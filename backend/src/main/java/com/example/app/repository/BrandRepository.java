package com.example.app.repository;

import com.example.app.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: BrandRepository
 */
@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {
    
    /**
     * Tìm tất cả brands đang active
     */
    List<Brand> findByIsActiveTrue();
    
    /**
     * Tìm brand theo tên
     */
    Optional<Brand> findByBrandName(String brandName);
    
    /**
     * Kiểm tra brand có tồn tại không
     */
    boolean existsByBrandName(String brandName);
}
