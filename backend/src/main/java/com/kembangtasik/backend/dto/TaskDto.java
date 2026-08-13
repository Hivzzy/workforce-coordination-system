package com.kembangtasik.backend.dto;

import java.time.LocalDateTime;

public class TaskDto {
    private String id;
    private String title;
    private String description;
    private String assignedStaffId;
    private String staffName;
    private String assignedAreaId;
    private String areaName;
    private String status;
    private LocalDateTime createdAt;

    public TaskDto() {}

    public TaskDto(String id, String title, String description, String assignedStaffId, String staffName, String assignedAreaId, String areaName, String status, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.assignedStaffId = assignedStaffId;
        this.staffName = staffName;
        this.assignedAreaId = assignedAreaId;
        this.areaName = areaName;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(String assignedStaffId) { this.assignedStaffId = assignedStaffId; }

    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }

    public String getAssignedAreaId() { return assignedAreaId; }
    public void setAssignedAreaId(String assignedAreaId) { this.assignedAreaId = assignedAreaId; }

    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }

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
        private String staffName;
        private String assignedAreaId;
        private String areaName;
        private String status;
        private LocalDateTime createdAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder assignedStaffId(String assignedStaffId) { this.assignedStaffId = assignedStaffId; return this; }
        public Builder staffName(String staffName) { this.staffName = staffName; return this; }
        public Builder assignedAreaId(String assignedAreaId) { this.assignedAreaId = assignedAreaId; return this; }
        public Builder areaName(String areaName) { this.areaName = areaName; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public TaskDto build() {
            return new TaskDto(id, title, description, assignedStaffId, staffName, assignedAreaId, areaName, status, createdAt);
        }
    }
}
