package com.bamby.jwt.banking.api;

import com.bamby.jwt.banking.model.Account;
import com.bamby.jwt.banking.service.DataStore;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@CrossOrigin(origins = "https://amboyose.onrender.com")
@RestController
@RequestMapping("/api")
public class DemoInfoController {

    private final DataStore dataStore;

    public DemoInfoController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping("/demo-balance")
    public DemoBalanceResponse getDemoBalance() {

        // Get Anna's account
        Account anna = dataStore.accounts.get("anna");

        // Fix: use BigDecimal.ZERO, not 0
        BigDecimal balance = (anna != null)
                ? BigDecimal.valueOf(anna.getBalance())
                : BigDecimal.ZERO;

        return new DemoBalanceResponse(balance);
    }

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
