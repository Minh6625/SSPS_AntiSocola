package com.example.app.repository;

import com.example.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * REPOSITORY: UserRepository
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUserId(String userId);
    
    boolean existsByEmail(String email);
    
    boolean existsByUserId(String userId);
    
    boolean existsByPhoneNumber(String phoneNumber);
    
    /**
     * Lấy danh sách userId của tất cả sinh viên
     */
    @org.springframework.data.jpa.repository.Query("SELECT u.userId FROM User u WHERE u.userType = 'Student'")
    java.util.List<String> findAllStudentIds();
}
