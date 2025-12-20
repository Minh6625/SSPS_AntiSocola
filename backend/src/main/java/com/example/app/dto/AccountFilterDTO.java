package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Filter cho danh sách tài khoản
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountFilterDTO {
    private String keyword;         // Tìm theo userId, email, fullName
    private String userType;        // Student, SPSO, Admin (null = tất cả)
    private String status;          // Active, Inactive, Suspended (null = tất cả)
    private Integer pageNumber = 1;
    private Integer pageSize = 20;
    private String sortBy = "userId";       // userId, fullName, lastLogin, createdAt
    private String sortDirection = "ASC";   // ASC, DESC
}
