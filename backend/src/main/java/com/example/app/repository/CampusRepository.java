package com.example.app.repository;

import com.example.app.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: CampusRepository
 */
@Repository
public interface CampusRepository extends JpaRepository<Campus, Integer> {
    
    /**
     * Tìm tất cả campuses đang active
     */
    List<Campus> findByIsActiveTrue();
    
    /**
     * Tìm campus theo code
     */
    Optional<Campus> findByCampusCode(String campusCode);
}
