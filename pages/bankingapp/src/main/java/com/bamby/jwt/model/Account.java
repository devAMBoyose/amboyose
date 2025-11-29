package com.bamby.jwt.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "accounts")
public class Account {

    @Id
    private String id;

    // login name (you are using email-like usernames)
    private String username;

    // real email column so Spring Data "findByEmail" works
    private String email;

    // for nicer emails ("Anna Boyose")
    private String fullName;

    private int pin;
    private double balance;

    public Account() {
    }

    public Account(String username, int pin, double balance) {
        this.username = username.toLowerCase();
        this.email = username.toLowerCase();
        this.fullName = username;
        this.pin = pin;
        this.balance = balance;
    }

    // ---------------- getters / setters ----------------

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase() : null;
    }

    public String getFullName() {
        return fullName != null ? fullName : username;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public int getPin() {
        return pin;
    }

    public void setPin(int pin) {
        this.pin = pin;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }
}
