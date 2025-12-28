package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Request đổi role cho tài khoản
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAccountRoleRequestDTO {
    
    @NotBlank(message = "User ID không được để trống")
    private String userId;
    
    @NotBlank(message = "Role không được để trống")
    @Pattern(regexp = "^(Student|SPSO)$", message = "Role phải là Student hoặc SPSO")
    private String newRole;
    
    private String reason;  // Lý do thay đổi (optional)
}
