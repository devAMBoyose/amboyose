package bamworldbank.auth;

import bamworldbank.model.Account;
import bamworldbank.model.AccountRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class AuthController {

    private final AccountRepository accountRepository;

    public AuthController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    // --------------- LOGIN PAGE ---------------

    @GetMapping({ "/", "/login" })
    public String showLoginPage(
            @RequestParam(value = "logout", required = false) String logout,
            Model model) {
        if (logout != null) {
            model.addAttribute("message", "You have been logged out.");
        }
        return "login"; // templates/login.html
    }

    // --------------- LOGIN (POST) ---------------

    @PostMapping("/auth/login")
    public String handleLogin(
            @RequestParam String email,
            @RequestParam String password,
            HttpSession session,
            Model model) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        String rawPassword = password == null ? "" : password.trim();

        if (normalizedEmail.isBlank() || rawPassword.isBlank()) {
            model.addAttribute("error", "Email and password are required.");
            return "login";
        }

        Optional<Account> optional = accountRepository.findByOwnerEmail(normalizedEmail);
        if (optional.isEmpty()) {
            model.addAttribute("error", "Account not found. Please sign up first.");
            return "login";
        }

        Account account = optional.get();

        if (account.getPassword() == null || !account.getPassword().equals(rawPassword)) {
            model.addAttribute("error", "Invalid email or password.");
            return "login";
        }

        // success: save identity into session
        session.setAttribute("userEmail", account.getOwnerEmail());
        return "redirect:/dashboard";
    }

    // --------------- REGISTER (POST) ---------------

    @PostMapping("/auth/register")
    public String handleRegister(
            @RequestParam String firstName,
            @RequestParam(required = false) String middleName,
            @RequestParam String lastName,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String passwordConfirm,
            Model model) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        String pwd = password == null ? "" : password.trim();
        String pwd2 = passwordConfirm == null ? "" : passwordConfirm.trim();

        if (normalizedEmail.isBlank() || pwd.isBlank()
                || firstName.isBlank() || lastName.isBlank()) {
            model.addAttribute("error", "Please fill in all required fields.");
            return "login";
        }

        if (!pwd.equals(pwd2)) {
            model.addAttribute("error", "Passwords do not match.");
            return "login";
        }

        if (accountRepository.findByOwnerEmail(normalizedEmail).isPresent()) {
            model.addAttribute("error", "An account with that email already exists. Please log in.");
            return "login";
        }

        String fullName = firstName.trim()
                + (middleName != null && !middleName.isBlank() ? " " + middleName.trim() : "")
                + " " + lastName.trim();

        // create account with password
        Account account = new Account(normalizedEmail, pwd);
        account.setCardHolderName(fullName.trim());

        // randomly choose VISA or Mastercard
        boolean isVisa = Math.random() < 0.5;
        String brand = isVisa ? "VISA" : "MASTERCARD";

        String fullCard = isVisa
                ? Account.generateVisaCardNumber()
                : Account.generateMastercardCardNumber();

        account.setCardBrand(brand);
        account.setAccountNumber(Account.generateAccountNumber());
        account.setCardNumberMasked(Account.maskCard(fullCard));
        account.setCardValid(Account.generateValidThru());
        account.setCardCvv(Account.generateCVV());

        accountRepository.save(account);

        model.addAttribute("message", "Registration successful. Please log in.");
        return "login";
    }

    // --------------- LOGOUT ---------------

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login?logout";
    }
}
