package com.bamby.jwt.repository;

import com.bamby.jwt.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByUsernameOrderByTimestampDesc(String username);
}
