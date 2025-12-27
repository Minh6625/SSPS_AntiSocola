package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ENTITY: Semesters - Quản lý học kỳ
 */
@Entity
@Table(name = "Semesters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Semester {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SemesterID")
    private Integer semesterId;
    
    @Column(name = "SemesterCode", nullable = false, unique = true, length = 20)
    private String semesterCode;
    
    @Column(name = "SemesterName", nullable = false, length = 100)
    private String semesterName;
    
    @Column(name = "AcademicYear", nullable = false, length = 20)
    private String academicYear;
    
    @Column(name = "StartDate", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "EndDate", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "DefaultA4Pages", nullable = false)
    private Integer defaultA4Pages = 100;
    
    @Column(name = "PageAllocationDate")
    private LocalDate pageAllocationDate;
    
    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "IsCurrent", nullable = false)
    private Boolean isCurrent = false;
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "CreatedBy", length = 20)
    private String createdBy;
    
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
    
    @Column(name = "UpdatedBy", length = 20)
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
