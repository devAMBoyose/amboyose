package com.bamby.jwt.banking.service;

import com.bamby.jwt.banking.model.Account;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final DataStore db;

    public AuthService(DataStore db) {
        this.db = db;
    }

    public Account authenticateCustomer(String username, int pin) {
        if (username == null) {
            return null;
        }

        // Always store keys in lowercase
        Account acc = db.accounts.get(username.toLowerCase());

        if (acc != null && acc.getPin() == pin) {
            db.log("AUTH OK for user " + acc.getUsername());
            return acc;
        }

        db.log("AUTH FAIL for user " + username);
        return null;
    }

    // Optional: engineer login (not used by HTML yet)
    public boolean authenticateEngineer(String id, int pin) {
        boolean ok = "engineer".equalsIgnoreCase(id) && pin == 9999;
        db.log(ok ? "ENGINEER AUTH OK" : "ENGINEER AUTH FAIL");
        return ok;
    }

    public Account register(String fullName, String email, String pin) {

        if (email == null || pin == null) {
            return null;
        }

        int pinInt;
        try {
            pinInt = Integer.parseInt(pin);
        } catch (NumberFormatException e) {
            // invalid PIN (hindi number)
            db.log("REGISTER FAIL (invalid PIN) for " + email);
            return null;
        }

        // gagamitin natin ang email bilang username
        String username = email.toLowerCase();

        // check kung existing na ang account
        if (db.accounts.containsKey(username)) {
            db.log("REGISTER FAIL (duplicate user) " + username);
            return null;
        }

        // Account(String username, int pin, double balance)
        Account acc = new Account(username, pinInt, 0.0);

        // isave sa in-memory database
        db.accounts.put(username, acc);

        db.log("REGISTER OK for user " + username + " (" + fullName + ")");
        return acc;
    }

}
