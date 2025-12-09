package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: EmailOtpCodes - Mã OTP qua email
 */
@Entity
@Table(name = "EmailOtpCodes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailOtpCode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OtpID")
    private Integer otpId;
    
    @Column(name = "UserID", nullable = true, length = 20)
    private String userId;
    
    @Column(name = "Email", nullable = true, length = 100)
    private String email;  // Dùng cho registration (user chưa tồn tại)
    
    @Column(name = "Purpose", nullable = false, length = 30)
    private String purpose;  // PasswordReset, Login2FA, EmailVerification, Register2FA
    
    @Column(name = "Code", nullable = false, length = 10)
    private String code;
    
    @Column(name = "ExpiresAt", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "ConsumedAt")
    private LocalDateTime consumedAt;
    
    @Column(name = "AttemptCount", nullable = false)
    private Integer attemptCount = 0;
    
    @Column(name = "MaxAttempts", nullable = false)
    private Integer maxAttempts = 5;
    
    @Column(name = "RequestedByIp", length = 45)
    private String requestedByIp;
    
    @Column(name = "DeviceId", length = 64)
    private String deviceId;
    
    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", insertable = false, updatable = false, nullable = true)
    private User user;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
