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

    // 🔹 NEW: 16-digit card number and 3-digit CVV
    private String cardNumber; // 16 digits
    private String cvv; // 3 digits

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

    // ---------- card number / CVV ----------

    /** Full raw 16-digit card number stored in DB. */
    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    /** 3-digit CVV code (string so we keep leading zeros). */
    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    /**
     * Card number grouped for UI: 1234 5678 9012 3456
     */
    public String getFormattedCardNumber() {
        if (cardNumber == null || cardNumber.length() != 16) {
            return "0000 0000 0000 0000";
        }
        return cardNumber.substring(0, 4) + " "
                + cardNumber.substring(4, 8) + " "
                + cardNumber.substring(8, 12) + " "
                + cardNumber.substring(12);
    }

    /**
     * Masked version if you still need it somewhere else.
     */
    public String getMaskedCardNumber() {
        if (cardNumber == null || cardNumber.length() != 16) {
            return "0000 **** **** 0000";
        }
        String first4 = cardNumber.substring(0, 4);
        String last4 = cardNumber.substring(12);
        return first4 + " **** **** " + last4;
    }
}
