package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho response tạo tài khoản mới
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountResponseDTO {
    private String userId;
    private String email;
    private String fullName;
    private String userType;
    private String status;
    private String message;
}
