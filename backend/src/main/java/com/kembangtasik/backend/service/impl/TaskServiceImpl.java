package com.kembangtasik.backend.service.impl;

import com.kembangtasik.backend.dto.TaskDto;
import com.kembangtasik.backend.model.AreaEntity;
import com.kembangtasik.backend.model.StaffEntity;
import com.kembangtasik.backend.model.TaskEntity;
import com.kembangtasik.backend.repository.AreaRepository;
import com.kembangtasik.backend.repository.StaffRepository;
import com.kembangtasik.backend.repository.TaskRepository;
import com.kembangtasik.backend.service.TaskService;
import com.kembangtasik.backend.service.WebSocketPublisherService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final StaffRepository staffRepository;
    private final AreaRepository areaRepository;
    private final WebSocketPublisherService webSocketPublisherService;

    public TaskServiceImpl(TaskRepository taskRepository, StaffRepository staffRepository, AreaRepository areaRepository, WebSocketPublisherService webSocketPublisherService) {
        this.taskRepository = taskRepository;
        this.staffRepository = staffRepository;
        this.areaRepository = areaRepository;
        this.webSocketPublisherService = webSocketPublisherService;
    }

    private TaskDto mapToDto(TaskEntity entity) {
        if (entity == null) return null;

        String staffName = null;
        if (entity.getAssignedStaffId() != null && !entity.getAssignedStaffId().isBlank()) {
            staffName = staffRepository.findById(entity.getAssignedStaffId())
                    .map(StaffEntity::getName)
                    .orElse(null);
        }

        String areaName = null;
        if (entity.getAssignedAreaId() != null && !entity.getAssignedAreaId().isBlank()) {
            areaName = areaRepository.findById(entity.getAssignedAreaId())
                    .map(AreaEntity::getName)
                    .orElse(null);
        }

        return TaskDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .assignedStaffId(entity.getAssignedStaffId())
                .staffName(staffName)
                .assignedAreaId(entity.getAssignedAreaId())
                .areaName(areaName)
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    @Override
    public List<TaskDto> getTasks(String staffId) {
        List<TaskEntity> entities;
        if (staffId != null && !staffId.isBlank()) {
            entities = taskRepository.findByAssignedStaffId(staffId);
        } else {
            entities = taskRepository.findAll();
        }
        return entities.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public TaskDto createTask(TaskEntity task) {
        if (task.getId() == null || task.getId().isBlank()) {
            task.setId("task-" + System.currentTimeMillis());
        }
        if (task.getCreatedAt() == null) {
            task.setCreatedAt(LocalDateTime.now());
        }
        if (task.getStatus() == null) {
            task.setStatus("pending");
        }
        TaskEntity saved = taskRepository.save(task);
        TaskDto dto = mapToDto(saved);

        // ⚡ Real-Time WebSocket STOMP Broadcast to /topic/tasks (< 50ms)
        webSocketPublisherService.sendTaskUpdate(dto);
        webSocketPublisherService.sendOperationsLog("📋 TASK CREATED: " + saved.getTitle() + " assigned to staff " + (dto.getStaffName() != null ? dto.getStaffName() : "Unassigned"));

        return dto;
    }

    @Override
    public TaskDto updateTask(String id, TaskEntity updated) {
        Optional<TaskEntity> existingOpt = taskRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return null;
        }
        TaskEntity existing = existingOpt.get();
        if (updated.getTitle() != null) existing.setTitle(updated.getTitle());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getAssignedStaffId() != null) existing.setAssignedStaffId(updated.getAssignedStaffId());
        if (updated.getAssignedAreaId() != null) existing.setAssignedAreaId(updated.getAssignedAreaId());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());

        TaskEntity saved = taskRepository.save(existing);
        TaskDto dto = mapToDto(saved);

        // ⚡ Real-Time WebSocket STOMP Broadcast to /topic/tasks (< 50ms)
        webSocketPublisherService.sendTaskUpdate(dto);
        webSocketPublisherService.sendOperationsLog("📋 TASK UPDATED: " + saved.getTitle() + " status is now " + saved.getStatus());

        return dto;
    }

    @Override
    public void deleteTask(String id) {
        taskRepository.deleteById(id);

        // ⚡ Real-Time WebSocket STOMP Broadcast to /topic/tasks (< 50ms)
        webSocketPublisherService.sendTaskUpdate(Map.of("type", "TASK_DELETED", "id", id));
        webSocketPublisherService.sendOperationsLog("📋 TASK DELETED: ID " + id);
    }
}
