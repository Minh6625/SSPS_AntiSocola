package com.example.app.repository;

import com.example.app.entity.Building;
import com.example.app.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * REPOSITORY: BuildingRepository
 */
@Repository
public interface BuildingRepository extends JpaRepository<Building, Integer> {
    
    /**
     * Tìm buildings theo campus và active
     */
    List<Building> findByCampusAndIsActiveTrueOrderByBuildingCode(Campus campus);
    
    /**
     * Tìm buildings theo campusId
     */
    @Query("SELECT b FROM Building b WHERE b.campus.campusId = :campusId AND b.isActive = true ORDER BY b.buildingCode")
    List<Building> findByCampusIdAndIsActiveTrue(@Param("campusId") Integer campusId);
    
    /**
     * Tìm tất cả buildings đang active
     */
    @Query("SELECT b FROM Building b WHERE b.isActive = true ORDER BY b.buildingCode")
    List<Building> findByIsActiveTrueOrderByBuildingCode();
    
    /**
     * Tìm building theo campusId và buildingCode (để check duplicate)
     */
    @Query("SELECT b FROM Building b WHERE b.campus.campusId = :campusId AND b.buildingCode = :buildingCode")
    java.util.Optional<Building> findByCampusIdAndBuildingCode(@Param("campusId") Integer campusId, @Param("buildingCode") String buildingCode);
}
