package com.kembangtasik.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kembangtasik.backend.model.SystemStateEntity;
import com.kembangtasik.backend.repository.SystemStateRepository;
import com.kembangtasik.backend.service.SystemStateService;
import com.kembangtasik.backend.service.WebSocketPublisherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class SystemStateServiceImpl implements SystemStateService {

    private static final Logger log = LoggerFactory.getLogger(SystemStateServiceImpl.class);
    private final SystemStateRepository systemStateRepository;
    private final WebSocketPublisherService webSocketPublisherService;
    private final ObjectMapper objectMapper;

    public SystemStateServiceImpl(SystemStateRepository systemStateRepository, WebSocketPublisherService webSocketPublisherService) {
        this.systemStateRepository = systemStateRepository;
        this.webSocketPublisherService = webSocketPublisherService;
        this.objectMapper = new ObjectMapper();
    }

    private boolean parseBool(Object val) {
        if (val == null) return false;
        if (val instanceof Boolean) return (Boolean) val;
        return "true".equalsIgnoreCase(String.valueOf(val).trim());
    }

    @Override
    public Map<String, Object> getSystemState() {
        Map<String, Object> result = new HashMap<>();

        Optional<SystemStateEntity> emergencyOpt = systemStateRepository.findById("emergency_active");
        boolean emergencyActive = emergencyOpt.map(e -> parseBool(e.getValue())).orElse(false);

        // Fetch per-area active signals JSON map
        Map<String, Map<String, Object>> areaSignals = getAreaSignalsMap();

        result.put("emergencyActive", emergencyActive);
        result.put("areaSignals", areaSignals);

        // Legacy compatibility fields
        boolean anyHelp = areaSignals.values().stream().anyMatch(s -> parseBool(s.get("helpActive")));
        boolean anyRefill = areaSignals.values().stream().anyMatch(s -> parseBool(s.get("refillActive")));
        result.put("helpStatus", anyHelp ? "requested" : "idle");
        result.put("refillStatus", anyRefill ? "requested" : "idle");

        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Map<String, Object>> getAreaSignalsMap() {
        Optional<SystemStateEntity> signalsOpt = systemStateRepository.findById("area_signals_json");
        if (signalsOpt.isPresent() && signalsOpt.get().getValue() != null && !signalsOpt.get().getValue().isBlank()) {
            try {
                return objectMapper.readValue(signalsOpt.get().getValue(), new TypeReference<Map<String, Map<String, Object>>>() {});
            } catch (Exception e) {
                log.error("Failed to parse area_signals_json:", e);
            }
        }
        return new HashMap<>();
    }

    private void saveAreaSignalsMap(Map<String, Map<String, Object>> areaSignals) {
        try {
            String json = objectMapper.writeValueAsString(areaSignals);
            systemStateRepository.saveAndFlush(new SystemStateEntity("area_signals_json", json));
        } catch (Exception e) {
            log.error("Failed to save area_signals_json:", e);
        }
    }

    @Override
    public Map<String, Object> updateSystemState(Map<String, String> body) {
        if (body.containsKey("emergencyActive")) {
            boolean active = parseBool(body.get("emergencyActive"));
            systemStateRepository.saveAndFlush(new SystemStateEntity("emergency_active", String.valueOf(active)));
            webSocketPublisherService.sendEmergencyAlert(active, active ? "🚨 DARURAT GATHERING AREA ACTIVE!" : "Emergency Call Cleared");
        }

        // Per-Area Signal Update Handler
        if (body.containsKey("areaId")) {
            String areaId = body.get("areaId");
            String areaName = body.getOrDefault("areaName", "Area " + areaId);
            Map<String, Map<String, Object>> areaSignals = getAreaSignalsMap();

            Map<String, Object> signal = areaSignals.getOrDefault(areaId, new HashMap<>());
            signal.put("areaId", areaId);
            signal.put("areaName", areaName);

            if (body.containsKey("helpActive")) {
                boolean helpActive = parseBool(body.get("helpActive"));
                signal.put("helpActive", helpActive);
                webSocketPublisherService.sendOperationsLog((helpActive ? "🆘 HELP REQUESTED" : "✅ HELP CLEARED") + " at " + areaName);
            }

            if (body.containsKey("refillActive")) {
                boolean refillActive = parseBool(body.get("refillActive"));
                signal.put("refillActive", refillActive);
                webSocketPublisherService.sendOperationsLog((refillActive ? "🍹 REFILL REQUESTED" : "✅ REFILL CLEARED") + " at " + areaName);
            }

            // Remove empty area signals if both help & refill are false
            boolean help = parseBool(signal.get("helpActive"));
            boolean refill = parseBool(signal.get("refillActive"));
            if (!help && !refill) {
                areaSignals.remove(areaId);
            } else {
                areaSignals.put(areaId, signal);
            }

            saveAreaSignalsMap(areaSignals);
            webSocketPublisherService.sendSignal("AREA_SIGNAL_UPDATE", areaId);
        } else {
            // Legacy single-string trigger fallback
            if (body.containsKey("helpStatus")) {
                String status = body.get("helpStatus");
                systemStateRepository.saveAndFlush(new SystemStateEntity("help_status", status));
                webSocketPublisherService.sendSignal("HELP", status);
            }
            if (body.containsKey("refillStatus")) {
                String status = body.get("refillStatus");
                systemStateRepository.saveAndFlush(new SystemStateEntity("refill_status", status));
                webSocketPublisherService.sendSignal("REFILL", status);
            }
        }

        Map<String, Object> updatedState = getSystemState();
        webSocketPublisherService.sendSystemStateUpdate(updatedState);
        return updatedState;
    }
}
