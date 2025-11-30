package com.bamby.jwt.service;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final AccountRepository accountRepo;

    public AuthService(AccountRepository accountRepo) {
        this.accountRepo = accountRepo;
    }

    // ==========================
    // Helpers
    // ==========================

    private int parsePin(String pinStr) {
        if (pinStr == null || pinStr.length() != 4) {
            throw new IllegalStateException("PIN must be exactly 4 digits.");
        }

        try {
            return Integer.parseInt(pinStr);
        } catch (NumberFormatException ex) {
            throw new IllegalStateException("PIN must contain only digits.");
        }
    }

    // ==========================
    // Lookups
    // ==========================

    /** Find account by username (case-insensitive). */
    public Optional<Account> findByUsername(String username) {
        if (username == null) {
            return Optional.empty();
        }
        return accountRepo.findByUsernameIgnoreCase(username.toLowerCase());
    }

    /** Find account by email (case-insensitive). */
    public Optional<Account> findByEmail(String email) {
        if (email == null) {
            return Optional.empty();
        }
        return accountRepo.findByEmailIgnoreCase(email.toLowerCase());
    }

    // ==========================
    // Login
    // ==========================

    /**
     * Login using username + PIN.
     * Returns Optional.empty() if not found or PIN mismatch.
     */
    public Optional<Account> login(String username, String pinStr) {
        int pin = parsePin(pinStr);

        Optional<Account> opt = findByUsername(username);
        if (opt.isEmpty()) {
            return Optional.empty();
        }

        Account acc = opt.get();
        if (acc.getPin() != pin) {
            return Optional.empty();
        }

        return Optional.of(acc);
    }

    // ==========================
    // Demo registration (OTP signup)
    // ==========================

    /**
     * Register a demo account using firstName, lastName, email, and PIN.
     * Username is the lowercase email.
     */
    public Account registerDemoAccount(
            String firstName,
            String lastName,
            String email,
            String pinStr) {

        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Email is required.");
        }

        int pin = parsePin(pinStr);
        String username = email.toLowerCase();

        // If account already exists, treat as error – controller will show message.
        Optional<Account> existing = accountRepo.findByUsernameIgnoreCase(username);
        if (existing.isPresent()) {
            throw new IllegalStateException("An account with this email already exists. Please log in instead.");
        }

        // Initial demo balance – adjust if you want
        double initialBalance = 10_000;

        Account acc = new Account(username, pin, initialBalance);
        acc.setEmail(email);
        String fullName = (firstName + " " + lastName).trim();
        acc.setFullName(fullName);

        return accountRepo.save(acc);
    }
}
