package com.bamby.jwt.controller;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.service.AuthService;
import com.bamby.jwt.service.MaintenanceService;
import com.bamby.jwt.service.TransactionService;
import com.bamby.jwt.service.EmailJsService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Optional;

@Controller
@RequestMapping("/bambanking")
public class BamBankingController {

    private final AuthService authService;
    private final TransactionService txService;
    private final MaintenanceService maintenanceService;
    private final EmailJsService emailJsService;

    private final SecureRandom random = new SecureRandom();

    public BamBankingController(AuthService authService,
            TransactionService txService,
            MaintenanceService maintenanceService,
            EmailJsService emailJsService) {
        this.authService = authService;
        this.txService = txService;
        this.maintenanceService = maintenanceService;
        this.emailJsService = emailJsService;
    }

    // --------------------------
    // Helpers
    // --------------------------

    private Account getSessionAccount(HttpSession session) {
        Object u = session.getAttribute("username");
        if (u == null) {
            return null;
        }
        return authService.findByUsername(u.toString()).orElse(null);
    }

    private String generateOtp() {
        return String.format("%06d", random.nextInt(1_000_000));
    }

    // --------------------------
    // Login / signup
    // --------------------------

    @GetMapping("/login")
    public String showLoginPage(
            @RequestParam(value = "tab", required = false, defaultValue = "login") String tab,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "success", required = false) String success,
            Model model) {
        model.addAttribute("tab", tab);
        model.addAttribute("error", error);
        model.addAttribute("success", success);
        return "bank-login";
    }

    @PostMapping("/login")
    public String handleLogin(
            @RequestParam("username") String username,
            @RequestParam("pin") String pin,
            HttpSession session,
            Model model) {
        Optional<Account> accountOpt = authService.login(username, pin);

        if (accountOpt.isEmpty()) {
            model.addAttribute("tab", "login");
            model.addAttribute("error", "Invalid username or PIN.");
            return "bank-login";
        }

        Account acc = accountOpt.get();
        session.setAttribute("username", acc.getUsername());
        return "redirect:/bambanking/dashboard";
    }

    @PostMapping("/signup")
    public String handleSignup(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("pin") String pin,
            HttpSession session,
            Model model) {
        try {
            // You can adjust this to match your existing AuthService register method.
            Account acc = authService.registerDemoAccount(firstName, lastName, email, pin);

            String fullName = firstName + " " + lastName;
            String otp = generateOtp();

            // Store OTP in session for demo; in real app, store in DB with expiry.
            session.setAttribute("signupEmail", email);
            session.setAttribute("signupOtp", otp);

            emailJsService.sendOtp(email, fullName, otp);

            model.addAttribute("tab", "login");
            model.addAttribute("success",
                    "Account created. We sent a verification code to " + email + ".");
            return "bank-login";
        } catch (IllegalStateException ex) {
            model.addAttribute("tab", "signup");
            model.addAttribute("error", ex.getMessage());
            return "bank-login";
        }
    }

    // --------------------------
    // Dashboard (unchanged)
    // --------------------------

    @GetMapping("/dashboard")
    public String showDashboard(HttpSession session, Model model) {
        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login?error=Please%20log%20in";
        }

        model.addAttribute("account", acc);
        model.addAttribute("balance", acc.getBalance());
        model.addAttribute("recentTx", txService.getRecentTransactions(acc.getUsername(), 10));

        return "bank-dashboard";
    }

    // --------------------------
    // Forgot PIN flow
    // --------------------------

    @GetMapping("/forgot-pin")
    public String showForgotPinPage(
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "success", required = false) String success,
            Model model) {
        model.addAttribute("error", error);
        model.addAttribute("success", success);
        return "forgot-pin";
    }

    @PostMapping("/forgot-pin")
    public String handleForgotPin(
            @RequestParam("email") String email,
            HttpSession session,
            Model model) {
        Optional<Account> accOpt = authService.findByEmail(email);

        if (accOpt.isEmpty()) {
            model.addAttribute("error", "We couldn't find an account with that email.");
            return "forgot-pin";
        }

        Account acc = accOpt.get();
        String fullName = acc.getFullName();
        String otp = generateOtp();

        // For demo, track in session; in a real app this belongs in DB.
        session.setAttribute("pinResetEmail", email);
        session.setAttribute("pinResetOtp", otp);

        emailJsService.sendPinResetLink(email, fullName, otp);

        model.addAttribute("success",
                "We sent a PIN reset code to " + email + ". Please check your inbox.");
        return "forgot-pin";
    }
}
