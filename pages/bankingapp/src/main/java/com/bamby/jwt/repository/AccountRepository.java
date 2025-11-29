package com.bamby.jwt.repository;

import com.bamby.jwt.model.Account;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends MongoRepository<Account, String> {

    // Used by AuthService.findByUsername(...)
    Optional<Account> findByUsernameIgnoreCase(String username);

    // Used by AuthService.findByEmail(...)
    Optional<Account> findByEmailIgnoreCase(String email);
}
