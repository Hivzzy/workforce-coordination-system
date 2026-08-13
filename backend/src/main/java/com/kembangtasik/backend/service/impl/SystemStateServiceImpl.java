package com.kembangtasik.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kembangtasik.backend.model.SystemStateEntity;
import com.kembangtasik.backend.repository.SystemStateRepository;
import com.kembangtasik.backend.service.SystemStateService;
import com.kembangtasik.backend.service.WebSocketPublisherService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class SystemStateServiceImpl implements SystemStateService {

    private static final Logger log = LoggerFactory.getLogger(SystemStateServiceImpl.class);
    private final SystemStateRepository systemStateRepository;
    private final WebSocketPublisherService webSocketPublisherService;
    private final ObjectMapper objectMapper;

    // ⚡ Thread-safe In-Memory Signal Cache to eliminate DB cache latency & stale reads
    private final Map<String, Map<String, Object>> areaSignalsCache = new ConcurrentHashMap<>();

    public SystemStateServiceImpl(SystemStateRepository systemStateRepository, WebSocketPublisherService webSocketPublisherService) {
        this.systemStateRepository = systemStateRepository;
        this.webSocketPublisherService = webSocketPublisherService;
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void initCache() {
        try {
            Optional<SystemStateEntity> signalsOpt = systemStateRepository.findById("area_signals_json");
            if (signalsOpt.isPresent() && signalsOpt.get().getValue() != null && !signalsOpt.get().getValue().isBlank()) {
                Map<String, Map<String, Object>> loaded = objectMapper.readValue(
                        signalsOpt.get().getValue(),
                        new TypeReference<Map<String, Map<String, Object>>>() {}
                );
                if (loaded != null) {
                    areaSignalsCache.putAll(loaded);
                    log.info("Initialized areaSignalsCache with {} areas from PostgreSQL DB.", areaSignalsCache.size());
                }
            }
        } catch (Exception e) {
            log.error("Failed to load initial areaSignalsCache from DB:", e);
        }
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

        // Return a copy of the thread-safe in-memory signals cache
        Map<String, Map<String, Object>> currentSignals = new HashMap<>(areaSignalsCache);

        result.put("emergencyActive", emergencyActive);
        result.put("areaSignals", currentSignals);

        // Legacy compatibility fields
        boolean anyHelp = currentSignals.values().stream().anyMatch(s -> parseBool(s.get("helpActive")));
        boolean anyRefill = currentSignals.values().stream().anyMatch(s -> parseBool(s.get("refillActive")));
        result.put("helpStatus", anyHelp ? "requested" : "idle");
        result.put("refillStatus", anyRefill ? "requested" : "idle");

        return result;
    }

    private void persistAreaSignalsCache() {
        try {
            String json = objectMapper.writeValueAsString(areaSignalsCache);
            systemStateRepository.saveAndFlush(new SystemStateEntity("area_signals_json", json));
            log.info("Persisted areaSignalsCache ({} areas) to PostgreSQL DB.", areaSignalsCache.size());
        } catch (Exception e) {
            log.error("Failed to persist areaSignalsCache to DB:", e);
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

            Map<String, Object> signal = areaSignalsCache.getOrDefault(areaId, new ConcurrentHashMap<>());
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
                areaSignalsCache.remove(areaId);
            } else {
                areaSignalsCache.put(areaId, signal);
            }

            persistAreaSignalsCache();
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
