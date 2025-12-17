package com.example.app.service;

import com.example.app.dto.ForgotPasswordRequestDTO;
import com.example.app.dto.ForgotPasswordResponseDTO;
import com.example.app.dto.VerifyPasswordResetOtpRequestDTO;
import com.example.app.dto.VerifyPasswordResetOtpResponseDTO;
import com.example.app.entity.User;
import com.example.app.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service: Xử lý logic quên mật khẩu
 * 
 * Flow:
 * 1. Bước 1: Người dùng nhập email -> Gửi OTP
 * 2. Bước 2: Người dùng nhập OTP + mật khẩu mới -> Cập nhật mật khẩu
 */
@Service
@Slf4j
public class PasswordResetService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OtpService otpService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${otp.expiration.minutes:10}")
    private int otpExpirationMinutes;
    
    /**
     * Bước 1: Gửi OTP để đặt lại mật khẩu
     * 
     * - Kiểm tra email có tồn tại không
     * - Tạo OTP và gửi email
     * - Trả về response với email masked
     */
    public ForgotPasswordResponseDTO initiatePasswordReset(ForgotPasswordRequestDTO request) {
        try {
            String email = request.getEmail().toLowerCase().trim();
            
            // Kiểm tra email có tồn tại không
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));
            
            log.info("Password reset initiated for email: {}", email);
            
            // Tạo OTP và gửi email
            String otpCode = otpService.generateAndSendOtp(user.getUserId(), email, "PasswordReset");
            
            // Tạo reset token (dùng để verify OTP)
            String resetToken = UUID.randomUUID().toString();
            
            // Mask email (e.g., "student@edu.vn" -> "st***@edu.vn")
            String maskedEmail = maskEmail(email);
            
            ForgotPasswordResponseDTO response = new ForgotPasswordResponseDTO();
            response.setMessage("OTP đã được gửi đến email của bạn");
            response.setEmail(maskedEmail);
            response.setResetToken(resetToken);
            response.setOtpExpirationMinutes(otpExpirationMinutes);
            response.setTimestamp(System.currentTimeMillis());
            
            // Nếu là test account, trả về OTP trong response
            if (otpCode != null) {
                response.setMessage("OTP (test account): " + otpCode);
            }
            
            return response;
            
        } catch (RuntimeException e) {
            log.warn("Password reset initiation failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error in initiatePasswordReset: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi khởi tạo đặt lại mật khẩu: " + e.getMessage(), e);
        }
    }
    
    /**
     * Bước 2: Xác thực OTP và đặt lại mật khẩu
     * 
     * - Kiểm tra OTP có hợp lệ không
     * - Kiểm tra mật khẩu mới có khớp không
     * - Cập nhật mật khẩu mới
     * - Xóa OTP đã dùng
     */
    @Transactional
    public VerifyPasswordResetOtpResponseDTO verifyPasswordResetOtp(
            VerifyPasswordResetOtpRequestDTO request) {
        try {
            String email = request.getEmail().toLowerCase().trim();
            String otpCode = request.getOtpCode().trim();
            String newPassword = request.getNewPassword();
            String confirmPassword = request.getConfirmPassword();
            
            // Kiểm tra mật khẩu mới có khớp không
            if (!newPassword.equals(confirmPassword)) {
                throw new RuntimeException("Mật khẩu mới không khớp");
            }
            
            // Kiểm tra email có tồn tại không
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));
            
            // Validate OTP
            boolean isValidOtp = otpService.validateOtpByEmail(email, otpCode, "PasswordReset");
            if (!isValidOtp) {
                throw new RuntimeException("OTP không hợp lệ hoặc đã hết hạn");
            }
            
            log.info("OTP verified for password reset: {}", email);
            
            // Cập nhật mật khẩu mới
            String hashedPassword = passwordEncoder.encode(newPassword);
            user.setPasswordHash(hashedPassword);
            userRepository.save(user);
            
            log.info("Password updated successfully for user: {}", user.getUserId());
            
            // Xóa OTP đã dùng
            otpService.deleteOtpByEmail(email, "PasswordReset");
            
            // TODO: Gửi email thông báo đặt lại mật khẩu thành công (optional)
            log.info("Password reset completed for user: {}", user.getUserId());
            
            VerifyPasswordResetOtpResponseDTO response = new VerifyPasswordResetOtpResponseDTO();
            response.setMessage("Mật khẩu đã được đặt lại thành công");
            response.setEmail(email);
            response.setUserId(user.getUserId());
            response.setTimestamp(System.currentTimeMillis());
            
            return response;
            
        } catch (RuntimeException e) {
            log.warn("Password reset verification failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error in verifyPasswordResetOtp: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi xác thực OTP: " + e.getMessage(), e);
        }
    }
    
    /**
     * Mask email để bảo vệ privacy
     * Ví dụ: "student@edu.vn" -> "st***@edu.vn"
     */
    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) {
            return email;
        }
        
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        
        // Giữ 2 ký tự đầu, che phần còn lại
        String masked = localPart.substring(0, 2) + "***" + domain;
        return masked;
    }
}
