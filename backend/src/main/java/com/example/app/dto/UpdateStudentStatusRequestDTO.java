package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Request cập nhật trạng thái sinh viên
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStudentStatusRequestDTO {
    
    @NotBlank(message = "Student ID không được để trống")
    private String studentId;
    
    @NotBlank(message = "Status không được để trống")
    @Pattern(regexp = "^(Active|Inactive|Suspended)$", 
             message = "Status phải là: Active, Inactive, hoặc Suspended")
    private String status;
    
    private String reason;  // Lý do thay đổi trạng thái
}
