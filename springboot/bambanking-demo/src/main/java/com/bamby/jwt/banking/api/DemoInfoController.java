package com.bamby.jwt.banking.api;

import com.bamby.jwt.banking.model.Account;
import com.bamby.jwt.banking.service.DataStore;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@CrossOrigin(origins = "https://amboyose.onrender.com") // your portfolio domain
@RestController
@RequestMapping("/api")
public class DemoInfoController {

    private final DataStore dataStore;

    public DemoInfoController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping("/demo-balance")
    public DemoBalanceResponse getDemoBalance() {

        // 🔑 KEY: use Anna's username as stored in DataStore
        Account anna = dataStore.accounts.get("anna"); // username = "anna"

        BigDecimal balance = (anna != null) ? anna.getBalance() : BigDecimal.ZERO;

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
