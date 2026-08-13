package com.kembangtasik.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketPublisherService {

    private static final Logger log = LoggerFactory.getLogger(WebSocketPublisherService.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketPublisherService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendEmergencyAlert(boolean active, String message) {
        if (messagingTemplate == null) return;
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "EMERGENCY_ALERT");
        payload.put("active", active);
        payload.put("message", message);
        payload.put("timestamp", Instant.now().toString());

        log.info("Publishing STOMP message to /topic/emergency: {}", payload);
        messagingTemplate.convertAndSend("/topic/emergency", payload);
    }

    public void sendSignal(String signalType, String areaName) {
        if (messagingTemplate == null) return;
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "SIGNAL_REQUEST");
        payload.put("signalType", signalType); // "HELP" or "REFILL"
        payload.put("areaName", areaName);
        payload.put("timestamp", Instant.now().toString());

        log.info("Publishing STOMP message to /topic/signals: {}", payload);
        messagingTemplate.convertAndSend("/topic/signals", payload);
    }

    public void sendSystemStateUpdate(Map<String, Object> systemState) {
        if (messagingTemplate == null) return;
        log.info("Publishing STOMP message to /topic/system-state: {}", systemState);
        messagingTemplate.convertAndSend("/topic/system-state", systemState);
    }

    public void sendTaskUpdate(Object taskData) {
        if (messagingTemplate == null) return;
        log.info("Publishing STOMP message to /topic/tasks: {}", taskData);
        messagingTemplate.convertAndSend("/topic/tasks", taskData);
    }

    public void sendOperationsLog(String message) {
        if (messagingTemplate == null) return;
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "LOG_ENTRY");
        payload.put("message", message);
        payload.put("timestamp", Instant.now().toString());

        log.info("Publishing STOMP message to /topic/logs: {}", payload);
        messagingTemplate.convertAndSend("/topic/logs", payload);
    }
}
