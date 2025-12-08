package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String accessToken;
    private String refreshToken;
    private String type = "Bearer";
    private String userId;
    private String email;
    private String fullName;
    private String role;
    
    // 2FA fields
    private Boolean requireOtp;
    private String message;
    private String otpCode;
    
    // Success login constructor
    public LoginResponseDTO(String accessToken, String refreshToken, String userId, 
                           String email, String fullName, String role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.requireOtp = false;
    }
    
    // 2FA required constructor
    public static LoginResponseDTO requireOtp(String message, String otpCode) {
        LoginResponseDTO dto = new LoginResponseDTO();
        dto.requireOtp = true;
        dto.message = message;
        dto.otpCode = otpCode;
        return dto;
    }
}
