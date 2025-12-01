package com.bamby.jwt.controller;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.service.AuthService;
import com.bamby.jwt.service.EmailJsService;
import com.bamby.jwt.service.MaintenanceService;
import com.bamby.jwt.service.TransactionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.time.format.DateTimeFormatter;

@Controller
@RequestMapping("/bambanking")
public class BamBankingController {

    // ---------------------------------------------------------------------
    // Dependencies
    // ---------------------------------------------------------------------

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

    // ---------------------------------------------------------------------
    // Helper methods
    // ---------------------------------------------------------------------

    /** Generate a 6-digit OTP as String. */
    private String generateOtp() {
        int code = 100_000 + random.nextInt(900_000);
        return String.valueOf(code);
    }

    /** Get logged-in username from session, or null if not logged in. */
    private String getLoggedUsername(HttpSession session) {
        Object u = session.getAttribute("username");
        return (u == null) ? null : u.toString();
    }

    /** Load Account for logged in user, or null if not logged in or missing. */
    private Account getLoggedAccount(HttpSession session) {
        String username = getLoggedUsername(session);
        if (username == null) {
            return null;
        }
        return authService.findByUsername(username).orElse(null);
    }

    /** Populate standard dashboard attributes. */

    private void populateDashboardModel(Model model, Account acc) {
        // base info
        model.addAttribute("account", acc);
        model.addAttribute("username", acc.getUsername());
        model.addAttribute("balance", acc.getBalance());

        // card holder name
        model.addAttribute("cardHolderName", acc.getFullName());
        model.addAttribute("cardNumber", acc.getFormattedCardNumber());
        model.addAttribute("cardCvv", acc.getCvv());

        // recent transactions (for the table)
        var recent = txService.getRecentTransactions(acc.getUsername(), 10);
        model.addAttribute("transactions", recent);
        model.addAttribute("recentTx", recent);
    }

    // ---------------------------------------------------------------------
    // LOGIN / SIGNUP
    // ---------------------------------------------------------------------

    @GetMapping("/login")
    public String showLoginPage(
            @RequestParam(value = "tab", required = false, defaultValue = "login") String tab,
            @RequestParam(value = "error", required = false) String errorParam,
            @RequestParam(value = "success", required = false) String successParam,
            @RequestParam(value = "openSignup", required = false) Boolean openSignup,
            HttpSession session,
            Model model) {

        // reset forgot-pin state whenever user opens login page
        session.removeAttribute("pinResetEmail");
        session.removeAttribute("pinResetOtp");
        session.removeAttribute("pinResetAwaitingOtp");

        // keep flash "success" if present (e.g. after reset-pin)
        Object flashSuccess = model.asMap().get("success");
        String success = flashSuccess != null ? flashSuccess.toString() : successParam;

        model.addAttribute("tab", tab);
        if (errorParam != null) {
            model.addAttribute("error", errorParam);
        }
        if (success != null) {
            model.addAttribute("success", success);
        }
        model.addAttribute("openSignup", openSignup != null && openSignup);

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
            model.addAttribute("openSignup", false);
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
                model.addAttribute("error",
                        "An account with this email already exists. Please log in instead.");
                model.addAttribute("openSignup", true);
                return "bank-login";
            }

            // 2. Generate OTP and store pending registration in session
            String otp = generateOtp();
            String fullName = (firstName + " " + lastName).trim();

            session.setAttribute("pending_firstName", firstName);
            session.setAttribute("pending_lastName", lastName);
            session.setAttribute("pending_email", email);
            session.setAttribute("pending_pin", pin);
            session.setAttribute("pending_otp", otp);

            // 3. Send OTP email
            emailJsService.sendOtp(email, fullName, otp);

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

        try {
            authService.registerDemoAccount(firstName, lastName, email, pin);
        } catch (IllegalStateException ex) {
            model.addAttribute("error", ex.getMessage());
            return "bank-login";
        }

        // Clean session
        session.removeAttribute("pending_firstName");
        session.removeAttribute("pending_lastName");
        session.removeAttribute("pending_email");
        session.removeAttribute("pending_pin");
        session.removeAttribute("pending_otp");

