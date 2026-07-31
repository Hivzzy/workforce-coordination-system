package com.kembangtasik.backend.dto;

public class LoginResponse {
    private String id;
    private String email;
    private String name;
    private String role;
    private String staffId;
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn;

    public LoginResponse() {}

    public LoginResponse(String id, String email, String name, String role, String staffId, String accessToken, String tokenType, long expiresIn) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.staffId = staffId;
        this.accessToken = accessToken;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.expiresIn = expiresIn;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String email;
        private String name;
        private String role;
        private String staffId;
        private String accessToken;
        private String tokenType = "Bearer";
        private long expiresIn;

        public Builder id(String id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder staffId(String staffId) { this.staffId = staffId; return this; }
        public Builder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public Builder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public Builder expiresIn(long expiresIn) { this.expiresIn = expiresIn; return this; }

        public LoginResponse build() {
            return new LoginResponse(id, email, name, role, staffId, accessToken, tokenType, expiresIn);
        }
    }
}
