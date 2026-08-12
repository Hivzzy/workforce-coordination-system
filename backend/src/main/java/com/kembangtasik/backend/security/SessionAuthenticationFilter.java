package com.kembangtasik.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SessionAuthenticationFilter.class);
    public static final String COOKIE_NAME = "session_id";

    private final RedisSessionService redisSessionService;
    private final CustomUserDetailsService customUserDetailsService;

    public SessionAuthenticationFilter(RedisSessionService redisSessionService, CustomUserDetailsService customUserDetailsService) {
        this.redisSessionService = redisSessionService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String sessionId = getSessionIdFromRequest(request);

            if (StringUtils.hasText(sessionId)) {
                RedisSessionService.SessionData session = redisSessionService.getSession(sessionId);

                if (session != null && !session.isExpired()) {
                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(session.getEmail());

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    log.debug("Session ID invalid or expired: {}", sessionId);
                }
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context from session", ex);
        }

        filterChain.doFilter(request, response);
    }

    public static String getSessionIdFromRequest(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (COOKIE_NAME.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                    return cookie.getValue();
                }
                // Backward compatibility check for jwt_token cookie name
                if ("jwt_token".equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                    return cookie.getValue();
                }
            }
        }

        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        String xSessionHeader = request.getHeader("X-Session-ID");
        if (StringUtils.hasText(xSessionHeader)) {
            return xSessionHeader.trim();
        }

        return null;
    }
}
