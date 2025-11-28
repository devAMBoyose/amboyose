package com.bamby.jwt.repository;

import com.bamby.jwt.model.Account;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AccountRepository extends MongoRepository<Account, String> {

    Optional<Account> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);
}
