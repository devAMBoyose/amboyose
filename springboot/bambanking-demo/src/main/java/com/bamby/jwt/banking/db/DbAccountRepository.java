package com.bamby.jwt.banking.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DbAccountRepository extends JpaRepository<DbAccount, Long> {

    Optional<DbAccount> findByUsername(String username);

    boolean existsByUsername(String username);
}
