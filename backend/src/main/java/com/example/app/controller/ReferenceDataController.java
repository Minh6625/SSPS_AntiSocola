package com.example.app.controller;

import com.example.app.dto.*;
import com.example.app.entity.*;
import com.example.app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * CONTROLLER: Reference Data APIs
 * Các API để load dropdown data cho Brand, Model, Campus, Building, Room
 */
@Slf4j
@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@Transactional(readOnly = true)
public class ReferenceDataController {
    
    private final BrandRepository brandRepository;
    private final PrinterModelRepository modelRepository;
    private final CampusRepository campusRepository;
    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    
    /**
     * GET /api/reference/brands
     * Lấy danh sách brands đang active
     */
    @GetMapping("/brands")
    public ResponseEntity<Map<String, Object>> getBrands() {
        try {
            List<Brand> brands = brandRepository.findByIsActiveTrue();
            brands.sort((a, b) -> a.getBrandName().compareTo(b.getBrandName()));
            
            List<BrandDTO> brandDTOs = brands.stream()
                .map(brand -> new BrandDTO(
                    brand.getBrandId(),
                    brand.getBrandName(),
                    brand.getBrandDescription()
                ))
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách hãng thành công");
            response.put("data", brandDTOs);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting brands", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi lấy danh sách hãng: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * GET /api/reference/campuses
     * Lấy danh sách campuses đang active
     */
    @GetMapping("/campuses")
    public ResponseEntity<Map<String, Object>> getCampuses() {
        try {
            List<Campus> campuses = campusRepository.findByIsActiveTrue();
            campuses.sort((a, b) -> a.getCampusCode().compareTo(b.getCampusCode()));
            
            List<CampusDTO> campusDTOs = campuses.stream()
                .map(campus -> new CampusDTO(
                    campus.getCampusId(),
                    campus.getCampusCode(),
                    campus.getCampusName(),
                    campus.getAddress()
                ))
                .collect(Collectors.toList());
            
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
    
    /**
     * GET /api/reference/models?brandId=1
     * Lấy danh sách models theo brand (hoặc tất cả nếu không có brandId)
     */
    @GetMapping("/models")
    public ResponseEntity<Map<String, Object>> getModels(
            @RequestParam(required = false) Integer brandId) {
        List<PrinterModel> models;
        if (brandId != null) {
            models = modelRepository.findByBrandIdAndIsActiveTrue(brandId);
        } else {
            models = modelRepository.findByIsActiveTrueOrderByModelName();
        }
        
        // Convert to simple DTOs
        List<Map<String, Object>> modelDTOs = models.stream()
            .map(model -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("modelId", model.getModelId());
                dto.put("modelName", model.getModelName());
                dto.put("brandId", model.getBrandId());
                dto.put("defaultColorPrinting", model.getDefaultColorPrinting());
                dto.put("defaultDuplexPrinting", model.getDefaultDuplexPrinting());
                return dto;
            })
            .toList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách model thành công");
        response.put("data", modelDTOs);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/reference/buildings?campusId=1
     * Lấy danh sách buildings theo campus (hoặc tất cả nếu không có campusId)
     */
    @GetMapping("/buildings")
    public ResponseEntity<Map<String, Object>> getBuildings(
            @RequestParam(required = false) Integer campusId) {
        List<Building> buildings;
        if (campusId != null) {
            buildings = buildingRepository.findByCampusIdAndIsActiveTrue(campusId);
        } else {
            buildings = buildingRepository.findByIsActiveTrueOrderByBuildingCode();
        }
        
        // Convert to simple DTOs
        List<Map<String, Object>> buildingDTOs = buildings.stream()
            .map(building -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("buildingId", building.getBuildingId());
                dto.put("buildingCode", building.getBuildingCode());
                dto.put("buildingName", building.getBuildingName());
                dto.put("campusId", building.getCampusId());
                return dto;
            })
            .toList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách tòa nhà thành công");
        response.put("data", buildingDTOs);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/reference/rooms?buildingId=1
     * Lấy danh sách rooms theo building (hoặc tất cả nếu không có buildingId)
     */
    @GetMapping("/rooms")
    public ResponseEntity<Map<String, Object>> getRooms(
            @RequestParam(required = false) Integer buildingId) {
        List<Room> rooms;
        if (buildingId != null) {
            rooms = roomRepository.findByBuildingIdAndIsActiveTrue(buildingId);
        } else {
            rooms = roomRepository.findByIsActiveTrueOrderByRoomNumber();
        }
        
        // Convert to simple DTOs
        List<Map<String, Object>> roomDTOs = rooms.stream()
            .map(room -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("roomId", room.getRoomId());
                dto.put("roomNumber", room.getRoomNumber());
                dto.put("roomName", room.getRoomName());
                dto.put("buildingId", room.getBuildingId());
                return dto;
            })
            .toList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách phòng thành công");
        response.put("data", roomDTOs);
        
        return ResponseEntity.ok(response);
    }
}
