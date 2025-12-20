package com.example.app.controller;

import com.example.app.dto.*;
import com.example.app.service.interfaces.IAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * CONTROLLER LAYER - Account Management (SPSO only)
 * Quản lý tất cả tài khoản (Student, SPSO, Admin)
 * Chỉ SPSO role mới có quyền truy cập
 */
@RestController
@RequestMapping("/api/spso/accounts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Account Management", description = "API quản lý tài khoản (SPSO only)")
@PreAuthorize("hasRole('SPSO')")
public class AccountManagementController {
    
    private final IAccountService accountService;
    
    /**
     * GET /api/spso/accounts - Lấy danh sách tài khoản
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách tài khoản", description = "Lấy danh sách tất cả tài khoản với filter, phân trang")
    public ResponseEntity<Page<AccountListDTO>> getAccountList(
            @Parameter(description = "Từ khóa tìm kiếm (ID, email, tên)")
            @RequestParam(required = false) String keyword,
            
            @Parameter(description = "Loại tài khoản (Student, SPSO, Admin)")
            @RequestParam(required = false) String userType,
            
            @Parameter(description = "Trạng thái (Active, Inactive, Suspended)")
            @RequestParam(required = false) String status,
            
            @Parameter(description = "Trang (bắt đầu từ 1)")
            @RequestParam(defaultValue = "1") Integer pageNumber,
            
            @Parameter(description = "Số bản ghi/trang")
            @RequestParam(defaultValue = "20") Integer pageSize,
            
            @Parameter(description = "Sắp xếp theo (userId, fullName, lastLogin, createdAt)")
            @RequestParam(defaultValue = "userId") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (ASC, DESC)")
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        log.info("SPSO requesting account list: keyword={}, userType={}, status={}, page={}", 
                 keyword, userType, status, pageNumber);
        
        AccountFilterDTO filter = new AccountFilterDTO(
            keyword, userType, status, pageNumber, pageSize, sortBy, sortDirection
        );
        
        Page<AccountListDTO> result = accountService.getAccountList(filter);
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/spso/accounts/{userId} - Lấy chi tiết tài khoản
     */
    @GetMapping("/{userId}")
    @Operation(summary = "Lấy chi tiết tài khoản", description = "Lấy thông tin chi tiết tài khoản")
    public ResponseEntity<AccountDetailDTO> getAccountDetail(
            @Parameter(description = "User ID")
            @PathVariable String userId) {
        
        log.info("SPSO requesting account detail: {}", userId);
        
        AccountDetailDTO result = accountService.getAccountDetail(userId);
        return ResponseEntity.ok(result);
    }
    
    /**
     * PUT /api/spso/accounts/status - Cập nhật trạng thái tài khoản
     */
    @PutMapping("/status")
    @Operation(summary = "Cập nhật trạng thái tài khoản", description = "Cập nhật trạng thái (Active/Inactive/Suspended)")
    public ResponseEntity<UpdateStatusResponseDTO> updateAccountStatus(
            @Valid @RequestBody UpdateAccountStatusRequestDTO request) {
        
        log.info("SPSO updating account status: {}, status={}", request.getUserId(), request.getStatus());
        
        UpdateStatusResponseDTO result = accountService.updateAccountStatus(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * PUT /api/spso/accounts/role - Đổi role cho tài khoản
     */
    @PutMapping("/role")
    @Operation(summary = "Đổi role tài khoản", description = "Đổi role (Student/SPSO/Admin)")
    public ResponseEntity<UpdateAccountRoleResponseDTO> updateAccountRole(
            @Valid @RequestBody UpdateAccountRoleRequestDTO request) {
        
        log.info("SPSO updating account role: {}, newRole={}", request.getUserId(), request.getNewRole());
        
        UpdateAccountRoleResponseDTO result = accountService.updateAccountRole(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * POST /api/spso/accounts/allocate-pages - Cấp trang miễn phí (chỉ cho Student)
     */
    @PostMapping("/allocate-pages")
    @Operation(summary = "Cấp trang miễn phí", description = "Cấp trang A4/A3 miễn phí cho sinh viên")
    public ResponseEntity<AllocatePageResponseDTO> allocatePages(
            @Valid @RequestBody AllocatePageRequestDTO request) {
        
        log.info("SPSO allocating pages: userId={}, A4={}, A3={}", 
                 request.getStudentId(), request.getA4Pages(), request.getA3Pages());
        
        AllocatePageResponseDTO result = accountService.allocatePages(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/spso/accounts/{userId}/print-history - Lấy lịch sử in (chỉ cho Student)
     */
    @GetMapping("/{userId}/print-history")
    @Operation(summary = "Lấy lịch sử in", description = "Lấy danh sách lịch sử in của sinh viên")
    public ResponseEntity<Page<PrintLogDTO>> getAccountPrintHistory(
            @Parameter(description = "User ID")
            @PathVariable String userId,
            
            @Parameter(description = "Trang (bắt đầu từ 1)")
            @RequestParam(defaultValue = "1") Integer pageNumber,
            
            @Parameter(description = "Số bản ghi/trang")
            @RequestParam(defaultValue = "20") Integer pageSize) {
        
        log.info("SPSO requesting print history: userId={}, page={}", userId, pageNumber);
        
        Page<PrintLogDTO> result = accountService.getAccountPrintHistory(userId, pageNumber, pageSize);
        return ResponseEntity.ok(result);
    }
    
    /**
     * DELETE /api/spso/accounts/{userId} - Xóa tài khoản (Soft delete)
     */
    @DeleteMapping("/{userId}")
    @Operation(summary = "Xóa tài khoản", description = "Xóa tài khoản (soft delete - chỉ đổi status)")
    public ResponseEntity<Void> deleteAccount(
            @Parameter(description = "User ID")
            @PathVariable String userId) {
        
        log.info("SPSO deleting account: {}", userId);
        
        accountService.deleteAccount(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
