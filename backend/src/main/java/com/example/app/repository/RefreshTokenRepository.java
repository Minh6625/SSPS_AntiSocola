package com.example.app.repository;

import com.example.app.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    
    Optional<RefreshToken> findByTokenAndRevokedAtIsNullAndExpiresAtAfter(
        String token, 
        LocalDateTime now
    );
    
    List<RefreshToken> findByUserIdAndRevokedAtIsNull(String userId);
    
    void deleteByExpiresAtBeforeOrRevokedAtBefore(
        LocalDateTime expiresAt, 
        LocalDateTime revokedAt
    );
    
    void deleteByUserId(String userId);
}
