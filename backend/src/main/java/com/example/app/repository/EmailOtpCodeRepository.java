package com.example.app.repository;

import com.example.app.entity.EmailOtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailOtpCodeRepository extends JpaRepository<EmailOtpCode, Integer> {
    
    Optional<EmailOtpCode> findByUserIdAndCodeAndPurposeAndExpiresAtAfter(
        String userId,
        String code,
        String purpose,
        LocalDateTime now
    );
    
    // Dùng cho registration (userId = null, dùng email)
    Optional<EmailOtpCode> findByEmailAndCodeAndPurposeAndExpiresAtAfter(
        String email,
        String code,
        String purpose,
        LocalDateTime now
    );
    
    List<EmailOtpCode> findByUserIdAndPurpose(String userId, String purpose);
    
    // Tìm tất cả OTP theo email và purpose (để check attempts)
    List<EmailOtpCode> findByEmailAndPurpose(String email, String purpose);
    
    @Modifying
    void deleteByUserIdAndPurpose(String userId, String purpose);
    
    @Modifying
    void deleteByEmailAndPurpose(String email, String purpose);
    
    @Modifying
    void deleteByExpiresAtBefore(LocalDateTime now);
}
