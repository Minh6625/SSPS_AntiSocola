package com.example.app.service.interfaces;

import com.example.app.dto.*;
import com.example.app.entity.Building;
import com.example.app.entity.Campus;
import com.example.app.entity.Room;

import java.util.List;

/**
 * Service Interface: Location Management
 * Quản lý Cơ sở (Campus), Tòa nhà (Building), Phòng (Room)
 */
public interface ILocationService {
    
    // ==================== CAMPUS ====================
    
    /**
     * Lấy danh sách tất cả cơ sở
     */
    List<CampusDTO> getAllCampuses();
    
    /**
     * Tạo cơ sở mới
     */
    CampusDTO createCampus(CampusRequestDTO request);
    
    /**
     * Cập nhật cơ sở
     */
    CampusDTO updateCampus(Integer id, CampusRequestDTO request);
    
    /**
     * Xóa cơ sở
     */
    void deleteCampus(Integer id);
    
    /**
     * Lấy campus entity theo ID
     */
    Campus getCampusById(Integer id);
    
    // ==================== BUILDING ====================
    
    /**
     * Lấy danh sách tất cả tòa nhà
     */
    List<BuildingDTO> getAllBuildings();
    
    /**
     * Tạo tòa nhà mới
     */
    BuildingDTO createBuilding(BuildingRequestDTO request);
    
    /**
     * Cập nhật tòa nhà
     */
    BuildingDTO updateBuilding(Integer id, BuildingRequestDTO request);
    
    /**
     * Xóa tòa nhà
     */
    void deleteBuilding(Integer id);
    
    /**
     * Lấy building entity theo ID
     */
    Building getBuildingById(Integer id);
    
    // ==================== ROOM ====================
    
    /**
     * Lấy danh sách tất cả phòng
     */
    List<RoomDTO> getAllRooms();
    
    /**
     * Tạo phòng mới
     */
    RoomDTO createRoom(RoomRequestDTO request);
    
    /**
     * Cập nhật phòng
     */
    RoomDTO updateRoom(Integer id, RoomRequestDTO request);
    
    /**
     * Xóa phòng
     */
    void deleteRoom(Integer id);
    
    /**
     * Lấy room entity theo ID
     */
    Room getRoomById(Integer id);
}
