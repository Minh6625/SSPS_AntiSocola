package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReportDTO {
    private Integer reportId;
    private Integer year;
    private Integer month;
    private String monthName;
    
    // Thống kê chung
    private Integer totalStudentsActive;
    private Integer totalPrintJobs;
    private Integer successfulJobs;
    private Integer failedJobs;
    private Integer cancelledJobs;
    private Integer totalPagesPrinted;
    private Integer totalA4Equivalent;
    private Integer totalPagesPurchased;
    private BigDecimal totalRevenue;
    
    // Top performers
    private String mostUsedPrinterId;
    private String mostUsedPrinterName;
    private Integer mostUsedPrinterJobs;
    private String topStudentId;
    private String topStudentName;
    private Integer topStudentPages;
    
    // Phân bổ theo khổ giấy
    private PaperSizeDistribution paperSizeDistribution;
    
    // Top 5 sinh viên
    private List<TopStudent> topStudents;
    
    // Top 3 máy in
    private List<TopPrinter> topPrinters;
    
    // Thống kê theo ngày trong tháng
    private List<DailyStats> dailyStats;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaperSizeDistribution {
        private Integer a4Count;
        private Integer a3Count;
        private Double a4Percentage;
        private Double a3Percentage;
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
    public static class DailyStats {
        private Integer day;
        private Integer jobs;
        private Integer pages;
        private BigDecimal revenue;
    }
}
