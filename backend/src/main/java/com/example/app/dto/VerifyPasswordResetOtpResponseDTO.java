package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Response khi đặt lại mật khẩu thành công
 * Bước 2: Trả về message + email
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPasswordResetOtpResponseDTO {
    
    private String message;
    private String email;
    private String userId;
    private Long timestamp;
}
