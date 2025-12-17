package com.example.app.service;

import com.example.app.dto.PrintLogDTO;
import com.example.app.dto.PrintLogStatsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelExportService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    
    /**
     * Xuất print logs ra file Excel
     */
    public byte[] exportPrintLogsToExcel(List<PrintLogDTO> logs, PrintLogStatsDTO stats) throws IOException {
        log.info("Exporting {} print logs to Excel", logs.size());
        
        try (Workbook workbook = new XSSFWorkbook()) {
            // Tạo styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            
            // Sheet 1: Raw data
            createDataSheet(workbook, logs, headerStyle, dataStyle, dateStyle);
            
            // Sheet 2: Statistics
            createStatsSheet(workbook, stats, headerStyle, dataStyle);
            
            // Convert to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    /**
     * Tạo sheet dữ liệu logs
     */
    private void createDataSheet(Workbook workbook, List<PrintLogDTO> logs, 
                                CellStyle headerStyle, CellStyle dataStyle, CellStyle dateStyle) {
        Sheet sheet = workbook.createSheet("Nhật ký in");
        
        // Header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "STT", "Ngày giờ", "Sinh viên", "MSSV", "Email", 
            "Tài liệu", "Máy in", "Vị trí", "Khổ giấy", 
            "Số trang", "A4 tương đương", "Thời gian in (giây)", "Trạng thái"
        };
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        int rowNum = 1;
        for (PrintLogDTO log : logs) {
            Row row = sheet.createRow(rowNum++);
            
            row.createCell(0).setCellValue(rowNum - 1); // STT
            
            Cell dateCell = row.createCell(1);
            if (log.getPrintTime() != null) {
                dateCell.setCellValue(log.getPrintTime().format(DATE_FORMATTER));
            }
            dateCell.setCellStyle(dateStyle);
            
            row.createCell(2).setCellValue(log.getStudentName() != null ? log.getStudentName() : "");
            row.createCell(3).setCellValue(log.getStudentId() != null ? log.getStudentId() : "");
            row.createCell(4).setCellValue(log.getStudentEmail() != null ? log.getStudentEmail() : "");
            row.createCell(5).setCellValue(log.getDocumentName() != null ? log.getDocumentName() : "");
            row.createCell(6).setCellValue(log.getPrinterName() != null ? log.getPrinterName() : "");
            row.createCell(7).setCellValue(log.getPrinterLocation() != null ? log.getPrinterLocation() : "");
            row.createCell(8).setCellValue(log.getPaperSize() != null ? log.getPaperSize() : "");
            row.createCell(9).setCellValue(log.getPagesPrinted() != null ? log.getPagesPrinted() : 0);
            row.createCell(10).setCellValue(log.getA4EquivalentUsed() != null ? log.getA4EquivalentUsed() : 0);
            row.createCell(11).setCellValue(log.getDurationSeconds() != null ? log.getDurationSeconds() : 0);
            row.createCell(12).setCellValue(log.getStatusDisplay() != null ? log.getStatusDisplay() : "");
            
            // Apply data style to all cells
            for (int i = 0; i < headers.length; i++) {
                if (i != 1) { // Skip date cell (already has style)
                    row.getCell(i).setCellStyle(dataStyle);
                }
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * Tạo sheet thống kê
     */
    private void createStatsSheet(Workbook workbook, PrintLogStatsDTO stats, 
                                 CellStyle headerStyle, CellStyle dataStyle) {
        Sheet sheet = workbook.createSheet("Thống kê");
        
        int rowNum = 0;
        
        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("THỐNG KÊ NHẬT KÝ IN");
        titleCell.setCellStyle(headerStyle);
        
        rowNum++; // Empty row
        
        // Tổng quan
        createStatsSection(sheet, rowNum, "TỔNG QUAN", new String[][]{
            {"Tổng số lệnh in:", stats.getTotalLogs().toString()},
            {"Hoàn thành:", stats.getCompletedLogs() + " (" + String.format("%.1f", stats.getCompletionRate()) + "%)"},
            {"Thất bại:", stats.getFailedLogs() + " (" + String.format("%.1f", stats.getFailureRate()) + "%)"},
            {"Đã hủy:", stats.getCancelledLogs().toString()},
            {"Đang chờ:", stats.getPendingLogs().toString()},
            {"Đang in:", stats.getPrintingLogs().toString()}
        }, headerStyle, dataStyle);
        
        rowNum += 8; // 6 data rows + 2 empty rows
        
        // Thống kê trang in
        createStatsSection(sheet, rowNum, "THỐNG KÊ TRANG IN", new String[][]{
            {"Tổng số trang:", stats.getTotalPages() + " trang"},
            {"Trung bình/lệnh:", String.format("%.1f", stats.getAveragePagesPerJob()) + " trang"},
            {"Lệnh in nhiều nhất:", stats.getMaxPagesPerJob() + " trang"},
            {"Lệnh in ít nhất:", stats.getMinPagesPerJob() + " trang"}
        }, headerStyle, dataStyle);
        
        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }
    
    /**
     * Tạo section thống kê
     */
    private void createStatsSection(Sheet sheet, int startRow, String title, String[][] data,
                                   CellStyle headerStyle, CellStyle dataStyle) {
        // Section title
        Row titleRow = sheet.createRow(startRow);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(title);
        titleCell.setCellStyle(headerStyle);
        
        // Data rows
        for (int i = 0; i < data.length; i++) {
            Row row = sheet.createRow(startRow + 1 + i);
            
            Cell labelCell = row.createCell(0);
            labelCell.setCellValue(data[i][0]);
            labelCell.setCellStyle(dataStyle);
            
            Cell valueCell = row.createCell(1);
            valueCell.setCellValue(data[i][1]);
            valueCell.setCellStyle(dataStyle);
        }
    }
    
    /**
     * Tạo style cho header
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
    
    /**
     * Tạo style cho data
     */
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    /**
     * Tạo style cho date
     */
    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
}