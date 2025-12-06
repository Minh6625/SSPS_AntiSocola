package com.example.app.repository;

import com.example.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * REPOSITORY LAYER - Giao tiếp Database
 * JpaRepository cung cấp sẵn: findAll, findById, save, delete...
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Custom query method (Spring Data JPA tự sinh query)
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
}
