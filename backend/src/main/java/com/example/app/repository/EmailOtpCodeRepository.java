package com.example.app.repository;

import com.example.app.entity.EmailOtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailOtpCodeRepository extends JpaRepository<EmailOtpCode, Integer> {
    
    Optional<EmailOtpCode> findByUserIdAndCodeAndPurposeAndExpiresAtAfter(
        String userId,
        String code,
        String purpose,
        LocalDateTime now
    );
    
    java.util.List<EmailOtpCode> findByUserIdAndPurpose(String userId, String purpose);
    
    @Modifying
    void deleteByUserIdAndPurpose(String userId, String purpose);
    
    @Modifying
    void deleteByExpiresAtBefore(LocalDateTime now);
}
