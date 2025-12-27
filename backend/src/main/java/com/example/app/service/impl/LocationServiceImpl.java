package com.example.app.service.impl;

import com.example.app.dto.*;
import com.example.app.entity.Building;
import com.example.app.entity.Campus;
import com.example.app.entity.Room;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.BuildingRepository;
import com.example.app.repository.CampusRepository;
import com.example.app.repository.RoomRepository;
import com.example.app.service.interfaces.ILocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation: Location Management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements ILocationService {
    
    private final CampusRepository campusRepository;
    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    
    // ==================== CAMPUS ====================
    
    @Override
    @Transactional(readOnly = true)
    public List<CampusDTO> getAllCampuses() {
        List<Campus> campuses = campusRepository.findAll();
        return campuses.stream()
            .map(this::convertToCampusDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public CampusDTO createCampus(CampusRequestDTO request) {
        // Check duplicate code
        if (campusRepository.findByCampusCode(request.getCampusCode()).isPresent()) {
            throw new BusinessException("Mã cơ sở đã tồn tại");
        }
        
        Campus campus = new Campus();
        campus.setCampusCode(request.getCampusCode());
        campus.setCampusName(request.getCampusName());
        campus.setAddress(request.getAddress());
        campus.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        Campus saved = campusRepository.save(campus);
        log.info("Created campus: {} (ID: {})", saved.getCampusCode(), saved.getCampusId());
        
        return convertToCampusDTO(saved);
    }
    
    @Override
    @Transactional
    public CampusDTO updateCampus(Integer id, CampusRequestDTO request) {
        Campus campus = getCampusById(id);
        
        // Check duplicate code (exclude current)
        campusRepository.findByCampusCode(request.getCampusCode())
            .ifPresent(existing -> {
                if (!existing.getCampusId().equals(id)) {
                    throw new BusinessException("Mã cơ sở đã tồn tại");
                }
            });
        
        campus.setCampusCode(request.getCampusCode());
        campus.setCampusName(request.getCampusName());
        campus.setAddress(request.getAddress());
        campus.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        Campus saved = campusRepository.save(campus);
        log.info("Updated campus: {} (ID: {})", saved.getCampusCode(), saved.getCampusId());
        
        return convertToCampusDTO(saved);
    }
    
    @Override
    @Transactional
    public void deleteCampus(Integer id) {
        Campus campus = getCampusById(id);
        campusRepository.delete(campus);
        log.info("Deleted campus: {} (ID: {})", campus.getCampusCode(), id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Campus getCampusById(Integer id) {
        return campusRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cơ sở với ID: " + id));
    }
    
    // ==================== BUILDING ====================
    
    @Override
    @Transactional(readOnly = true)
    public List<BuildingDTO> getAllBuildings() {
        List<Building> buildings = buildingRepository.findAll();
        return buildings.stream()
            .map(this::convertToBuildingDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public BuildingDTO createBuilding(BuildingRequestDTO request) {
        Campus campus = getCampusById(request.getCampusId());
        
        // Check duplicate building code in the same campus
        if (buildingRepository.findByCampusIdAndBuildingCode(request.getCampusId(), request.getBuildingCode()).isPresent()) {
            throw new BusinessException("Mã tòa nhà đã tồn tại trong cơ sở này");
        }
        
        Building building = new Building();
        building.setCampus(campus);
        building.setBuildingCode(request.getBuildingCode());
        building.setBuildingName(request.getBuildingName());
        building.setFloorCount(request.getFloorCount());
        building.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        Building saved = buildingRepository.save(building);
        log.info("Created building: {} (ID: {})", saved.getBuildingCode(), saved.getBuildingId());
        
        return convertToBuildingDTO(saved);
    }
    
    @Override
    @Transactional
    public BuildingDTO updateBuilding(Integer id, BuildingRequestDTO request) {
        Building building = getBuildingById(id);
        Campus campus = getCampusById(request.getCampusId());
        
        // Check duplicate building code in the same campus (exclude current building)
        buildingRepository.findByCampusIdAndBuildingCode(request.getCampusId(), request.getBuildingCode())
            .ifPresent(existing -> {
                if (!existing.getBuildingId().equals(id)) {
                    throw new BusinessException("Mã tòa nhà đã tồn tại trong cơ sở này");
                }
            });
        
        building.setCampus(campus);
        building.setBuildingCode(request.getBuildingCode());
        building.setBuildingName(request.getBuildingName());
        building.setFloorCount(request.getFloorCount());
        building.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        Building saved = buildingRepository.save(building);
        log.info("Updated building: {} (ID: {})", saved.getBuildingCode(), saved.getBuildingId());
        
        return convertToBuildingDTO(saved);
    }
    
    @Override
    @Transactional
    public void deleteBuilding(Integer id) {
        Building building = getBuildingById(id);
        buildingRepository.delete(building);
        log.info("Deleted building: {} (ID: {})", building.getBuildingCode(), id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Building getBuildingById(Integer id) {
        return buildingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tòa nhà với ID: " + id));
    }
    
    // ==================== ROOM ====================
    
    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        return rooms.stream()
            .map(this::convertToRoomDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public RoomDTO createRoom(RoomRequestDTO request) {
        Building building = getBuildingById(request.getBuildingId());
        
        // Check duplicate room number in the same building
        if (roomRepository.findByBuildingIdAndRoomNumber(request.getBuildingId(), request.getRoomNumber()).isPresent()) {
            throw new BusinessException("Số phòng đã tồn tại trong tòa nhà này");
        }
        
        Room room = new Room();
        room.setBuilding(building);
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomName(request.getRoomName());
        room.setRoomType(request.getRoomType());
        room.setCapacity(request.getCapacity());
        room.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        Room saved = roomRepository.save(room);
        log.info("Created room: {} (ID: {})", saved.getRoomNumber(), saved.getRoomId());
        
        return convertToRoomDTO(saved);
    }
    
    @Override
    @Transactional
    public RoomDTO updateRoom(Integer id, RoomRequestDTO request) {
        Room room = getRoomById(id);
        Building building = getBuildingById(request.getBuildingId());
        
        // Check duplicate room number in the same building (exclude current room)
        roomRepository.findByBuildingIdAndRoomNumber(request.getBuildingId(), request.getRoomNumber())
            .ifPresent(existing -> {
                if (!existing.getRoomId().equals(id)) {
                    throw new BusinessException("Số phòng đã tồn tại trong tòa nhà này");
                }
            });
        
        room.setBuilding(building);
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomName(request.getRoomName());
        room.setRoomType(request.getRoomType());
        room.setCapacity(request.getCapacity());
        room.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        Room saved = roomRepository.save(room);
        log.info("Updated room: {} (ID: {})", saved.getRoomNumber(), saved.getRoomId());
        
        return convertToRoomDTO(saved);
    }
    
    @Override
    @Transactional
    public void deleteRoom(Integer id) {
        Room room = getRoomById(id);
        roomRepository.delete(room);
        log.info("Deleted room: {} (ID: {})", room.getRoomNumber(), id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Room getRoomById(Integer id) {
        return roomRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với ID: " + id));
    }
    
    // ==================== HELPER METHODS ====================
    
    private CampusDTO convertToCampusDTO(Campus campus) {
        return new CampusDTO(
            campus.getCampusId(),
            campus.getCampusCode(),
            campus.getCampusName(),
            campus.getAddress(),
            campus.getIsActive()
        );
    }
    
    private BuildingDTO convertToBuildingDTO(Building building) {
        return new BuildingDTO(
            building.getBuildingId(),
            building.getCampusId(),
            building.getCampus() != null ? building.getCampus().getCampusName() : null,
            building.getBuildingCode(),
            building.getBuildingName(),
            building.getFloorCount(),
            building.getIsActive()
        );
    }
    
    private RoomDTO convertToRoomDTO(Room room) {
        return new RoomDTO(
            room.getRoomId(),
            room.getBuildingId(),
            room.getBuilding() != null ? room.getBuilding().getBuildingName() : null,
            room.getRoomNumber(),
            room.getRoomName(),
            room.getRoomType(),
            room.getCapacity(),
            room.getIsActive()
        );
    }
}
