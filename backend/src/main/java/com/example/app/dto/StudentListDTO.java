package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO: Danh sách sinh viên (dùng cho SPSO xem danh sách)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentListDTO {
    private String studentId;
    private String email;
    private String fullName;
    private String status;  // Active, Inactive, Suspended
    private Integer a4Balance;
    private Integer a3Balance;
    private Long totalPrintJobs;
    private LocalDateTime lastLogin;
}
