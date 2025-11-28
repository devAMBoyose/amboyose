package com.bamby.jwt.service;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.repository.AccountRepository;
import org.springframework.stereotype.Service;

@Service
public class MaintenanceService {

    private final DataStore db;
    private final AccountRepository accountRepo;

    public MaintenanceService(DataStore db, AccountRepository accountRepo) {
        this.db = db;
        this.accountRepo = accountRepo;
    }

    public String diagnostics() {
        double total = 0.0;
        long count = 0;

        for (Account acc : accountRepo.findAll()) {
            total += acc.getBalance();
            count++;
        }

        int start = Math.max(0, db.logs.size() - 5);
        StringBuilder recent = new StringBuilder();
        for (int i = start; i < db.logs.size(); i++) {
            recent.append("- ").append(db.logs.get(i)).append("<br>");
        }

        db.log("DIAGNOSTICS viewed");

        StringBuilder sb = new StringBuilder();
        sb.append("=== Diagnostics ===<br>");
        sb.append("Users: ").append(count).append("<br>");
        sb.append("Total system balance: ").append(DataStore.php(total)).append("<br>");
        sb.append("Recent logs:<br>");
        sb.append(recent);
        sb.append("===================<br>");
        return sb.toString();
    }

    public String softwareUpdates() {
        db.log("SOFTWARE UPDATE check requested");
        return "=== Software Update ===<br>"
                + "No pending updates. You are on the latest BamBanking demo build.<br>"
                + "=======================<br>";
    }
}
