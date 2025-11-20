package bamworldbank.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // identity + security
    private String ownerEmail;
    private String password;

    // card / account details
    private String cardHolderName;
    private String accountNumber;
    private String cardNumberMasked;
    private String cardValid;
    private String cardCvv;
    private String cardBrand; // "VISA" or "MASTERCARD"

    // money
    private BigDecimal balance;
    private BigDecimal withdrawalLimit;

    public Account() {
    }

    // old constructor (kept for compatibility – demo accounts)
    public Account(String ownerEmail) {
        this.ownerEmail = ownerEmail;
        this.cardHolderName = "BAMWORLDBANK User";

        // default demo values
        this.accountNumber = generateAccountNumber();
        String fullCard = generateVisaCardNumber();
        this.cardBrand = "VISA";
        this.cardNumberMasked = maskCard(fullCard);
        this.cardValid = generateValidThru();
        this.cardCvv = generateCVV();

        this.balance = new BigDecimal("5200.00");
        this.withdrawalLimit = new BigDecimal("300.00");
    }

    // new constructor used on REGISTER (email + password)
    public Account(String ownerEmail, String password) {
        this(ownerEmail);
        this.password = password;
    }

    // ---------- STATIC HELPERS (account + card generation) ----------

    public static String generateAccountNumber() {
        String prefix = "1098"; // your BAMWORLDBANK code
        StringBuilder sb = new StringBuilder(prefix);
        for (int i = 0; i < 12; i++) { // 16-digit account number
            sb.append((int) (Math.random() * 10));
        }
        return sb.toString();
    }

    private static String generateCardNumberWithPrefix(String prefix) {
        StringBuilder card = new StringBuilder(prefix);

        // build until we have 15 digits (last digit = Luhn checksum)
        while (card.length() < 15) {
            card.append((int) (Math.random() * 10));
        }

        // Luhn algorithm
        int sum = 0;
        boolean alternate = true;
        for (int i = card.length() - 1; i >= 0; i--) {
            int n = card.charAt(i) - '0';
            if (alternate) {
                n *= 2;
                if (n > 9)
                    n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        int checkDigit = (10 - (sum % 10)) % 10;

        return card.toString() + checkDigit; // 16 digits total
    }

    public static String generateVisaCardNumber() {
        // VISA starts with 4
        return generateCardNumberWithPrefix("4");
    }

    public static String generateMastercardCardNumber() {
        // Mastercard starts with 5
        return generateCardNumberWithPrefix("5");
    }

    public static String maskCard(String fullCard) {
        return "**** **** **** " + fullCard.substring(fullCard.length() - 4);
    }

    public static String generateValidThru() {
        int month = 1 + (int) (Math.random() * 12);
        int year = 25 + (int) (Math.random() * 5); // 25–29
        return String.format("%02d/%02d", month, year);
    }

    public static String generateCVV() {
        return String.valueOf(100 + (int) (Math.random() * 900));
    }

    // ---------- GETTERS & SETTERS ----------

    public Long getId() {
        return id;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCardHolderName() {
        return cardHolderName;
    }

    public void setCardHolderName(String cardHolderName) {
        this.cardHolderName = cardHolderName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCardNumberMasked() {
        return cardNumberMasked;
    }

    public void setCardNumberMasked(String cardNumberMasked) {
        this.cardNumberMasked = cardNumberMasked;
    }

    public String getCardValid() {
        return cardValid;
    }

    public void setCardValid(String cardValid) {
        this.cardValid = cardValid;
    }

    public String getCardCvv() {
        return cardCvv;
    }

    public void setCardCvv(String cardCvv) {
        this.cardCvv = cardCvv;
    }

    public String getCardBrand() {
        return cardBrand;
    }

    public void setCardBrand(String cardBrand) {
        this.cardBrand = cardBrand;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getWithdrawalLimit() {
        return withdrawalLimit;
    }

    public void setWithdrawalLimit(BigDecimal withdrawalLimit) {
        this.withdrawalLimit = withdrawalLimit;
    }
}
