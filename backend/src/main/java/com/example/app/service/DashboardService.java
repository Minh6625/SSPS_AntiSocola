package com.example.app.service;

import com.example.app.dto.DashboardStatsDTO;
import com.example.app.dto.DashboardStatsDTO.MonthlyStatDTO;
import com.example.app.dto.DashboardStatsDTO.WeeklyStatDTO;
import com.example.app.repository.PageTransactionRepository;
import com.example.app.repository.PrintLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {
    
    private final PrintLogRepository printLogRepository;
    private final PageTransactionRepository pageTransactionRepository;
    
    public DashboardStatsDTO getDashboardStats(Integer year) {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        int targetYear = year != null ? year : LocalDate.now().getYear();
        
        try {
            // Thống kê print logs
            stats.setTotalPrintJobs(printLogRepository.count());
            stats.setCompletedJobs(printLogRepository.countByStatus("Success") + 
                                   printLogRepository.countByStatus("Completed"));
            stats.setFailedJobs(printLogRepository.countByStatus("Failed"));
            stats.setCancelledJobs(printLogRepository.countByStatus("Cancelled"));
            stats.setPendingJobs(printLogRepository.countByStatus("Pending"));
            stats.setPrintingJobs(printLogRepository.countByStatus("Printing"));
            
            // Tổng số trang
            Long totalPages = printLogRepository.sumPagesPrinted();
            stats.setTotalPages(totalPages != null ? totalPages : 0L);
            
            // Doanh thu từ Purchase transactions
            BigDecimal totalRevenue = calculateTotalRevenue();
            stats.setTotalRevenue(totalRevenue);
            
            // Doanh thu tháng này
            LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            BigDecimal monthRevenue = calculateRevenueInRange(startOfMonth, LocalDateTime.now());
            stats.setMonthRevenue(monthRevenue);
            
            // Thống kê theo tháng (12 tháng của năm được chọn)
            stats.setMonthlyStats(calculateMonthlyStats(targetYear));
            
            // Thống kê theo tuần (7 ngày gần nhất)
            stats.setWeeklyStats(calculateWeeklyStats());
            
        } catch (Exception e) {
            log.error("Error calculating dashboard stats", e);
            // Return empty stats on error
            stats.setTotalPrintJobs(0L);
            stats.setCompletedJobs(0L);
            stats.setFailedJobs(0L);
            stats.setCancelledJobs(0L);
            stats.setPendingJobs(0L);
            stats.setPrintingJobs(0L);
            stats.setTotalPages(0L);
            stats.setTotalRevenue(BigDecimal.ZERO);
            stats.setMonthRevenue(BigDecimal.ZERO);
            stats.setMonthlyStats(new ArrayList<>());
            stats.setWeeklyStats(new ArrayList<>());
        }
        
        return stats;
    }
    
    private BigDecimal calculateTotalRevenue() {
        try {
            BigDecimal revenue = pageTransactionRepository.findAll().stream()
                .filter(t -> "Purchase".equals(t.getTransactionType()) && 
                            "Completed".equals(t.getTransactionStatus()) &&
                            t.getAmount() != null)
                .map(t -> t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            return revenue;
        } catch (Exception e) {
            log.error("Error calculating total revenue", e);
            return BigDecimal.ZERO;
        }
    }
    
    private BigDecimal calculateRevenueInRange(LocalDateTime start, LocalDateTime end) {
        try {
            BigDecimal revenue = pageTransactionRepository.findAll().stream()
                .filter(t -> "Purchase".equals(t.getTransactionType()) && 
                            "Completed".equals(t.getTransactionStatus()) &&
                            t.getAmount() != null &&
                            t.getCreatedAt() != null &&
                            !t.getCreatedAt().isBefore(start) &&
                            !t.getCreatedAt().isAfter(end))
                .map(t -> t.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            return revenue;
        } catch (Exception e) {
            log.error("Error calculating revenue in range", e);
            return BigDecimal.ZERO;
        }
    }

    private List<MonthlyStatDTO> calculateMonthlyStats(int year) {
        List<MonthlyStatDTO> monthlyStats = new ArrayList<>();
        String[] monthNames = {"T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"};
        
        // Lặp qua 12 tháng của năm được chọn
        for (int month = 1; month <= 12; month++) {
            LocalDate monthDate = LocalDate.of(year, month, 1);
            
            LocalDateTime startOfMonth = monthDate.atStartOfDay();
            LocalDateTime endOfMonth = monthDate.withDayOfMonth(monthDate.lengthOfMonth())
                                                .atTime(23, 59, 59);
            
            // Count jobs in this month
            Long jobs = printLogRepository.countByPrintTimeBetweenAndStatusIn(
                startOfMonth, endOfMonth, List.of("Success", "Completed"));
            
            // Calculate revenue for this month
            BigDecimal revenue = calculateRevenueInRange(startOfMonth, endOfMonth);
            
            monthlyStats.add(new MonthlyStatDTO(monthNames[month - 1], year, jobs, revenue));
        }
        
        return monthlyStats;
    }
    
    private List<WeeklyStatDTO> calculateWeeklyStats() {
        List<WeeklyStatDTO> weeklyStats = new ArrayList<>();
        String[] dayNames = {"CN", "T2", "T3", "T4", "T5", "T6", "T7"};
        
        LocalDate today = LocalDate.now();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59);
            
            // Get day name
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            String dayName = dayNames[dayOfWeek.getValue() % 7]; // Sunday = 0
            
            // Count success and failed jobs
            Long success = printLogRepository.countByPrintTimeBetweenAndStatusIn(
                startOfDay, endOfDay, List.of("Success", "Completed"));
            Long failed = printLogRepository.countByPrintTimeBetweenAndStatusIn(
                startOfDay, endOfDay, List.of("Failed"));
            
            weeklyStats.add(new WeeklyStatDTO(dayName, date.toString(), success, failed));
        }
        
        return weeklyStats;
    }
}
