package com.example.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Bước 1 - Đăng ký (Gửi OTP)
 * Validate thông tin cơ bản trước khi gửi OTP
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InitiateRegistrationRequestDTO {
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Pattern(regexp = ".*@siu\\.edu\\.vn$", message = "Email phải là địa chỉ @siu.edu.vn")
    private String email;
    
    @NotBlank(message = "MSSV không được để trống")
    @Pattern(regexp = "^[0-9]{11}$", message = "MSSV phải là 11 chữ số")
    private String studentId;
    
    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ và tên phải từ 2 đến 100 ký tự")
    private String fullName;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
        message = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
    )
    private String password;
    
    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    private String confirmPassword;
}
