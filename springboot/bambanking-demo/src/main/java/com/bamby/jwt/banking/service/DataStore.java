package com.bamby.jwt.banking.service;

import com.bamby.jwt.banking.model.Account;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataStore {

    public final Map<String, Account> accounts = new HashMap<>();
    public final List<String> logs = new ArrayList<>();

    public DataStore() {
        seedData();
    }

    private void seedData() {
        accounts.clear();
        logs.clear();

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
}
