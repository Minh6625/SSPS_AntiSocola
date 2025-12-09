package com.example.app.controller;

import com.example.app.dto.PrinterResponseDTO;
import com.example.app.service.interfaces.IPrinterService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/printers")
public class PrinterController {

    private final IPrinterService printerService;

    public PrinterController(IPrinterService printerService) {
        this.printerService = printerService;
    }

    /**
     * GET /api/printers
     * Optional filters: campus, building, status, colorPrinting, duplexPrinting, keyword
     * Pagination: page, size, sortBy, sortDir
     */
    @GetMapping
    public ResponseEntity<Page<PrinterResponseDTO>> getPrinters(
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean colorPrinting,
            @RequestParam(required = false) Boolean duplexPrinting,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "printerName") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Page<PrinterResponseDTO> result = printerService.getPrinters(
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
        return ResponseEntity.ok(result);
    }
}
