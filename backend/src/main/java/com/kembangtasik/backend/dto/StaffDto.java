package com.kembangtasik.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class StaffDto {
    private String id;

    @NotBlank(message = "Nama staff wajib diisi")
    private String name;

    @NotBlank(message = "Peran staff wajib diisi")
    private String role;

    private String assignedAreaId;
    private String email;
    private String password;

    public StaffDto() {}

    public StaffDto(String id, String name, String role, String assignedAreaId, String email, String password) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.assignedAreaId = assignedAreaId;
        this.email = email;
        this.password = password;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAssignedAreaId() { return assignedAreaId; }
    public void setAssignedAreaId(String assignedAreaId) { this.assignedAreaId = assignedAreaId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String name;
        private String role;
        private String assignedAreaId;
        private String email;
        private String password;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder assignedAreaId(String assignedAreaId) { this.assignedAreaId = assignedAreaId; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder password(String password) { this.password = password; return this; }

        public StaffDto build() {
            return new StaffDto(id, name, role, assignedAreaId, email, password);
        }
    }
}
