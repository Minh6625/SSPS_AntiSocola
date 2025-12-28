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
    
    /**
     * Đếm số lượng giao dịch theo học kỳ và loại giao dịch
     * Dùng để kiểm tra đã cấp phát cho học kỳ này chưa (idempotent check)
     */
    long countBySemesterAndTransactionType(String semester, String transactionType);
    
    /**
     * Lấy danh sách giao dịch trong khoảng thời gian (không pagination)
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE pt.createdAt BETWEEN :startDate AND :endDate ORDER BY pt.createdAt DESC")
    java.util.List<PageTransaction> findByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // ==================== ADMIN/SPSO QUERIES ====================
    
    /**
     * Lấy tất cả giao dịch với pagination (cho SPSO)
     */
    Page<PageTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    /**
     * Tìm kiếm giao dịch theo mã giao dịch, mã sinh viên hoặc tên sinh viên
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE " +
           "LOWER(pt.transactionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(pt.studentId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "pt.studentId IN (SELECT u.userId FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY pt.createdAt DESC")
    Page<PageTransaction> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Lọc giao dịch theo loại (cho SPSO)
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE pt.transactionType = :type ORDER BY pt.createdAt DESC")
    Page<PageTransaction> findByTransactionType(@Param("type") String type, Pageable pageable);
    
    /**
     * Lọc giao dịch theo khoảng thời gian (cho SPSO)
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE pt.createdAt BETWEEN :startDate AND :endDate ORDER BY pt.createdAt DESC")
    Page<PageTransaction> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate,
                                          Pageable pageable);
    
    /**
     * Lọc giao dịch theo loại và khoảng thời gian (cho SPSO)
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE pt.transactionType = :type AND pt.createdAt BETWEEN :startDate AND :endDate ORDER BY pt.createdAt DESC")
    Page<PageTransaction> findByTypeAndDateRange(@Param("type") String type,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate,
                                                  Pageable pageable);
    
    /**
     * Tìm kiếm với filter loại giao dịch
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE " +
           "(LOWER(pt.transactionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(pt.studentId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "pt.studentId IN (SELECT u.userId FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
           "AND pt.transactionType = :type " +
           "ORDER BY pt.createdAt DESC")
    Page<PageTransaction> searchByKeywordAndType(@Param("keyword") String keyword, 
                                                  @Param("type") String type, 
                                                  Pageable pageable);
    
    /**
     * Tìm kiếm với filter khoảng thời gian
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE " +
           "(LOWER(pt.transactionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(pt.studentId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "pt.studentId IN (SELECT u.userId FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
           "AND pt.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY pt.createdAt DESC")
    Page<PageTransaction> searchByKeywordAndDateRange(@Param("keyword") String keyword,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate,
                                                       Pageable pageable);
    
    /**
     * Tìm kiếm với filter loại và khoảng thời gian
     */
    @Query("SELECT pt FROM PageTransaction pt WHERE " +
           "(LOWER(pt.transactionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(pt.studentId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "pt.studentId IN (SELECT u.userId FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
           "AND pt.transactionType = :type " +
           "AND pt.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY pt.createdAt DESC")
    Page<PageTransaction> searchByKeywordTypeAndDateRange(@Param("keyword") String keyword,
                                                           @Param("type") String type,
                                                           @Param("startDate") LocalDateTime startDate,
                                                           @Param("endDate") LocalDateTime endDate,
                                                           Pageable pageable);
    
    /**
     * Đếm số giao dịch theo loại
     */
    long countByTransactionType(String transactionType);
    
    /**
     * Lấy giao dịch theo ID
     */
    java.util.Optional<PageTransaction> findByTransactionId(Integer transactionId);
}
