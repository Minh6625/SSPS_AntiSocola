package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Response khi gửi OTP quên mật khẩu
 * Bước 1: Trả về message + email (masked)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordResponseDTO {
    
    private String message;
    private String email;  // Email masked (e.g., "st***@edu.vn")
    private String resetToken;  // Token để verify OTP
    private Integer otpExpirationMinutes;
    private Long timestamp;
}
