package com.example.app.repository;

import com.example.app.entity.PagePricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: PagePricing
 * Quản lý bảng giá trang in
 */
@Repository
public interface PagePricingRepository extends JpaRepository<PagePricing, Integer> {
    
    /**
     * Tìm giá theo paper size, còn active
     */
    @Query("SELECT pp FROM PagePricing pp WHERE pp.paperSize = :paperSize " +
           "AND pp.isActive = true " +
           "AND pp.effectiveFrom <= CURRENT_DATE " +
           "AND (pp.effectiveTo IS NULL OR pp.effectiveTo >= CURRENT_DATE) " +
           "ORDER BY pp.effectiveFrom DESC")
    Optional<PagePricing> findActivePricing(@Param("paperSize") String paperSize);
    
    /**
     * Lấy tất cả giá đang active
     */
    @Query("SELECT pp FROM PagePricing pp WHERE pp.isActive = true " +
           "AND pp.effectiveFrom <= CURRENT_DATE " +
           "AND (pp.effectiveTo IS NULL OR pp.effectiveTo >= CURRENT_DATE) " +
           "ORDER BY pp.paperSize")
    List<PagePricing> findAllActivePricing();
}
