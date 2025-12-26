package com.example.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO: Create Semester Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSemesterRequestDTO {
    @NotBlank(message = "Mã học kỳ không được để trống")
    private String semesterCode;
    
    @NotBlank(message = "Tên học kỳ không được để trống")
    private String semesterName;
    
    @NotBlank(message = "Năm học không được để trống")
    private String academicYear;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;
    
    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;
    
    @NotNull(message = "Số trang A4 mặc định không được để trống")
    @Min(value = 0, message = "Số trang A4 phải >= 0")
    private Integer defaultA4Pages;
    
    private LocalDate pageAllocationDate;
    
    private Boolean isCurrent = false;
    
    private String createdBy;
}
