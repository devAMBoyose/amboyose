package com.bamby.jwt.banking.controller;

import com.bamby.jwt.banking.model.Account;
import com.bamby.jwt.banking.service.AuthService;
import com.bamby.jwt.banking.service.TransactionService;
import com.bamby.jwt.banking.service.MaintenanceService;
import com.bamby.jwt.banking.service.DataStore;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/bambanking")
public class BamBankingController {

    private final AuthService authService;
    private final TransactionService txService;
    private final MaintenanceService maintenanceService;
    private final DataStore db;

    public BamBankingController(AuthService authService,
            TransactionService txService,
            MaintenanceService maintenanceService,
            DataStore db) {
        this.authService = authService;
        this.txService = txService;
        this.maintenanceService = maintenanceService;
        this.db = db;
    }

    // --------------------------
    // Helpers
    // --------------------------
    private Account getSessionAccount(HttpSession session) {
        Object u = session.getAttribute("username");
        if (u == null)
            return null;
        return db.accounts.get(u.toString().toLowerCase());
    }

    // --------------------------
    // LOGIN / LOGOUT
    // --------------------------

    @GetMapping("/login")
    public String showLogin() {
        return "bank-login";
    }

    @PostMapping("/login")
    public String doLogin(@RequestParam String username,
            @RequestParam int pin,
            HttpSession session,
            Model model) {

        Account acc = authService.authenticateCustomer(username, pin);
        if (acc == null) {
            model.addAttribute("error", "Invalid username or PIN.");
            return "bank-login";
        }

        session.setAttribute("username", acc.getUsername());
        session.setAttribute("pin", acc.getPin());

        return "redirect:/bambanking/dashboard";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/bambanking/login";
    }

    // --------------------------
    // DASHBOARD
    // --------------------------
    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        model.addAttribute("username", acc.getUsername());
        model.addAttribute("balance", acc.getBalance());

        // ✅ NEW: add transactions list for the table in bank-dashboard.html
        // (for now you can use an empty list if you don't have real history yet)
        model.addAttribute("transactions", java.util.Collections.emptyList());
        // later, when ready: txService.getRecentTransactions(acc.getUsername(), 10);

        return "bank-dashboard";
    }

    // --------------------------
    // WITHDRAW – detailed result page
    // --------------------------
    @PostMapping("/withdraw")
    public String handleWithdraw(@RequestParam double amount,
            HttpSession session,
            Model model) {

        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        double oldBalance = acc.getBalance();
        boolean success = false;
        String txMessage;

        if (amount <= 0) {
            txMessage = "Withdrawal failed. Amount must be greater than zero.";
        } else if (amount > oldBalance) {
            txMessage = "Withdrawal failed. Insufficient balance.";
        } else {
            acc.setBalance(oldBalance - amount);
            success = true;
            txMessage = "Withdrawal successful! Your new balance is PHP "
                    + String.format("%.2f", acc.getBalance());
        }

        double newBalance = acc.getBalance();

        // ✅ NEW: record this withdrawal in history
        txService.record(acc.getUsername(), "Withdrawal", amount, newBalance, success);

        model.addAttribute("username", acc.getUsername());
        model.addAttribute("txType", "Withdrawal");
        model.addAttribute("amount", amount);
        model.addAttribute("oldBalance", oldBalance);
        model.addAttribute("newBalance", newBalance);
        model.addAttribute("success", success);
        model.addAttribute("txRef", "BB-" + System.currentTimeMillis());
        model.addAttribute("txDateTime",
                java.time.LocalDateTime.now().toString().replace('T', ' '));
        model.addAttribute("txMessage", txMessage);

        return "transaction-result";

    }

    // --------------------------
    // DEPOSIT – detailed result page
    // --------------------------
    @PostMapping("/deposit")
    public String handleDeposit(@RequestParam double amount,
            HttpSession session,
            Model model) {

        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        double oldBalance = acc.getBalance();
        boolean success = false;
        String txMessage;

        if (amount <= 0) {
            txMessage = "Deposit failed. Amount must be greater than zero.";
        } else {
            acc.setBalance(oldBalance + amount);
            success = true;
            txMessage = "Deposit successful! Your new balance is PHP "
                    + String.format("%.2f", acc.getBalance());
        }

        double newBalance = acc.getBalance();

        // ✅ NEW: record this deposit in history
        txService.record(acc.getUsername(), "Deposit", amount, newBalance, success);

        model.addAttribute("username", acc.getUsername());
        model.addAttribute("txType", "Deposit");
        model.addAttribute("amount", amount);
        model.addAttribute("oldBalance", oldBalance);
        model.addAttribute("newBalance", newBalance);
        model.addAttribute("success", success);
        model.addAttribute("txRef", "BB-" + System.currentTimeMillis());
        model.addAttribute("txDateTime",
                java.time.LocalDateTime.now().toString().replace('T', ' '));
        model.addAttribute("txMessage", txMessage);

        // ⛔ OLD:
        // return "transaction-result";

        // ✅ NEW: use your custom deposit UI
        return "deposit-result";

    }

    // --------------------------
    // TRANSACTIONS (simple text page)
    // --------------------------
    @PostMapping("/check-balance")
    public String checkBalance(HttpSession session, Model model) {
        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        double balance = acc.getBalance();

        // nice structured data for the UI
        model.addAttribute("username", acc.getUsername());
        model.addAttribute("balance", balance);

        model.addAttribute("txType", "Balance Inquiry");
        model.addAttribute("success", true);
        model.addAttribute("txRef", "BB-" + System.currentTimeMillis());
        model.addAttribute("txDateTime",
                java.time.LocalDateTime.now().toString().replace('T', ' '));
        model.addAttribute("txMessage",
                "Hello, " + acc.getUsername() + "! Your current balance is PHP "
                        + String.format("%.2f", balance));

        return "balance-result"; // <<< new template
    }

    @PostMapping("/transfer")
    public String transfer(@RequestParam String toUser,
            @RequestParam double amount,
            HttpSession session,
            Model model) {
        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }
        String result = txService.transfer(acc, toUser, amount);
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    @GetMapping("/help")
    public String help(Model model) {
        String result = txService.helpText();
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    // --------------------------
    // MAINTENANCE
    // --------------------------
    @GetMapping("/maintenance/diagnostics")
    public String diagnostics(Model model) {
        String result = maintenanceService.diagnostics();
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    @GetMapping("/maintenance/update")
    public String softwareUpdate(Model model) {
        String result = maintenanceService.softwareUpdates();
        model.addAttribute("message", result);
        return "bank-transaction";
    }
}
