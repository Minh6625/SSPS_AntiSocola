package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YearlyReportDTO {
    private Integer reportId;
    private Integer year;
    
    // Thống kê chung
    private Integer totalStudentsActive;
    private Integer totalPrintJobs;
    private Integer successfulJobs;
    private Integer failedJobs;
    private Integer totalPagesPrinted;
    private Integer totalA4Equivalent;
    private Integer totalPagesPurchased;
    private BigDecimal totalRevenue;
    private BigDecimal averageRevenuePerStudent;
    
    // Tháng hoạt động nhiều nhất
    private Integer mostActiveMonth;
    private String mostActiveMonthName;
    private Integer mostActiveMonthJobs;
    
    // Thống kê theo tháng
    private List<MonthlyStats> monthlyStats;
    
    // Top performers cả năm
    private List<TopStudent> topStudents;
    private List<TopPrinter> topPrinters;
    
    // Phân bổ theo khổ giấy
    private PaperSizeDistribution paperSizeDistribution;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStats {
        private Integer month;
        private String monthName;
        private Integer jobs;
        private Integer pages;
        private BigDecimal revenue;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopStudent {
        private String studentId;
        private String studentName;
        private String studentEmail;
        private Integer totalPages;
        private Integer totalJobs;
        private BigDecimal totalSpent;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPrinter {
        private String printerId;
        private String printerName;
        private String location;
        private Integer totalJobs;
        private Integer totalPages;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaperSizeDistribution {
        private Integer a4Count;
        private Integer a3Count;
        private Double a4Percentage;
        private Double a3Percentage;
    }
}
