package com.bamby.jwt.service;

import com.bamby.jwt.model.Account;
import com.bamby.jwt.model.PinResetToken;
import com.bamby.jwt.repository.AccountRepository;
import com.bamby.jwt.repository.PinResetTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PinResetService {

    private final PinResetTokenRepository tokenRepo;
    private final AccountRepository accountRepo;
    private final DataStore db;

    public PinResetService(PinResetTokenRepository tokenRepo,
            AccountRepository accountRepo,
            DataStore db) {
        this.tokenRepo = tokenRepo;
        this.accountRepo = accountRepo;
        this.db = db;
    }

    public PinResetToken createTokenForUser(String username) {
        String token = UUID.randomUUID().toString();
        PinResetToken prt = new PinResetToken(
                username,
                token,
                LocalDateTime.now().plusMinutes(30));
        tokenRepo.save(prt);
        db.log("PIN RESET TOKEN created for " + username);
        return prt;
    }

    public Optional<PinResetToken> findValidToken(String token) {
        return tokenRepo.findByToken(token)
                .filter(t -> !t.isUsed())
                .filter(t -> t.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    public boolean resetPin(String tokenValue, String newPinRaw) {
        Optional<PinResetToken> optToken = findValidToken(tokenValue);
        if (optToken.isEmpty()) {
            return false;
        }

        PinResetToken t = optToken.get();
        String username = t.getUsername();

        if (newPinRaw == null || !newPinRaw.matches("\\d{4}")) {
            return false;
        }
        int pinInt = Integer.parseInt(newPinRaw);

        Optional<Account> optAcc = accountRepo.findByUsernameIgnoreCase(username);
        if (optAcc.isEmpty()) {
            return false;
        }

        Account acc = optAcc.get();
        acc.setPin(pinInt);
        accountRepo.save(acc);

        t.setUsed(true);
        tokenRepo.save(t);

        db.log("PIN RESET OK for user " + username);
        return true;
    }
}
