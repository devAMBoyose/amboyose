package com.bamby.jwt.controller;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.model.Transaction;
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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

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
    private static final DateTimeFormatter TX_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

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

    /** Old helper name reused in some methods. */
    private Account getSessionAccount(HttpSession session) {
        return getLoggedAccount(session);
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
        List<Transaction> recent = txService.getRecentTransactions(acc.getUsername(), 10);
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

        // keep flash "success" if present (ex after reset-pin)
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

    // ---------------------------------------------------------------------
    // DEPOSIT
    // ---------------------------------------------------------------------

    @PostMapping("/deposit")
    public String handleDeposit(
            @RequestParam("amount") double amount,
            @RequestParam(value = "channel", required = false) String channel,
            HttpSession session,
            Model model) {

        Account acc = getSessionAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login?error=Please%20login%20first.";
        }

        String serviceMsg = txService.deposit(acc, amount);

        boolean success = serviceMsg != null && serviceMsg.startsWith("✅");
        String txMessage = success ? "Deposit successful!" : serviceMsg;
        String txType = "Deposit";

        String txRef;
        String txDateTime;
        double txAmount;
        double balanceAfter;

        if (success) {
            List<Transaction> recent = txService.getRecentTransactions(acc.getUsername(), 1);
            Transaction tx = (recent != null && !recent.isEmpty()) ? recent.get(0) : null;

            if (tx != null) {
                txRef = tx.getReference();
                txDateTime = tx.getTimestamp().format(TX_FORMAT);
                txAmount = tx.getAmount();
                balanceAfter = tx.getBalanceAfter();
            } else {
                txRef = "BB-DEP-" + System.currentTimeMillis();
                txDateTime = LocalDateTime.now().format(TX_FORMAT);
                txAmount = amount;
                balanceAfter = acc.getBalance();
            }
        } else {
            txRef = "BB-DEP-" + System.currentTimeMillis();
            txDateTime = LocalDateTime.now().format(TX_FORMAT);
            txAmount = amount;
            balanceAfter = acc.getBalance();
        }

        model.addAttribute("username", acc.getUsername());
        model.addAttribute("success", success);
        model.addAttribute("txMessage", txMessage);
        model.addAttribute("txType", txType);
        model.addAttribute("txRef", txRef);
        model.addAttribute("txDateTime", txDateTime);
        model.addAttribute("amount", txAmount);
        model.addAttribute("balance", balanceAfter);

        return "deposit-result";
    }

    // ---------------------------------------------------------------------
    // WITHDRAW
    // ---------------------------------------------------------------------

    @PostMapping("/withdraw")
    public String handleWithdraw(
            @RequestParam("amount") double amount,
            HttpSession session,
            Model model) {

        Account acc = getLoggedAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login";
        }

        // 💡 1) Remember old balance BEFORE withdrawal
        double oldBalance = acc.getBalance();

        String serviceMsg = txService.withdraw(acc, amount);
        boolean success = serviceMsg != null && serviceMsg.startsWith("✅");
        String txMessage = success ? "Withdrawal successful!" : serviceMsg;

        String txType = "Withdrawal";

        String txRef;
        String txDateTime;
        double txAmount;
        double balanceAfter;

        if (success) {
            List<Transaction> recent = txService.getRecentTransactions(acc.getUsername(), 1);
            Transaction tx = (recent != null && !recent.isEmpty()) ? recent.get(0) : null;

            if (tx != null) {
                txRef = tx.getReference();
                txDateTime = tx.getTimestamp().format(TX_FORMAT);
                txAmount = tx.getAmount();
                balanceAfter = tx.getBalanceAfter();
            } else {
                txRef = "BB-WDL-" + System.currentTimeMillis();
                txDateTime = LocalDateTime.now().format(TX_FORMAT);
                txAmount = amount;
                // acc balance should already be updated by the service
                balanceAfter = acc.getBalance();
            }
        } else {
            txRef = "BB-WDL-" + System.currentTimeMillis();
            txDateTime = LocalDateTime.now().format(TX_FORMAT);
            txAmount = amount;
            // on fail, balance stays as oldBalance
            balanceAfter = acc.getBalance();
        }

        model.addAttribute("username", acc.getUsername());
        model.addAttribute("success", success);
        model.addAttribute("txMessage", txMessage);
        model.addAttribute("txType", txType);
        model.addAttribute("txRef", txRef);
        model.addAttribute("amount", txAmount);
        model.addAttribute("txDateTime", txDateTime);
        model.addAttribute("balance", balanceAfter);

        // 💡 2) Send old balance to template
        model.addAttribute("oldBalance", oldBalance);

        return "withdraw-result";
    }

    // ---------------------------------------------------------------------
    // TRANSFER
    // ---------------------------------------------------------------------

    @PostMapping("/transfer")
    public String handleTransfer(
            @RequestParam("toUser") String toUser,
            @RequestParam("amount") double amount,
            HttpSession session,
            Model model) {

        Account from = getLoggedAccount(session);
        if (from == null) {
            return "redirect:/bambanking/login?error=Please%20log%20in";
        }

        double oldBalance = from.getBalance();

        String serviceMsg = txService.transfer(from, toUser, amount);
        boolean success = serviceMsg != null && serviceMsg.startsWith("✅");

        List<Transaction> recent = txService.getRecentTransactions(from.getUsername(), 1);
        Transaction tx = (recent != null && !recent.isEmpty()) ? recent.get(0) : null;

        String txRef = (tx != null) ? tx.getReference() : "N/A";
        String txDateTime = (tx != null)
                ? tx.getTimestamp().format(TX_FORMAT)
                : LocalDateTime.now().format(TX_FORMAT);

        double newBalance = from.getBalance();

        model.addAttribute("success", success);
        model.addAttribute("txType", "Transfer");
        model.addAttribute("username", from.getUsername());
        model.addAttribute("txMessage", serviceMsg);
        model.addAttribute("amount", amount);
        model.addAttribute("oldBalance", oldBalance);
        model.addAttribute("newBalance", newBalance);
        model.addAttribute("txCounterparty", toUser);
        model.addAttribute("txRef", txRef);
        model.addAttribute("txDateTime", txDateTime);

        return "bank-transaction";
    }

    // ---------------------------------------------------------------------
    // VIEW SINGLE TRANSACTION
    // ---------------------------------------------------------------------

    // 1) OLD PATTERN – by MongoDB ID in the path: /bambanking/tx/{id}
    @GetMapping("/tx/{id}")
    public String showTransactionFromHistoryById(
            @PathVariable("id") String id,
            HttpSession session,
            Model model) {

        Account acc = getLoggedAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login?error=Please%20log%20in";
        }

        Optional<Transaction> txOpt = txService.findByIdForUser(id, acc.getUsername());
        if (txOpt.isEmpty()) {
            return "redirect:/bambanking/dashboard#recent-transactions";
        }

        Transaction tx = txOpt.get();

        boolean success = "OK".equalsIgnoreCase(tx.getStatus());
        String txType = tx.getType();

        // Try to extract counterparty from "Transfer to X" or "Transfer from X"
        String counterparty = null;
        if (txType != null) {
            String lower = txType.toLowerCase();
            if (lower.startsWith("transfer to ")) {
                counterparty = txType.substring("Transfer to ".length());
            } else if (lower.startsWith("transfer from ")) {
                counterparty = txType.substring("Transfer from ".length());
            }
        }

        Double recordedAfter = tx.getBalanceAfter();
        double newBalance = (recordedAfter != null ? recordedAfter : acc.getBalance());

        model.addAttribute("success", success);
        model.addAttribute("txType", txType);
        model.addAttribute("username", acc.getUsername());
        model.addAttribute("txMessage",
                success ? "Transaction completed." : "Transaction failed.");

        model.addAttribute("amount", Math.abs(tx.getAmount()));
        model.addAttribute("oldBalance", null);
        model.addAttribute("newBalance", newBalance);
        model.addAttribute("txCounterparty", counterparty);
        model.addAttribute("txRef", tx.getReference());
        model.addAttribute("txDateTime", tx.getTimestamp().format(TX_FORMAT));

        return "bank-transaction";
    }

    // 2) NEW PATTERN – by reference: /bambanking/tx?ref=BB-TRF-123...
    @GetMapping("/tx")
    public String showTransactionFromHistoryByRef(
            @RequestParam("ref") String ref,
            HttpSession session,
            Model model) {

        Account acc = getLoggedAccount(session);
        if (acc == null) {
            return "redirect:/bambanking/login?error=Please%20log%20in";
        }

        Optional<Transaction> txOpt = txService.findLatestByReferenceForUser(ref, acc.getUsername());
        if (txOpt.isEmpty()) {
            return "redirect:/bambanking/dashboard#recent-transactions";
        }

        Transaction tx = txOpt.get();

        boolean success = "OK".equalsIgnoreCase(tx.getStatus());
        String txType = tx.getType();

        String counterparty = null;
        if (txType != null) {
            String lower = txType.toLowerCase();
            if (lower.startsWith("transfer to ")) {
                counterparty = txType.substring("Transfer to ".length());
            } else if (lower.startsWith("transfer from ")) {
                counterparty = txType.substring("Transfer from ".length());
            }
        }

        Double recordedAfter = tx.getBalanceAfter();
        double newBalance = (recordedAfter != null ? recordedAfter : acc.getBalance());

        model.addAttribute("success", success);
        model.addAttribute("txType", txType);
        model.addAttribute("username", acc.getUsername());
        model.addAttribute("txMessage",
                success ? "Transaction completed." : "Transaction failed.");

        model.addAttribute("amount", Math.abs(tx.getAmount()));
        model.addAttribute("oldBalance", null);
        model.addAttribute("newBalance", newBalance);
        model.addAttribute("txCounterparty", counterparty);
        model.addAttribute("txRef", tx.getReference());
        model.addAttribute("txDateTime", tx.getTimestamp().format(TX_FORMAT));

        return "bank-transaction";
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
