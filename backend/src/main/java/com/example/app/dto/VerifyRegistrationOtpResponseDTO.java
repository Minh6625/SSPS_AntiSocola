package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Response bước 2 - Xác thực OTP
 * Trả về thông tin tài khoản đã tạo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyRegistrationOtpResponseDTO {
    private String message;
    private String userId;
    private String email;
    private String fullName;
    private String userType;
    private boolean accountCreated;
}
