package com.example.app.repository;

import com.example.app.entity.PageBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository: PageBalance
 * Quản lý số dư trang in của sinh viên
 */
@Repository
public interface PageBalanceRepository extends JpaRepository<PageBalance, String> {
    
    /**
     * Tìm số dư trang theo StudentID
     */
    Optional<PageBalance> findByStudentId(String studentId);
    
    /**
     * Check số dư trang tồn tại
     */
    boolean existsByStudentId(String studentId);
}
