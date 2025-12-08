package com.example.app.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Generate device fingerprint để detect token theft
 */
@Service
public class DeviceFingerprintService {
    
    /**
     * Tạo fingerprint từ User-Agent, IP, Screen Resolution, Timezone
     */
    public String generateFingerprint(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIpAddress(request);
        String screenResolution = request.getHeader("X-Screen-Resolution"); // Client gửi lên
        String timezone = request.getHeader("X-Timezone"); // Client gửi lên
        
        String fingerprint = String.format("%s|%s|%s|%s",
            userAgent != null ? userAgent : "",
            ipAddress,
            screenResolution != null ? screenResolution : "unknown",
            timezone != null ? timezone : "unknown"
        );
        
        return hashFingerprint(fingerprint);
    }
    
    /**
     * Hash fingerprint để không lưu plain text
     */
    private String hashFingerprint(String fingerprint) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(fingerprint.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate fingerprint hash", e);
        }
    }
    
    /**
     * Lấy IP thực của client (xử lý proxy/load balancer)
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
