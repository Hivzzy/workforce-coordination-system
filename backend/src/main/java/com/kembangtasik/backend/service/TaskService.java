package com.kembangtasik.backend.service;

import com.kembangtasik.backend.dto.TaskDto;
import com.kembangtasik.backend.model.TaskEntity;
import java.util.List;

public interface TaskService {
    List<TaskDto> getTasks(String staffId);
    TaskDto createTask(TaskEntity task);
    TaskDto updateTask(String id, TaskEntity updated);
    void deleteTask(String id);
}
