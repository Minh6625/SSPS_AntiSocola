package com.example.app.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO cho cập nhật thông tin cá nhân
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDTO {
    
    @Size(max = 100, message = "Họ tên không được quá 100 ký tự")
    private String fullName;
    
    @Size(max = 15, message = "Số điện thoại không được quá 15 ký tự")
    private String phoneNumber;
}
