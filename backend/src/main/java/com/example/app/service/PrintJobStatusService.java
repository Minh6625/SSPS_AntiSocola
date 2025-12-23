package com.example.app.service;

import com.example.app.entity.PrintJob;
import com.example.app.repository.PrintJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * SERVICE: Print Job Status Management
 * Quản lý cập nhật trạng thái của print jobs
 * 
 * Service riêng này được tạo để xử lý transaction REQUIRES_NEW
 * (tránh Spring AOP proxy issue khi gọi từ cùng class)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PrintJobStatusService {

    private final PrintJobRepository printJobRepository;

    /**
     * Cập nhật status của job và commit ngay lập tức trong transaction riêng
     * 
     * @param job PrintJob entity
     * @param status New status (e.g., "Printing", "Completed", "Failed")
     * @param notes Optional notes
     * 
     * Transaction REQUIRES_NEW đảm bảo:
     * - Tạo transaction mới, độc lập với transaction cha
     * - Commit ngay khi method kết thúc
     * - Không bị block bởi transaction cha (e.g., mock printing 30s)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateStatusAndCommit(PrintJob job, String status, String notes) {
        job.setJobStatus(status);
        
        // Set timestamps
        if ("Printing".equals(status)) {
            job.setStartedAt(LocalDateTime.now());
        } else if ("Completed".equals(status) || "Failed".equals(status)) {
            if (job.getStartedAt() == null) {
                job.setStartedAt(LocalDateTime.now());
            }
            job.setCompletedAt(LocalDateTime.now());
        }
        
        if (notes != null) {
            job.setNotes(notes);
        }
        
        printJobRepository.saveAndFlush(job);
        log.info("Job {} status updated to {} and committed to database", job.getJobId(), status);
        
        // Verify ngay lập tức (for debugging)
        PrintJob verified = printJobRepository.findById(job.getJobId()).orElse(null);
        if (verified != null) {
            log.debug("VERIFY: Job {} status in DB = {}", job.getJobId(), verified.getJobStatus());
        }
    }

    /**
     * Cập nhật status thông thường (không cần commit ngay)
     */
    @Transactional
    public void updateStatus(PrintJob job, String status, String notes) {
        job.setJobStatus(status);
        if (notes != null) {
            job.setNotes(notes);
        }
        printJobRepository.save(job);
        log.debug("Job {} status updated to {}", job.getJobId(), status);
    }
}
