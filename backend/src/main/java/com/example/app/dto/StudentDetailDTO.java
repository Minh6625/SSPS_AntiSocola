package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO: Chi tiết sinh viên (dùng cho SPSO xem)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDetailDTO {
    private String studentId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String status;  // Active, Inactive, Suspended
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    
    // Page Balance Info
    private Integer a4Balance;
    private Integer a3Balance;
    private Integer totalA4Equivalent;  // a4Balance + (a3Balance * 2)
    
    // Statistics
    private Long totalPrintJobs;
    private Long totalPagesPrinted;
    private LocalDateTime lastPrintTime;
}
