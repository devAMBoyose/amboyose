package com.bamby.jwt.banking.db;

import jakarta.persistence.*;

@Entity
@Table(name = "accounts")
public class DbAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false)
    private Integer pin;

    @Column(nullable = false)
    private Double balance;

    public DbAccount() {
    }

    public DbAccount(String username, Integer pin, Double balance) {
        this.username = username;
        this.pin = pin;
        this.balance = balance;
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

    public Integer getPin() {
        return pin;
    }

    public void setPin(Integer pin) {
        this.pin = pin;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }
}
