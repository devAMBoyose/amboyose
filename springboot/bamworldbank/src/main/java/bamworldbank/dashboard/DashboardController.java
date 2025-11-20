package bamworldbank.dashboard;

import bamworldbank.model.Account;
import bamworldbank.model.AccountRepository;
import bamworldbank.model.Transaction;
import bamworldbank.model.TransactionRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Controller
public class DashboardController {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public DashboardController(AccountRepository accountRepository,
            TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    // ---------- Helpers ----------

    private String getLoggedInEmail(HttpSession session) {
        Object value = session.getAttribute("userEmail");
        return value != null ? value.toString() : null;
    }

    private Account loadAccountOrRedirect(HttpSession session, Model model) {
        String email = getLoggedInEmail(session);
        if (email == null) {
            // not logged in, controller method should return "redirect:/login"
            return null;
        }

        Optional<Account> optional = accountRepository.findByOwnerEmail(email);
        return optional.orElse(null);
    }

    private void addCommonModel(Account account, Model model) {
        model.addAttribute("account", account);

        List<Transaction> recent = transactionRepository
                .findTop5ByOwnerEmailOrderByCreatedAtDesc(account.getOwnerEmail());
        model.addAttribute("transactions", recent);
    }

    private Transaction buildTransaction(Account account,
            String type,
            BigDecimal amount,
            String description) {
        Transaction tx = new Transaction();
        // these setters must exist in your Transaction entity
        tx.setOwnerEmail(account.getOwnerEmail());
        tx.setType(type);
        tx.setAmount(amount);
        tx.setDescription(description);
        tx.setCreatedAt(LocalDateTime.now());
        return tx;
    }

    // ---------- Dashboard ----------

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        Account account = loadAccountOrRedirect(session, model);
        if (account == null) {
            return "redirect:/login";
        }

        addCommonModel(account, model);
        return "dashboard";
    }

    // ---------- Account info ----------

    @GetMapping("/account-info")
    public String accountInfo(HttpSession session, Model model) {
        Account account = loadAccountOrRedirect(session, model);
        if (account == null) {
            return "redirect:/login";
        }

        model.addAttribute("account", account);

        List<Transaction> recent = transactionRepository
                .findTop5ByOwnerEmailOrderByCreatedAtDesc(account.getOwnerEmail());
        Transaction last = recent.isEmpty() ? null : recent.get(0);
        model.addAttribute("lastTransaction", last);

        return "account-info";
    }

    // ---------- Deposit from dashboard ----------

    @PostMapping("/deposit")
    public String deposit(@RequestParam BigDecimal amount,
            HttpSession session,
            Model model) {
        Account account = loadAccountOrRedirect(session, model);
        if (account == null) {
            return "redirect:/login";
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            model.addAttribute("error", "Amount must be greater than zero.");
            addCommonModel(account, model);
            return "dashboard";
        }

        // update balance
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        // create transaction (DEPOSIT)
        Transaction tx = buildTransaction(
                account,
                "DEPOSIT",
                amount,
                "Deposit to wallet");
        transactionRepository.save(tx);

        addCommonModel(account, model);
        model.addAttribute("message", "Deposit successful.");
        return "dashboard";
    }

    // ---------- Transfer ----------

    @GetMapping("/transfer")
    public String showTransfer(HttpSession session, Model model) {
        Account account = loadAccountOrRedirect(session, model);
        if (account == null) {
            return "redirect:/login";
        }

        model.addAttribute("account", account);
        model.addAttribute("transaction", null); // no receipt yet
        return "transfer";
    }

    @PostMapping("/transfer")
    public String doTransfer(@RequestParam String recipient,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String note,
            HttpSession session,
            Model model) {
        Account account = loadAccountOrRedirect(session, model);
        if (account == null) {
            return "redirect:/login";
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            model.addAttribute("error", "Amount must be greater than zero.");
        } else if (account.getBalance().compareTo(amount) < 0) {
            model.addAttribute("error", "Insufficient balance for this transfer.");
        } else {
            // subtract from balance
            account.setBalance(account.getBalance().subtract(amount));
            accountRepository.save(account);

            String desc = "Transfer to " + recipient;
            if (note != null && !note.isBlank()) {
                desc += " – " + note.trim();
            }

            // store negative amount for outflow (optional)
            Transaction tx = buildTransaction(
                    account,
                    "TRANSFER",
                    amount.negate(),
                    desc);
            transactionRepository.save(tx);

            model.addAttribute("transaction", tx);
            model.addAttribute("message", "Transfer completed.");
        }

        model.addAttribute("account", account);
        if (!model.containsAttribute("transaction")) {
            model.addAttribute("transaction", null);
        }
        return "transfer";
    }

    // ---------- Top up ----------

    @GetMapping("/topup")
    public String showTopup(HttpSession session, Model model) {
        Account account = loadAccountOrRedirect(session, model);
        if (account == null) {
            return "redirect:/login";
        }

        model.addAttribute("account", account);
        model.addAttribute("transaction", null);
        return "topup";
    }

    @PostMapping("/topup")
    public String doTopup(@RequestParam BigDecimal amount,
            @RequestParam(required = false) String source,
            HttpSession session,
            Model model) {
        Account account = loadAccountOrRedirect(session, model);
        if (account == null) {
            return "redirect:/login";
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            model.addAttribute("error", "Amount must be greater than zero.");
        } else {
            account.setBalance(account.getBalance().add(amount));
            accountRepository.save(account);

            String desc = "Top up";
            if (source != null && !source.isBlank()) {
                desc += " via " + source.trim();
            }

            Transaction tx = buildTransaction(
                    account,
                    "TOPUP",
                    amount,
                    desc);
            transactionRepository.save(tx);

            model.addAttribute("transaction", tx);
            model.addAttribute("message", "Top up successful.");
        }

        model.addAttribute("account", account);
        if (!model.containsAttribute("transaction")) {
            model.addAttribute("transaction", null);
        }
        return "topup";
    }

    // ---------- Auto debit ----------

    @GetMapping("/autodebit")
    public String showAutoDebit(HttpSession session, Model model) {
        Account account = loadAccountOrRedirect(session, model);
        if (account == null) {
            return "redirect:/login";
        }

        model.addAttribute("account", account);
        model.addAttribute("transaction", null);
        return "autodebit";
    }

    @PostMapping("/autodebit")
    public String doAutoDebit(@RequestParam String biller,
            @RequestParam BigDecimal amount,
            @RequestParam String schedule,
            HttpSession session,
            Model model) {
        Account account = loadAccountOrRedirect(session, model);
        if (account == null) {
            return "redirect:/login";
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            model.addAttribute("error", "Amount must be greater than zero.");
        } else if (account.getBalance().compareTo(amount) < 0) {
            model.addAttribute("error", "Insufficient balance for this auto debit.");
        } else {
            // subtract once (demo); in a real system you’d schedule this.
            account.setBalance(account.getBalance().subtract(amount));
            accountRepository.save(account);

            String desc = biller + " – " + amount + " every " + schedule;

            Transaction tx = buildTransaction(
                    account,
                    "AUTO_DEBIT",
                    amount.negate(),
                    desc);
            transactionRepository.save(tx);

            model.addAttribute("transaction", tx);
            model.addAttribute("message", "Auto debit mock setup saved.");
        }

        model.addAttribute("account", account);
        if (!model.containsAttribute("transaction")) {
            model.addAttribute("transaction", null);
        }
        return "autodebit";
    }
}
