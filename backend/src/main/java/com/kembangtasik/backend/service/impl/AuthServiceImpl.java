package com.kembangtasik.backend.service.impl;

import com.kembangtasik.backend.dto.LoginRequest;
import com.kembangtasik.backend.dto.LoginResponse;
import com.kembangtasik.backend.model.UserEntity;
import com.kembangtasik.backend.repository.UserRepository;
import com.kembangtasik.backend.security.JwtTokenProvider;
import com.kembangtasik.backend.security.TokenBlacklistService;
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
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider, TokenBlacklistService tokenBlacklistService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    public LoginResult login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return new LoginResult(false, null, "Email dan password wajib diisi", 400);
        }

        Optional<UserEntity> userOpt = userRepository.findByEmail(request.getEmail().trim());

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword()) ||
                              request.getPassword().equals(user.getPassword());

            if (matches) {
                String token = jwtTokenProvider.generateToken(user);
                long maxAgeSeconds = jwtTokenProvider.getExpirationMs() / 1000;

                LoginResponse response = LoginResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .staffId(user.getStaffId())
                        .accessToken(token)
                        .tokenType("Bearer")
                        .expiresIn(maxAgeSeconds)
                        .build();

                log.info("Enterprise Login successful for user: {}", user.getEmail());
                return new LoginResult(true, response, null, 200);
            }
        }

        log.warn("Failed login attempt for email: {}", request.getEmail());
        return new LoginResult(false, null, "Email atau kata sandi yang Anda masukkan salah", 401);
    }

    @Override
    public Map<String, String> logout(String token) {
        if (token != null) {
            tokenBlacklistService.blacklistToken(token);
            log.info("Token blacklisted on server-side logout");
        }
        return Map.of("message", "Logout berhasil, cookie HttpOnly telah dihapus dan token direvokasi");
    }

    @Override
    public LoginResponse getCurrentUser(String token) {
        if (token != null && jwtTokenProvider.validateToken(token) && !tokenBlacklistService.isBlacklisted(token)) {
            String email = jwtTokenProvider.getEmailFromToken(token);
            Optional<UserEntity> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                return LoginResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .staffId(user.getStaffId())
                        .accessToken(token)
                        .tokenType("Bearer")
                        .expiresIn(jwtTokenProvider.getExpirationMs() / 1000)
                        .build();
            }
        }
        return null;
    }
}
