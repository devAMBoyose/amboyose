package com.bamby.jwt.banking.controller;

import com.bamby.jwt.banking.model.Account;
import com.bamby.jwt.banking.service.AuthService;
import com.bamby.jwt.banking.service.MaintenanceService;
import com.bamby.jwt.banking.service.TransactionService;
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

    public BamBankingController(
            AuthService authService,
            TransactionService txService,
            MaintenanceService maintenanceService) {
        this.authService = authService;
        this.txService = txService;
        this.maintenanceService = maintenanceService;
    }

    // ---------- LOGIN ----------

    @GetMapping("/login")
    public String showLogin() {
        return "bank-login"; // templates/bank-login.html
    }

    @PostMapping("/login")
    public String doLogin(
            @RequestParam String username,
            @RequestParam int pin,
            HttpSession session,
            Model model) {
        Account acc = authService.authenticateCustomer(username, pin);
        if (acc == null) {
            model.addAttribute("error", "Invalid username or PIN");
            return "bank-login";
        }

        session.setAttribute("userAccount", acc);
        return "redirect:/bambanking/dashboard";
    }

    // ---------- DASHBOARD (tiles) ----------

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        Account acc = (Account) session.getAttribute("userAccount");
        if (acc == null) {
            return "redirect:/bambanking/login";
        }
        model.addAttribute("username", acc.getUsername());
        model.addAttribute("balance", acc.getBalance());
        return "bank-dashboard";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/bambanking/login";
    }

    // ---------- TRANSACTIONS ----------

    @PostMapping("/check-balance")
    public String checkBalance(HttpSession session, Model model) {
        Account acc = (Account) session.getAttribute("userAccount");
        if (acc == null)
            return "redirect:/bambanking/login";

        String result = txService.checkBalance(acc);
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    @PostMapping("/deposit")
    public String deposit(
            @RequestParam double amount,
            HttpSession session,
            Model model) {
        Account acc = (Account) session.getAttribute("userAccount");
        if (acc == null)
            return "redirect:/bambanking/login";

        String result = txService.deposit(acc, amount);
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    @PostMapping("/withdraw")
    public String withdraw(
            @RequestParam double amount,
            HttpSession session,
            Model model) {
        Account acc = (Account) session.getAttribute("userAccount");
        if (acc == null)
            return "redirect:/bambanking/login";

        String result = txService.withdraw(acc, amount);
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    @PostMapping("/transfer")
    public String transfer(
            @RequestParam String toUser,
            @RequestParam double amount,
            HttpSession session,
            Model model) {
        Account acc = (Account) session.getAttribute("userAccount");
        if (acc == null)
            return "redirect:/bambanking/login";

        String result = txService.transfer(acc, toUser, amount);
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    @GetMapping("/help")
    public String help(HttpSession session, Model model) {
        Account acc = (Account) session.getAttribute("userAccount");
        if (acc == null)
            return "redirect:/bambanking/login";

        String result = txService.helpText();
        model.addAttribute("message", result);
        return "bank-transaction";
    }

    // ---------- Maintenance (Engineer) – optional ----------

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
