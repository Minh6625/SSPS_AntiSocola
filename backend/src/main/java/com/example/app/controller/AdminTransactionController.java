package com.example.app.controller;

import com.example.app.dto.AdminTransactionDTO;
import com.example.app.dto.AdminTransactionResponseDTO;
import com.example.app.service.interfaces.IAdminTransactionService;
import com.example.app.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

/**
 * CONTROLLER: Quản lý giao dịch cho SPSO
 * Endpoint: /api/admin/transactions
 */
@RestController
@RequestMapping("/api/admin/transactions")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@Tag(name = "Admin Transactions", description = "API quản lý giao dịch cho SPSO")
@Slf4j
public class AdminTransactionController {
    
    @Autowired
    private IAdminTransactionService adminTransactionService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * GET /api/admin/transactions
     * Lấy danh sách tất cả giao dịch với filter và pagination
     */
    @GetMapping(value = {"", "/"})
    @Operation(
        summary = "Lấy danh sách giao dịch",
        description = "Lấy danh sách tất cả giao dịch với tìm kiếm, lọc và phân trang"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
        @ApiResponse(responseCode = "401", description = "Không có quyền truy cập"),
        @ApiResponse(responseCode = "403", description = "Không phải SPSO")
    })
    public ResponseEntity<AdminTransactionResponseDTO> getAllTransactions(
            HttpServletRequest request,
            @Parameter(description = "Số trang (0-indexed)") @RequestParam(defaultValue = "0") Integer page,
            @Parameter(description = "Số item mỗi trang") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "Từ khóa tìm kiếm (mã GD, mã SV, tên SV)") @RequestParam(required = false) String keyword,
            @Parameter(description = "Loại giao dịch (Allocate, Purchase, Use)") @RequestParam(required = false) String type,
            @Parameter(description = "Ngày bắt đầu (yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "Ngày kết thúc (yyyy-MM-dd)") @RequestParam(required = false) String endDate
    ) {
        log.info("=== Admin Get All Transactions Request ===");
        try {
            // Validate SPSO role
            if (!validateSPSORole(request)) {
                log.warn("Unauthorized access attempt");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            AdminTransactionResponseDTO response = adminTransactionService.getAllTransactions(
                page, size, keyword, type, startDate, endDate
            );
            
            log.info("Fetched {} transactions", response.getTotalElements());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching transactions: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/admin/transactions/{id}
     * Lấy chi tiết một giao dịch
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Lấy chi tiết giao dịch",
        description = "Lấy thông tin chi tiết của một giao dịch theo ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy chi tiết thành công"),
        @ApiResponse(responseCode = "401", description = "Không có quyền truy cập"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy giao dịch")
    })
    public ResponseEntity<AdminTransactionDTO> getTransactionById(
            HttpServletRequest request,
            @Parameter(description = "ID giao dịch") @PathVariable Integer id
    ) {
        log.info("=== Admin Get Transaction By ID: {} ===", id);
        try {
            // Validate SPSO role
            if (!validateSPSORole(request)) {
                log.warn("Unauthorized access attempt");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            AdminTransactionDTO response = adminTransactionService.getTransactionById(id);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching transaction {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * GET /api/admin/transactions/stats
     * Lấy thống kê giao dịch
     */
    @GetMapping("/stats")
    @Operation(
        summary = "Lấy thống kê giao dịch",
        description = "Lấy thống kê tổng quan về các loại giao dịch"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy thống kê thành công"),
        @ApiResponse(responseCode = "401", description = "Không có quyền truy cập")
    })
    public ResponseEntity<AdminTransactionResponseDTO> getTransactionStats(HttpServletRequest request) {
        log.info("=== Admin Get Transaction Stats ===");
        try {
            // Validate SPSO role
            if (!validateSPSORole(request)) {
                log.warn("Unauthorized access attempt");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            AdminTransactionResponseDTO response = adminTransactionService.getTransactionStats();
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching transaction stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Validate SPSO role từ JWT token
     */
    private boolean validateSPSORole(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return false;
            }
            
            String token = authHeader.substring(7);
            if (jwtUtil.isTokenExpired(token)) {
                return false;
            }
            
            String role = jwtUtil.extractRole(token);
            return "SPSO".equalsIgnoreCase(role);
            
        } catch (Exception e) {
            log.error("Error validating SPSO role: {}", e.getMessage());
            return false;
        }
    }
}
