package com.example.app.service.impl;

import com.example.app.dto.PrinterRequestDTO;
import com.example.app.dto.PrinterResponseDTO;
import com.example.app.entity.Brand;
import com.example.app.entity.Printer;
import com.example.app.entity.PrinterModel;
import com.example.app.entity.Room;
import com.example.app.repository.BrandRepository;
import com.example.app.repository.PrinterModelRepository;
import com.example.app.repository.PrinterRepository;
import com.example.app.repository.RoomRepository;
import com.example.app.service.interfaces.IPrinterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import java.util.NoSuchElementException;

@Service
public class PrinterServiceImpl implements IPrinterService {

    @Autowired
    private PrinterRepository printerRepository;
    
    @Autowired
    private BrandRepository brandRepository;
    
    @Autowired
    private PrinterModelRepository printerModelRepository;
    
    @Autowired
    private RoomRepository roomRepository;

    @Override
    public Page<PrinterResponseDTO> getPrinters(String campus,
                                               String building,
                                               String room,
                                               String brand,
                                               String model,
                                               String status,
                                               Boolean colorPrinting,
                                               Boolean duplexPrinting,
                                               String keyword,
                                               int page,
                                               int size,
                                               String sortBy,
                                               String sortDir) {
        Sort.Direction direction = "DESC".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(direction, sortBy));

        Specification<Printer> spec = Specification.where(null);

        // Filter by campus (JOIN through room -> building -> campus)
        if (StringUtils.hasText(campus)) {
            spec = spec.and((root, query, cb) -> {
                Join<Object, Object> roomJoin = root.join("room", JoinType.INNER);
                Join<Object, Object> buildingJoin = roomJoin.join("building", JoinType.INNER);
                Join<Object, Object> campusJoin = buildingJoin.join("campus", JoinType.INNER);
                return cb.like(cb.lower(campusJoin.get("campusName")), "%" + campus.toLowerCase() + "%");
            });
        }

        // Filter by building (JOIN through room -> building)
        if (StringUtils.hasText(building)) {
            spec = spec.and((root, query, cb) -> {
                Join<Object, Object> roomJoin = root.join("room", JoinType.INNER);
                Join<Object, Object> buildingJoin = roomJoin.join("building", JoinType.INNER);
                return cb.like(cb.lower(buildingJoin.get("buildingCode")), "%" + building.toLowerCase() + "%");
            });
        }

        // Filter by room
        if (StringUtils.hasText(room)) {
            spec = spec.and((root, query, cb) -> {
                Join<Object, Object> roomJoin = root.join("room", JoinType.INNER);
                return cb.like(cb.lower(roomJoin.get("roomNumber")), "%" + room.toLowerCase() + "%");
            });
        }

        // Filter by brand
        if (StringUtils.hasText(brand)) {
            spec = spec.and((root, query, cb) -> {
                Join<Object, Object> brandJoin = root.join("brand", JoinType.INNER);
                return cb.like(cb.lower(brandJoin.get("brandName")), "%" + brand.toLowerCase() + "%");
            });
        }

        // Filter by model
        if (StringUtils.hasText(model)) {
            spec = spec.and((root, query, cb) -> {
                Join<Object, Object> modelJoin = root.join("model", JoinType.INNER);
                return cb.like(cb.lower(modelJoin.get("modelName")), "%" + model.toLowerCase() + "%");
            });
        }

