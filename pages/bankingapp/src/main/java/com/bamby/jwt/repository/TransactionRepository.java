package com.bamby.jwt.repository;

import com.bamby.jwt.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    // Existing: get all transactions for a user, newest first
    List<Transaction> findByUsernameOrderByTimestampDesc(String username);

    // NEW: get all transactions with the same reference, newest first
    // This is exactly the method used in TransactionService at line 327:
    // txRepo.findByReferenceOrderByTimestampDesc(reference);
    List<Transaction> findByReferenceOrderByTimestampDesc(String reference);
}
