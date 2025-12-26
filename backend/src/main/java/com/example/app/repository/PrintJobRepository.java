package com.example.app.repository;

import com.example.app.entity.PrintJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REPOSITORY: PrintJob
 * Quản lý lệnh in
 */
@Repository
public interface PrintJobRepository extends JpaRepository<PrintJob, Integer>, JpaSpecificationExecutor<PrintJob> {
    
    /**
     * Tìm tất cả print jobs của một student
     */
    List<PrintJob> findByStudentIdOrderBySubmittedAtDesc(String studentId);
    
    /**
     * Tìm print jobs của student theo trạng thái
     */
    List<PrintJob> findByStudentIdAndJobStatusOrderBySubmittedAtDesc(
        String studentId, String jobStatus);
    
    /**
     * Tìm print jobs của printer
     */
    List<PrintJob> findByPrinterIdOrderBySubmittedAtDesc(Long printerId);
    
    /**
     * Tìm print jobs trong khoảng thời gian
     */
    @Query("SELECT pj FROM PrintJob pj WHERE pj.submittedAt BETWEEN :startDate AND :endDate " +
           "ORDER BY pj.submittedAt DESC")
    List<PrintJob> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);
    
    /**
     * Đếm số jobs của student
     */
    long countByStudentId(String studentId);
    
    /**
     * Lấy recent jobs của student
     */
    List<PrintJob> findTop5ByStudentIdOrderBySubmittedAtDesc(String studentId);
    
    /**
     * Tìm print jobs theo status (cho print queue service)
     */
    List<PrintJob> findByJobStatus(String jobStatus);
    
    /**
     * Đếm số jobs của printer theo danh sách status
     */
    long countByPrinterIdAndJobStatusIn(Long printerId, List<String> jobStatuses);
    
    /**
     * Tìm print jobs theo printer ID
     */
    Page<PrintJob> findByPrinterId(Long printerId, Pageable pageable);
    
    /**
     * Tìm print jobs theo status
     */
    Page<PrintJob> findByJobStatus(String jobStatus, Pageable pageable);
}
