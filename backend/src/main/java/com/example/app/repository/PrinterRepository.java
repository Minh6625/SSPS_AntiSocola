package com.example.app.repository;

import com.example.app.entity.Printer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Printer entity with dynamic filtering support.
 * Updated to work with Reference Tables (Brand, Model, Room hierarchy)
 */
@Repository
public interface PrinterRepository extends JpaRepository<Printer, Long>, JpaSpecificationExecutor<Printer> {
    
    /**
     * Tìm printers với full details (JOIN FETCH reference tables)
     * Tránh N+1 query problem
     */
    @Query("SELECT p FROM Printer p " +
           "JOIN FETCH p.brand b " +
           "JOIN FETCH p.model m " +
           "JOIN FETCH p.room r " +
           "JOIN FETCH r.building bld " +
           "JOIN FETCH bld.campus c " +
           "WHERE p.status = 'Active' " +
           "ORDER BY p.printerName")
    List<Printer> findActivePrintersWithDetails();
    
    /**
     * Tìm printers theo status với full details
     */
    @Query("SELECT p FROM Printer p " +
           "JOIN FETCH p.brand b " +
           "JOIN FETCH p.model m " +
           "JOIN FETCH p.room r " +
           "JOIN FETCH r.building bld " +
           "JOIN FETCH bld.campus c " +
           "WHERE p.status = :status " +
           "ORDER BY p.printerName")
    List<Printer> findByStatusWithDetails(@Param("status") String status);
    
    /**
     * Tìm printer theo ID với full details
     */
    @Query("SELECT p FROM Printer p " +
           "JOIN FETCH p.brand b " +
           "JOIN FETCH p.model m " +
           "JOIN FETCH p.room r " +
           "JOIN FETCH r.building bld " +
           "JOIN FETCH bld.campus c " +
           "WHERE p.printerId = :printerId")
    Printer findByIdWithDetails(@Param("printerId") String printerId);
}

