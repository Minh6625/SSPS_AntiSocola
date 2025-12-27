package com.example.app.repository;

import com.example.app.entity.PrintLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PrintLogRepository extends JpaRepository<PrintLog, Integer> {
    
    /**
     * Tìm logs với filters và pagination
     * Note: Sử dụng native query để tránh lỗi PostgreSQL với null parameters
     */
    @Query(value = "SELECT pl.* FROM PrintLogs pl " +
           "LEFT JOIN Users s ON s.UserID = pl.StudentID " +
           "WHERE (CAST(:studentSearch AS VARCHAR) IS NULL OR " +
           "       pl.StudentID = CAST(:studentSearch AS VARCHAR) OR " +
           "       LOWER(s.FullName) LIKE LOWER(CONCAT('%', CAST(:studentSearch AS VARCHAR), '%')) OR " +
           "       LOWER(s.Email) LIKE LOWER(CONCAT('%', CAST(:studentSearch AS VARCHAR), '%'))) " +
           "AND (CAST(:printerId AS BIGINT) IS NULL OR pl.PrinterID = CAST(:printerId AS BIGINT)) " +
           "AND (CAST(:status AS VARCHAR) IS NULL OR pl.Status = CAST(:status AS VARCHAR)) " +
           "AND (CAST(:startDate AS TIMESTAMP) IS NULL OR pl.PrintTime >= CAST(:startDate AS TIMESTAMP)) " +
           "AND (CAST(:endDate AS TIMESTAMP) IS NULL OR pl.PrintTime <= CAST(:endDate AS TIMESTAMP)) " +
           "AND (CAST(:documentName AS VARCHAR) IS NULL OR LOWER(pl.DocumentName) LIKE LOWER(CONCAT('%', CAST(:documentName AS VARCHAR), '%'))) " +
           "ORDER BY pl.PrintTime DESC",
           countQuery = "SELECT COUNT(*) FROM PrintLogs pl " +
           "LEFT JOIN Users s ON s.UserID = pl.StudentID " +
           "WHERE (CAST(:studentSearch AS VARCHAR) IS NULL OR " +
           "       pl.StudentID = CAST(:studentSearch AS VARCHAR) OR " +
           "       LOWER(s.FullName) LIKE LOWER(CONCAT('%', CAST(:studentSearch AS VARCHAR), '%')) OR " +
           "       LOWER(s.Email) LIKE LOWER(CONCAT('%', CAST(:studentSearch AS VARCHAR), '%'))) " +
           "AND (CAST(:printerId AS BIGINT) IS NULL OR pl.PrinterID = CAST(:printerId AS BIGINT)) " +
           "AND (CAST(:status AS VARCHAR) IS NULL OR pl.Status = CAST(:status AS VARCHAR)) " +
           "AND (CAST(:startDate AS TIMESTAMP) IS NULL OR pl.PrintTime >= CAST(:startDate AS TIMESTAMP)) " +
           "AND (CAST(:endDate AS TIMESTAMP) IS NULL OR pl.PrintTime <= CAST(:endDate AS TIMESTAMP)) " +
           "AND (CAST(:documentName AS VARCHAR) IS NULL OR LOWER(pl.DocumentName) LIKE LOWER(CONCAT('%', CAST(:documentName AS VARCHAR), '%')))",
           nativeQuery = true)
    Page<PrintLog> findLogsWithFilters(
        @Param("studentSearch") String studentSearch,
        @Param("printerId") Long printerId, 
        @Param("status") String status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("documentName") String documentName,
        Pageable pageable
    );
    
    /**
     * Đếm số lượng logs với filters (cho export)
     */
    @Query(value = "SELECT COUNT(*) FROM PrintLogs pl " +
           "LEFT JOIN Users s ON s.UserID = pl.StudentID " +
           "WHERE (CAST(:studentSearch AS VARCHAR) IS NULL OR " +
           "       pl.StudentID = CAST(:studentSearch AS VARCHAR) OR " +
           "       LOWER(s.FullName) LIKE LOWER(CONCAT('%', CAST(:studentSearch AS VARCHAR), '%')) OR " +
           "       LOWER(s.Email) LIKE LOWER(CONCAT('%', CAST(:studentSearch AS VARCHAR), '%'))) " +
           "AND (CAST(:printerId AS BIGINT) IS NULL OR pl.PrinterID = CAST(:printerId AS BIGINT)) " +
           "AND (CAST(:status AS VARCHAR) IS NULL OR pl.Status = CAST(:status AS VARCHAR)) " +
           "AND (CAST(:startDate AS TIMESTAMP) IS NULL OR pl.PrintTime >= CAST(:startDate AS TIMESTAMP)) " +
           "AND (CAST(:endDate AS TIMESTAMP) IS NULL OR pl.PrintTime <= CAST(:endDate AS TIMESTAMP)) " +
           "AND (CAST(:documentName AS VARCHAR) IS NULL OR LOWER(pl.DocumentName) LIKE LOWER(CONCAT('%', CAST(:documentName AS VARCHAR), '%')))",
           nativeQuery = true)
    Long countLogsWithFilters(
        @Param("studentSearch") String studentSearch,
        @Param("printerId") Long printerId,
        @Param("status") String status, 
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("documentName") String documentName
    );
    
    /**
     * Lấy logs cho export (không pagination)
     */
    @Query(value = "SELECT pl.* FROM PrintLogs pl " +
           "LEFT JOIN Users s ON s.UserID = pl.StudentID " +
           "WHERE (CAST(:studentSearch AS VARCHAR) IS NULL OR " +
           "       pl.StudentID = CAST(:studentSearch AS VARCHAR) OR " +
           "       LOWER(s.FullName) LIKE LOWER(CONCAT('%', CAST(:studentSearch AS VARCHAR), '%')) OR " +
           "       LOWER(s.Email) LIKE LOWER(CONCAT('%', CAST(:studentSearch AS VARCHAR), '%'))) " +
           "AND (CAST(:printerId AS BIGINT) IS NULL OR pl.PrinterID = CAST(:printerId AS BIGINT)) " +
           "AND (CAST(:status AS VARCHAR) IS NULL OR pl.Status = CAST(:status AS VARCHAR)) " +
           "AND (CAST(:startDate AS TIMESTAMP) IS NULL OR pl.PrintTime >= CAST(:startDate AS TIMESTAMP)) " +
           "AND (CAST(:endDate AS TIMESTAMP) IS NULL OR pl.PrintTime <= CAST(:endDate AS TIMESTAMP)) " +
           "AND (CAST(:documentName AS VARCHAR) IS NULL OR LOWER(pl.DocumentName) LIKE LOWER(CONCAT('%', CAST(:documentName AS VARCHAR), '%'))) " +
           "ORDER BY pl.PrintTime DESC",
           nativeQuery = true)
    List<PrintLog> findLogsForExport(
        @Param("studentSearch") String studentSearch,
        @Param("printerId") Long printerId,
        @Param("status") String status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("documentName") String documentName
    );
    
    /**
     * Tìm logs theo student ID
     */
    Page<PrintLog> findByStudentIdOrderByPrintTimeDesc(String studentId, Pageable pageable);
    
    /**
     * Tìm logs theo student ID (alias)
     */
    @Query("SELECT pl FROM PrintLog pl WHERE pl.studentId = :studentId ORDER BY pl.printTime DESC")
    Page<PrintLog> findByStudentId(@Param("studentId") String studentId, Pageable pageable);
    
    /**
     * Tìm logs theo printer ID
     */
    Page<PrintLog> findByPrinterIdOrderByPrintTimeDesc(String printerId, Pageable pageable);
    
    /**
     * Tìm logs theo status
     */
    Page<PrintLog> findByStatusOrderByPrintTimeDesc(String status, Pageable pageable);
    
    /**
     * Tìm logs trong khoảng thời gian
     */
    Page<PrintLog> findByPrintTimeBetweenOrderByPrintTimeDesc(
        LocalDateTime startDate, 
        LocalDateTime endDate, 
        Pageable pageable
    );
    
    /**
     * Đếm số lần in của sinh viên
     */
    @Query("SELECT COUNT(pl) FROM PrintLog pl WHERE pl.studentId = :studentId")
    Long countByStudentId(@Param("studentId") String studentId);
    
    /**
     * Tính tổng trang A4 quy đổi của sinh viên
     */
    @Query("SELECT SUM(pl.a4EquivalentUsed) FROM PrintLog pl WHERE pl.studentId = :studentId")
    Integer sumA4EquivalentByStudentId(@Param("studentId") String studentId);
    
    /**
     * Lấy lần in gần nhất của sinh viên
     */
    @Query("SELECT MAX(pl.printTime) FROM PrintLog pl WHERE pl.studentId = :studentId")
    LocalDateTime findLastPrintTimeByStudentId(@Param("studentId") String studentId);
    
    /**
     * Đếm theo status
     */
    Long countByStatus(String status);
    
    /**
     * Tính tổng số trang in
     */
    @Query("SELECT COALESCE(SUM(pl.pagesPrinted), 0) FROM PrintLog pl")
    Long sumPagesPrinted();
    
    /**
     * Đếm logs trong khoảng thời gian với danh sách status
     */
    @Query("SELECT COUNT(pl) FROM PrintLog pl WHERE pl.printTime BETWEEN :startDate AND :endDate AND pl.status IN :statuses")
    Long countByPrintTimeBetweenAndStatusIn(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("statuses") List<String> statuses
    );
}