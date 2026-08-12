package com.kembangtasik.backend.service.impl;

import com.kembangtasik.backend.model.TaskEntity;
import com.kembangtasik.backend.repository.TaskRepository;
import com.kembangtasik.backend.service.TaskService;
import com.kembangtasik.backend.service.WebSocketPublisherService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final WebSocketPublisherService webSocketPublisherService;

    public TaskServiceImpl(TaskRepository taskRepository, WebSocketPublisherService webSocketPublisherService) {
        this.taskRepository = taskRepository;
        this.webSocketPublisherService = webSocketPublisherService;
    }

    @Override
    public List<TaskEntity> getTasks(String staffId) {
        if (staffId != null && !staffId.isBlank()) {
            return taskRepository.findByAssignedStaffId(staffId);
        }
        return taskRepository.findAll();
    }

    @Override
    public TaskEntity createTask(TaskEntity task) {
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

        // ⚡ Real-Time WebSocket STOMP Broadcast to /topic/tasks (< 50ms)
        webSocketPublisherService.sendTaskUpdate(saved);
        webSocketPublisherService.sendOperationsLog("📋 TASK CREATED: " + saved.getTitle() + " assigned to staff " + (saved.getAssignedStaffId() != null ? saved.getAssignedStaffId() : "Unassigned"));

        return saved;
    }

    @Override
    public TaskEntity updateTask(String id, TaskEntity updated) {
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

        // ⚡ Real-Time WebSocket STOMP Broadcast to /topic/tasks (< 50ms)
        webSocketPublisherService.sendTaskUpdate(saved);
        webSocketPublisherService.sendOperationsLog("📋 TASK UPDATED: " + saved.getTitle() + " status is now " + saved.getStatus());

        return saved;
    }

    @Override
    public void deleteTask(String id) {
        taskRepository.deleteById(id);

        // ⚡ Real-Time WebSocket STOMP Broadcast to /topic/tasks (< 50ms)
        webSocketPublisherService.sendTaskUpdate(Map.of("type", "TASK_DELETED", "id", id));
        webSocketPublisherService.sendOperationsLog("📋 TASK DELETED: ID " + id);
    }
}
