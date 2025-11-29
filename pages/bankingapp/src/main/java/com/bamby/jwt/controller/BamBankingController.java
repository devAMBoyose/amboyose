package com.bamby.jwt.controller;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.service.AuthService;
import com.bamby.jwt.service.MaintenanceService;
import com.bamby.jwt.service.TransactionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class BamBankingController {

    private final AuthService authService;
    private final TransactionService txService;
    private final MaintenanceService maintenanceService;

    public BamBankingController(AuthService authService,
            TransactionService txService,
            MaintenanceService maintenanceService) {
        this.authService = authService;
        this.txService = txService;
        this.maintenanceService = maintenanceService;
    }

    // --------------------------
    // Helpers
    // --------------------------
    private Account getSessionAccount(HttpSession session) {
        Object u = session.getAttribute("username");
        if (u == null) {
            return null;
        }
        return authService.findByUsername(u.toString());
    }

    // --------------------------
    // LOGIN / LOGOUT
    // --------------------------

    @GetMapping("/bambanking/login")
    public String showLogin() {
        return "bank-login";
    }

    @PostMapping("/bambanking/login")
    public String doLogin(@RequestParam String username,
            @RequestParam String pin,
            HttpSession session,
            Model model) {

        // Uses MongoDB via AuthService; PIN is 4-digit string
        Account acc = authService.authenticateCustomer(username, pin);
        if (acc == null) {
            model.addAttribute("error", "Invalid username or PIN.");
            return "bank-login";
        }

        session.setAttribute("username", acc.getUsername());
        session.setAttribute("pin", acc.getPin());

        return "redirect:/bambanking/dashboard";
    }

    @GetMapping("/bambanking/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/bambanking/login";
    }

    // --------------------------
    // DASHBOARD
    // --------------------------
    @GetMapping("/bambanking/dashboard")
    public String dashboard(HttpSession session, Model model) {
        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        model.addAttribute("username", acc.getUsername());
        model.addAttribute("balance", acc.getBalance());

        model.addAttribute("transactions",
                txService.getRecentTransactions(acc.getUsername(), 10));

        return "bank-dashboard";
    }

    // --------------------------
    // WITHDRAW – detailed result page
    // --------------------------
    @PostMapping("/bambanking/withdraw")
    public String handleWithdraw(@RequestParam double amount,
            HttpSession session,
            Model model) {

        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        double oldBalance = acc.getBalance();

        String resultMessage = txService.withdraw(acc, amount);
        boolean success = resultMessage != null && resultMessage.startsWith("✅");
        double newBalance = acc.getBalance();

        txService.record(
                acc.getUsername(),
                "Withdrawal",
                amount,
                newBalance,
                success);

        String cleanMessage = resultMessage
                .replace("✅ ", "")
                .replace("❌ ", "");

        model.addAttribute("username", acc.getUsername());
        model.addAttribute("txType", "Withdrawal");
        model.addAttribute("amount", amount);
        model.addAttribute("oldBalance", oldBalance);
        model.addAttribute("newBalance", newBalance);
        model.addAttribute("success", success);
        model.addAttribute("txRef", "BB-WDL-" + System.currentTimeMillis());
        model.addAttribute("txDateTime",
                java.time.LocalDateTime.now().toString().replace('T', ' '));
        model.addAttribute("txMessage", cleanMessage);

        return "transaction-result";
    }

    // --------------------------
    // DEPOSIT – detailed result page
    // --------------------------
    @PostMapping("/bambanking/deposit")
    public String handleDeposit(@RequestParam double amount,
            HttpSession session,
            Model model) {

        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        double oldBalance = acc.getBalance();

        String result = txService.deposit(acc, amount);
        boolean success = result != null && result.startsWith("✅");

        String txRef = txService.record(
                acc.getUsername(),
                "Deposit",
                amount,
                acc.getBalance(),
                success);

        String cleanMessage = result
                .replace("✅ ", "")
                .replace("❌ ", "")
                .trim();

        model.addAttribute("username", acc.getUsername());
        model.addAttribute("txType", "Deposit");
        model.addAttribute("amount", amount);
        model.addAttribute("oldBalance", oldBalance);
        model.addAttribute("newBalance", acc.getBalance());
        model.addAttribute("success", success);
        model.addAttribute("txRef", txRef);
        model.addAttribute("txDateTime",
                java.time.LocalDateTime.now().toString().replace('T', ' '));
        model.addAttribute("txMessage", cleanMessage);

        return "deposit-result";
    }

    // --------------------------
    // CHECK BALANCE – result page
    // --------------------------
    @PostMapping("/bambanking/check-balance")
    public String checkBalance(HttpSession session, Model model) {
        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        double balance = acc.getBalance();

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

        return "balance-result";
    }

    // --------------------------
    // TRANSFER – detailed result page + history
    // --------------------------
    @PostMapping("/bambanking/transfer")
    public String handleTransfer(@RequestParam String toUser,
            @RequestParam double amount,
            HttpSession session,
            Model model) {

        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        double oldBalance = acc.getBalance();

        String result = txService.transfer(acc, toUser, amount);
        boolean success = result != null && result.startsWith("✅");

        String txRef = txService.record(
                acc.getUsername(),
                "Transfer",
                amount,
                acc.getBalance(),
                success);

        if (success) {
            Account toAcc = authService.findByUsername(toUser);
            if (toAcc != null) {
                txService.record(
                        toAcc.getUsername(),
                        "Transfer (incoming)",
                        amount,
                        toAcc.getBalance(),
                        true);
            }
        }

        String cleanMessage = result
                .replace("✅ ", "")
                .replace("❌ ", "")
                .replace("<br>", " ")
                .replace("<strong>", "")
                .replace("</strong>", "")
                .trim();

        model.addAttribute("username", acc.getUsername());
        model.addAttribute("txType", "Transfer");
        model.addAttribute("amount", amount);
        model.addAttribute("oldBalance", oldBalance);
        model.addAttribute("newBalance", acc.getBalance());
        model.addAttribute("success", success);
        model.addAttribute("txRef", txRef);
        model.addAttribute("txDateTime",
                java.time.LocalDateTime.now().toString().replace('T', ' '));
        model.addAttribute("txMessage", cleanMessage);
        model.addAttribute("txCounterparty", toUser);

        return "transaction-result";
    }

    @GetMapping("/bambanking/help")
    public String help(Model model) {
        String result = txService.helpText();
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    // --------------------------
    // MAINTENANCE
    // --------------------------
    @GetMapping("/bambanking/maintenance/diagnostics")
    public String diagnostics(Model model) {
        String result = maintenanceService.diagnostics();
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    @GetMapping("/bambanking/maintenance/update")
    public String softwareUpdate(Model model) {
        String result = maintenanceService.softwareUpdates();
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    // --------------------------
    // SIGNUP
    // --------------------------
    @PostMapping("/bambanking/signup")
    public String handleSignup(@RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String pin,
            HttpSession session,
            Model model) {

        Account acc = authService.register(fullName, email, pin);

        if (acc == null) {
            model.addAttribute("signupError",
                    "Sign up failed. Email already used, invalid PIN, or database error.");
            return "bank-login";
        }

        // auto-login
        session.setAttribute("username", acc.getUsername());

        return "redirect:/bambanking/dashboard";
    }
}
