package com.example.app.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO cho thống kê print logs
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrintLogStatsDTO {
    
    private Long totalLogs;
    private Long completedLogs;
    private Long failedLogs;
    private Long cancelledLogs;
    private Long pendingLogs;
    private Long printingLogs;
    
    private Integer totalPages;
    private Double averagePagesPerJob;
    private Integer maxPagesPerJob;
    private Integer minPagesPerJob;
    
    private Double completionRate;
    private Double failureRate;
    
    // Constructor với tính toán tỷ lệ
    public PrintLogStatsDTO(Long totalLogs, Long completedLogs, Long failedLogs, 
                           Long cancelledLogs, Long pendingLogs, Long printingLogs,
                           Integer totalPages, Integer maxPages, Integer minPages) {
        this.totalLogs = totalLogs;
        this.completedLogs = completedLogs;
        this.failedLogs = failedLogs;
        this.cancelledLogs = cancelledLogs;
        this.pendingLogs = pendingLogs;
        this.printingLogs = printingLogs;
        this.totalPages = totalPages;
        this.maxPagesPerJob = maxPages;
        this.minPagesPerJob = minPages;
        
        // Tính toán tỷ lệ
        if (totalLogs > 0) {
            this.completionRate = (completedLogs * 100.0) / totalLogs;
            this.failureRate = (failedLogs * 100.0) / totalLogs;
            this.averagePagesPerJob = totalPages.doubleValue() / totalLogs;
        } else {
            this.completionRate = 0.0;
            this.failureRate = 0.0;
            this.averagePagesPerJob = 0.0;
        }
    }
}