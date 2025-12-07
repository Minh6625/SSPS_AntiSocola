package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: RefreshTokens - Token rotation & revocation
 */
@Entity
@Table(name = "RefreshTokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {
    
    @Id
    @Column(name = "TokenID", length = 100)
    private String tokenId;
    
    @Column(name = "UserID", nullable = false, length = 20)
    private String userId;
    
    @Column(name = "DeviceID", length = 100)
    private String deviceId;
    
    @Column(name = "DeviceFingerprint", length = 200)
    private String deviceFingerprint;
    
    @Column(name = "Token", nullable = false, length = 500)
    private String token;
    
    @Column(name = "ExpiresAt", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "LastUsedAt")
    private LocalDateTime lastUsedAt;
    
    @Column(name = "RevokedAt")
    private LocalDateTime revokedAt;
    
    @Column(name = "RevokeReason", length = 100)
    private String revokeReason;
    
    @Column(name = "IpAddress", length = 50)
    private String ipAddress;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public boolean isValid() {
        return revokedAt == null && expiresAt.isAfter(LocalDateTime.now());
    }
}
