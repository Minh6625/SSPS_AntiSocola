package com.example.app.scheduler;

import com.example.app.entity.PageBalance;
import com.example.app.entity.PageTransaction;
import com.example.app.entity.Semester;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.repository.PageTransactionRepository;
import com.example.app.repository.SemesterRepository;
import com.example.app.repository.SystemConfigRepository;
import com.example.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * SCHEDULER: Page Allocation
 * Tự động cấp phát trang A4 cho sinh viên khi bắt đầu học kỳ mới
 * 
 * Chạy hàng ngày lúc 00:05 để kiểm tra xem có học kỳ nào bắt đầu hôm nay không
 * 
 * OPTIMIZATIONS:
 * - Batch processing (100 sinh viên/lần) để tránh quá tải memory
 * - Bulk insert transactions để giảm DB calls
 * - Idempotent: Kiểm tra đã cấp phát chưa để tránh duplicate
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PageAllocationScheduler {
    
    private final SemesterRepository semesterRepository;
    private final PageBalanceRepository pageBalanceRepository;
    private final PageTransactionRepository pageTransactionRepository;
    private final UserRepository userRepository;
    private final SystemConfigRepository systemConfigRepository;
    
    private static final int BATCH_SIZE = 100; // Process 100 students at a time
    
    /**
     * Chạy hàng ngày lúc 00:05 (5 phút sau nửa đêm)
     * Cron: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 5 0 * * *")
    public void allocatePagesForNewSemester() {
        log.info("========== PAGE ALLOCATION SCHEDULER START ==========");
        LocalDate today = LocalDate.now();
        log.info("Checking for semesters starting on: {}", today);
        
        // Tìm các học kỳ có PageAllocationDate = hôm nay
        List<Semester> semestersToAllocate = semesterRepository.findByPageAllocationDate(today);
        
        if (semestersToAllocate.isEmpty()) {
            log.info("No semesters to allocate pages today");
            log.info("========== PAGE ALLOCATION SCHEDULER END ==========");
            return;
        }
        
        for (Semester semester : semestersToAllocate) {
            log.info("Processing semester: {} ({})", semester.getSemesterName(), semester.getSemesterCode());
            
            try {
                allocatePagesForSemester(semester);
            } catch (Exception e) {
                log.error("Failed to allocate pages for semester {}: {}", 
                    semester.getSemesterCode(), e.getMessage(), e);
                // Continue với semester khác
            }
        }
        
        log.info("========== PAGE ALLOCATION SCHEDULER END ==========");
    }
    
    /**
     * Cấp phát trang cho tất cả sinh viên trong một học kỳ
     * OPTIMIZED: Batch processing + idempotent check
     * 
     * Số trang cấp phát lấy từ SystemConfig (default_a4_pages_per_semester)
     */
    @Transactional
    public void allocatePagesForSemester(Semester semester) {
        String semesterCode = semester.getSemesterCode();
        
        // Lấy số trang cấp phát từ SystemConfig
        int pagesToAllocate = systemConfigRepository.findByConfigKey("default_a4_pages_per_semester")
            .map(config -> {
                try {
                    return Integer.parseInt(config.getConfigValue());
                } catch (NumberFormatException e) {
                    log.warn("Invalid default_a4_pages_per_semester value: {}. Using default 100", 
                        config.getConfigValue());
                    return 100; // Default fallback
                }
            })
            .orElse(100); // Default nếu không tìm thấy config
        
        log.info("Allocating {} A4 pages for semester: {} (from SystemConfig)", 
            pagesToAllocate, semesterCode);
        
        // IDEMPOTENT CHECK: Kiểm tra đã cấp phát cho học kỳ này chưa
        long existingAllocations = pageTransactionRepository.countBySemesterAndTransactionType(
            semesterCode, "Allocate");
        
        if (existingAllocations > 0) {
            log.warn("Semester {} already has {} allocations. Skipping to prevent duplicate.", 
                semesterCode, existingAllocations);
            return;
        }
        
        // Lấy tất cả sinh viên (UserType = 'Student')
        List<String> allStudentIds = userRepository.findAllStudentIds();
        int totalStudents = allStudentIds.size();
        log.info("Found {} students to allocate pages", totalStudents);
        
        if (totalStudents == 0) {
            log.warn("No students found to allocate pages");
            return;
        }
        
        // BATCH PROCESSING: Xử lý từng batch để tránh quá tải memory
        int successCount = 0;
        int errorCount = 0;
        int processedCount = 0;
        
        for (int i = 0; i < totalStudents; i += BATCH_SIZE) {
            int endIndex = Math.min(i + BATCH_SIZE, totalStudents);
            List<String> batchStudentIds = allStudentIds.subList(i, endIndex);
            
            log.debug("Processing batch {}-{} of {}", i + 1, endIndex, totalStudents);
            
            try {
                int batchSuccess = allocatePagesToStudentBatch(batchStudentIds, pagesToAllocate, semester);
                successCount += batchSuccess;
                processedCount += batchStudentIds.size();
                
                log.info("Batch progress: {}/{} students processed", processedCount, totalStudents);
                
            } catch (Exception e) {
                log.error("Error processing batch {}-{}: {}", i + 1, endIndex, e.getMessage(), e);
                errorCount += batchStudentIds.size();
            }
        }
        
        log.info("Page allocation completed: {} success, {} errors out of {} students", 
            successCount, errorCount, totalStudents);
    }
    
    /**
     * Cấp phát trang cho một batch sinh viên
     * OPTIMIZED: Bulk operations
     */
    private int allocatePagesToStudentBatch(List<String> studentIds, int pagesToAllocate, Semester semester) {
        List<PageBalance> balancesToSave = new ArrayList<>();
        List<PageTransaction> transactionsToSave = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        String semesterCode = semester.getSemesterCode();
        String notes = String.format("Cấp phát tự động cho học kỳ %s (%s)", 
            semester.getSemesterName(), semesterCode);
        
        for (String studentId : studentIds) {
            try {
                // Lấy hoặc tạo PageBalance
                PageBalance pageBalance = pageBalanceRepository.findById(studentId)
                    .orElseGet(() -> {
                        PageBalance newBalance = new PageBalance();
                        newBalance.setStudentId(studentId);
                        newBalance.setA4Balance(0);
                        newBalance.setLastUpdated(now);
                        return newBalance;
                    });
                
                int oldBalance = pageBalance.getA4Balance();
                
                // CỘNG DỒN số trang (không reset)
                pageBalance.setA4Balance(oldBalance + pagesToAllocate);
                pageBalance.setLastUpdated(now);
                balancesToSave.add(pageBalance);
                
                int newBalance = pageBalance.getA4Balance();
                
                // Tạo transaction
                PageTransaction transaction = new PageTransaction();
                transaction.setStudentId(studentId);
                transaction.setTransactionType("Allocate");
                transaction.setA4Pages(pagesToAllocate);
                transaction.setBalanceAfterA4(newBalance);
                transaction.setSemester(semesterCode);
                transaction.setNotes(notes);
                transaction.setCreatedAt(now);
                transaction.setCreatedBy("SYSTEM");
                transactionsToSave.add(transaction);
                
            } catch (Exception e) {
                log.error("Error preparing allocation for student {}: {}", studentId, e.getMessage());
            }
        }
        
        // BULK SAVE: Lưu tất cả cùng lúc
        if (!balancesToSave.isEmpty()) {
            pageBalanceRepository.saveAll(balancesToSave);
            log.debug("Saved {} page balances", balancesToSave.size());
        }
        
        if (!transactionsToSave.isEmpty()) {
            pageTransactionRepository.saveAll(transactionsToSave);
            log.debug("Saved {} transactions", transactionsToSave.size());
        }
        
        return balancesToSave.size();
    }
    
    /**
     * Manual trigger để test (có thể gọi từ API endpoint)
     * Cấp phát trang cho học kỳ hiện tại
     */
    @Transactional
    public void manualAllocateForCurrentSemester() {
        log.info("Manual page allocation triggered");
        
        Semester currentSemester = semesterRepository.findByIsCurrent()
            .orElseThrow(() -> new IllegalStateException("Không tìm thấy học kỳ hiện tại"));
        
        allocatePagesForSemester(currentSemester);
    }
}
