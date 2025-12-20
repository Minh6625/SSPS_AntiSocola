package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO: Danh sách tài khoản (dùng cho SPSO xem danh sách tất cả users)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountListDTO {
    private String userId;
    private String email;
    private String fullName;
    private String userType;    // Student, SPSO, Admin
    private String status;      // Active, Inactive, Suspended
    private Integer a4Balance;  // Chỉ có với Student
    private Integer a3Balance;  // Chỉ có với Student
    private Long totalPrintJobs; // Chỉ có với Student
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
}
