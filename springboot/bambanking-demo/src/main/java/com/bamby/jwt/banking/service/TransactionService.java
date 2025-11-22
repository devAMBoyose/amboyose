package com.bamby.jwt.banking.service;

import com.bamby.jwt.banking.model.Account;
import com.bamby.jwt.banking.model.Transaction;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class TransactionService {

    private final DataStore db;

    public TransactionService(DataStore db) {
        this.db = db;
    }

    // UC2 – CHECK BALANCE
    public String checkBalance(Account acc) {
        if (acc == null) {
            return "No active account.<br>Please log in again.";
        }
        db.log("BALANCE checked for " + acc.getUsername());
        return "Hello, <strong>" + acc.getUsername() + "</strong>!<br>"
                + "Your current balance is <strong>" + DataStore.php(acc.getBalance()) + "</strong>.<br>";
    }

    // UC3 – DEPOSIT
    public String deposit(Account acc, double amount) {
        if (acc == null) {
            return "No active account.<br>Please log in again.";
        }
        if (amount <= 0) {
            return "❌ Invalid deposit amount.";
        }
        double oldBalance = acc.getBalance();
        acc.setBalance(oldBalance + amount);
        db.log("DEPOSIT " + DataStore.php(amount) + " to " + acc.getUsername());
        return "✅ Deposit successful!<br>"
                + "Old balance: " + DataStore.php(oldBalance) + "<br>"
                + "Deposited: " + DataStore.php(amount) + "<br>"
                + "New balance: <strong>" + DataStore.php(acc.getBalance()) + "</strong><br>";
    }

    // UC4 – WITHDRAW
    public String withdraw(Account acc, double amount) {
        if (acc == null) {
            return "No active account.<br>Please log in again.";
        }
        if (amount <= 0) {
            return "❌ Invalid withdrawal amount.";
        }
        if (amount > acc.getBalance()) {
            db.log("WITHDRAW FAIL (insufficient) for " + acc.getUsername());
            return "❌ Insufficient funds.<br>"
                    + "Your balance is only " + DataStore.php(acc.getBalance()) + ".";
        }
        double oldBalance = acc.getBalance();
        acc.setBalance(oldBalance - amount);
        db.log("WITHDRAW " + DataStore.php(amount) + " from " + acc.getUsername());
        return "✅ Withdrawal successful!<br>"
                + "Old balance: " + DataStore.php(oldBalance) + "<br>"
                + "Withdrawn: " + DataStore.php(amount) + "<br>"
                + "New balance: <strong>" + DataStore.php(acc.getBalance()) + "</strong><br>";
    }

    // UC5 – TRANSFER
    public String transfer(Account from, String toUser, double amount) {
        if (from == null) {
            return "No active account.<br>Please log in again.";
        }
        if (amount <= 0) {
            return "❌ Invalid transfer amount.";
        }

        Account to = db.accounts.get(toUser.toLowerCase());
        if (to == null) {
            return "❌ Target user <strong>" + toUser + "</strong> does not exist.";
        }
        if (from.getUsername().equalsIgnoreCase(to.getUsername())) {
            return "❌ You cannot transfer to your own account.";
        }
        if (amount > from.getBalance()) {
            db.log("TRANSFER FAIL (insufficient) from " + from.getUsername() + " to " + to.getUsername());
            return "❌ Insufficient funds for transfer.<br>"
                    + "Your balance is " + DataStore.php(from.getBalance()) + ".";
        }

        double fromOld = from.getBalance();
        double toOld = to.getBalance();

        from.setBalance(fromOld - amount);
        to.setBalance(toOld + amount);

        db.log("TRANSFER " + DataStore.php(amount)
                + " from " + from.getUsername() + " to " + to.getUsername());

        return "✅ Transfer successful!<br>"
                + "From: <strong>" + from.getUsername() + "</strong><br>"
                + "To: <strong>" + to.getUsername() + "</strong><br>"
                + "Amount: " + DataStore.php(amount) + "<br>"
                + "Your new balance: <strong>" + DataStore.php(from.getBalance()) + "</strong><br>";
    }

    // UC7 – HELP TEXT
    public String helpText() {
        db.log("HELP viewed");
        return "=== App Help ===<br>"
                + "- Check Balance: shows your current balance.<br>"
                + "- Deposit: add money to your account.<br>"
                + "- Withdraw: remove money if you have enough.<br>"
                + "- Transfer: send money to another user.<br>"
                + "- Tips: amounts must be positive; PIN is required at login.<br>"
                + "=================<br>";
    }

    // record one transaction in history (now with reference)
    public void record(String username,
            String type,
            double amount,
            double balanceAfter,
            boolean success) {

        String status = success ? "OK" : "FAILED";
        String reference = generateReference(type);

        Transaction tx = new Transaction(
                LocalDateTime.now(),
                type,
                "APP", // method
                amount,
                balanceAfter,
                status,
                reference);

        // add newest at top of list
        db.getTxList(username).add(0, tx);
    }

    // generate reference like BB-DEP-<timestamp>, BB-WDL-<timestamp>, etc.
    private String generateReference(String type) {
        String lower = type.toLowerCase();
        String prefix;
        if (lower.contains("deposit")) {
            prefix = "DEP";
        } else if (lower.contains("withdraw")) {
            prefix = "WDL";
        } else if (lower.contains("transfer")) {
            prefix = "TRF";
        } else if (lower.contains("balance")) {
            prefix = "BAL";
        } else {
            prefix = "GEN";
        }
        long now = System.currentTimeMillis();
        return "BB-" + prefix + "-" + now;
    }

    // get last N transactions for dashboard
    public List<Transaction> getRecentTransactions(String username, int limit) {
        List<Transaction> list = db.getTxList(username);
        if (list.isEmpty()) {
            return Collections.emptyList();
        }
        return list.size() <= limit ? list : list.subList(0, limit);
    }
}
