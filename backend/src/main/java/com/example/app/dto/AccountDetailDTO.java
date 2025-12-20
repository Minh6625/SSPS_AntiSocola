package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO: Chi tiết tài khoản
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountDetailDTO {
    private String userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String userType;    // Student, SPSO, Admin
    private String status;      // Active, Inactive, Suspended
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    
    // Thông tin trang in (chỉ có với Student)
    private Integer a4Balance;
    private Integer a3Balance;
    private Integer totalA4Equivalent;
    private Long totalPrintJobs;
    private Long totalPagesPrinted;
    private LocalDateTime lastPrintTime;
}
