package com.example.app.controller;

import com.example.app.dto.PrintJobResponseDTO;
import com.example.app.dto.PrintJobSubmitRequestDTO;
import com.example.app.service.interfaces.IPrintJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST CONTROLLER: PrintJob
 * API endpoints for print job management
 */
@RestController
@RequestMapping("/api/print-jobs")
@RequiredArgsConstructor
@Tag(name = "Print Jobs", description = "API quản lý lệnh in")
public class PrintJobController {
    
    private final IPrintJobService printJobService;
    
    /**
     * POST /api/print-jobs
     * Gửi lệnh in mới
     */
    @PostMapping
    @Operation(summary = "Gửi lệnh in", description = "Sinh viên gửi lệnh in tài liệu")
    public ResponseEntity<Map<String, Object>> submitPrintJob(
            @Valid @RequestBody PrintJobSubmitRequestDTO request,
            Authentication authentication) {
        
        String studentId = authentication.getName();
        
        PrintJobResponseDTO response = printJobService.submitPrintJob(studentId, request);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Gửi lệnh in thành công");
        result.put("data", response);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
    
    /**
     * GET /api/print-jobs
     * Lấy danh sách print jobs của student
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách lệnh in", description = "Xem tất cả lệnh in của sinh viên")
    public ResponseEntity<List<PrintJobResponseDTO>> getMyPrintJobs(Authentication authentication) {
        String studentId = authentication.getName();
        List<PrintJobResponseDTO> jobs = printJobService.getStudentPrintJobs(studentId);
        return ResponseEntity.ok(jobs);
    }
    
    /**
     * GET /api/print-jobs/recent
     * Lấy recent jobs (5 jobs gần nhất)
     */
    @GetMapping("/recent")
    @Operation(summary = "Lấy lệnh in gần đây", description = "Lấy 5 lệnh in gần nhất")
    public ResponseEntity<List<PrintJobResponseDTO>> getRecentJobs(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication) {
        
        String studentId = authentication.getName();
        List<PrintJobResponseDTO> jobs = printJobService.getRecentJobs(studentId, limit);
        return ResponseEntity.ok(jobs);
    }
    
    /**
     * GET /api/print-jobs/{id}
     * Lấy chi tiết print job
     */
    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết lệnh in", description = "Lấy thông tin chi tiết một lệnh in")
    public ResponseEntity<PrintJobResponseDTO> getPrintJobById(
            @PathVariable Integer id,
            Authentication authentication) {
        
        String studentId = authentication.getName();
        PrintJobResponseDTO job = printJobService.getPrintJobById(id, studentId);
        return ResponseEntity.ok(job);
    }
    
    /**
     * DELETE /api/print-jobs/{id}
     * Hủy print job
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Hủy lệnh in", description = "Hủy lệnh in đang chờ (Pending)")
    public ResponseEntity<Map<String, Object>> cancelPrintJob(
            @PathVariable Integer id,
            Authentication authentication) {
        
        String studentId = authentication.getName();
        printJobService.cancelPrintJob(id, studentId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Đã hủy lệnh in");
        
        return ResponseEntity.ok(result);
    }
}
