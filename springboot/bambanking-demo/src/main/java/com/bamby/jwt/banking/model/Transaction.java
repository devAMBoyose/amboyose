package com.bamby.jwt.banking.model;

import java.time.LocalDateTime;

public class Transaction {

    private LocalDateTime timestamp;
    private String type; // Deposit, Withdrawal, Transfer, Balance Inquiry, etc.
    private String method; // APP, CHECK, ATM, etc.
    private double amount;
    private double balanceAfter;
    private String status; // OK, PENDING, FAILED
    private String reference; // NEW: unique reference per transaction

    public Transaction(LocalDateTime timestamp,
            String type,
            String method,
            double amount,
            double balanceAfter,
            String status,
            String reference) {
        this.timestamp = timestamp;
        this.type = type;
        this.method = method;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.status = status;
        this.reference = reference;
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

    // NEW: getter for reference
    public String getReference() {
        return reference;
    }
}
