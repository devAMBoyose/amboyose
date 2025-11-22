// Example: src/main/java/com/bambanking/api/DemoInfoController.java
package com.bambanking.api;

import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@CrossOrigin(origins = "https://amboyose.onrender.com") // or your portfolio domain
@RestController
@RequestMapping("/api")
public class DemoInfoController {

    private final AccountService accountService;

    public DemoInfoController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/demo-balance")
    public DemoBalanceResponse getDemoBalance() {
        // 👉 Use a safe DEMO account or fixed demo data
        BigDecimal balance = accountService.getBalance("DEMO_ACCOUNT_ID");

        return new DemoBalanceResponse(balance);
    }

    // Simple DTO class
    public static class DemoBalanceResponse {
        private BigDecimal balance;

        public DemoBalanceResponse(BigDecimal balance) {
            this.balance = balance;
        }

        public BigDecimal getBalance() {
            return balance;
        }

        public void setBalance(BigDecimal balance) {
            this.balance = balance;
        }
    }
}
