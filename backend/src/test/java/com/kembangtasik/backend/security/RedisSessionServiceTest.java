package com.kembangtasik.backend.security;

import com.kembangtasik.backend.model.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RedisSessionServiceTest {

    private RedisSessionService redisSessionService;
    private UserEntity mockUser;

    @BeforeEach
    void setUp() {
        redisSessionService = new RedisSessionService();

        mockUser = new UserEntity();
        mockUser.setId("usr-test-123");
        mockUser.setEmail("admin.test@coordination.com");
        mockUser.setName("Admin Tester");
        mockUser.setRole("admin");
        mockUser.setStaffId("stf-999");
    }

    @Test
    @DisplayName("Should create active session in Redis with valid Session Data")
    void testCreateSession() {
        RedisSessionService.SessionData session = redisSessionService.createSession(mockUser);

        assertNotNull(session);
        assertNotNull(session.getSessionId());
        assertEquals("admin.test@coordination.com", session.getEmail());
        assertEquals("admin", session.getRole());
        assertEquals("stf-999", session.getStaffId());
        assertFalse(session.isExpired());
    }

    @Test
    @DisplayName("Should retrieve active session by Session ID")
    void testGetSessionSuccess() {
        RedisSessionService.SessionData created = redisSessionService.createSession(mockUser);
        RedisSessionService.SessionData retrieved = redisSessionService.getSession(created.getSessionId());

        assertNotNull(retrieved);
        assertEquals(created.getSessionId(), retrieved.getSessionId());
        assertEquals("Admin Tester", retrieved.getName());
    }

    @Test
    @DisplayName("Should return null for non-existent Session ID")
    void testGetSessionNotFound() {
        RedisSessionService.SessionData retrieved = redisSessionService.getSession("invalid-session-uuid-999");
        assertNull(retrieved);
    }

    @Test
    @DisplayName("Should instantly revoke session on deleteSession")
    void testDeleteSession() {
        RedisSessionService.SessionData created = redisSessionService.createSession(mockUser);
        String sessionId = created.getSessionId();

        boolean deleted = redisSessionService.deleteSession(sessionId);
        assertTrue(deleted);

        RedisSessionService.SessionData afterDelete = redisSessionService.getSession(sessionId);
        assertNull(afterDelete);
    }
}
