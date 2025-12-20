package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Request cấp trang miễn phí cho sinh viên
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllocatePageRequestDTO {
    
    @NotBlank(message = "Student ID không được để trống")
    private String studentId;
    
    @NotNull(message = "Số trang A4 không được để trống")
    @Min(value = 0, message = "Số trang A4 phải >= 0")
    private Integer a4Pages;
    
    @NotNull(message = "Số trang A3 không được để trống")
    @Min(value = 0, message = "Số trang A3 phải >= 0")
    private Integer a3Pages;
    
    private String reason;  // Lý do cấp trang (VD: "Cấp trang học kỳ 1")
}
