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

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000); // 6-digit
        return String.valueOf(code);
    }

    private Account getSessionAccount(HttpSession session) {
        Object u = session.getAttribute("username");
        if (u == null) {
            return null;
        }
        return authService.findByUsername(u.toString()).orElse(null);
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
            // 1. Check if email already exists
            Optional<Account> existing = authService.findByEmail(email);
            if (existing.isPresent()) {
                model.addAttribute("error", "An account with this email already exists. Please log in instead.");
                model.addAttribute("openSignup", true);
                return "bank-login";
            }

            // 2. Generate OTP and send email
            String otp = generateOtp();
            String fullName = (firstName + " " + lastName).trim();

            // Store pending registration in session
            session.setAttribute("pending_firstName", firstName);
            session.setAttribute("pending_lastName", lastName);
            session.setAttribute("pending_email", email);
            session.setAttribute("pending_pin", pin);
            session.setAttribute("pending_otp", otp);

            // Send OTP email
            emailJsService.sendOtp(email, fullName, otp);

            // 3. Show OTP page
            model.addAttribute("email", email);
            return "bank-verify-otp";

        } catch (IllegalStateException ex) {
            model.addAttribute("error", ex.getMessage());
            model.addAttribute("openSignup", true);
            return "bank-login";
        }
    }

    @GetMapping("/verify-otp")
    public String showVerifyOtp(HttpSession session, Model model) {
        String email = (String) session.getAttribute("pending_email");
        if (email == null) {
            model.addAttribute("error", "No pending registration found. Please sign up first.");
            return "bank-login";
        }
        model.addAttribute("email", email);
        return "bank-verify-otp";
    }

    @PostMapping("/verify-otp")
    public String handleVerifyOtp(
            @RequestParam("otp") String otpInput,
            HttpSession session,
            Model model) {

        String expectedOtp = (String) session.getAttribute("pending_otp");
        String firstName = (String) session.getAttribute("pending_firstName");
        String lastName = (String) session.getAttribute("pending_lastName");
        String email = (String) session.getAttribute("pending_email");
        String pin = (String) session.getAttribute("pending_pin");

        if (expectedOtp == null || email == null) {
            model.addAttribute("error", "Your registration session expired. Please sign up again.");
            return "bank-login";
        }

        if (!expectedOtp.equals(otpInput)) {
            model.addAttribute("email", email);
            model.addAttribute("error", "Invalid code. Please try again.");
            return "bank-verify-otp";
        }

        // OTP is correct → create account
        try {
            authService.registerDemoAccount(firstName, lastName, email, pin);
        } catch (IllegalStateException ex) {
            model.addAttribute("error", ex.getMessage());
            return "bank-login";
        }

        // Clean up session
        session.removeAttribute("pending_firstName");
        session.removeAttribute("pending_lastName");
        session.removeAttribute("pending_email");
        session.removeAttribute("pending_pin");
        session.removeAttribute("pending_otp");

        model.addAttribute("success", "Your account is verified. You can now log in.");
        return "bank-login";
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
