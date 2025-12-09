package com.example.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Bước 2 - Xác thực OTP
 * Verify OTP và tạo tài khoản
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyRegistrationOtpRequestDTO {
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Mã OTP không được để trống")
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP phải là 6 chữ số")
    private String otpCode;
    
    @NotBlank(message = "Registration token không được để trống")
    private String registrationToken;
}
