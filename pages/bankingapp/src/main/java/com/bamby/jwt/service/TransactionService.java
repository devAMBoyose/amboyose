package com.bamby.jwt.service;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.model.Transaction;
import com.bamby.jwt.repository.AccountRepository;
import com.bamby.jwt.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class TransactionService {

    private final AccountRepository accountRepo;
    private final TransactionRepository txRepo;
    private final DataStore db;

    public TransactionService(AccountRepository accountRepo,
            TransactionRepository txRepo,
            DataStore db) {
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
        this.db = db;
    }

    // ==========================
    // CHECK BALANCE
    // ==========================
    public String checkBalance(Account acc) {
        if (acc == null) {
            return "No active account.<br>Please log in again.";
        }
        db.log("BALANCE checked for " + acc.getUsername());
        return "Hello, <strong>" + acc.getUsername() + "</strong>!<br>"
                + "Your current balance is <strong>"
                + DataStore.php(acc.getBalance()) + "</strong>.<br>";
    }

    // ==========================
    // DEPOSIT
    // ==========================
    public String deposit(Account acc, double amount) {
        if (acc == null) {
            return "No active account.<br>Please log in again.";
        }
        if (amount <= 0) {
            return "❌ Invalid deposit amount.";
        }

        double old = acc.getBalance();
        acc.setBalance(old + amount);
        accountRepo.save(acc);

        db.log("DEPOSIT " + DataStore.php(amount) + " to " + acc.getUsername());

        return "✅ Deposit successful!<br>"
                + "Old balance: " + DataStore.php(old) + "<br>"
                + "Deposited: " + DataStore.php(amount) + "<br>"
                + "New balance: <strong>" + DataStore.php(acc.getBalance()) + "</strong><br>";
    }

    // ==========================
    // WITHDRAW
    // ==========================
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
                    + "Your balance is " + DataStore.php(acc.getBalance()) + ".";
        }

        double old = acc.getBalance();
        acc.setBalance(old - amount);
        accountRepo.save(acc);

        db.log("WITHDRAW " + DataStore.php(amount) + " from " + acc.getUsername());

        return "✅ Withdrawal successful!<br>"
                + "Old balance: " + DataStore.php(old) + "<br>"
                + "Withdrawn: " + DataStore.php(amount) + "<br>"
                + "New balance: <strong>" + DataStore.php(acc.getBalance()) + "</strong><br>";
    }

    // ==========================
    // TRANSFER
    // ==========================
    public String transfer(Account from, String toUser, double amount) {
        if (from == null) {
            return "No active account.<br>Please log in again.";
        }
        if (amount <= 0) {
            return "❌ Invalid transfer amount.";
        }

        var toOpt = accountRepo.findByUsernameIgnoreCase(toUser);
        if (toOpt.isEmpty()) {
            return "❌ Target user <strong>" + toUser + "</strong> does not exist.";
        }
        Account to = toOpt.get();

        if (from.getUsername().equalsIgnoreCase(to.getUsername())) {
            return "❌ You cannot transfer to your own account.";
        }
        if (amount > from.getBalance()) {
            db.log("TRANSFER FAIL (insufficient) from "
                    + from.getUsername() + " to " + to.getUsername());
            return "❌ Insufficient funds for transfer.<br>"
                    + "Your balance is " + DataStore.php(from.getBalance()) + ".";
        }

        double fromOld = from.getBalance();
        double toOld = to.getBalance();

        from.setBalance(fromOld - amount);
        to.setBalance(toOld + amount);

        accountRepo.save(from);
        accountRepo.save(to);

        db.log("TRANSFER " + DataStore.php(amount) + " from "
                + from.getUsername() + " to " + to.getUsername());

        return "✅ Transfer successful!<br>"
                + "From: " + from.getUsername() + " (old " + DataStore.php(fromOld) + ")<br>"
                + "To: " + to.getUsername() + " (old " + DataStore.php(toOld) + ")<br>"
                + "Amount: " + DataStore.php(amount) + "<br>"
                + "New balance (you): <strong>" + DataStore.php(from.getBalance()) + "</strong><br>";
    }

    // ==========================
    // RECORD TRANSACTION ROW
    // ==========================
    public String record(String username,
            String type,
            double amount,
            double balanceAfter,
            boolean success) {

        String reference = generateReference(type);

        Transaction tx = new Transaction(
                LocalDateTime.now(),
                type,
                "APP",
                amount,
                balanceAfter,
                success ? "OK" : "FAILED",
                reference,
                username);

        txRepo.save(tx);
        return reference;
    }

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

    // ==========================
    // RECENT TRANSACTIONS
    // ==========================
    public List<Transaction> getRecentTransactions(String username, int limit) {
        List<Transaction> list = txRepo.findByUsernameOrderByTimestampDesc(username.toLowerCase());
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }
        return list.size() <= limit ? list : list.subList(0, limit);
    }

    // ==========================
    // HELP TEXT (for controller)
    // ==========================
    public String helpText() {
        return db.helpText();
    }
}
