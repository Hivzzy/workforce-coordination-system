package com.kembangtasik.backend.security;

import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Set<String> blacklistedTokens = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void blacklistToken(String token) {
        if (token != null && !token.isBlank()) {
            blacklistedTokens.add(token.trim());
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) return false;
        return blacklistedTokens.contains(token.trim());
    }
}
