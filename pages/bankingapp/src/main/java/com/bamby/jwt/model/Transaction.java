package com.bamby.jwt.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    private String username;

    private LocalDateTime timestamp;
    private String type; // Deposit, Withdrawal, Transfer, etc.
    private String method; // APP, ATM, etc.
    private double amount;
    private double balanceAfter;
    private String status; // OK, FAILED, etc.
    private String reference; // BB-DEP-XXXX...

    public Transaction() {
    }

    public Transaction(LocalDateTime timestamp,
            String type,
            String method,
            double amount,
            double balanceAfter,
            String status,
            String reference,
            String username) {
        this.timestamp = timestamp;
        this.type = type;
        this.method = method;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.status = status;
        this.reference = reference;
        this.username = username.toLowerCase();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username.toLowerCase();
    }

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

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public double getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(double balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }
}
