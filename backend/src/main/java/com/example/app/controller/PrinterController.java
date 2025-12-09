package com.example.app.controller;

import com.example.app.dto.PrinterResponseDTO;
import com.example.app.service.interfaces.IPrinterService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
     * Filters: campus, building, status, colorPrinting, duplexPrinting, keyword
     * Pagination: page, size, sortBy, sortDir
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getPrinters(
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) String status,
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
                status,
                colorPrinting,
                duplexPrinting,
                keyword,
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
}
