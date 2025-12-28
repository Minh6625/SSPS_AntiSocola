package com.example.app.service;

import com.example.app.dto.MonthlyReportDTO;
import com.example.app.dto.YearlyReportDTO;
import com.example.app.entity.PageTransaction;
import com.example.app.entity.PrintJob;
import com.example.app.repository.PageTransactionRepository;
import com.example.app.repository.PrintJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    
    private final PrintJobRepository printJobRepository;
    private final PageTransactionRepository pageTransactionRepository;
    
    private static final String[] MONTH_NAMES = {
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    };
    
    public MonthlyReportDTO getMonthlyReport(int year, int month) {
        log.info("Generating monthly report for {}/{}", month, year);
        
        LocalDateTime startDate = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime endDate = startDate.plusMonths(1).minusSeconds(1);
        
        log.info("Date range: {} to {}", startDate, endDate);
        
        MonthlyReportDTO report = new MonthlyReportDTO();
        report.setYear(year);
        report.setMonth(month);
        report.setMonthName(MONTH_NAMES[month - 1]);
        
        // Lấy tất cả print jobs trong tháng (dùng PrintJob thay vì PrintLog)
        Specification<PrintJob> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.greaterThanOrEqualTo(root.get("submittedAt"), startDate));
            predicates.add(cb.lessThanOrEqualTo(root.get("submittedAt"), endDate));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        List<PrintJob> jobs = printJobRepository.findAll(spec);
        log.info("Found {} print jobs in date range", jobs.size());
        
        // Thống kê cơ bản
        report.setTotalPrintJobs(jobs.size());
        report.setSuccessfulJobs((int) jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .count());
        report.setFailedJobs((int) jobs.stream()
            .filter(j -> "Failed".equals(j.getJobStatus()))
            .count());
        
        int totalPages = jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .mapToInt(j -> j.getTotalPagesToPrint() != null ? j.getTotalPagesToPrint() : 0)
            .sum();
        report.setTotalPagesPrinted(totalPages);
        
        int totalA4Equiv = jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .mapToInt(j -> j.getA4EquivalentPages() != null ? j.getA4EquivalentPages() : 0)
            .sum();
        report.setTotalA4Equivalent(totalA4Equiv);
        
        // Số sinh viên hoạt động
        Set<String> activeStudents = jobs.stream()
            .map(PrintJob::getStudentId)
            .collect(Collectors.toSet());
        report.setTotalStudentsActive(activeStudents.size());
        
        // Tính doanh thu và số trang mua
        List<PageTransaction> transactions = pageTransactionRepository
            .findByCreatedAtBetween(startDate, endDate);
        
        log.info("Found {} transactions in date range", transactions.size());
        
        BigDecimal revenue = transactions.stream()
            .filter(t -> "Purchase".equals(t.getTransactionType()) && 
                        "Completed".equals(t.getTransactionStatus()))
            .map(PageTransaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        log.info("Calculated revenue: {} from {} Purchase/Completed transactions", 
            revenue, 
            transactions.stream()
                .filter(t -> "Purchase".equals(t.getTransactionType()) && 
                            "Completed".equals(t.getTransactionStatus()))
                .count());
        
        report.setTotalRevenue(revenue);
        
        int pagesPurchased = transactions.stream()
            .filter(t -> "Purchase".equals(t.getTransactionType()) && 
                        "Completed".equals(t.getTransactionStatus()))
            .mapToInt(PageTransaction::getA4Pages)
            .sum();
        report.setTotalPagesPurchased(pagesPurchased);
        
        // Phân bổ theo khổ giấy
        long a4Count = jobs.stream()
            .filter(j -> "A4".equals(j.getPaperSize()))
            .count();
        long a3Count = jobs.stream()
            .filter(j -> "A3".equals(j.getPaperSize()))
            .count();
        
        MonthlyReportDTO.PaperSizeDistribution paperDist = new MonthlyReportDTO.PaperSizeDistribution();
        paperDist.setA4Count((int) a4Count);
        paperDist.setA3Count((int) a3Count);
        if (jobs.size() > 0) {
            paperDist.setA4Percentage((double) a4Count / jobs.size() * 100);
            paperDist.setA3Percentage((double) a3Count / jobs.size() * 100);
        } else {
            paperDist.setA4Percentage(0.0);
            paperDist.setA3Percentage(0.0);
        }
        report.setPaperSizeDistribution(paperDist);
        
        // Top 5 sinh viên
        Map<String, List<PrintJob>> jobsByStudent = jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .collect(Collectors.groupingBy(PrintJob::getStudentId));
        
        List<MonthlyReportDTO.TopStudent> topStudents = jobsByStudent.entrySet().stream()
            .map(entry -> {
                List<PrintJob> studentJobs = entry.getValue();
                int pages = studentJobs.stream()
                    .mapToInt(j -> j.getTotalPagesToPrint() != null ? j.getTotalPagesToPrint() : 0)
                    .sum();
                PrintJob firstJob = studentJobs.get(0);
                String studentName = firstJob.getStudent() != null ? firstJob.getStudent().getFullName() : entry.getKey();
                String studentEmail = firstJob.getStudent() != null ? firstJob.getStudent().getEmail() : "";
                return new MonthlyReportDTO.TopStudent(
                    entry.getKey(),
                    studentName,
                    studentEmail,
                    pages,
                    studentJobs.size(),
                    BigDecimal.ZERO
                );
            })
            .sorted(Comparator.comparing(MonthlyReportDTO.TopStudent::getTotalPages).reversed())
            .limit(5)
            .collect(Collectors.toList());
        report.setTopStudents(topStudents);
        
        if (!topStudents.isEmpty()) {
            report.setTopStudentId(topStudents.get(0).getStudentId());
            report.setTopStudentName(topStudents.get(0).getStudentName());
            report.setTopStudentPages(topStudents.get(0).getTotalPages());
        }
        
        // Top 3 máy in
        Map<Long, List<PrintJob>> jobsByPrinter = jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .collect(Collectors.groupingBy(PrintJob::getPrinterId));
        
        List<MonthlyReportDTO.TopPrinter> topPrinters = jobsByPrinter.entrySet().stream()
            .map(entry -> {
                List<PrintJob> printerJobs = entry.getValue();
                int pages = printerJobs.stream()
                    .mapToInt(j -> j.getTotalPagesToPrint() != null ? j.getTotalPagesToPrint() : 0)
                    .sum();
                PrintJob firstJob = printerJobs.get(0);
                String printerName = firstJob.getPrinter() != null ? firstJob.getPrinter().getPrinterName() : "Printer " + entry.getKey();
                String location = firstJob.getPrinter() != null ? firstJob.getPrinter().getLocation() : "Unknown";
                return new MonthlyReportDTO.TopPrinter(
                    String.valueOf(entry.getKey()),
                    printerName,
                    location,
                    printerJobs.size(),
                    pages
                );
            })
            .sorted(Comparator.comparing(MonthlyReportDTO.TopPrinter::getTotalJobs).reversed())
            .limit(3)
            .collect(Collectors.toList());
        report.setTopPrinters(topPrinters);
        
        if (!topPrinters.isEmpty()) {
            report.setMostUsedPrinterId(topPrinters.get(0).getPrinterId());
            report.setMostUsedPrinterName(topPrinters.get(0).getPrinterName());
            report.setMostUsedPrinterJobs(topPrinters.get(0).getTotalJobs());
        }
        
        // Thống kê theo ngày
        Map<Integer, List<PrintJob>> jobsByDay = jobs.stream()
            .collect(Collectors.groupingBy(j -> j.getSubmittedAt().getDayOfMonth()));
        
        List<MonthlyReportDTO.DailyStats> dailyStats = new ArrayList<>();
        int daysInMonth = startDate.toLocalDate().lengthOfMonth();
        for (int day = 1; day <= daysInMonth; day++) {
            List<PrintJob> dayJobs = jobsByDay.getOrDefault(day, Collections.emptyList());
            int jobCount = dayJobs.size();
            int dayPages = dayJobs.stream()
                .filter(j -> "Completed".equals(j.getJobStatus()))
                .mapToInt(j -> j.getTotalPagesToPrint() != null ? j.getTotalPagesToPrint() : 0)
                .sum();
            dailyStats.add(new MonthlyReportDTO.DailyStats(day, jobCount, dayPages, BigDecimal.ZERO));
        }
        report.setDailyStats(dailyStats);
        
        return report;
    }
    
    public YearlyReportDTO getYearlyReport(int year) {
        log.info("Generating yearly report for {}", year);
        
        LocalDateTime startDate = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime endDate = LocalDate.of(year, 12, 31).atTime(23, 59, 59);
        
        YearlyReportDTO report = new YearlyReportDTO();
        report.setYear(year);
        
        // Lấy tất cả print jobs trong năm
        Specification<PrintJob> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.greaterThanOrEqualTo(root.get("submittedAt"), startDate));
            predicates.add(cb.lessThanOrEqualTo(root.get("submittedAt"), endDate));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        List<PrintJob> jobs = printJobRepository.findAll(spec);
        
        // Thống kê cơ bản
        report.setTotalPrintJobs(jobs.size());
        report.setSuccessfulJobs((int) jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .count());
        report.setFailedJobs((int) jobs.stream()
            .filter(j -> "Failed".equals(j.getJobStatus()))
            .count());
        
        int totalPages = jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .mapToInt(j -> j.getTotalPagesToPrint() != null ? j.getTotalPagesToPrint() : 0)
            .sum();
        report.setTotalPagesPrinted(totalPages);
        
        int totalA4Equiv = jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .mapToInt(j -> j.getA4EquivalentPages() != null ? j.getA4EquivalentPages() : 0)
            .sum();
        report.setTotalA4Equivalent(totalA4Equiv);
        
        // Số sinh viên hoạt động
        Set<String> activeStudents = jobs.stream()
            .map(PrintJob::getStudentId)
            .collect(Collectors.toSet());
        report.setTotalStudentsActive(activeStudents.size());
        
        // Tính doanh thu
        List<PageTransaction> transactions = pageTransactionRepository
            .findByCreatedAtBetween(startDate, endDate);
        
        BigDecimal revenue = transactions.stream()
            .filter(t -> "Purchase".equals(t.getTransactionType()) && 
                        "Completed".equals(t.getTransactionStatus()))
            .map(PageTransaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        report.setTotalRevenue(revenue);
        
        int pagesPurchased = transactions.stream()
            .filter(t -> "Purchase".equals(t.getTransactionType()) && 
                        "Completed".equals(t.getTransactionStatus()))
            .mapToInt(PageTransaction::getA4Pages)
            .sum();
        report.setTotalPagesPurchased(pagesPurchased);
        
        // Doanh thu trung bình mỗi sinh viên
        if (activeStudents.size() > 0) {
            report.setAverageRevenuePerStudent(
                revenue.divide(BigDecimal.valueOf(activeStudents.size()), 2, RoundingMode.HALF_UP)
            );
        } else {
            report.setAverageRevenuePerStudent(BigDecimal.ZERO);
        }
        
        // Phân bổ theo khổ giấy
        long a4Count = jobs.stream().filter(j -> "A4".equals(j.getPaperSize())).count();
        long a3Count = jobs.stream().filter(j -> "A3".equals(j.getPaperSize())).count();
        
        YearlyReportDTO.PaperSizeDistribution paperDist = new YearlyReportDTO.PaperSizeDistribution();
        paperDist.setA4Count((int) a4Count);
        paperDist.setA3Count((int) a3Count);
        if (jobs.size() > 0) {
            paperDist.setA4Percentage((double) a4Count / jobs.size() * 100);
            paperDist.setA3Percentage((double) a3Count / jobs.size() * 100);
        } else {
            paperDist.setA4Percentage(0.0);
            paperDist.setA3Percentage(0.0);
        }
        report.setPaperSizeDistribution(paperDist);
        
        // Thống kê theo tháng
        Map<Integer, List<PrintJob>> jobsByMonth = jobs.stream()
            .collect(Collectors.groupingBy(j -> j.getSubmittedAt().getMonthValue()));
        
        List<YearlyReportDTO.MonthlyStats> monthlyStats = new ArrayList<>();
        int maxJobs = 0;
        int mostActiveMonth = 1;
        
        for (int month = 1; month <= 12; month++) {
            List<PrintJob> monthJobs = jobsByMonth.getOrDefault(month, Collections.emptyList());
            int jobCount = monthJobs.size();
            int pages = monthJobs.stream()
                .filter(j -> "Completed".equals(j.getJobStatus()))
                .mapToInt(j -> j.getTotalPagesToPrint() != null ? j.getTotalPagesToPrint() : 0)
                .sum();
            
            if (jobCount > maxJobs) {
                maxJobs = jobCount;
                mostActiveMonth = month;
            }
            
            monthlyStats.add(new YearlyReportDTO.MonthlyStats(
                month, MONTH_NAMES[month - 1], jobCount, pages, BigDecimal.ZERO
            ));
        }
        report.setMonthlyStats(monthlyStats);
        report.setMostActiveMonth(mostActiveMonth);
        report.setMostActiveMonthName(MONTH_NAMES[mostActiveMonth - 1]);
        report.setMostActiveMonthJobs(maxJobs);
        
        // Top 5 sinh viên
        Map<String, List<PrintJob>> jobsByStudent = jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .collect(Collectors.groupingBy(PrintJob::getStudentId));
        
        List<YearlyReportDTO.TopStudent> topStudents = jobsByStudent.entrySet().stream()
            .map(entry -> {
                List<PrintJob> studentJobs = entry.getValue();
                int pages = studentJobs.stream()
                    .mapToInt(j -> j.getTotalPagesToPrint() != null ? j.getTotalPagesToPrint() : 0)
                    .sum();
                PrintJob firstJob = studentJobs.get(0);
                String studentName = firstJob.getStudent() != null ? firstJob.getStudent().getFullName() : entry.getKey();
                String studentEmail = firstJob.getStudent() != null ? firstJob.getStudent().getEmail() : "";
                return new YearlyReportDTO.TopStudent(
                    entry.getKey(),
                    studentName,
                    studentEmail,
                    pages,
                    studentJobs.size(),
                    BigDecimal.ZERO
                );
            })
            .sorted(Comparator.comparing(YearlyReportDTO.TopStudent::getTotalPages).reversed())
            .limit(5)
            .collect(Collectors.toList());
        report.setTopStudents(topStudents);
        
        // Top 3 máy in
        Map<Long, List<PrintJob>> jobsByPrinter = jobs.stream()
            .filter(j -> "Completed".equals(j.getJobStatus()))
            .collect(Collectors.groupingBy(PrintJob::getPrinterId));
        
        List<YearlyReportDTO.TopPrinter> topPrinters = jobsByPrinter.entrySet().stream()
            .map(entry -> {
                List<PrintJob> printerJobs = entry.getValue();
                int pages = printerJobs.stream()
                    .mapToInt(j -> j.getTotalPagesToPrint() != null ? j.getTotalPagesToPrint() : 0)
                    .sum();
                PrintJob firstJob = printerJobs.get(0);
                String printerName = firstJob.getPrinter() != null ? firstJob.getPrinter().getPrinterName() : "Printer " + entry.getKey();
                String location = firstJob.getPrinter() != null ? firstJob.getPrinter().getLocation() : "Unknown";
                return new YearlyReportDTO.TopPrinter(
                    String.valueOf(entry.getKey()),
                    printerName,
                    location,
                    printerJobs.size(),
                    pages
                );
            })
            .sorted(Comparator.comparing(YearlyReportDTO.TopPrinter::getTotalJobs).reversed())
            .limit(3)
            .collect(Collectors.toList());
        report.setTopPrinters(topPrinters);
        
        return report;
    }
    
    public MonthlyReportDTO generateAndSaveMonthlyReport(int year, int month) {
        return getMonthlyReport(year, month);
    }
}
