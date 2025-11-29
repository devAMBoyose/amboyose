package com.bamby.jwt.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static class OtpEntry {
        String code;
        LocalDateTime expiresAt;

        OtpEntry(String code, LocalDateTime expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final Random random = new Random();

    // 6-digit OTP, valid for 5 minutes
    public String createOtpForUser(String username) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);
        store.put(username.toLowerCase(), new OtpEntry(code, expiry));
        return code;
    }

    public boolean verifyOtp(String username, String code) {
        if (username == null || code == null)
            return false;

        String key = username.toLowerCase();
        OtpEntry entry = store.get(key);
        if (entry == null)
            return false;

        if (LocalDateTime.now().isAfter(entry.expiresAt)) {
            store.remove(key);
            return false;
        }

        boolean match = entry.code.equals(code.trim());
        if (match) {
            store.remove(key); // one-time use
        }
        return match;
    }
}
