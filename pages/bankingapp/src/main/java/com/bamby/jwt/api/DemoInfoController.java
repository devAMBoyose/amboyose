package com.bamby.jwt.api;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.model.Transaction;
import com.bamby.jwt.service.AuthService;
import com.bamby.jwt.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * API used by the portfolio warm-up page.
 * Returns a snapshot of one fixed demo account
 * (balance + a few recent transactions).
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/bambanking/api")
public class DemoInfoController {

    // This should match the username/email you use to log in
    private static final String DEMO_USERNAME = "bamby.dev@gmail.com";

    private final AuthService authService;
    private final TransactionService transactionService;

    public DemoInfoController(AuthService authService,
            TransactionService transactionService) {
        this.authService = authService;
        this.transactionService = transactionService;
    }

    @GetMapping("/demo-summary")
    public DemoSummaryResponse getDemoSummary() {

        // 1) Look up the fixed demo account using your existing AuthService
        Account acc = authService.findByUsername(DEMO_USERNAME)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Demo account '" + DEMO_USERNAME + "' not found"));

        // 2) Current balance (your model uses double)
        double balance = acc.getBalance();

        // 3) Recent transactions (same method as dashboard)
        List<Transaction> recent = transactionService
                .getRecentTransactions(acc.getUsername(), 5);

        List<TxItem> txDtos = new ArrayList<>();
        if (recent != null) {
            for (Transaction tx : recent) {
                TxItem dto = new TxItem();
                // Transaction has getTimestamp(), getType(), getAmount(), getStatus()
                dto.setTimestamp(tx.getTimestamp());
                dto.setType(tx.getType());
                dto.setAmount(tx.getAmount());
                dto.setStatus(tx.getStatus());
                txDtos.add(dto);
            }
        }

        // 4) Build response
        DemoSummaryResponse res = new DemoSummaryResponse();
        res.setBalance(balance);
        res.setCurrency("PHP");

        String label = acc.getFullName();
        if (label == null || label.isBlank()) {
            label = acc.getUsername();
        }
        res.setAccountLabel(label);
        res.setUpdatedAt(LocalDateTime.now());
        res.setLastTransactions(txDtos);

        return res;
    }

    // ------------- DTO classes returned as JSON -------------

    public static class DemoSummaryResponse {
        private double balance;
        private String currency;
        private String accountLabel;
        private LocalDateTime updatedAt;
        private List<TxItem> lastTransactions;

        public double getBalance() {
            return balance;
        }

        public void setBalance(double balance) {
            this.balance = balance;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public String getAccountLabel() {
            return accountLabel;
        }

        public void setAccountLabel(String accountLabel) {
            this.accountLabel = accountLabel;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }

        public List<TxItem> getLastTransactions() {
            return lastTransactions;
        }

        public void setLastTransactions(List<TxItem> lastTransactions) {
            this.lastTransactions = lastTransactions;
        }
    }

    public static class TxItem {
        // name is "timestamp" on purpose:
        // JS checks tx.date || tx.createdAt || tx.timestamp
        private LocalDateTime timestamp;
        private String type;
        private double amount;
        private String status;

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
