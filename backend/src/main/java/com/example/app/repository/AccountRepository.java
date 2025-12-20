package com.example.app.repository;

import com.example.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY LAYER - Quản lý tài khoản (tất cả roles)
 * Giao tiếp với Database cho Account Management
 */
@Repository
public interface AccountRepository extends JpaRepository<User, String> {
    
    /**
     * Tìm user theo ID
     */
    Optional<User> findByUserId(String userId);
    
    /**
     * Tìm user theo email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Danh sách tài khoản với filter (tất cả roles)
     */
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:userType IS NULL OR u.userType = :userType) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "ORDER BY u.userId ASC")
    Page<User> findAccountsWithFilter(
            @Param("keyword") String keyword,
            @Param("userType") String userType,
            @Param("status") String status,
            Pageable pageable);
    
    /**
     * Danh sách tài khoản với filter (sắp xếp theo fullName)
     */
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:userType IS NULL OR u.userType = :userType) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "ORDER BY u.fullName ASC")
    Page<User> findAccountsWithFilterSortByName(
            @Param("keyword") String keyword,
            @Param("userType") String userType,
            @Param("status") String status,
            Pageable pageable);
    
    /**
     * Danh sách tài khoản với filter (sắp xếp theo lastLogin)
     */
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:userType IS NULL OR u.userType = :userType) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "ORDER BY u.lastLogin DESC NULLS LAST")
    Page<User> findAccountsWithFilterSortByLastLogin(
            @Param("keyword") String keyword,
            @Param("userType") String userType,
            @Param("status") String status,
            Pageable pageable);
    
    /**
     * Danh sách tài khoản với filter (sắp xếp theo createdAt)
     */
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:userType IS NULL OR u.userType = :userType) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "ORDER BY u.createdAt DESC")
    Page<User> findAccountsWithFilterSortByCreatedAt(
            @Param("keyword") String keyword,
            @Param("userType") String userType,
            @Param("status") String status,
            Pageable pageable);
    
    /**
     * Đếm tài khoản theo userType
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.userType = :userType")
    Long countByUserType(@Param("userType") String userType);
    
    /**
     * Đếm tài khoản theo status
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    Long countByStatus(@Param("status") String status);
    
    /**
     * Đếm tài khoản theo userType và status
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.userType = :userType AND u.status = :status")
    Long countByUserTypeAndStatus(@Param("userType") String userType, @Param("status") String status);
    
    /**
     * Lấy danh sách tất cả SPSO
     */
    @Query("SELECT u FROM User u WHERE u.userType = 'SPSO' AND u.status = 'Active'")
    List<User> findAllActiveSPSO();
    
    /**
     * Lấy danh sách tất cả Admin
     */
    @Query("SELECT u FROM User u WHERE u.userType = 'Admin' AND u.status = 'Active'")
    List<User> findAllActiveAdmin();
}
