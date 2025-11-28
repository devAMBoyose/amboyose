package com.bamby.jwt.controller;

import com.bamby.jwt.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bambanking/debug")
public class DebugController {

    private final AccountRepository accountRepo;

    public DebugController(AccountRepository accountRepo) {
        this.accountRepo = accountRepo;
    }

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @GetMapping("/db-check")
    public String checkDb() {
        try {
            long count = accountRepo.count(); // try real DB call
            return "DB OK. URI=" + mongoUri + " | accounts.count=" + count;
        } catch (Exception e) {
            e.printStackTrace();
            return "DB ERROR: " + e.getClass().getSimpleName()
                    + " - " + e.getMessage();
        }
    }
}
