package com.example.app.controller;

import com.example.app.dto.PrinterRefillRequestDTO;
import com.example.app.dto.PrinterRequestDTO;
import com.example.app.dto.PrinterResponseDTO;
import com.example.app.service.interfaces.IPrinterService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/printers")
public class PrinterController {

    private final IPrinterService printerService;

    public PrinterController(IPrinterService printerService) {
        this.printerService = printerService;
    }

    /**
     * GET /api/printers
     * Lấy danh sách máy in với filter và pagination
     * Filters: campus, building, room, brand, model, status, colorPrinting, duplexPrinting, keyword
     * Pagination: page, size, sortBy, sortDir
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getPrinters(
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) String room,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String lastMaintenanceDate,
            @RequestParam(required = false) Boolean colorPrinting,
            @RequestParam(required = false) Boolean duplexPrinting,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "printerName") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Page<PrinterResponseDTO> printersPage = printerService.getPrinters(
            campus,
            building,
            room,
            brand,
            model,
            status,
            colorPrinting,
            duplexPrinting,
            keyword,
            lastMaintenanceDate,
            page,
            size,
            sortBy,
            sortDir
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách máy in thành công");

        Map<String, Object> data = new HashMap<>();
        data.put("content", printersPage.getContent());
        data.put("totalElements", printersPage.getTotalElements());
        data.put("totalPages", printersPage.getTotalPages());
        data.put("currentPage", printersPage.getNumber());
        data.put("pageSize", printersPage.getSize());
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/printers/{id}
     * Lấy thông tin máy in chi tiết
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPrinterById(@PathVariable String id) {
        PrinterResponseDTO printer = printerService.getPrinterById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thông tin máy in thành công");
        response.put("data", printer);

        return ResponseEntity.ok(response);
    }
    
    /**
     * POST /api/printers
     * Thêm máy in mới (SPSO only)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('SPSO')")
    public ResponseEntity<Map<String, Object>> createPrinter(
            @Valid @RequestBody PrinterRequestDTO request,
            Authentication authentication) {
        String username = authentication.getName();
        PrinterResponseDTO printer = printerService.createPrinter(request, username);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Thêm máy in thành công");
        response.put("data", printer);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * PUT /api/printers/{id}
     * Cập nhật máy in (SPSO only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SPSO')")
    public ResponseEntity<Map<String, Object>> updatePrinter(
            @PathVariable Long id,
            @Valid @RequestBody PrinterRequestDTO request) {
        PrinterResponseDTO printer = printerService.updatePrinter(id, request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật máy in thành công");
        response.put("data", printer);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * PATCH /api/printers/{id}/toggle
     * Bật/Tắt máy in (SPSO only)
     */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('SPSO')")
    public ResponseEntity<Map<String, Object>> togglePrinterStatus(@PathVariable Long id) {
        PrinterResponseDTO printer = printerService.togglePrinterStatus(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Thay đổi trạng thái máy in thành công");
        response.put("data", printer);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * DELETE /api/printers/{id}
     * Xóa máy in (SPSO only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SPSO')")
    public ResponseEntity<Map<String, Object>> deletePrinter(@PathVariable Long id) {
        printerService.deletePrinter(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa máy in thành công");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * POST /api/printers/{id}/refill
     * Nạp giấy/mực cho máy in (SPSO only)
     */
    @PostMapping("/{id}/refill")
    @PreAuthorize("hasAuthority('SPSO')")
    public ResponseEntity<Map<String, Object>> refillSupplies(
            @PathVariable Long id,
            @Valid @RequestBody PrinterRefillRequestDTO request) {
        PrinterResponseDTO printer = printerService.refillSupplies(id, request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Nạp giấy/mực thành công");
        response.put("data", printer);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/printers/{id}/supplies
     * Lấy thông tin giấy/mực của máy in
     */
    @GetMapping("/{id}/supplies")
    public ResponseEntity<Map<String, Object>> getPrinterSupplies(@PathVariable Long id) {
        PrinterResponseDTO printer = printerService.getPrinterById(String.valueOf(id));
        
        Map<String, Object> supplies = new HashMap<>();
        supplies.put("a4PaperRemaining", printer.getA4PaperRemaining());
        supplies.put("a3PaperRemaining", printer.getA3PaperRemaining());
        supplies.put("a4PaperCapacity", printer.getA4PaperCapacity());
        supplies.put("a3PaperCapacity", printer.getA3PaperCapacity());
        supplies.put("tonerBlackRemaining", printer.getTonerBlackRemaining());
        supplies.put("tonerCyanRemaining", printer.getTonerCyanRemaining());
        supplies.put("tonerMagentaRemaining", printer.getTonerMagentaRemaining());
        supplies.put("tonerYellowRemaining", printer.getTonerYellowRemaining());
        supplies.put("tonerLastReplaced", printer.getTonerLastReplaced());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thông tin giấy/mực thành công");
        response.put("data", supplies);
        
        return ResponseEntity.ok(response);
    }
}
