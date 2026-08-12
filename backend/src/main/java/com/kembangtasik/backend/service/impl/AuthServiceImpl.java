package com.kembangtasik.backend.service.impl;

import com.kembangtasik.backend.dto.LoginRequest;
import com.kembangtasik.backend.dto.LoginResponse;
import com.kembangtasik.backend.model.UserEntity;
import com.kembangtasik.backend.repository.UserRepository;
import com.kembangtasik.backend.security.RedisSessionService;
import com.kembangtasik.backend.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisSessionService redisSessionService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, RedisSessionService redisSessionService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.redisSessionService = redisSessionService;
    }

    @Override
    public LoginResult login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return new LoginResult(false, null, "Email dan password wajib diisi", 400);
        }

        Optional<UserEntity> userOpt = userRepository.findFirstByEmail(request.getEmail().trim());

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword()) ||
                              request.getPassword().equals(user.getPassword());

            if (matches) {
                RedisSessionService.SessionData session = redisSessionService.createSession(user);

                LoginResponse response = LoginResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .staffId(user.getStaffId())
                        .accessToken(session.getSessionId())
                        .tokenType("Bearer")
                        .expiresIn(redisSessionService.getDefaultTtlSeconds())
                        .build();

                log.info("Pure Redis Session login successful for user: {} (Session ID: {})", user.getEmail(), session.getSessionId());
                return new LoginResult(true, response, null, 200);
            }
        }

        log.warn("Failed login attempt for email: {}", request.getEmail());
        return new LoginResult(false, null, "Email atau kata sandi yang Anda masukkan salah", 401);
    }

    @Override
    public Map<String, String> logout(String tokenOrSessionId) {
        if (tokenOrSessionId != null) {
            boolean deleted = redisSessionService.deleteSession(tokenOrSessionId);
            log.info("Pure Redis Session deleted on logout (sessionId: {}, deleted: {})", tokenOrSessionId, deleted);
        }
        return Map.of("message", "Logout berhasil, sesi Redis telah direvokasi dan cookie dibersihkan");
    }

    @Override
    public LoginResponse getCurrentUser(String tokenOrSessionId) {
        if (tokenOrSessionId != null) {
            RedisSessionService.SessionData session = redisSessionService.getSession(tokenOrSessionId);
            if (session != null && !session.isExpired()) {
                return LoginResponse.builder()
                        .id(session.getUserId())
                        .email(session.getEmail())
                        .name(session.getName())
                        .role(session.getRole())
                        .staffId(session.getStaffId())
                        .accessToken(session.getSessionId())
                        .tokenType("Bearer")
                        .expiresIn(redisSessionService.getDefaultTtlSeconds())
                        .build();
            }
        }
        return null;
    }
}
