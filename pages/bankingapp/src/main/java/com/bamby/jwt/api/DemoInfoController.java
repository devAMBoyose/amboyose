package com.bamby.jwt.api;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.model.Transaction;
import com.bamby.jwt.repository.AccountRepository;
import com.bamby.jwt.repository.TransactionRepository;
import com.bamby.jwt.service.DataStore;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class DemoInfoController {

    private final DataStore db;
    private final AccountRepository accountRepo;
    private final TransactionRepository txRepo;

    public DemoInfoController(DataStore db,
            AccountRepository accountRepo,
            TransactionRepository txRepo) {
        this.db = db;
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
    }

    // Simple ping
    @GetMapping("/ping")
    public String ping() {
        return "BamBanking API is alive";
    }

    // Help text (uses DataStore.helpText())
    @GetMapping("/help")
    public String help() {
        return db.helpText();
    }

    // List all accounts (basic demo info)
    @GetMapping("/accounts")
    public List<String> listAccounts() {
        return accountRepo.findAll()
                .stream()
                .map(Account::getUsername)
                .collect(Collectors.toList());
    }

    // Get current balance of a user
    @GetMapping("/accounts/{username}/balance")
    public DemoBalanceResponse getBalance(@PathVariable String username) {
        Account acc = accountRepo.findByUsernameIgnoreCase(username)
                .orElse(null);

        BigDecimal balance = (acc != null)
                ? BigDecimal.valueOf(acc.getBalance())
                : BigDecimal.ZERO;

        return new DemoBalanceResponse(balance);
    }

    // Get recent transactions as a small summary list
    @GetMapping("/accounts/{username}/transactions")
    public List<DemoTxSummary> getTransactions(@PathVariable String username) {
        List<Transaction> txList = txRepo.findByUsernameOrderByTimestampDesc(username.toLowerCase());

        return txList.stream()
                .map(tx -> new DemoTxSummary(
                        tx.getType(),
                        BigDecimal.valueOf(tx.getAmount())))
                .collect(Collectors.toList());
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

    public static class DemoTxSummary {
        private String type;
        private BigDecimal amount;

        public DemoTxSummary(String type, BigDecimal amount) {
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
