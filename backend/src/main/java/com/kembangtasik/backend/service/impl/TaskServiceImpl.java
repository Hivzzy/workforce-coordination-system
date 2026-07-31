package com.kembangtasik.backend.service.impl;

import com.kembangtasik.backend.model.TaskEntity;
import com.kembangtasik.backend.repository.TaskRepository;
import com.kembangtasik.backend.service.TaskService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
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
        return taskRepository.save(task);
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

        return taskRepository.save(existing);
    }

    @Override
    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }
}
