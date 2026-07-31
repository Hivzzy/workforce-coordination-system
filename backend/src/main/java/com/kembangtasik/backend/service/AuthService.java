package com.kembangtasik.backend.service;

import com.kembangtasik.backend.dto.LoginRequest;
import com.kembangtasik.backend.dto.LoginResponse;

import java.util.Map;

public interface AuthService {
    LoginResult login(LoginRequest request);
    Map<String, String> logout(String token);
    LoginResponse getCurrentUser(String token);

    class LoginResult {
        private final boolean success;
        private final LoginResponse response;
        private final String errorMessage;
        private final int status;

        public LoginResult(boolean success, LoginResponse response, String errorMessage, int status) {
            this.success = success;
            this.response = response;
            this.errorMessage = errorMessage;
            this.status = status;
        }

        public boolean isSuccess() { return success; }
        public LoginResponse getResponse() { return response; }
        public String getErrorMessage() { return errorMessage; }
        public int getStatus() { return status; }
    }
}
