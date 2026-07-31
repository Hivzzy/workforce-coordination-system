package com.kembangtasik.backend.service;

import com.kembangtasik.backend.model.TaskEntity;
import java.util.List;

public interface TaskService {
    List<TaskEntity> getTasks(String staffId);
    TaskEntity createTask(TaskEntity task);
    TaskEntity updateTask(String id, TaskEntity updated);
    void deleteTask(String id);
}
