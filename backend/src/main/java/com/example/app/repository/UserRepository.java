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
}
