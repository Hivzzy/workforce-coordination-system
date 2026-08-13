package com.kembangtasik.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Maximum 50 requests per minute per IP address
    private static final int MAX_REQUESTS_PER_MINUTE = 50;
    private static final long ONE_MINUTE_MS = 60_000L;

    private final Map<String, ClientRequestInfo> clientRequestMap = new ConcurrentHashMap<>();

    private static class ClientRequestInfo {
        long windowStart;
        int requestCount;

        ClientRequestInfo(long windowStart, int requestCount) {
            this.windowStart = windowStart;
            this.requestCount = requestCount;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Apply rate limiting specifically on write/mutation APIs and System State APIs
        if (path.startsWith("/api/system-state") || path.startsWith("/api/auth/login") || path.startsWith("/api/tasks")) {
            String clientIp = getClientIP(request);
            long now = System.currentTimeMillis();

            ClientRequestInfo info = clientRequestMap.compute(clientIp, (ip, current) -> {
                if (current == null || (now - current.windowStart) > ONE_MINUTE_MS) {
                    return new ClientRequestInfo(now, 1);
                } else {
                    current.requestCount++;
                    return current;
                }
            });

            if (info.requestCount > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); // HTTP 429
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"status\": 429, \"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Maximum 50 requests per minute allowed.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
