package com.bamby.jwt.banking.api;

import com.bamby.jwt.banking.model.Account;
import com.bamby.jwt.banking.model.Transaction;
import com.bamby.jwt.banking.service.DataStore;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class DemoInfoController {

    private final DataStore db;

    public DemoInfoController(DataStore db) {
        this.db = db;
    }

    // ----------- LIVE BALANCE FOR DEMO USER "anna" -----------
    @GetMapping("/demo-balance")
    public DemoBalanceResponse getDemoBalance() {

        String username = "anna";

        Account anna = db.accounts.get(username);
        double bal = (anna != null) ? anna.getBalance() : 0.0;

        return new DemoBalanceResponse(BigDecimal.valueOf(bal));
    }

    // ----------- LIVE LAST TRANSACTION FOR "anna" -----------
    @GetMapping("/demo-last-transaction")
    public DemoLastTransactionResponse getDemoLastTransaction() {

        String username = "anna";

        List<Transaction> list = db.getTxList(username);
        if (list == null || list.isEmpty()) {
            return new DemoLastTransactionResponse("NONE", BigDecimal.ZERO);
        }

        // your TransactionService saves newest first (check your implementation);
        // if it's oldest first, change to list.get(list.size() - 1)
        Transaction lastTx = list.get(0);

        String type = lastTx.getType(); // e.g. "DEPOSIT", "WITHDRAW"
        double amt = lastTx.getAmount();

        return new DemoLastTransactionResponse(type, BigDecimal.valueOf(amt));
    }

    // ------------------ DTO CLASSES ------------------

    public static class DemoBalanceResponse {
        private BigDecimal balance;

        public DemoBalanceResponse(BigDecimal balance) {
            this.balance = balance;
        }

        public BigDecimal getBalance() {
            return balance;
        }

        public void setBalance(BigDecimal balance) {
            this.balance = balance;
        }
    }

    public static class DemoLastTransactionResponse {
        private String type;
        private BigDecimal amount;

        public DemoLastTransactionResponse(String type, BigDecimal amount) {
            this.type = type;
            this.amount = amount;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
    }
}
