package com.example.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request tạo tài khoản mới (SPSO only)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequestDTO {
    
    @NotBlank(message = "User ID không được để trống")
    @Size(max = 20, message = "User ID không được quá 20 ký tự")
    private String userId;
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được quá 100 ký tự")
    private String email;
    
    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2-100 ký tự")
    private String fullName;
    
    @Size(max = 15, message = "Số điện thoại không được quá 15 ký tự")
    private String phoneNumber;
    
    @NotBlank(message = "Loại tài khoản không được để trống")
    private String userType; // Student, SPSO, Admin
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;
}
