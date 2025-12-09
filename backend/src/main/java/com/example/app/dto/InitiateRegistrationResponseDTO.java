package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Response bước 1 - Đăng ký (Gửi OTP)
 * Trả về registration token để dùng ở bước 2
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InitiateRegistrationResponseDTO {
    private String message;
    private String registrationToken;  // JWT token - dùng để verify OTP
    private String email;
    private boolean otpSent;
}
