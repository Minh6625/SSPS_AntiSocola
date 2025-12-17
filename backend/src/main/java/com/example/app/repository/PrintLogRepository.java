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
     */
    @Query("SELECT pl FROM PrintLog pl " +
           "LEFT JOIN FETCH pl.student s " +
           "LEFT JOIN FETCH pl.printer p " +
           "WHERE (:studentSearch IS NULL OR " +
           "       pl.studentId = :studentSearch OR " +
           "       LOWER(s.fullName) LIKE LOWER(CONCAT('%', :studentSearch, '%')) OR " +
           "       LOWER(s.email) LIKE LOWER(CONCAT('%', :studentSearch, '%'))) " +
           "AND (:printerId IS NULL OR pl.printerId = :printerId) " +
           "AND (:status IS NULL OR pl.status = :status) " +
           "AND (:startDate IS NULL OR pl.printTime >= :startDate) " +
           "AND (:endDate IS NULL OR pl.printTime <= :endDate) " +
           "AND (:documentName IS NULL OR LOWER(pl.documentName) LIKE LOWER(CONCAT('%', :documentName, '%')))")
    Page<PrintLog> findLogsWithFilters(
        @Param("studentSearch") String studentSearch,
        @Param("printerId") String printerId, 
        @Param("status") String status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("documentName") String documentName,
        Pageable pageable
    );
    
    /**
     * Đếm số lượng logs với filters (cho export)
     */
    @Query("SELECT COUNT(pl) FROM PrintLog pl " +
           "LEFT JOIN pl.student s " +
           "WHERE (:studentSearch IS NULL OR " +
           "       pl.studentId = :studentSearch OR " +
           "       LOWER(s.fullName) LIKE LOWER(CONCAT('%', :studentSearch, '%')) OR " +
           "       LOWER(s.email) LIKE LOWER(CONCAT('%', :studentSearch, '%'))) " +
           "AND (:printerId IS NULL OR pl.printerId = :printerId) " +
           "AND (:status IS NULL OR pl.status = :status) " +
           "AND (:startDate IS NULL OR pl.printTime >= :startDate) " +
           "AND (:endDate IS NULL OR pl.printTime <= :endDate) " +
           "AND (:documentName IS NULL OR LOWER(pl.documentName) LIKE LOWER(CONCAT('%', :documentName, '%')))")
    Long countLogsWithFilters(
        @Param("studentSearch") String studentSearch,
        @Param("printerId") String printerId,
        @Param("status") String status, 
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("documentName") String documentName
    );
    
    /**
     * Lấy logs cho export (không pagination)
     */
    @Query("SELECT pl FROM PrintLog pl " +
           "LEFT JOIN FETCH pl.student s " +
           "LEFT JOIN FETCH pl.printer p " +
           "WHERE (:studentSearch IS NULL OR " +
           "       pl.studentId = :studentSearch OR " +
           "       LOWER(s.fullName) LIKE LOWER(CONCAT('%', :studentSearch, '%')) OR " +
           "       LOWER(s.email) LIKE LOWER(CONCAT('%', :studentSearch, '%'))) " +
           "AND (:printerId IS NULL OR pl.printerId = :printerId) " +
           "AND (:status IS NULL OR pl.status = :status) " +
           "AND (:startDate IS NULL OR pl.printTime >= :startDate) " +
           "AND (:endDate IS NULL OR pl.printTime <= :endDate) " +
           "AND (:documentName IS NULL OR LOWER(pl.documentName) LIKE LOWER(CONCAT('%', :documentName, '%'))) " +
           "ORDER BY pl.printTime DESC")
    List<PrintLog> findLogsForExport(
        @Param("studentSearch") String studentSearch,
        @Param("printerId") String printerId,
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
}