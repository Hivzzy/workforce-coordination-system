package com.kembangtasik.backend.controller;

import com.kembangtasik.backend.service.SystemStateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/system-state")
public class SystemStateController {

    private final SystemStateService systemStateService;

    public SystemStateController(SystemStateService systemStateService) {
        this.systemStateService = systemStateService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSystemState() {
        return ResponseEntity.ok(systemStateService.getSystemState());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> updateSystemState(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(systemStateService.updateSystemState(body));
    }
}
