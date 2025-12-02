package com.bamby.jwt.service;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.model.Transaction;
import com.bamby.jwt.repository.AccountRepository;
import com.bamby.jwt.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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

        // record balance check as a transaction row
        record(
                acc.getUsername().toLowerCase(),
                "Balance check",
                0.0,
                acc.getBalance(),
                true);

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

        // save transaction row for deposit
        record(
                acc.getUsername().toLowerCase(),
                "Deposit",
                amount,
                acc.getBalance(),
                true);

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

        // save transaction row for withdrawal
        record(
                acc.getUsername().toLowerCase(),
                "Withdraw",
                amount,
                acc.getBalance(),
                true);

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

        // ---------- INVALID AMOUNT ----------
        if (amount <= 0) {
            String msg = "❌ Invalid transfer amount.";

            String ref = generateReference("Transfer FAIL");
            recordWithReference(
                    from.getUsername().toLowerCase(),
                    "Transfer FAILED to " + toUser + " (invalid amount)",
                    amount,
                    from.getBalance(), // unchanged
                    false,
                    ref);

            return msg;
        }

        // ---------- TARGET USER NOT FOUND ----------
        var toOpt = accountRepo.findByUsernameIgnoreCase(toUser);
        if (toOpt.isEmpty()) {
            String msg = "❌ Target user <strong>" + toUser + "</strong> does not exist.";

            String ref = generateReference("Transfer FAIL");
            recordWithReference(
                    from.getUsername().toLowerCase(),
                    "Transfer FAILED to " + toUser + " (user not found)",
                    amount,
                    from.getBalance(),
                    false,
                    ref);

            return msg;
        }

        Account to = toOpt.get();

        // ---------- SELF TRANSFER ----------
        if (from.getUsername().equalsIgnoreCase(to.getUsername())) {
            String msg = "❌ You cannot transfer to your own account.";

            String ref = generateReference("Transfer FAIL");
            recordWithReference(
                    from.getUsername().toLowerCase(),
                    "Transfer FAILED to " + toUser + " (same account)",
                    amount,
                    from.getBalance(),
                    false,
                    ref);

            return msg;
        }

        // ---------- INSUFFICIENT FUNDS ----------
        if (amount > from.getBalance()) {
            db.log("TRANSFER FAIL (insufficient) from "
                    + from.getUsername() + " to " + to.getUsername());

            String msg = "❌ Insufficient funds for transfer."
                    + "Your balance is " + DataStore.php(from.getBalance()) + ".";

            String ref = generateReference("Transfer FAIL");
            recordWithReference(
                    from.getUsername().toLowerCase(),
                    "Transfer FAILED to " + to.getUsername() + " (insufficient funds)",
                    amount,
                    from.getBalance(),
                    false,
                    ref);

            return msg;
        }

        // ---------- SUCCESS CASE ----------
        double fromOld = from.getBalance();
        double toOld = to.getBalance();

        from.setBalance(fromOld - amount);
        to.setBalance(toOld + amount);

        accountRepo.save(from);
        accountRepo.save(to);

        db.log("TRANSFER " + DataStore.php(amount) + " from "
                + from.getUsername() + " to " + to.getUsername());

        // ONE shared reference for the successful transfer
        String sharedRef = generateReference("Transfer");

        // sender transaction (outgoing)
        recordWithReference(
                from.getUsername().toLowerCase(),
                "Transfer to " + to.getUsername(),
                amount,
                from.getBalance(),
                true,
                sharedRef);

        // receiver transaction (incoming)
        recordWithReference(
                to.getUsername().toLowerCase(),
                "Transfer from " + from.getUsername(),
                amount,
                to.getBalance(),
                true,
                sharedRef);

        return "✅ Transfer successful!"
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
        recordWithReference(username, type, amount, balanceAfter, success, reference);
        return reference;
    }

    private void recordWithReference(String username,
            String type,
            double amount,
            double balanceAfter,
            boolean success,
            String reference) {

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
    // SINGLE TRANSACTION LOOKUP BY ID (safety helper)
    // ==========================
    public Optional<Transaction> findByIdForUser(String id, String username) {
        if (id == null || username == null) {
            return Optional.empty();
        }
        var opt = txRepo.findById(id);
        if (opt.isEmpty()) {
            return Optional.empty();
        }
        Transaction tx = opt.get();
        if (!username.equalsIgnoreCase(tx.getUsername())) {
            return Optional.empty();
        }
        return Optional.of(tx);
    }

    // ==========================
    // SINGLE TRANSACTION LOOKUP BY REFERENCE (for TYPE link)
    // ==========================
    public Optional<Transaction> findLatestByReferenceForUser(String reference, String username) {
        if (reference == null || username == null) {
            return Optional.empty();
        }

        List<Transaction> list = txRepo.findByReferenceOrderByTimestampDesc(reference);
        if (list == null || list.isEmpty()) {
            return Optional.empty();
        }

        // pick the latest tx that belongs to this user
        for (Transaction tx : list) {
            if (username.equalsIgnoreCase(tx.getUsername())) {
                return Optional.of(tx);
            }
        }
        return Optional.empty();
    }

    // ==========================
    // HELP TEXT (for controller)
    // ==========================
    public String helpText() {
        return db.helpText();
    }
}
