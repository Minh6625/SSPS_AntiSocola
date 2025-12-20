package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Request cập nhật trạng thái tài khoản
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAccountStatusRequestDTO {
    
    @NotBlank(message = "User ID không được để trống")
    private String userId;
    
    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(Active|Inactive|Suspended)$", message = "Trạng thái phải là Active, Inactive hoặc Suspended")
    private String status;
    
    private String reason;  // Lý do thay đổi (optional)
}
