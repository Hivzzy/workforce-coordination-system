package com.kembangtasik.backend.service.impl;

import com.kembangtasik.backend.model.SystemStateEntity;
import com.kembangtasik.backend.repository.SystemStateRepository;
import com.kembangtasik.backend.service.SystemStateService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class SystemStateServiceImpl implements SystemStateService {

    private final SystemStateRepository systemStateRepository;

    public SystemStateServiceImpl(SystemStateRepository systemStateRepository) {
        this.systemStateRepository = systemStateRepository;
    }

    @Override
    public Map<String, Object> getSystemState() {
        Map<String, Object> result = new HashMap<>();

        Optional<SystemStateEntity> emergencyOpt = systemStateRepository.findById("emergency_active");
        boolean emergencyActive = emergencyOpt.map(e -> Boolean.parseBoolean(e.getValue())).orElse(false);

        Optional<SystemStateEntity> helpOpt = systemStateRepository.findById("help_status");
        String helpStatus = helpOpt.map(SystemStateEntity::getValue).orElse("idle");

        Optional<SystemStateEntity> refillOpt = systemStateRepository.findById("refill_status");
        String refillStatus = refillOpt.map(SystemStateEntity::getValue).orElse("idle");

        result.put("emergencyActive", emergencyActive);
        result.put("helpStatus", helpStatus);
        result.put("refillStatus", refillStatus);

        return result;
    }

    @Override
    public Map<String, Object> updateSystemState(Map<String, String> body) {
        if (body.containsKey("emergencyActive")) {
            systemStateRepository.save(new SystemStateEntity("emergency_active", body.get("emergencyActive")));
        }
        if (body.containsKey("helpStatus")) {
            systemStateRepository.save(new SystemStateEntity("help_status", body.get("helpStatus")));
        }
        if (body.containsKey("refillStatus")) {
            systemStateRepository.save(new SystemStateEntity("refill_status", body.get("refillStatus")));
        }

        return getSystemState();
    }
}