        model.addAttribute("success", "Your account is verified. You can now log in.");
        model.addAttribute("openSignup", false);
        return "bank-login";
    }

    // ---------------------------------------------------------------------
    // DASHBOARD
    // ---------------------------------------------------------------------

    @GetMapping("/dashboard")
    public String showDashboard(HttpSession session, Model model) {
        Account acc = getLoggedAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login?error=Please%20log%20in";
        }

        populateDashboardModel(model, acc);

        // Welcome name from real full name
        String display = acc.getFullName();
        if (display == null || display.isBlank()) {
            display = acc.getUsername();
        }
        model.addAttribute("displayName", display.toUpperCase());

        // flash attributes from tx endpoints
        Object showBalance = model.asMap().get("showBalanceCard");
        Object txMsg = model.asMap().get("txMessage");
        if (showBalance != null) {
            model.addAttribute("showBalanceCard", showBalance);
        }
        if (txMsg != null) {
            model.addAttribute("txMessage", txMsg);
        }

        return "bank-dashboard";
    }

    // ---------------------------------------------------------------------
    // TRANSACTIONS
    // ---------------------------------------------------------------------

    @PostMapping("/check-balance")
    public String handleCheckBalance(HttpSession session, RedirectAttributes redirect) {
        Account acc = getLoggedAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login?error=Please%20log%20in";
        }

        redirect.addFlashAttribute("showBalanceCard", true);
        redirect.addFlashAttribute("txMessage", "Balance checked successfully.");
        return "redirect:/bambanking/dashboard";
    }

    @PostMapping("/deposit")
    public String handleDeposit(
            @RequestParam("amount") double amount,
            HttpSession session,
            Model model,
            RedirectAttributes redirect) {

        // 1) Check logged-in account
        Account acc = getLoggedAccount(session); // use your existing helper
        if (acc == null) {
            redirect.addFlashAttribute("error", "Session expired. Please log in again.");
            return "redirect:/bambanking/login";
        }

        // 2) Basic validation
        if (amount <= 0) {
            redirect.addFlashAttribute("txMessage", "Amount must be greater than zero.");
            redirect.addFlashAttribute("success", false);
            return "redirect:/bambanking/dashboard";
        }

        boolean success = true;
        String txMessage;

        try {
            // 3) Your existing business logic – this should update DB + balance
            txService.deposit(acc, amount);
            txMessage = "Deposit successful!";
        } catch (Exception ex) {
            success = false;
            txMessage = (ex.getMessage() != null) ? ex.getMessage() : "Deposit failed.";
        }

        // 4) Build receipt info (for now we generate a simple reference + current
        // datetime)
        String txType = "Deposit";
        String txRef = "BB-DEP-" + System.currentTimeMillis();
        String txDateTime = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        // 5) Put everything in the model for deposit-result.html
        model.addAttribute("username", acc.getUsername());
        model.addAttribute("success", success);
        model.addAttribute("txMessage", txMessage);
        model.addAttribute("txType", txType);
        model.addAttribute("txRef", txRef);
        model.addAttribute("amount", amount);
        model.addAttribute("txDateTime", txDateTime);

        // (optional) if later you still want dashboard modal receipt,
        // you can also set redirect attributes here.

        // 6) Show your receipt page
        return "deposit-result";
    }

    @PostMapping("/withdraw/receipt")
    public String handleWithdrawWithReceipt(
            @RequestParam("amount") double amount,
            HttpSession session,
            Model model) {

        Account acc = getLoggedAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login?error=Please%20log%20in";
        }

        // Always show username on the page
        model.addAttribute("username", acc.getUsername());

        // Common helper for timestamp string
        String nowStr = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        // If invalid amount – go straight to error view
        if (amount <= 0) {
            model.addAttribute("success", false);
            model.addAttribute("txMessage", "Amount must be greater than zero.");
            model.addAttribute("txType", "Withdrawal");
            model.addAttribute("txRef", "—");
            model.addAttribute("amount", 0.00);
            model.addAttribute("txDateTime", nowStr);
            model.addAttribute("balance", acc.getBalance());
            return "withdraw-result";
        }

        try {
            // Perform the actual withdraw (this also writes to transactions table)
            txService.withdraw(acc, amount);

            // Get the latest transaction for this user (real data from DB)
            var recent = txService.getRecentTransactions(acc.getUsername(), 1);
            if (!recent.isEmpty()) {
                var tx = recent.get(0);

                model.addAttribute("txType", tx.getType()); // e.g. "WITHDRAW"
                model.addAttribute("txRef", tx.getReference()); // e.g. BB-2025-0001
                model.addAttribute("amount", tx.getAmount()); // numeric
                model.addAttribute("txDateTime",
                        tx.getTimestamp().format(
                                java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
                model.addAttribute("balance", tx.getBalanceAfter()); // balance after tx
                model.addAttribute("txStatus", tx.getStatus()); // OK / FAILED, etc.
            } else {
                // Fallback if no transaction returned (should rarely happen)
                model.addAttribute("txType", "Withdrawal");
                model.addAttribute("txRef", "BB-WD-" + System.currentTimeMillis());
                model.addAttribute("amount", amount);
                model.addAttribute("txDateTime", nowStr);
                model.addAttribute("balance", acc.getBalance() - amount);
            }

            model.addAttribute("success", true);
            model.addAttribute("txMessage", "Withdrawal successful!");

        } catch (IllegalStateException ex) {
            // e.g. insufficient balance
            model.addAttribute("success", false);
            model.addAttribute("txMessage", ex.getMessage());
            model.addAttribute("txType", "Withdrawal");
            model.addAttribute("txRef", "—");
            model.addAttribute("amount", amount);
            model.addAttribute("txDateTime", nowStr);
            model.addAttribute("balance", acc.getBalance());
        }

        return "withdraw-result"; // <-- this is the Thymeleaf template below
    }

    // @PostMapping("/withdraw")
    // public String handleWithdraw(
    // @RequestParam("amount") double amount,
    // HttpSession session,
    // RedirectAttributes redirect) {

    // Account acc = getLoggedAccount(session);
    // if (acc == null) {
    // return "redirect:/bambanking/login?error=Please%20log%20in";
    // }

    // if (amount <= 0) {
    // redirect.addFlashAttribute("txMessage", "Amount must be greater than zero.");
    // redirect.addFlashAttribute("showBalanceCard", true);
    // return "redirect:/bambanking/dashboard";
    // }

    // try {
    // txService.withdraw(acc, amount);
    // redirect.addFlashAttribute("txMessage", "Withdraw successful: ₱" + amount);
    // } catch (IllegalStateException ex) {
    // redirect.addFlashAttribute("txMessage", ex.getMessage());
    // }

    // redirect.addFlashAttribute("showBalanceCard", true);
    // return "redirect:/bambanking/dashboard";
    // }

    @PostMapping("/transfer")
    public String handleTransfer(
            @RequestParam("toUser") String toUser,
            @RequestParam("amount") double amount,
            HttpSession session,
            RedirectAttributes redirect) {

        Account acc = getLoggedAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login?error=Please%20log%20in";
        }

        if (amount <= 0) {
            redirect.addFlashAttribute("txMessage", "Amount must be greater than zero.");
            redirect.addFlashAttribute("showBalanceCard", true);
            return "redirect:/bambanking/dashboard";
        }

        try {
            txService.transfer(acc, toUser, amount);
            redirect.addFlashAttribute(
                    "txMessage",
                    "Transfer successful: ₱" + amount + " to " + toUser);
        } catch (IllegalStateException ex) {
            redirect.addFlashAttribute("txMessage", ex.getMessage());
        }

        redirect.addFlashAttribute("showBalanceCard", true);
        return "redirect:/bambanking/dashboard";
    }

    // ---------------------------------------------------------------------
    // FORGOT PIN (OTP + 4-digit new PIN)
    // ---------------------------------------------------------------------

    @GetMapping("/forgot-pin")
    public String showForgotPinPage(
            @RequestParam(value = "error", required = false) String errorParam,
            @RequestParam(value = "success", required = false) String successParam,
            Model model,
            HttpSession session) {

        if (errorParam != null) {
            model.addAttribute("error", errorParam);
        }
        if (successParam != null) {
            model.addAttribute("success", successParam);
        }

        Boolean awaitingOtp = (Boolean) session.getAttribute("pinResetAwaitingOtp");
        String email = (String) session.getAttribute("pinResetEmail");

        if (awaitingOtp == null) {
            awaitingOtp = false;
        }

        model.addAttribute("awaitingOtp", awaitingOtp);
        if (awaitingOtp && email != null) {
            model.addAttribute("email", email);
        }

        return "forgot-pin";
    }

    @PostMapping("/forgot-pin")
    public String handleForgotPin(
            @RequestParam("email") String email,
            HttpSession session,
            RedirectAttributes redirect) {

        Optional<Account> accOpt = authService.findByEmail(email);

        if (accOpt.isEmpty()) {
            redirect.addFlashAttribute("error", "We couldn't find an account with that email.");
            return "redirect:/bambanking/forgot-pin";
        }

        Account acc = accOpt.get();
        String fullName = acc.getFullName();
        String otp = generateOtp();

        session.setAttribute("pinResetEmail", email);
        session.setAttribute("pinResetOtp", otp);
        session.setAttribute("pinResetAwaitingOtp", true);

        emailJsService.sendPinResetLink(email, fullName, otp);

        redirect.addFlashAttribute("success",
                "We sent a PIN reset code to " + email + ". Please check your inbox.");
        return "redirect:/bambanking/forgot-pin";
    }

    @PostMapping("/reset-pin")
    public String handleResetPin(
            @RequestParam("otp") String otpInput,
            @RequestParam("newPin") String newPin,
            @RequestParam("confirmPin") String confirmPin,
            HttpSession session,
            RedirectAttributes redirect) {

        String email = (String) session.getAttribute("pinResetEmail");
        String expectedOtp = (String) session.getAttribute("pinResetOtp");

        if (email == null || expectedOtp == null) {
            redirect.addFlashAttribute("error", "Your reset session expired. Please start again.");
            return "redirect:/bambanking/forgot-pin";
        }

        if (!expectedOtp.equals(otpInput)) {
            redirect.addFlashAttribute("error", "Invalid reset code. Please try again.");
            session.setAttribute("pinResetAwaitingOtp", true);
            return "redirect:/bambanking/forgot-pin";
        }

        if (!newPin.matches("\\d{4}")) {
            redirect.addFlashAttribute("error", "PIN must be exactly 4 digits (0–9).");
            session.setAttribute("pinResetAwaitingOtp", true);
            return "redirect:/bambanking/forgot-pin";
        }

        if (!newPin.equals(confirmPin)) {
            redirect.addFlashAttribute("error", "New PIN and confirmation do not match.");
            session.setAttribute("pinResetAwaitingOtp", true);
            return "redirect:/bambanking/forgot-pin";
        }

        authService.updatePinByEmail(email, newPin);

        session.removeAttribute("pinResetEmail");
        session.removeAttribute("pinResetOtp");
        session.removeAttribute("pinResetAwaitingOtp");

        redirect.addFlashAttribute("success",
                "Your PIN has been updated. You can now log in with your new 4-digit PIN.");

        return "redirect:/bambanking/login";
    }

    // ---------------------------------------------------------------------
    // LOGOUT + HELP
    // ---------------------------------------------------------------------

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/bambanking/login?success=You%20have%20logged%20out.";
    }

    @GetMapping("/help")
    public String showHelp(HttpSession session, Model model) {
        Account acc = getLoggedAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login?error=Please%20log%20in";
        }

        populateDashboardModel(model, acc);
        model.addAttribute("helpText", txService.helpText());
        return "bank-dashboard";
    }
}
