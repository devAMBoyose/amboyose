package com.bamby.jwt.banking.db;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class DbTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 50)
    private String type; // Deposit, Withdrawal, Transfer

    @Column(length = 50)
    private String method; // APP, ATM, etc.

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Double balanceAfter;

    @Column(length = 50)
    private String status; // OK, FAILED, etc.

    @Column(length = 100, unique = true)
    private String reference;

    public DbTransaction() {
    }

    public DbTransaction(
            String username,
            LocalDateTime timestamp,
            String type,
            String method,
            Double amount,
            Double balanceAfter,
            String status,
            String reference) {
        this.username = username;
        this.timestamp = timestamp;
        this.type = type;
        this.method = method;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.status = status;
        this.reference = reference;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Double getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(Double balanceAfter) {
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
