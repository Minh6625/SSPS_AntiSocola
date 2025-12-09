package com.example.app.service.impl;

import com.example.app.dto.PrinterResponseDTO;
import com.example.app.entity.Printer;
import com.example.app.repository.PrinterRepository;
import com.example.app.service.interfaces.IPrinterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PrinterServiceImpl implements IPrinterService {

    @Autowired
    private PrinterRepository printerRepository;

    @Override
    public Page<PrinterResponseDTO> getPrinters(String campus,
                                               String building,
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

        if (StringUtils.hasText(campus)) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("campus")), campus.toLowerCase()));
        }

        if (StringUtils.hasText(building)) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("building")), building.toLowerCase()));
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

        if (StringUtils.hasText(keyword)) {
            String likeValue = "%" + keyword.toLowerCase().trim() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("printerName")), likeValue),
                    cb.like(cb.lower(root.get("location")), likeValue),
                    cb.like(cb.lower(root.get("roomNumber")), likeValue)
            ));
        }

        Page<Printer> result = printerRepository.findAll(spec, pageable);
        return result.map(this::toDto);
    }

    private PrinterResponseDTO toDto(Printer entity) {
        PrinterResponseDTO dto = new PrinterResponseDTO();
        dto.setPrinterId(entity.getPrinterId());
        dto.setPrinterName(entity.getPrinterName());
        dto.setBrand(entity.getBrand());
        dto.setModel(entity.getModel());
        dto.setLocation(entity.getLocation());
        dto.setCampus(entity.getCampus());
        dto.setBuilding(entity.getBuilding());
        dto.setRoomNumber(entity.getRoomNumber());
        dto.setPaperSizes(entity.getPaperSizes());
        dto.setColorPrinting(entity.getColorPrinting());
        dto.setDuplexPrinting(entity.getDuplexPrinting());
        dto.setStatus(entity.getStatus());
        dto.setTotalPagesPrinted(entity.getTotalPagesPrinted());
        dto.setLastMaintenanceDate(entity.getLastMaintenanceDate());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
