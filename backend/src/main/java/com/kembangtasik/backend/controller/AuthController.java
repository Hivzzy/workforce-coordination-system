package com.kembangtasik.backend.controller;

import com.kembangtasik.backend.dto.LoginRequest;
import com.kembangtasik.backend.dto.LoginResponse;
import com.kembangtasik.backend.security.SessionAuthenticationFilter;
import com.kembangtasik.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        AuthService.LoginResult result = authService.login(request);

        if (result.isSuccess()) {
            LoginResponse response = result.getResponse();
            ResponseCookie sessionCookie = ResponseCookie.from(SessionAuthenticationFilter.COOKIE_NAME, response.getAccessToken())
                    .httpOnly(true)
                    .secure(false) // Set to true in HTTPS production
                    .path("/")
                    .maxAge(response.getExpiresIn())
                    .sameSite("Lax")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, sessionCookie.toString())
                    .body(response);
        }

        return ResponseEntity.status(result.getStatus()).body(Map.of(
                "status", result.getStatus(),
                "error", result.getStatus() == 400 ? "Bad Request" : "Unauthorized",
                "message", result.getErrorMessage()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String sessionId = SessionAuthenticationFilter.getSessionIdFromRequest(request);
        Map<String, String> logoutResult = authService.logout(sessionId);

        ResponseCookie deleteCookie = ResponseCookie.from(SessionAuthenticationFilter.COOKIE_NAME, "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(logoutResult);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String sessionId = SessionAuthenticationFilter.getSessionIdFromRequest(request);
        LoginResponse userResponse = authService.getCurrentUser(sessionId);

        if (userResponse != null) {
            return ResponseEntity.ok(userResponse);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Sesi otentikasi tidak valid atau telah kedaluwarsa"));
    }
}
