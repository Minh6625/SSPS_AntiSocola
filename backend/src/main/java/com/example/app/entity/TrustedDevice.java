package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * ENTITY: TrustedDevices - Thiết bị tin cậy
 */
@Entity
@Table(name = "TrustedDevices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(TrustedDevice.TrustedDeviceId.class)
public class TrustedDevice {
    
    @Id
    @Column(name = "UserID", length = 20)
    private String userId;
    
    @Id
    @Column(name = "DeviceId", length = 64)
    private String deviceId;
    
    @Column(name = "DeviceName", length = 100)
    private String deviceName;
    
    @Column(name = "UserAgent", length = 255)
    private String userAgent;
    
    @Column(name = "IpAddress", length = 45)
    private String ipAddress;
    
    @Column(name = "DeviceFingerprint", length = 200)
    private String deviceFingerprint;
    
    @Column(name = "TrustedAt", nullable = false)
    private LocalDateTime trustedAt;
    
    @Column(name = "ExpiresAt", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "LastUsedAt")
    private LocalDateTime lastUsedAt;
    
    @Column(name = "RevokedAt")
    private LocalDateTime revokedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", insertable = false, updatable = false)
    private User user;
    
    @PrePersist
    protected void onCreate() {
        if (trustedAt == null) {
            trustedAt = LocalDateTime.now();
        }
    }
    
    // Composite Key Class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrustedDeviceId implements Serializable {
        private String userId;
        private String deviceId;
    }
}
