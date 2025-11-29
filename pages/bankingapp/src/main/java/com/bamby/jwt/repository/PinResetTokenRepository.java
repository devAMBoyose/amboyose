package com.bamby.jwt.repository;

import com.bamby.jwt.model.PinResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PinResetTokenRepository extends MongoRepository<PinResetToken, String> {

    Optional<PinResetToken> findByToken(String token);
}
