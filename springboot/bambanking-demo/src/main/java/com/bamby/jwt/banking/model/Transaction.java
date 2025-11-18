package com.bamby.jwt.banking.model;

import java.time.LocalDateTime;

public class Transaction {

    private LocalDateTime timestamp;
    private String type; // Deposit, Withdrawal, Transfer
    private String method; // APP, CHECK, etc.
    private double amount;
    private double balanceAfter;
    private String status; // OK, PENDING, FAILED

    public Transaction(LocalDateTime timestamp,
            String type,
            String method,
            double amount,
            double balanceAfter,
            String status) {
        this.timestamp = timestamp;
        this.type = type;
        this.method = method;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getType() {
        return type;
    }

    public String getMethod() {
        return method;
    }

    public double getAmount() {
        return amount;
    }

    public double getBalanceAfter() {
        return balanceAfter;
    }

    public String getStatus() {
        return status;
    }
}
