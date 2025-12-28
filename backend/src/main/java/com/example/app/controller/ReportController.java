package com.example.app.controller;

import com.example.app.dto.MonthlyReportDTO;
import com.example.app.dto.YearlyReportDTO;
import com.example.app.service.ReportService;
import com.example.app.service.ReportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "API báo cáo cho SPSO")
public class ReportController {
    
    private final ReportService reportService;
    private final ReportExportService reportExportService;
    
    @Operation(
        summary = "Lấy báo cáo theo tháng",
        description = "Lấy báo cáo chi tiết theo tháng và năm"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy báo cáo thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @GetMapping("/monthly")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<MonthlyReportDTO> getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month
    ) {
        log.info("Getting monthly report for {}/{}", month, year);
        MonthlyReportDTO report = reportService.getMonthlyReport(year, month);
        return ResponseEntity.ok(report);
    }
    
    @Operation(
        summary = "Lấy báo cáo theo năm",
        description = "Lấy báo cáo tổng hợp theo năm"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy báo cáo thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @GetMapping("/yearly")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<YearlyReportDTO> getYearlyReport(@RequestParam int year) {
        log.info("Getting yearly report for {}", year);
        YearlyReportDTO report = reportService.getYearlyReport(year);
        return ResponseEntity.ok(report);
    }
    
    @Operation(
        summary = "Tạo báo cáo tháng mới",
        description = "Tạo và lưu báo cáo tháng vào database"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tạo báo cáo thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @PostMapping("/monthly/generate")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<MonthlyReportDTO> generateMonthlyReport(
            @RequestParam int year,
            @RequestParam int month
    ) {
        log.info("Generating monthly report for {}/{}", month, year);
        MonthlyReportDTO report = reportService.generateAndSaveMonthlyReport(year, month);
        return ResponseEntity.ok(report);
    }
    
    @Operation(
        summary = "Xuất báo cáo tháng ra PDF",
        description = "Tải báo cáo tháng dưới dạng file PDF"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Xuất PDF thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @GetMapping("/monthly/export/pdf")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportMonthlyReportToPDF(
            @RequestParam int year,
            @RequestParam int month
    ) {
        log.info("Exporting monthly report to PDF for {}/{}", month, year);
        try {
            MonthlyReportDTO report = reportService.getMonthlyReport(year, month);
            byte[] pdfBytes = reportExportService.exportMonthlyReportToPDF(report);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                String.format("BaoCaoThang_%d_%d.pdf", month, year));
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
        } catch (IOException e) {
            log.error("Error exporting monthly report to PDF", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @Operation(
        summary = "Xuất báo cáo tháng ra Excel",
        description = "Tải báo cáo tháng dưới dạng file Excel"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Xuất Excel thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @GetMapping("/monthly/export/excel")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportMonthlyReportToExcel(
            @RequestParam int year,
            @RequestParam int month
    ) {
        log.info("Exporting monthly report to Excel for {}/{}", month, year);
        try {
            MonthlyReportDTO report = reportService.getMonthlyReport(year, month);
            byte[] excelBytes = reportExportService.exportMonthlyReportToExcel(report);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", 
                String.format("BaoCaoThang_%d_%d.xlsx", month, year));
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
        } catch (IOException e) {
            log.error("Error exporting monthly report to Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @Operation(
        summary = "Xuất báo cáo năm ra PDF",
        description = "Tải báo cáo năm dưới dạng file PDF"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Xuất PDF thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @GetMapping("/yearly/export/pdf")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportYearlyReportToPDF(@RequestParam int year) {
        log.info("Exporting yearly report to PDF for {}", year);
        try {
            YearlyReportDTO report = reportService.getYearlyReport(year);
            byte[] pdfBytes = reportExportService.exportYearlyReportToPDF(report);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                String.format("BaoCaoNam_%d.pdf", year));
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
        } catch (IOException e) {
            log.error("Error exporting yearly report to PDF", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @Operation(
        summary = "Xuất báo cáo năm ra Excel",
        description = "Tải báo cáo năm dưới dạng file Excel"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Xuất Excel thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "403", description = "Không có quyền truy cập")
    })
    @GetMapping("/yearly/export/excel")
    @PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportYearlyReportToExcel(@RequestParam int year) {
        log.info("Exporting yearly report to Excel for {}", year);
        try {
            YearlyReportDTO report = reportService.getYearlyReport(year);
            byte[] excelBytes = reportExportService.exportYearlyReportToExcel(report);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", 
                String.format("BaoCaoNam_%d.xlsx", year));
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
        } catch (IOException e) {
            log.error("Error exporting yearly report to Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
