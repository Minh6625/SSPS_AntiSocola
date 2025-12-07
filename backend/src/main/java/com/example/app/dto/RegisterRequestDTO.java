package com.example.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Pattern(regexp = ".*@hcmiu\\.edu\\.vn$", message = "Email phải là địa chỉ @hcmiu.edu.vn")
    private String email;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;
    
    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;
    
    @NotBlank(message = "MSSV không được để trống")
    @Pattern(regexp = "^[0-9]{7,10}$", message = "MSSV phải là số từ 7-10 chữ số")
    private String studentId;
}
