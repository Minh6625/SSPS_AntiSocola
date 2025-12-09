package com.example.app.controller;

import com.example.app.dto.PageBalanceResponseDTO;
import com.example.app.service.interfaces.IPageBalanceService;
import com.example.app.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

/**
 * CONTROLLER LAYER: Quản lý số dư trang in
 * Chỉ xử lý HTTP request/response, KHÔNG chứa Business Logic
 */
@RestController
@RequestMapping("/api/page-balance")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@Tag(name = "Page Balance", description = "API quản lý số dư trang in")
@Slf4j
public class PageBalanceController {
    
    @Autowired
    private IPageBalanceService pageBalanceService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * GET /api/page-balance
     * Lấy số dư trang của sinh viên hiện tại (từ JWT token)
     * 
     * Response: { pagesA4, pagesA3, totalA4Equivalent, lastUpdated }
     * 
     * Security: Lấy StudentID từ JWT token (không từ request param)
     */
    @GetMapping(value = {"", "/"})
    @Operation(
        summary = "Lấy số dư trang",
        description = "Lấy số dư trang A4, A3 và tổng quy đổi A4 của sinh viên hiện tại"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy số dư thành công"),
        @ApiResponse(responseCode = "401", description = "Token không hợp lệ hoặc hết hạn"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy số dư trang")
    })
    public ResponseEntity<PageBalanceResponseDTO> getPageBalance(HttpServletRequest request) {
        log.info("=== PageBalance Request Started ===");
        try {
            // Lấy token từ header Authorization
            String token = extractTokenFromRequest(request);
            log.info("Token extracted: {}", token != null ? "YES" : "NO");
            
            if (token == null || token.isEmpty()) {
                log.warn("No token provided in request");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Validate token
            try {
                if (jwtUtil.isTokenExpired(token)) {
                    log.warn("Token expired");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
            } catch (Exception e) {
                log.warn("Invalid token: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Lấy StudentID từ token (Bảo mật: không từ request param)
            String studentId = jwtUtil.extractUserId(token);
            log.info("StudentID extracted: {}", studentId);
            
            if (studentId == null || studentId.isEmpty()) {
                log.warn("StudentID not found in token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            log.info("Fetching page balance for student: {}", studentId);
            
            // Gọi Service
            PageBalanceResponseDTO response = pageBalanceService.getPageBalance(studentId);
            
            log.info("Page balance fetched successfully for student: {}", studentId);
            log.info("=== PageBalance Request Completed ===");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("=== ERROR in PageBalance Request ===", e);
            log.error("Error message: {}", e.getMessage());
            log.error("Error type: {}", e.getClass().getName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Extract JWT token từ Authorization header
     * Format: "Bearer <token>"
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        log.debug("Authorization header: {}", authHeader);
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Bỏ "Bearer "
            log.debug("Extracted token: {}", token.substring(0, Math.min(50, token.length())) + "...");
            return token;
        }
        
        log.warn("No valid Authorization header found");
        return null;
    }
}
