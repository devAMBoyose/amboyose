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

    /**
     * Find account by username (case-insensitive).
     */
    public Optional<Account> findByUsername(String username) {
        if (username == null) {
            return Optional.empty();
        }
        return accountRepo.findByUsernameIgnoreCase(username.toLowerCase());
    }

    /**
     * Find account by email (case-insensitive).
     */
    public Optional<Account> findByEmail(String email) {
        if (email == null) {
            return Optional.empty();
        }
        return accountRepo.findByEmailIgnoreCase(email.toLowerCase());
    }

    // ==========================
    // Login (username OR email)
    // ==========================

    /**
     * Login using username OR email + PIN.
     * The login field can be either:
     * - stored username
     * - or stored email
     */
    public Optional<Account> login(String loginValue, String pinStr) {
        int pin = parsePin(pinStr);

        if (loginValue == null || loginValue.isBlank()) {
            return Optional.empty();
        }

        String v = loginValue.trim().toLowerCase();

        // 1) Try username
        Optional<Account> opt = accountRepo.findByUsernameIgnoreCase(v);

        // 2) If not found, try email
        if (opt.isEmpty()) {
            opt = accountRepo.findByEmailIgnoreCase(v);
        }

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
     * Username is the lowercase email for consistency.
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

    /**
     * Update the PIN for the account with the given email.
     * Used by the Forgot PIN + OTP flow.
     */
    public void updatePinByEmail(String email, String newPin) {
        if (email == null || newPin == null) {
            throw new IllegalArgumentException("Email and new PIN must not be null.");
        }

        // Convert the PIN to int – your Account.pin field is int
        int pinInt;
        try {
            pinInt = Integer.parseInt(newPin.trim());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("PIN must be numeric (e.g. 1234).");
        }

        // Look up the account by email (case-insensitive)
        Account acc = accountRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("No account found for email: " + email));

        // Update and save
        acc.setPin(pinInt);
        accountRepo.save(acc);
    }

}
