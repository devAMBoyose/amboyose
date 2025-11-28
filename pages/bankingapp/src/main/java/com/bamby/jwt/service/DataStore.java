package com.bamby.jwt.service;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.model.Transaction;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataStore {

    // In-memory map kept only so DemoInfoController / API can still read something
    public final Map<String, Account> accounts = new HashMap<>();

    // Logs
    public final List<String> logs = new ArrayList<>();

    public DataStore() {
        log("APPLICATION STARTED");
    }

    public void log(String message) {
        logs.add(new Date() + " | " + message);
    }

    public static String php(double v) {
        return String.format("PHP %.2f", v);
    }

    // For DemoInfoController: currently empty list (main history is in Mongo)
    public List<Transaction> getTxList(String username) {
        return Collections.emptyList();
    }

    public String helpText() {
        return "BamBanking demo – help text not yet implemented.";
    }

    // Used by old signup/API if needed
    public boolean exists(String username) {
        if (username == null)
            return false;
        return accounts.containsKey(username.toLowerCase());
    }

    public void save(Account acc) {
        if (acc == null || acc.getUsername() == null)
            return;
        accounts.put(acc.getUsername().toLowerCase(), acc);
    }
}
