package com.bamby.jwt.banking.db;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DbTransactionRepository extends JpaRepository<DbTransaction, Long> {

    List<DbTransaction> findByUsernameOrderByTimestampDesc(String username);
}
