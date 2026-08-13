package com.kembangtasik.backend.service;

import com.kembangtasik.backend.model.SystemStateEntity;
import com.kembangtasik.backend.repository.SystemStateRepository;
import com.kembangtasik.backend.service.impl.SystemStateServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

@ExtendWith(MockitoExtension.class)
class SystemStateServiceImplTest {

    @Mock
    private SystemStateRepository systemStateRepository;

    private WebSocketPublisherService webSocketPublisherService;
    private SystemStateServiceImpl systemStateService;
    private final Map<String, String> dbState = new HashMap<>();

    @BeforeEach
    void setUp() {
        webSocketPublisherService = new WebSocketPublisherService(null);
        systemStateService = new SystemStateServiceImpl(systemStateRepository, webSocketPublisherService);
        dbState.clear();

        org.mockito.Mockito.lenient().when(systemStateRepository.saveAndFlush(any(SystemStateEntity.class))).thenAnswer(invocation -> {
            SystemStateEntity entity = invocation.getArgument(0);
            dbState.put(entity.getKey(), entity.getValue());
            return entity;
        });

        org.mockito.Mockito.lenient().when(systemStateRepository.findById(anyString())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            if (dbState.containsKey(key)) {
                return Optional.of(new SystemStateEntity(key, dbState.get(key)));
            }
            return Optional.empty();
        });
    }

    @Test
    @DisplayName("1. Multi-Area Signals: Should handle 5+ concurrent areas with Help and Refill without signal loss")
    void testMultiAreaSignalsConcurrent() {
        for (int i = 1; i <= 5; i++) {
            Map<String, String> body = new HashMap<>();
            body.put("areaId", "area-" + i);
            body.put("areaName", "Area Zone " + i);
            body.put("helpActive", "true");
            body.put("refillActive", "true");

            systemStateService.updateSystemState(body);
        }

        Map<String, Object> state = systemStateService.getSystemState();
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> signals = (Map<String, Map<String, Object>>) state.get("areaSignals");

        assertNotNull(signals);
        assertEquals(5, signals.size(), "All 5 area signals must be preserved in memory cache and DB");

        for (int i = 1; i <= 5; i++) {
            Map<String, Object> areaSignal = signals.get("area-" + i);
            assertNotNull(areaSignal, "Area " + i + " must exist");
            assertTrue((Boolean) areaSignal.get("helpActive"), "Area " + i + " helpActive must be true");
            assertTrue((Boolean) areaSignal.get("refillActive"), "Area " + i + " refillActive must be true");
        }
    }

    @Test
    @DisplayName("2. Emergency Dispatch Protection: Toggling Emergency should NOT lose existing active area signals")
    void testEmergencyDoesNotWipeAreaSignals() {
        // Step 1: Add 3 active area signals
        for (int i = 1; i <= 3; i++) {
            Map<String, String> body = new HashMap<>();
            body.put("areaId", "area-" + i);
            body.put("areaName", "Area Zone " + i);
            body.put("helpActive", "true");
            body.put("refillActive", "true");
            systemStateService.updateSystemState(body);
        }

        // Step 2: Admin triggers Emergency Alert
        Map<String, String> emergencyBody = new HashMap<>();
        emergencyBody.put("emergencyActive", "true");
        systemStateService.updateSystemState(emergencyBody);

        // Step 3: Verify Emergency is ACTIVE AND all 3 area signals remain intact
        Map<String, Object> state = systemStateService.getSystemState();
        assertTrue((Boolean) state.get("emergencyActive"), "Emergency must be active");

        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> signals = (Map<String, Map<String, Object>>) state.get("areaSignals");
        assertNotNull(signals);
        assertEquals(3, signals.size(), "All 3 area signals must be preserved when Emergency is triggered!");
    }

    @Test
    @DisplayName("3. Scoped Isolation: Resolving Help for Area 1 should NOT affect Area 2 or Area 3")
    void testScopedSignalResolution() {
        // Step 1: Add signals for Area 1, 2, and 3
        for (int i = 1; i <= 3; i++) {
            Map<String, String> body = new HashMap<>();
            body.put("areaId", "area-" + i);
            body.put("areaName", "Area Zone " + i);
            body.put("helpActive", "true");
            body.put("refillActive", "true");
            systemStateService.updateSystemState(body);
        }

        // Step 2: Admin resolves Help ONLY for Area 1
        Map<String, String> resolveBody = new HashMap<>();
        resolveBody.put("areaId", "area-1");
        resolveBody.put("areaName", "Area Zone 1");
        resolveBody.put("helpActive", "false");
        systemStateService.updateSystemState(resolveBody);

        // Step 3: Verify Area 1 help is FALSE, but Refill is STILL TRUE. Area 2 & 3 remain UNTOUCHED.
        Map<String, Object> state = systemStateService.getSystemState();
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> signals = (Map<String, Map<String, Object>>) state.get("areaSignals");

        Map<String, Object> area1 = signals.get("area-1");
        assertFalse((Boolean) area1.get("helpActive"), "Area 1 helpActive should be false");
        assertTrue((Boolean) area1.get("refillActive"), "Area 1 refillActive should STILL be true");

        Map<String, Object> area2 = signals.get("area-2");
        assertTrue((Boolean) area2.get("helpActive"), "Area 2 helpActive must remain true");

        Map<String, Object> area3 = signals.get("area-3");
        assertTrue((Boolean) area3.get("helpActive"), "Area 3 helpActive must remain true");
    }

    @Test
    @DisplayName("4. Automatic Cleanup: Area signal should be removed ONLY when both Help and Refill become false")
    void testAreaSignalRemovalWhenBothFalse() {
        Map<String, String> body = new HashMap<>();
        body.put("areaId", "area-1");
        body.put("areaName", "Area Zone 1");
        body.put("helpActive", "true");
        body.put("refillActive", "false");
        systemStateService.updateSystemState(body);

        // Resolve Help
        Map<String, String> clearBody = new HashMap<>();
        clearBody.put("areaId", "area-1");
        clearBody.put("helpActive", "false");
        systemStateService.updateSystemState(clearBody);

        Map<String, Object> state = systemStateService.getSystemState();
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> signals = (Map<String, Map<String, Object>>) state.get("areaSignals");

        assertFalse(signals.containsKey("area-1"), "Area 1 must be automatically cleaned up when both signals are false");
    }

    @Test
    @DisplayName("5. Robust Boolean Parsing: Should handle String 'true', 'TRUE', Boolean.TRUE, and 'false' safely")
    void testRobustBooleanParsing() {
        Map<String, String> bodyUpper = new HashMap<>();
        bodyUpper.put("areaId", "area-robust");
        bodyUpper.put("areaName", "Robust Area");
        bodyUpper.put("helpActive", "TRUE");
        bodyUpper.put("refillActive", "True");
        systemStateService.updateSystemState(bodyUpper);

        Map<String, Object> state = systemStateService.getSystemState();
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> signals = (Map<String, Map<String, Object>>) state.get("areaSignals");

        Map<String, Object> robust = signals.get("area-robust");
        assertTrue((Boolean) robust.get("helpActive"), "Upper case 'TRUE' must evaluate to boolean true");
        assertTrue((Boolean) robust.get("refillActive"), "Mixed case 'True' must evaluate to boolean true");
    }
}
