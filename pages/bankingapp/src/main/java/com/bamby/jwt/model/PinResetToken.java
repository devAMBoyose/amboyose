package com.bamby.jwt.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "pin_reset_tokens")
public class PinResetToken {

    @Id
    private String id;

    private String username;
    private String token;
    private LocalDateTime expiresAt;
    private boolean used;

    public PinResetToken() {
    }

    public PinResetToken(String username, String token, LocalDateTime expiresAt) {
        this.username = username;
        this.token = token;
        this.expiresAt = expiresAt;
        this.used = false;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }
}
