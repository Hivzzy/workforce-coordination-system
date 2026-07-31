package com.kembangtasik.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class TaskEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "assigned_staff_id")
    private String assignedStaffId;

    @Column(name = "assigned_area_id")
    private String assignedAreaId;

    private String status = "pending"; // "pending", "in_progress", "completed"

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public TaskEntity() {}

    public TaskEntity(String id, String title, String description, String assignedStaffId, String assignedAreaId, String status, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.assignedStaffId = assignedStaffId;
        this.assignedAreaId = assignedAreaId;
        this.status = status != null ? status : "pending";
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(String assignedStaffId) { this.assignedStaffId = assignedStaffId; }

    public String getAssignedAreaId() { return assignedAreaId; }
    public void setAssignedAreaId(String assignedAreaId) { this.assignedAreaId = assignedAreaId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String title;
        private String description;
        private String assignedStaffId;
        private String assignedAreaId;
        private String status = "pending";
        private LocalDateTime createdAt = LocalDateTime.now();

        public Builder id(String id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder assignedStaffId(String assignedStaffId) { this.assignedStaffId = assignedStaffId; return this; }
        public Builder assignedAreaId(String assignedAreaId) { this.assignedAreaId = assignedAreaId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public TaskEntity build() {
            return new TaskEntity(id, title, description, assignedStaffId, assignedAreaId, status, createdAt);
        }
    }
}
