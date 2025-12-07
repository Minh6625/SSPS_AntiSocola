package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ENTITY: ReportsMonthly - Báo cáo tháng
 */
@Entity
@Table(name = "ReportsMonthly")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportMonthly {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReportID")
    private Integer reportId;
    
    @Column(name = "ReportYear", nullable = false)
    private Integer reportYear;
    
    @Column(name = "ReportMonth", nullable = false)
    private Integer reportMonth;
    
    @Column(name = "TotalStudentsActive", nullable = false)
    private Integer totalStudentsActive = 0;
    
    @Column(name = "TotalPrintJobs", nullable = false)
    private Integer totalPrintJobs = 0;
    
    @Column(name = "SuccessfulJobs", nullable = false)
    private Integer successfulJobs = 0;
    
    @Column(name = "FailedJobs", nullable = false)
    private Integer failedJobs = 0;
    
    @Column(name = "TotalPagesPrinted", nullable = false)
    private Integer totalPagesPrinted = 0;
    
    @Column(name = "TotalA4Equivalent", nullable = false)
    private Integer totalA4Equivalent = 0;
    
    @Column(name = "TotalPagesPurchased", nullable = false)
    private Integer totalPagesPurchased = 0;
    
    @Column(name = "TotalRevenue", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    
    @Column(name = "MostUsedPrinterID", length = 20)
    private String mostUsedPrinterId;
    
    @Column(name = "MostUsedPrinterJobs")
    private Integer mostUsedPrinterJobs;
    
    @Column(name = "TopStudentID", length = 20)
    private String topStudentId;
    
    @Column(name = "TopStudentPages")
    private Integer topStudentPages;
    
    @Column(name = "GeneratedAt", nullable = false)
    private LocalDateTime generatedAt;
    
    @Column(name = "GeneratedBy", length = 20)
    private String generatedBy;
    
    @Column(name = "Notes", length = 500)
    private String notes;
    
    @PrePersist
    protected void onCreate() {
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }
    }
}
