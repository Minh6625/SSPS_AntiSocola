package com.example.app.repository;

import com.example.app.entity.Building;
import com.example.app.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * REPOSITORY: RoomRepository
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    
    /**
     * Tìm rooms theo building và active
     */
    List<Room> findByBuildingAndIsActiveTrueOrderByRoomNumber(Building building);
    
    /**
     * Tìm rooms theo buildingId
     */
    @Query("SELECT r FROM Room r WHERE r.building.buildingId = :buildingId AND r.isActive = true ORDER BY r.roomNumber")
    List<Room> findByBuildingIdAndIsActiveTrue(@Param("buildingId") Integer buildingId);
    
    /**
     * Tìm tất cả rooms đang active
     */
    @Query("SELECT r FROM Room r WHERE r.isActive = true ORDER BY r.roomNumber")
    List<Room> findByIsActiveTrueOrderByRoomNumber();
    
    /**
     * Tìm room theo buildingId và roomNumber (để check duplicate)
     */
    @Query("SELECT r FROM Room r WHERE r.building.buildingId = :buildingId AND r.roomNumber = :roomNumber")
    java.util.Optional<Room> findByBuildingIdAndRoomNumber(@Param("buildingId") Integer buildingId, @Param("roomNumber") String roomNumber);
}
