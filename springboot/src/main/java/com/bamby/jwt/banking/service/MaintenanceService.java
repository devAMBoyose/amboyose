package com.bamby.jwt.banking.service;

import com.bamby.jwt.banking.model.Account;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class MaintenanceService {

    private final DataStore db;

    public MaintenanceService(DataStore db) {
        this.db = db;
    }

    // UC9
    public String softwareUpdates() {
        db.log("SOFTWARE UPDATE applied");
        return "Applying software update... Done. System is up to date.";
    }

    // UC10
    public String diagnostics() {
        double total = 0.0;
        for (Map.Entry<String, Account> e : db.accounts.entrySet()) {
            total += e.getValue().getBalance();
        }

        StringBuilder recent = new StringBuilder();
        int start = Math.max(0, db.logs.size() - 10);
        for (int i = start; i < db.logs.size(); i++) {
            recent.append(" - ").append(db.logs.get(i)).append("<br>");
        }

        db.log("DIAGNOSTICS viewed");

        StringBuilder sb = new StringBuilder();
        sb.append("=== Diagnostics ===<br>");
        sb.append("Users: ").append(db.accounts.size()).append("<br>");
        sb.append("Total system balance: ").append(DataStore.php(total)).append("<br>");
        sb.append("Recent logs:<br>");
        sb.append(recent);
        sb.append("===================<br>");
        return sb.toString();
    }
}
