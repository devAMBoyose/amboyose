package com.bamby.jwt.banking.api;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class DemoInfoController {

    // ------------------ DEMO BALANCE API ------------------
    @GetMapping("/demo-balance")
    public DemoBalanceResponse getDemoBalance() {
        // Fixed demo value – safe, no DB/DataStore access
        return new DemoBalanceResponse(new BigDecimal("120540.75"));
    }

    // ------------------ DEMO LAST TRANSACTION API ------------------
    @GetMapping("/demo-last-transaction")
    public DemoLastTransactionResponse getDemoLastTransaction() {
        // Fixed demo last transaction – safe demo data
        return new DemoLastTransactionResponse("DEPOSIT", new BigDecimal("3250.00"));
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
