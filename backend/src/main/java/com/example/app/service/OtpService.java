package com.example.app.service;

import com.example.app.entity.EmailOtpCode;
import com.example.app.repository.EmailOtpCodeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * OTP Service - Generate, validate, cleanup, send via email
 * 
 * Config from .env:
 * - OTP_LENGTH: 6
 * - OTP_EXPIRATION_MINUTES: 10
 * - OTP_MAX_ATTEMPTS: 5
 * - OTP_RESEND_COOLDOWN_SECONDS: 60
 */
@Service
@Slf4j
public class OtpService {
    
    // Danh sách tài khoản test cố định (nhận OTP qua DB, không gửi email)
    private static final List<String> TEST_ACCOUNTS = Arrays.asList(
        "student.test@edu.vn",
        "spso.test@edu.vn",
        "admin.test@edu.vn"
    );
    
    @Autowired
    private EmailOtpCodeRepository otpRepository;

    @Autowired
    private EmailService emailService;
    
    @Value("${otp.length:6}")
    private int otpLength;

    @Value("${otp.expiration.minutes:10}")
    private int otpExpirationMinutes;

    @Value("${otp.max.attempts:5}")
    private int maxAttempts;
    
    /**
     * Tạo OTP 6 chữ số và gửi qua email
     */
    @Transactional
    public String generateAndSendOtp(String userId, String email, String purpose) {
        try {
            // Invalidate OTP cũ (đánh dấu đã dùng) thay vì xóa để giữ audit trail
            otpRepository.findByUserIdAndPurpose(userId, purpose)
                .stream()
                .filter(otp -> otp.getConsumedAt() == null)
                .forEach(otp -> {
                    otp.setConsumedAt(LocalDateTime.now());
                    otpRepository.save(otp);
                });
            otpRepository.flush();
            
            // Tạo OTP 6 chữ số
            String code = String.format("%06d", new Random().nextInt(1000000));
            
            // Lưu vào DB
            EmailOtpCode otpCode = new EmailOtpCode();
            otpCode.setUserId(userId);
            otpCode.setCode(code);
            otpCode.setPurpose(purpose);
            otpCode.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
            otpCode.setAttemptCount(0);
            
            otpRepository.save(otpCode);
            
            // Kiểm tra có phải tài khoản test không
            boolean isTestAccount = TEST_ACCOUNTS.contains(email.toLowerCase());
            
            if (isTestAccount) {
                // Tài khoản test: KHÔNG gửi email, user lấy OTP từ DB qua response
                log.info("OTP generated for TEST account {}: {} (available in response, not sent via email)", email, code);
            } else {
                // Tài khoản thật: GỬI email async, KHÔNG trả code trong response
                emailService.sendOtpEmailAsync(email, code, otpExpirationMinutes);
                log.info("OTP generated and sent via email to production account: {}", email);
            }
            
            // Trả code chỉ cho test account (production trả null)
            return isTestAccount ? code : null;
            
        } catch (Exception e) {
            log.error("Error in generateAndSendOtp: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Tạo OTP mà không gửi email (dùng cho testing)
     */
    @Transactional
    public String generateOtpCode(String userId, String purpose) {
        try {
            // Xóa OTP cũ của user
            otpRepository.deleteByUserIdAndPurpose(userId, purpose);
            otpRepository.flush();
            
            // Tạo OTP 6 chữ số
            String code = String.format("%06d", new Random().nextInt(1000000));
            
            // Lưu vào DB
            EmailOtpCode otpCode = new EmailOtpCode();
            otpCode.setUserId(userId);
            otpCode.setCode(code);
            otpCode.setPurpose(purpose);
            otpCode.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
            otpCode.setAttemptCount(0);
            
            otpRepository.save(otpCode);
            
            log.info("OTP generated for user: {}", userId);
            return code;
        } catch (Exception e) {
            log.error("Error in generateOtpCode: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Validate OTP
     */
    @Transactional
    public boolean validateOtp(String userId, String code, String purpose) {
        try {
            var otp = otpRepository
                .findByUserIdAndCodeAndPurposeAndExpiresAtAfter(
                    userId, code, purpose, LocalDateTime.now()
                )
                .orElse(null);
            
            if (otp == null) {
                log.warn("OTP validation failed for user: {}", userId);
                return false;
            }
            
            // Check attempt count
            if (otp.getAttemptCount() >= maxAttempts) {
                otpRepository.delete(otp);
                log.warn("OTP max attempts exceeded for user: {}", userId);
                return false;
            }
            
            // Increment attempt
            otp.setAttemptCount(otp.getAttemptCount() + 1);
            otpRepository.save(otp);
            
            log.info("OTP validated successfully for user: {}", userId);
            return true;
        } catch (Exception e) {
            log.error("Error in validateOtp: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Delete OTP sau khi dùng xong
     */
    @Transactional
    public void deleteOtp(String userId, String purpose) {
        try {
            otpRepository.deleteByUserIdAndPurpose(userId, purpose);
            log.info("OTP deleted for user: {}", userId);
        } catch (Exception e) {
            log.error("Error in deleteOtp: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Cleanup expired OTPs (chạy định kỳ)
     */
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
            log.info("Expired OTPs cleaned up");
        } catch (Exception e) {
            log.error("Error in cleanupExpiredOtps: {}", e.getMessage(), e);
        }
    }
}
