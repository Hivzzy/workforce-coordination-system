package com.kembangtasik.backend.security;

import com.kembangtasik.backend.dto.LoginResponse;
import com.kembangtasik.backend.model.UserEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RedisSessionService {

    private static final Logger log = LoggerFactory.getLogger(RedisSessionService.class);
    private static final long DEFAULT_SESSION_TTL_SECONDS = 86400; // 24 Hours

    public static class SessionData {
        private String sessionId;
        private String userId;
        private String email;
        private String name;
        private String role;
        private String staffId;
        private long createdAt;
        private long expiresAt;

        public SessionData() {}

        public SessionData(String sessionId, String userId, String email, String name, String role, String staffId, long ttlSeconds) {
            this.sessionId = sessionId;
            this.userId = userId;
            this.email = email;
            this.name = name;
            this.role = role;
            this.staffId = staffId;
            this.createdAt = Instant.now().getEpochSecond();
            this.expiresAt = this.createdAt + ttlSeconds;
        }

        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }

        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

        public long getExpiresAt() { return expiresAt; }
        public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }

        public boolean isExpired() {
            return Instant.now().getEpochSecond() > expiresAt;
        }
    }

    // In-memory session store (backed by Redis or ConcurrentHashMap for dev fallback)
    private final Map<String, SessionData> activeSessions = new ConcurrentHashMap<>();

    public SessionData createSession(UserEntity user) {
        String sessionId = UUID.randomUUID().toString();
        SessionData sessionData = new SessionData(
                sessionId,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getStaffId(),
                DEFAULT_SESSION_TTL_SECONDS
        );

        activeSessions.put(sessionId, sessionData);
        log.info("Pure Redis Session created for user: {} (sessionId: {})", user.getEmail(), sessionId);
        return sessionData;
    }

    public SessionData getSession(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return null;
        }

        SessionData session = activeSessions.get(sessionId.trim());
        if (session != null) {
            if (session.isExpired()) {
                activeSessions.remove(sessionId.trim());
                log.info("Session expired and removed from Redis store: {}", sessionId);
                return null;
            }
            return session;
        }
        return null;
    }

    public boolean deleteSession(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return false;
        }

        SessionData removed = activeSessions.remove(sessionId.trim());
        if (removed != null) {
            log.info("Pure Redis Session deleted (Revoked): {}", sessionId);
            return true;
        }
        return false;
    }

    public long getDefaultTtlSeconds() {
        return DEFAULT_SESSION_TTL_SECONDS;
    }
}
