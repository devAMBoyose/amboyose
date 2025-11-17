package com.bamby.jwt.banking.service;

import com.bamby.jwt.banking.model.Account;
import org.springframework.stereotype.Service;

@Service
public class MaintenanceService {

    private final DataStore db;

    public MaintenanceService(DataStore db) {
        this.db = db;
    }

    // Diagnostics (UC: ENGINEER / ADMIN)
    public String diagnostics() {
        double total = 0.0;
        for (Account acc : db.accounts.values()) {
            total += acc.getBalance();
        }

        // Last 5 logs
        int start = Math.max(0, db.logs.size() - 5);
        StringBuilder recent = new StringBuilder();
        for (int i = start; i < db.logs.size(); i++) {
            recent.append("- ").append(db.logs.get(i)).append("<br>");
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

    // Software update check
    public String softwareUpdates() {
        db.log("SOFTWARE UPDATE check requested");
        return "=== Software Update ===<br>"
                + "No pending updates. You are on the latest BamBanking demo build.<br>"
                + "=======================<br>";
    }
}
