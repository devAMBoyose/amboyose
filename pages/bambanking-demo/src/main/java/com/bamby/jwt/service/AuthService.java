package com.bamby.jwt.service;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.repository.AccountRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AccountRepository accountRepo;
    private final DataStore db;

    public AuthService(AccountRepository accountRepo, DataStore db) {
        this.accountRepo = accountRepo;
        this.db = db;
    }

    // ====================================
    // SIGNUP (used by Postman + HTML form)
    // ====================================
    public Account register(String fullName, String email, String pinRaw) {

        String name = fullName == null ? "" : fullName.trim();
        String mail = email == null ? "" : email.trim().toLowerCase();

        if (name.isEmpty()) {
            db.log("REGISTER FAIL (missing fullName)");
            return null;
        }
        if (mail.isEmpty()) {
            db.log("REGISTER FAIL (missing email)");
            return null;
        }
        if (pinRaw == null || !pinRaw.matches("\\d{4}")) {
            db.log("REGISTER FAIL (invalid PIN) for " + mail);
            return null;
        }

        int pinInt;
        try {
            pinInt = Integer.parseInt(pinRaw);
        } catch (NumberFormatException ex) {
            db.log("REGISTER FAIL (PIN parse error) for " + mail);
            return null;
        }

        try {
            // duplicate check
            if (accountRepo.existsByUsernameIgnoreCase(mail)) {
                db.log("REGISTER FAIL (duplicate user) " + mail);
                return null;
            }

            Account acc = new Account(mail, pinInt, 0.0);

            // 1) save to MongoDB
            Account saved = accountRepo.save(acc);

            // 2) ALSO save in DataStore so the existing login/demo logic can see it
            db.save(saved);

            db.log("REGISTER OK for user " + mail + " (" + name + ")");
            return saved;

        } catch (DataAccessException ex) {
            db.log("REGISTER ERROR (DB) for " + mail + ": " + ex.getMessage());
            return null;
        }
    }

    // ====================================
    // LOGIN (used by /bambanking/login)
    // ====================================
    public Account authenticateCustomer(String username, String pinRaw) {

        if (username == null || username.isBlank()) {
            return null;
        }
        if (pinRaw == null || !pinRaw.matches("\\d{4}")) {
            return null;
        }

        String normalized = username.trim().toLowerCase();
        int pin;
        try {
            pin = Integer.parseInt(pinRaw);
        } catch (NumberFormatException ex) {
            return null;
        }

        try {
            // Read from Mongo as the main source of truth
            return accountRepo.findByUsernameIgnoreCase(normalized)
                    .filter(acc -> acc.getPin() == pin)
                    .map(acc -> {
                        db.log("AUTH OK for user " + normalized);
                        // keep DataStore in sync
                        db.save(acc);
                        return acc;
                    })
                    .orElseGet(() -> {
                        db.log("AUTH FAIL for user " + normalized);
                        return null;
                    });

        } catch (DataAccessException ex) {
            db.log("AUTH ERROR (DB) for user " + normalized + ": " + ex.getMessage());
            return null;
        }
    }

    // Helper
    public Account findByUsername(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }
        String normalized = username.trim().toLowerCase();
        try {
            return accountRepo.findByUsernameIgnoreCase(normalized).orElse(null);
        } catch (DataAccessException ex) {
            db.log("FIND USER ERROR (DB) " + normalized + ": " + ex.getMessage());
            return null;
        }
    }
}
