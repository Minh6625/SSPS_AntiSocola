package com.example.app.controller;

import com.example.app.dto.*;
import com.example.app.service.interfaces.ILocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: Location Management APIs
 * Quản lý Cơ sở (Campus), Tòa nhà (Building), Phòng (Room)
 */
@Slf4j
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@Tag(name = "Location Management", description = "API quản lý vị trí máy in")
public class LocationController {
    
    private final ILocationService locationService;
    
    // ==================== CAMPUS APIs ====================
    
    @GetMapping("/campuses")
    @Operation(summary = "Lấy danh sách tất cả cơ sở")
    public ResponseEntity<Map<String, Object>> getAllCampuses() {
        try {
            List<CampusDTO> campusDTOs = locationService.getAllCampuses();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách cơ sở thành công");
            response.put("data", campusDTOs);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting campuses", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách cơ sở: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PostMapping("/campuses")
    @Operation(summary = "Tạo cơ sở mới")
    public ResponseEntity<Map<String, Object>> createCampus(@Valid @RequestBody CampusRequestDTO request) {
        try {
            CampusDTO dto = locationService.createCampus(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo cơ sở thành công");
            response.put("data", dto);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating campus", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi tạo cơ sở: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PutMapping("/campuses/{id}")
    @Operation(summary = "Cập nhật cơ sở")
    public ResponseEntity<Map<String, Object>> updateCampus(
            @PathVariable Integer id,
            @Valid @RequestBody CampusRequestDTO request) {
        try {
            CampusDTO dto = locationService.updateCampus(id, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật cơ sở thành công");
            response.put("data", dto);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating campus", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi cập nhật cơ sở: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @DeleteMapping("/campuses/{id}")
    @Operation(summary = "Xóa cơ sở")
    public ResponseEntity<Map<String, Object>> deleteCampus(@PathVariable Integer id) {
        try {
            locationService.deleteCampus(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa cơ sở thành công");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting campus", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi xóa cơ sở: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    // ==================== BUILDING APIs ====================
    
    @GetMapping("/buildings")
    @Operation(summary = "Lấy danh sách tất cả tòa nhà")
    public ResponseEntity<Map<String, Object>> getAllBuildings() {
        try {
            List<BuildingDTO> buildingDTOs = locationService.getAllBuildings();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách tòa nhà thành công");
            response.put("data", buildingDTOs);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting buildings", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách tòa nhà: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PostMapping("/buildings")
    @Operation(summary = "Tạo tòa nhà mới")
    public ResponseEntity<Map<String, Object>> createBuilding(@Valid @RequestBody BuildingRequestDTO request) {
        try {
            BuildingDTO dto = locationService.createBuilding(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo tòa nhà thành công");
            response.put("data", dto);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating building", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi tạo tòa nhà: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PutMapping("/buildings/{id}")
    @Operation(summary = "Cập nhật tòa nhà")
    public ResponseEntity<Map<String, Object>> updateBuilding(
            @PathVariable Integer id,
            @Valid @RequestBody BuildingRequestDTO request) {
        try {
            BuildingDTO dto = locationService.updateBuilding(id, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật tòa nhà thành công");
            response.put("data", dto);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating building", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi cập nhật tòa nhà: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @DeleteMapping("/buildings/{id}")
    @Operation(summary = "Xóa tòa nhà")
    public ResponseEntity<Map<String, Object>> deleteBuilding(@PathVariable Integer id) {
        try {
            locationService.deleteBuilding(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa tòa nhà thành công");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting building", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi xóa tòa nhà: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    // ==================== ROOM APIs ====================
    
    @GetMapping("/rooms")
    @Operation(summary = "Lấy danh sách tất cả phòng")
    public ResponseEntity<Map<String, Object>> getAllRooms() {
        try {
            List<RoomDTO> roomDTOs = locationService.getAllRooms();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách phòng thành công");
            response.put("data", roomDTOs);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting rooms", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách phòng: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PostMapping("/rooms")
    @Operation(summary = "Tạo phòng mới")
    public ResponseEntity<Map<String, Object>> createRoom(@Valid @RequestBody RoomRequestDTO request) {
        try {
            RoomDTO dto = locationService.createRoom(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo phòng thành công");
            response.put("data", dto);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating room", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi tạo phòng: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PutMapping("/rooms/{id}")
    @Operation(summary = "Cập nhật phòng")
    public ResponseEntity<Map<String, Object>> updateRoom(
            @PathVariable Integer id,
            @Valid @RequestBody RoomRequestDTO request) {
        try {
            RoomDTO dto = locationService.updateRoom(id, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật phòng thành công");
            response.put("data", dto);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating room", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi cập nhật phòng: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @DeleteMapping("/rooms/{id}")
    @Operation(summary = "Xóa phòng")
    public ResponseEntity<Map<String, Object>> deleteRoom(@PathVariable Integer id) {
        try {
            locationService.deleteRoom(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa phòng thành công");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting room", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi xóa phòng: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