        if (StringUtils.hasText(status)) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("status")), status.toLowerCase()));
        }

        if (colorPrinting != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("colorPrinting"), colorPrinting));
        }

        if (duplexPrinting != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("duplexPrinting"), duplexPrinting));
        }

        // Keyword search across printer name, brand, model, room
        if (StringUtils.hasText(keyword)) {
            String likeValue = "%" + keyword.toLowerCase().trim() + "%";
            spec = spec.and((root, query, cb) -> {
                Join<Object, Object> brandJoin = root.join("brand", JoinType.INNER);
                Join<Object, Object> modelJoin = root.join("model", JoinType.INNER);
                Join<Object, Object> roomJoin = root.join("room", JoinType.INNER);
                return cb.or(
                    cb.like(cb.lower(root.get("printerName")), likeValue),
                    cb.like(cb.lower(brandJoin.get("brandName")), likeValue),
                    cb.like(cb.lower(modelJoin.get("modelName")), likeValue),
                    cb.like(cb.lower(roomJoin.get("roomNumber")), likeValue)
                );
            });
        }

        Page<Printer> result = printerRepository.findAll(spec, pageable);
        return result.map(this::toDto);
    }

    @Override
    public PrinterResponseDTO getPrinterById(String printerId) {
        Printer printer = printerRepository.findByIdWithDetails(printerId);
        if (printer == null) {
            throw new NoSuchElementException("Không tìm thấy máy in");
        }
        return toDto(printer);
    }

    private PrinterResponseDTO toDto(Printer entity) {
        PrinterResponseDTO dto = new PrinterResponseDTO();
        dto.setPrinterId(entity.getPrinterId());
        dto.setPrinterName(entity.getPrinterName());
        dto.setIpAddress(entity.getIpAddress());
        
        // Map from reference tables
        dto.setBrand(entity.getBrand() != null ? entity.getBrand().getBrandName() : "");
        dto.setModel(entity.getModel() != null ? entity.getModel().getModelName() : "");
        
        // Generate location from room hierarchy
        if (entity.getRoom() != null && 
            entity.getRoom().getBuilding() != null && 
            entity.getRoom().getBuilding().getCampus() != null) {
            dto.setLocation(String.format("%s - %s - %s",
                entity.getRoom().getBuilding().getCampus().getCampusName(),
                entity.getRoom().getBuilding().getBuildingCode(),
                entity.getRoom().getRoomNumber()));
            dto.setCampus(entity.getRoom().getBuilding().getCampus().getCampusName());
            dto.setBuilding(entity.getRoom().getBuilding().getBuildingCode());
            dto.setRoomNumber(entity.getRoom().getRoomNumber());
        }
        
        dto.setPaperSizes(entity.getPaperSizes());
        dto.setColorPrinting(entity.getColorPrinting());
        dto.setDuplexPrinting(entity.getDuplexPrinting());
        dto.setStatus(entity.getStatus());
        dto.setTotalPagesPrinted(entity.getTotalPagesPrinted());
        dto.setLastMaintenanceDate(entity.getLastMaintenanceDate());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
    
    @Override
    @Transactional
    public PrinterResponseDTO createPrinter(PrinterRequestDTO request, String username) {
        // Validate references
        Brand brand = brandRepository.findById(request.getBrandId().intValue())
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy thương hiệu"));
            
        PrinterModel model = printerModelRepository.findById(request.getModelId().intValue())
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy model"));
            
        Room room = roomRepository.findById(request.getRoomId().intValue())
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phòng"));
        
        // Create new printer
        Printer printer = new Printer();
        printer.setPrinterName(request.getPrinterName());
        printer.setBrand(brand);
        printer.setModel(model);
        printer.setRoom(room);
        printer.setIpAddress(request.getIpAddress());
        printer.setPaperSizes(request.getPaperSizes() != null ? request.getPaperSizes() : "A4");
        printer.setColorPrinting(request.getColorPrinting() != null ? request.getColorPrinting() : false);
        printer.setDuplexPrinting(request.getDuplexPrinting() != null ? request.getDuplexPrinting() : true);
        printer.setStatus(request.getStatus() != null ? request.getStatus() : "Active");
        printer.setLastMaintenanceDate(request.getLastMaintenanceDate());
        printer.setCreatedBy(username);
        printer.setTotalPagesPrinted(0);
        
        Printer saved = printerRepository.save(printer);
        return toDto(saved);
    }
    
    @Override
    @Transactional
    public PrinterResponseDTO updatePrinter(Long printerId, PrinterRequestDTO request) {
        Printer printer = printerRepository.findById(printerId)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy máy in"));
        
        // Validate and update references if changed
        if (!printer.getBrand().getBrandId().equals(request.getBrandId().intValue())) {
            Brand brand = brandRepository.findById(request.getBrandId().intValue())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy thương hiệu"));
            printer.setBrand(brand);
        }
        
        if (!printer.getModel().getModelId().equals(request.getModelId().intValue())) {
            PrinterModel model = printerModelRepository.findById(request.getModelId().intValue())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy model"));
            printer.setModel(model);
        }
        
        if (!printer.getRoom().getRoomId().equals(request.getRoomId().intValue())) {
            Room room = roomRepository.findById(request.getRoomId().intValue())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phòng"));
            printer.setRoom(room);
        }
        
        // Update other fields
        printer.setPrinterName(request.getPrinterName());
        printer.setIpAddress(request.getIpAddress());
        printer.setPaperSizes(request.getPaperSizes());
        printer.setColorPrinting(request.getColorPrinting());
        printer.setDuplexPrinting(request.getDuplexPrinting());
        printer.setStatus(request.getStatus());
        printer.setLastMaintenanceDate(request.getLastMaintenanceDate());
        
        Printer updated = printerRepository.save(printer);
        return toDto(updated);
    }
    
    @Override
    @Transactional
    public PrinterResponseDTO togglePrinterStatus(Long printerId) {
        Printer printer = printerRepository.findById(printerId)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy máy in"));
        
        // Toggle between Active and Inactive
        if ("Active".equals(printer.getStatus())) {
            printer.setStatus("Inactive");
        } else {
            printer.setStatus("Active");
        }
        
        Printer updated = printerRepository.save(printer);
        return toDto(updated);
    }
    
    @Override
    @Transactional
    public void deletePrinter(Long printerId) {
        Printer printer = printerRepository.findById(printerId)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy máy in"));
        
        printerRepository.delete(printer);
    }
}
