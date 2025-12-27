package com.example.app.repository;

import com.example.app.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * REPOSITORY: SystemConfig
 */
@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
    
    /**
     * Tìm config theo key
     */
    Optional<SystemConfig> findByConfigKey(String configKey);
    
    /**
     * Kiểm tra config key có tồn tại không
     */
    boolean existsByConfigKey(String configKey);
}
