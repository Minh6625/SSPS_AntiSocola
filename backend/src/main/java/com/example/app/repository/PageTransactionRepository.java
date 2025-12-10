package com.example.app.repository;

import com.example.app.entity.PageTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Repository: PageTransaction
 * Quản lý lịch sử giao dịch trang in
 */
@Repository
public interface PageTransactionRepository extends JpaRepository<PageTransaction, Integer> {
    
    /**
     * Lấy danh sách giao dịch của sinh viên với pagination
     */
    Page<PageTransaction> findByStudentIdOrderByCreatedAtDesc(String studentId, Pageable pageable);
    
    /**
     * Lấy danh sách giao dịch theo loại (ALLOCATED, PURCHASED, DEDUCTED)
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE pt.studentId = :studentId AND pt.transactionType = :type ORDER BY pt.createdAt DESC")
    Page<PageTransaction> findByStudentIdAndType(@Param("studentId") String studentId, 
                                                  @Param("type") String type, 
                                                  Pageable pageable);
    
    /**
     * Lấy danh sách giao dịch trong khoảng thời gian
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE pt.studentId = :studentId AND pt.createdAt BETWEEN :startDate AND :endDate ORDER BY pt.createdAt DESC")
    Page<PageTransaction> findByStudentIdAndDateRange(@Param("studentId") String studentId,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate,
                                                       Pageable pageable);
    
    /**
     * Lấy danh sách giao dịch theo loại và khoảng thời gian
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE pt.studentId = :studentId AND pt.transactionType = :type AND pt.createdAt BETWEEN :startDate AND :endDate ORDER BY pt.createdAt DESC")
    Page<PageTransaction> findByStudentIdTypeAndDateRange(@Param("studentId") String studentId,
                                                           @Param("type") String type,
                                                           @Param("startDate") LocalDateTime startDate,
                                                           @Param("endDate") LocalDateTime endDate,
                                                           Pageable pageable);
}
