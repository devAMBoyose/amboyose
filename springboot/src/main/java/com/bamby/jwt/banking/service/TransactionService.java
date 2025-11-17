package com.bamby.jwt.banking.service;

import com.bamby.jwt.banking.model.Account;
import org.springframework.stereotype.Service;

@Service
public class TransactionService {

    private final DataStore db;

    public TransactionService(DataStore db) {
        this.db = db;
    }

    // UC2
    public String checkBalance(Account acc) {
        String msg = "Your balance is: " + DataStore.php(acc.getBalance());
        db.log("CHECK BALANCE by " + acc.getUsername()
                + " => " + DataStore.php(acc.getBalance()));
        return msg;
    }

    // UC3
    public String deposit(Account acc, double amount) {
        if (amount <= 0)
            return "Amount must be positive.";
        acc.setBalance(acc.getBalance() + amount);
        db.log("DEPOSIT " + DataStore.php(amount) + " into " + acc.getUsername());
        return "Deposited. New balance: " + DataStore.php(acc.getBalance());
    }

    // UC4
    public String withdraw(Account acc, double amount) {
        if (amount <= 0)
            return "Amount must be positive.";
        if (amount > acc.getBalance())
            return "Insufficient funds.";
        acc.setBalance(acc.getBalance() - amount);
        db.log("WITHDRAW " + DataStore.php(amount) + " from " + acc.getUsername());
        return "Withdrawn. New balance: " + DataStore.php(acc.getBalance());
    }

    // UC5
    public String transfer(Account from, String toUser, double amount) {
        if (toUser == null)
            return "Target user not found.";

        Account to = db.accounts.get(toUser.toLowerCase());
        if (to == null)
            return "Target user not found.";

        if (amount <= 0)
            return "Amount must be positive.";
        if (amount > from.getBalance())
            return "Insufficient funds.";

        from.setBalance(from.getBalance() - amount);
        to.setBalance(to.getBalance() + amount);

        db.log("TRANSFER " + DataStore.php(amount) + " from "
                + from.getUsername() + " to " + to.getUsername());

        return "Transferred " + DataStore.php(amount) + " to " + to.getUsername()
                + "<br>Your new balance: " + DataStore.php(from.getBalance());
    }

    // UC7
    public String helpText() {
        db.log("HELP viewed");
        return "=== App Help ===<br>"
                + "- Check Balance: shows your current balance.<br>"
                + "- Deposit: add money to your account.<br>"
                + "- Withdraw: remove money if you have enough.<br>"
                + "- Transfer: send money to another user.<br>"
                + "- Tips: amounts must be positive; PIN is required at login.<br>"
                + "=================<br>";
    }
}
