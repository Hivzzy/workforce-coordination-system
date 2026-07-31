package com.kembangtasik.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "staffs")
public class StaffEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String role;

    @Column(name = "assigned_area_id")
    private String assignedAreaId;

    public StaffEntity() {}

    public StaffEntity(String id, String name, String role, String assignedAreaId) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.assignedAreaId = assignedAreaId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAssignedAreaId() { return assignedAreaId; }
    public void setAssignedAreaId(String assignedAreaId) { this.assignedAreaId = assignedAreaId; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String name;
        private String role;
        private String assignedAreaId;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder assignedAreaId(String assignedAreaId) { this.assignedAreaId = assignedAreaId; return this; }

        public StaffEntity build() {
            return new StaffEntity(id, name, role, assignedAreaId);
        }
    }
}
