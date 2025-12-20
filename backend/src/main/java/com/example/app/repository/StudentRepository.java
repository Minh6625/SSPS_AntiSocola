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
 * REPOSITORY LAYER - Giao tiếp với Database
 * Chỉ chứa các query, không chứa Business Logic
 */
@Repository
public interface StudentRepository extends JpaRepository<User, String> {
    
    /**
     * Tìm sinh viên theo UserType = 'Student'
     */
    @Query("SELECT u FROM User u WHERE u.userType = 'Student' AND u.userId = :studentId")
    Optional<User> findStudentById(@Param("studentId") String studentId);
    
    /**
     * Tìm sinh viên theo email
     */
    @Query("SELECT u FROM User u WHERE u.userType = 'Student' AND u.email = :email")
    Optional<User> findStudentByEmail(@Param("email") String email);
    
    /**
     * Danh sách sinh viên với filter (sắp xếp theo userId)
     */
    @Query("SELECT u FROM User u WHERE u.userType = 'Student' " +
           "AND (LOWER(u.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR u.status = :status)")
    Page<User> findStudentsWithFilter(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable);
    
    /**
     * Danh sách sinh viên với filter (sắp xếp theo fullName)
     */
    @Query("SELECT u FROM User u WHERE u.userType = 'Student' " +
           "AND (LOWER(u.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "ORDER BY u.fullName ASC")
    Page<User> findStudentsWithFilterSortByName(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable);
    
    /**
     * Danh sách sinh viên với filter (sắp xếp theo lastLogin)
     */
    @Query("SELECT u FROM User u WHERE u.userType = 'Student' " +
           "AND (LOWER(u.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR u.status = :status) " +
           "ORDER BY u.lastLogin DESC")
    Page<User> findStudentsWithFilterSortByLastLogin(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable);
    
    /**
     * Tất cả sinh viên (không filter)
     */
    @Query("SELECT u FROM User u WHERE u.userType = 'Student'")
    Page<User> findAllStudents(Pageable pageable);
    
    /**
     * Đếm sinh viên theo trạng thái
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.userType = 'Student' AND u.status = :status")
    Long countStudentsByStatus(@Param("status") String status);
    
    /**
     * Tìm sinh viên có số dư trang < ngưỡng
     */
    @Query("SELECT u FROM User u " +
           "JOIN PageBalance pb ON u.userId = pb.studentId " +
           "WHERE u.userType = 'Student' " +
           "AND (pb.a4Balance + pb.a3Balance * 2) < :threshold")
    List<User> findStudentsWithLowPageBalance(@Param("threshold") Integer threshold);
}
