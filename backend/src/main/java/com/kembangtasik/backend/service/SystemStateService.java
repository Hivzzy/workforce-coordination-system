package com.kembangtasik.backend.service;

import java.util.Map;

public interface SystemStateService {
    Map<String, Object> getSystemState();
    Map<String, Object> updateSystemState(Map<String, String> body);
}
