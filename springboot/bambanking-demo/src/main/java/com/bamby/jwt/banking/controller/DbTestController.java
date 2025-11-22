package com.bamby.jwt.banking.controller;

import com.bamby.jwt.banking.db.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/bambanking/db-test")
public class DbTestController {

    private final DbAccountRepository accountRepo;
    private final DbTransactionRepository txRepo;

    public DbTestController(DbAccountRepository accountRepo,
            DbTransactionRepository txRepo) {
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
    }

    // 1) Create a demo account in the DB
    @PostMapping("/create-account")
    public DbAccount createAccount(@RequestParam String username) {
        DbAccount acc = new DbAccount(username, 1234, 1000.00);
        return accountRepo.save(acc);
    }

    // 2) Create a demo transaction for that account
    @PostMapping("/create-transaction")
    public DbTransaction createTransaction(@RequestParam String username,
            @RequestParam Double amount) {

        double newBalance = amount; // just dummy logic for now

        DbTransaction tx = new DbTransaction(
                username,
                LocalDateTime.now(),
                "Deposit",
                "APP",
                amount,
                newBalance,
                "OK",
                "BB-TEST-" + System.currentTimeMillis());

        return txRepo.save(tx);
    }

    // 3) List accounts
    @GetMapping("/accounts")
    public List<DbAccount> listAccounts() {
        return accountRepo.findAll();
    }

    // 4) List transactions for a user
    @GetMapping("/transactions/{username}")
    public List<DbTransaction> listTransactions(@PathVariable String username) {
        return txRepo.findByUsernameOrderByTimestampDesc(username);
    }
}
