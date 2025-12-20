package com.example.app.controller;

import com.example.app.dto.*;
import com.example.app.service.interfaces.IStudentService;
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
 * CONTROLLER LAYER - Student Management (SPSO only)
 * Xử lý HTTP request/response, KHÔNG chứa Business Logic
 * Chỉ SPSO role mới có quyền truy cập
 */
@RestController
@RequestMapping("/api/spso/students")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Student Management", description = "API quản lý sinh viên (SPSO only)")
@PreAuthorize("hasRole('SPSO')")
public class StudentManagementController {
    
    private final IStudentService studentService;
    
    /**
     * GET /api/spso/students - Lấy danh sách sinh viên
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách sinh viên", description = "Lấy danh sách sinh viên với filter, phân trang")
    public ResponseEntity<Page<StudentListDTO>> getStudentList(
            @Parameter(description = "Từ khóa tìm kiếm (MSSV, email, tên)")
            @RequestParam(required = false) String keyword,
            
            @Parameter(description = "Trạng thái (Active, Inactive, Suspended)")
            @RequestParam(required = false) String status,
            
            @Parameter(description = "Trang (bắt đầu từ 1)")
            @RequestParam(defaultValue = "1") Integer pageNumber,
            
            @Parameter(description = "Số bản ghi/trang")
            @RequestParam(defaultValue = "20") Integer pageSize,
            
            @Parameter(description = "Sắp xếp theo (studentId, fullName, lastLogin)")
            @RequestParam(defaultValue = "studentId") String sortBy,
            
            @Parameter(description = "Hướng sắp xếp (ASC, DESC)")
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        log.info("SPSO requesting student list: keyword={}, status={}, page={}", 
                 keyword, status, pageNumber);
        
        StudentFilterDTO filter = new StudentFilterDTO(
            keyword, status, pageNumber, pageSize, sortBy, sortDirection
        );
        
        Page<StudentListDTO> result = studentService.getStudentList(filter);
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/spso/students/{studentId} - Lấy chi tiết sinh viên
     */
    @GetMapping("/{studentId}")
    @Operation(summary = "Lấy chi tiết sinh viên", description = "Lấy thông tin chi tiết sinh viên kèm số dư trang và thống kê")
    public ResponseEntity<StudentDetailDTO> getStudentDetail(
            @Parameter(description = "MSSV")
            @PathVariable String studentId) {
        
        log.info("SPSO requesting student detail: {}", studentId);
        
        StudentDetailDTO result = studentService.getStudentDetail(studentId);
        return ResponseEntity.ok(result);
    }
    
    /**
     * POST /api/spso/students/allocate-pages - Cấp trang miễn phí
     */
    @PostMapping("/allocate-pages")
    @Operation(summary = "Cấp trang miễn phí", description = "Cấp trang A4/A3 miễn phí cho sinh viên")
    public ResponseEntity<AllocatePageResponseDTO> allocatePages(
            @Valid @RequestBody AllocatePageRequestDTO request) {
        
        log.info("SPSO allocating pages to student: {}, A4={}, A3={}", 
                 request.getStudentId(), request.getA4Pages(), request.getA3Pages());
        
        AllocatePageResponseDTO result = studentService.allocatePages(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * PUT /api/spso/students/status - Cập nhật trạng thái sinh viên
     */
    @PutMapping("/status")
    @Operation(summary = "Cập nhật trạng thái sinh viên", description = "Cập nhật trạng thái (Active/Inactive/Suspended)")
    public ResponseEntity<UpdateStatusResponseDTO> updateStudentStatus(
            @Valid @RequestBody UpdateStudentStatusRequestDTO request) {
        
        log.info("SPSO updating student status: {}, status={}", request.getStudentId(), request.getStatus());
        
        UpdateStatusResponseDTO result = studentService.updateStudentStatus(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/spso/students/{studentId}/print-history - Lấy lịch sử in
     */
    @GetMapping("/{studentId}/print-history")
    @Operation(summary = "Lấy lịch sử in của sinh viên", description = "Lấy danh sách lịch sử in của sinh viên")
    public ResponseEntity<Page<PrintLogDTO>> getStudentPrintHistory(
            @Parameter(description = "MSSV")
            @PathVariable String studentId,
            
            @Parameter(description = "Trang (bắt đầu từ 1)")
            @RequestParam(defaultValue = "1") Integer pageNumber,
            
            @Parameter(description = "Số bản ghi/trang")
            @RequestParam(defaultValue = "20") Integer pageSize) {
        
        log.info("SPSO requesting print history for student: {}, page={}", studentId, pageNumber);
        
        Page<PrintLogDTO> result = studentService.getStudentPrintHistory(studentId, pageNumber, pageSize);
        return ResponseEntity.ok(result);
    }
    
    /**
     * DELETE /api/spso/students/{studentId} - Xóa sinh viên (Soft delete)
     */
    @DeleteMapping("/{studentId}")
    @Operation(summary = "Xóa sinh viên", description = "Xóa sinh viên (soft delete - chỉ đổi status)")
    public ResponseEntity<Void> deleteStudent(
            @Parameter(description = "MSSV")
            @PathVariable String studentId) {
        
        log.info("SPSO deleting student: {}", studentId);
        
        studentService.deleteStudent(studentId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
