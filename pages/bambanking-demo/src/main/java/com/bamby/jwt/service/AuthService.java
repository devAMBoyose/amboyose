package com.bamby.jwt.service;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.repository.AccountRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AccountRepository accountRepo;
    private final DataStore db;

    public AuthService(AccountRepository accountRepo, DataStore db) {
        this.accountRepo = accountRepo;
        this.db = db;
    }

    // LOGIN
    public Account authenticateCustomer(String username, int pin) {
        if (username == null) {
            return null;
        }

        return accountRepo.findByUsernameIgnoreCase(username)
                .filter(acc -> acc.getPin() == pin)
                .map(acc -> {
                    db.log("AUTH OK for user " + acc.getUsername());
                    return acc;
                })
                .orElseGet(() -> {
                    db.log("AUTH FAIL for user " + username);
                    return null;
                });
    }

    // SIGNUP (from login.html flip-card)
    public Account register(String fullName, String email, String pin) {
        if (email == null || pin == null) {
            return null;
        }

        int pinInt;
        try {
            pinInt = Integer.parseInt(pin);
        } catch (NumberFormatException e) {
            db.log("REGISTER FAIL (invalid PIN) for " + email);
            return null;
        }

        String username = email.toLowerCase();

        if (accountRepo.existsByUsernameIgnoreCase(username)) {
            db.log("REGISTER FAIL (duplicate user) " + username);
            return null;
        }

        Account acc = new Account(username, pinInt, 0.0);
        accountRepo.save(acc);

        db.log("REGISTER OK for user " + username + " (" + fullName + ")");
        return acc;
    }

    // Helper for controller
    public Account findByUsername(String username) {
        if (username == null)
            return null;
        return accountRepo.findByUsernameIgnoreCase(username).orElse(null);
    }
}
