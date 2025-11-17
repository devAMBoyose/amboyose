package com.bamby.jwt.banking.model;

public class Account {

    private final String username;
    private final int pin;
    private double balance;

    public Account(String username, int pin, double balance) {
        this.username = username;
        this.pin = pin;
        this.balance = balance;
    }

    public String getUsername() {
        return username;
    }

    public int getPin() {
        return pin;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }
}
