package com.example.app.repository;

import com.example.app.entity.Brand;
import com.example.app.entity.PrinterModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * REPOSITORY: PrinterModelRepository
 */
@Repository
public interface PrinterModelRepository extends JpaRepository<PrinterModel, Integer> {
    
    /**
     * Tìm models theo brand và active
     */
    List<PrinterModel> findByBrandAndIsActiveTrueOrderByModelName(Brand brand);
    
    /**
     * Tìm models theo brandId
     */
    @Query("SELECT m FROM PrinterModel m WHERE m.brand.brandId = :brandId AND m.isActive = true ORDER BY m.modelName")
    List<PrinterModel> findByBrandIdAndIsActiveTrue(@Param("brandId") Integer brandId);
    
    /**
     * Tìm tất cả models đang active
     */
    @Query("SELECT m FROM PrinterModel m WHERE m.isActive = true ORDER BY m.modelName")
    List<PrinterModel> findByIsActiveTrueOrderByModelName();
}
