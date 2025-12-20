package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Filter điều kiện tìm kiếm sinh viên
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentFilterDTO {
    private String keyword;  // Tìm theo MSSV, email, tên
    private String status;   // Active, Inactive, Suspended
    private Integer pageNumber = 1;
    private Integer pageSize = 20;
    private String sortBy = "studentId";  // studentId, fullName, lastLogin
    private String sortDirection = "ASC";  // ASC, DESC
}
