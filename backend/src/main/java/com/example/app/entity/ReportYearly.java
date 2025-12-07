package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ENTITY: ReportsYearly - Báo cáo năm
 */
@Entity
@Table(name = "ReportsYearly")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportYearly {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReportID")
    private Integer reportId;
    
    @Column(name = "ReportYear", nullable = false, unique = true)
    private Integer reportYear;
    
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
    
    @Column(name = "TotalRevenue", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    
    @Column(name = "AverageRevenuePerStudent", precision = 10, scale = 2)
    private BigDecimal averageRevenuePerStudent;
    
    @Column(name = "MostActiveMonth")
    private Integer mostActiveMonth;
    
    @Column(name = "PeakUsageDate")
    private LocalDate peakUsageDate;
    
    @Column(name = "PeakUsageJobs")
    private Integer peakUsageJobs;
    
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
