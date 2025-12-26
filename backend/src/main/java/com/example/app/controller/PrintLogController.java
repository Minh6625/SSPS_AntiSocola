package com.example.app.controller;

import com.example.app.dto.PrintLogDTO;
import com.example.app.dto.PrintLogFilterDTO;
import com.example.app.dto.PrintLogStatsDTO;
import com.example.app.service.ExcelExportService;
import com.example.app.service.PrintLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/print-logs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Print Logs Management", description = "API quản lý nhật ký in - SPSO xem và theo dõi tất cả hoạt động in ấn")
public class PrintLogController {
    
    private final PrintLogService printLogService;
    private final ExcelExportService excelExportService;
    
    @Operation(
        summary = "Lấy danh sách nhật ký in",
        description = "SPSO xem danh sách tất cả lệnh in trong hệ thống với các bộ lọc và phân trang"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
        @ApiResponse(responseCode = "400", description = "Tham số không hợp lệ"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @GetMapping
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<Page<PrintLogDTO>> getPrintLogs(
        @Parameter(description = "Tìm kiếm sinh viên (MSSV, tên, hoặc email)")
        @RequestParam(required = false) String studentSearch,
        
        @Parameter(description = "ID máy in")
        @RequestParam(required = false) String printerId,
        
        @Parameter(description = "Trạng thái (Pending, Printing, Completed, Failed, Cancelled)")
        @RequestParam(required = false) String status,
        
        @Parameter(description = "Ngày bắt đầu (yyyy-MM-dd HH:mm:ss)")
        @RequestParam(required = false) 
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
        
        @Parameter(description = "Ngày kết thúc (yyyy-MM-dd HH:mm:ss)")
        @RequestParam(required = false)
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate,
        
        @Parameter(description = "Tên tài liệu (tìm kiếm)")
        @RequestParam(required = false) String documentName,
        
        @Parameter(description = "Số trang (0-based)")
        @RequestParam(defaultValue = "0") Integer page,
        
        @Parameter(description = "Kích thước trang (1-100)")
        @RequestParam(defaultValue = "20") Integer size,
        
        @Parameter(description = "Sắp xếp theo (printTime, studentName, pagesPrinted, status)")
        @RequestParam(defaultValue = "printTime") String sortBy,
        
        @Parameter(description = "Thứ tự sắp xếp (ASC, DESC)")
        @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        try {
            // Sanitize empty strings to null
            studentSearch = (studentSearch != null && studentSearch.trim().isEmpty()) ? null : studentSearch;
            printerId = (printerId != null && printerId.trim().isEmpty()) ? null : printerId;
            status = (status != null && status.trim().isEmpty()) ? null : status;
            documentName = (documentName != null && documentName.trim().isEmpty()) ? null : documentName;
            
            PrintLogFilterDTO filter = new PrintLogFilterDTO(
                studentSearch, printerId, status, startDate, endDate, 
                documentName, page, size, sortBy, sortDirection
            );
            
            Page<PrintLogDTO> result = printLogService.getPrintLogs(filter);
            
            log.info("Retrieved {} print logs for page {}", result.getContent().size(), page);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid filter parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting print logs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(
        summary = "Lấy chi tiết nhật ký in",
        description = "SPSO xem chi tiết đầy đủ của một lệnh in để troubleshoot và hỗ trợ sinh viên"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy chi tiết thành công"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy nhật ký in"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @GetMapping("/{logId}")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<PrintLogDTO> getPrintLogById(
        @Parameter(description = "ID của nhật ký in")
        @PathVariable Integer logId
    ) {
        try {
            return printLogService.getPrintLogById(logId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            log.error("Error getting print log detail for ID: {}", logId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(
        summary = "Đếm số lượng nhật ký in",
        description = "Đếm số lượng logs với bộ lọc (dùng để kiểm tra trước khi export)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Đếm thành công"),
        @ApiResponse(responseCode = "400", description = "Tham số không hợp lệ")
    })
    @GetMapping("/count")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> countPrintLogs(
        @RequestParam(required = false) String studentSearch,
        @RequestParam(required = false) String printerId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) 
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
        @RequestParam(required = false)
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate,
        @RequestParam(required = false) String documentName
    ) {
        try {
            PrintLogFilterDTO filter = new PrintLogFilterDTO(
                studentSearch, printerId, status, startDate, endDate, 
                documentName, 0, 20, "printTime", "DESC"
            );
            
            Long count = printLogService.countLogsWithFilter(filter);
            return ResponseEntity.ok(Map.of("count", count));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid filter parameters for count: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error counting print logs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(
        summary = "Lấy thống kê nhật ký in",
        description = "Lấy thống kê tổng hợp về logs (tổng số, tỷ lệ thành công, số trang...)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy thống kê thành công"),
        @ApiResponse(responseCode = "400", description = "Tham số không hợp lệ")
    })
    @GetMapping("/stats")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<PrintLogStatsDTO> getPrintLogStats(
        @RequestParam(required = false) String studentSearch,
        @RequestParam(required = false) String printerId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) 
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
        @RequestParam(required = false)
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate,
        @RequestParam(required = false) String documentName
    ) {
        try {
            // Sanitize empty strings to null
            studentSearch = (studentSearch != null && studentSearch.trim().isEmpty()) ? null : studentSearch;
            printerId = (printerId != null && printerId.trim().isEmpty()) ? null : printerId;
            status = (status != null && status.trim().isEmpty()) ? null : status;
            documentName = (documentName != null && documentName.trim().isEmpty()) ? null : documentName;
            
            PrintLogFilterDTO filter = new PrintLogFilterDTO(
                studentSearch, printerId, status, startDate, endDate, 
                documentName, 0, 20, "printTime", "DESC"
            );
            
            PrintLogStatsDTO stats = printLogService.getPrintLogStats(filter);
            return ResponseEntity.ok(stats);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid filter parameters for stats: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting print log stats", e);
            // Return empty stats instead of error
            return ResponseEntity.ok(new PrintLogStatsDTO(0L, 0L, 0L, 0L, 0L, 0L, 0, 0, 0));
        }
    }
    
    @Operation(
        summary = "Xuất nhật ký in ra Excel",
        description = "SPSO xuất danh sách logs ra file Excel để lưu trữ và phân tích offline. Giới hạn tối đa 10,000 records."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Xuất file thành công", 
                    content = @Content(mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")),
        @ApiResponse(responseCode = "400", description = "Quá nhiều dữ liệu hoặc tham số không hợp lệ"),
        @ApiResponse(responseCode = "500", description = "Lỗi tạo file Excel")
    })
    @PostMapping("/export")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportPrintLogsToExcel(
        @RequestParam(required = false) String studentSearch,
        @RequestParam(required = false) String printerId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) 
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startDate,
        @RequestParam(required = false)
        @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endDate,
        @RequestParam(required = false) String documentName
    ) {
        try {
            PrintLogFilterDTO filter = new PrintLogFilterDTO(
                studentSearch, printerId, status, startDate, endDate, 
                documentName, 0, 20, "printTime", "DESC"
            );
            
            // Lấy dữ liệu và thống kê
            List<PrintLogDTO> logs = printLogService.getLogsForExport(filter);
            PrintLogStatsDTO stats = printLogService.getPrintLogStats(filter);
            
            // Tạo file Excel
            byte[] excelData = excelExportService.exportPrintLogsToExcel(logs, stats);
            
            // Tạo filename với timestamp
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
            String filename = "print-logs-" + timestamp + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            log.info("Exported {} print logs to Excel file: {}", logs.size(), filename);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(excelData);
                
        } catch (IllegalArgumentException e) {
            log.warn("Export failed - invalid parameters: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            log.error("Error creating Excel file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Error exporting print logs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(
        summary = "Lấy danh sách trạng thái",
        description = "Lấy danh sách các trạng thái có thể có của print log"
    )
    @GetMapping("/statuses")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, String>>> getPrintLogStatuses() {
        List<Map<String, String>> statuses = List.of(
            Map.of("value", "Pending", "label", "Đang chờ xử lý", "color", "warning"),
            Map.of("value", "Printing", "label", "Đang in", "color", "info"),
            Map.of("value", "Success", "label", "Hoàn thành", "color", "success"),
            Map.of("value", "Failed", "label", "Thất bại", "color", "danger"),
            Map.of("value", "Cancelled", "label", "Đã hủy", "color", "secondary")
        );
        
        return ResponseEntity.ok(statuses);
    }
}