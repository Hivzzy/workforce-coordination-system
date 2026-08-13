package com.kembangtasik.backend.controller;

import com.kembangtasik.backend.dto.TaskDto;
import com.kembangtasik.backend.model.TaskEntity;
import com.kembangtasik.backend.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasks(@RequestParam(required = false) String staffId) {
        return ResponseEntity.ok(taskService.getTasks(staffId));
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskEntity task) {
        TaskDto saved = taskService.createTask(task);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable String id, @RequestBody TaskEntity updated) {
        TaskDto saved = taskService.updateTask(id, updated);
        if (saved == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
