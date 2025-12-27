package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO cho thống kê Dashboard SPSO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    
    // Thống kê tổng quan
    private Long totalPrintJobs;
    private Long completedJobs;
    private Long failedJobs;
    private Long cancelledJobs;
    private Long pendingJobs;
    private Long printingJobs;
    private Long totalPages;
    
    // Doanh thu
    private BigDecimal totalRevenue;
    private BigDecimal monthRevenue;
    
    // Thống kê theo tháng (6 tháng gần nhất)
    private List<MonthlyStatDTO> monthlyStats;
    
    // Thống kê theo tuần (7 ngày gần nhất)
    private List<WeeklyStatDTO> weeklyStats;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStatDTO {
        private String month;
        private Integer year;
        private Long jobs;
        private BigDecimal revenue;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyStatDTO {
        private String day;
        private String date;
        private Long success;
        private Long failed;
    }
}
