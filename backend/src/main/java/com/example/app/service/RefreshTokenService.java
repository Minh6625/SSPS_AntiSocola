package com.example.app.service;

import com.example.app.entity.RefreshToken;
import com.example.app.entity.User;
import com.example.app.repository.RefreshTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * RefreshTokenService - Option A (Fixed 7-day refresh, no rotation)
 * 
 * Trách nhiệm:
 * 1. Lưu trữ token metadata để audit/tracking
 * 2. Xác thực refresh token có hợp lệ
 * 3. Dọn dẹp tokens hết hạn (scheduled task)
 * 
 * KHÔNG làm:
 * - Không rotate token (Option A không dùng rotation)
 * - Không revoke token (tránh phức tạp)
 * - Không kiểm tra concurrent sessions
 */
@Service
@Slf4j
public class RefreshTokenService {
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    
    @Value("${jwt.refresh.expiration:604800000}")
    private long refreshTokenExpiration; // milliseconds (7 days)
    
    /**
     * Tạo RefreshToken record để audit
     */
    public RefreshToken createRefreshToken(User user, String deviceId, 
                                          String deviceFingerprint, String token, 
                                          String ipAddress) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenId(UUID.randomUUID().toString());
        refreshToken.setUserId(user.getUserId());
        refreshToken.setDeviceId(deviceId);
        refreshToken.setDeviceFingerprint(deviceFingerprint);
        refreshToken.setToken(token);
        refreshToken.setIpAddress(ipAddress);
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000));
        refreshToken.setLastUsedAt(LocalDateTime.now());
        
        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.info("Refresh token created for user: {}", user.getUserId());
        return saved;
    }

    /**
     * Kiểm tra token còn hợp lệ không
     * Option A: Chỉ kiểm tra hạn, không cần revoke check
     */
    public boolean isValidToken(String token, String deviceFingerprint) {
        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository
                .findByTokenAndRevokedAtIsNullAndExpiresAtAfter(token, LocalDateTime.now());
        
        if (refreshTokenOpt.isEmpty()) {
            log.warn("Invalid or expired refresh token");
            return false;
        }
        
        RefreshToken refreshToken = refreshTokenOpt.get();
        
        // Device fingerprint mismatch = token bị dùng trên thiết bị khác
        if (!refreshToken.getDeviceFingerprint().equals(deviceFingerprint)) {
            log.warn("Device fingerprint mismatch for token - potential security threat");
            return false;
        }
        
        return true;
    }

    /**
     * Lấy refresh token record
     */
    public Optional<RefreshToken> getTokenByValue(String token) {
        return refreshTokenRepository.findByTokenAndRevokedAtIsNullAndExpiresAtAfter(
                token, LocalDateTime.now());
    }

    /**
     * Update lastUsedAt khi token được dùng
     */
    public void updateLastUsed(RefreshToken refreshToken) {
        refreshToken.setLastUsedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);
        log.debug("Updated last used for token: {}", refreshToken.getTokenId());
    }

    /**
     * Dọn dẹp tokens hết hạn (chạy scheduled)
     */
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteByExpiresAtBeforeOrRevokedAtBefore(
            LocalDateTime.now(), LocalDateTime.now());
        log.info("Expired refresh tokens cleaned up");
    }
}
