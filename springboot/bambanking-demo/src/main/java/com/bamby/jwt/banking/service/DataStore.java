package com.bamby.jwt.banking.service;

import com.bamby.jwt.banking.model.Account;
import com.bamby.jwt.banking.model.Transaction;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataStore {

    // existing data
    public final Map<String, Account> accounts = new HashMap<>();
    public final List<String> logs = new ArrayList<>();

    // ✅ NEW: transaction history per username
    public final Map<String, List<Transaction>> txHistory = new HashMap<>();

    public DataStore() {
        seedData();
    }

    private void seedData() {
        accounts.clear();
        logs.clear();
        txHistory.clear();

        // Demo users
        accounts.put("anna", new Account("anna", 1234, 1500.00));
        accounts.put("bamby", new Account("bamby", 4321, 750.00));
        accounts.put("guest", new Account("guest", 1111, 100.00));
        accounts.put("sample", new Account("sample", 2222, 100.00));

        log("SEED DATA loaded with demo users");
    }

    public void log(String message) {
        logs.add(new Date() + " | " + message);
    }

    public static String php(double v) {
        return String.format("PHP %.2f", v);
    }

    // ✅ helper – always returns a list for that user
    public List<Transaction> getTxList(String username) {
        return txHistory.computeIfAbsent(
                username.toLowerCase(),
                k -> new ArrayList<>());
    }
}
