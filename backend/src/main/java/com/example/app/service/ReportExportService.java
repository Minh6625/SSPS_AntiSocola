package com.example.app.service;

import com.example.app.dto.MonthlyReportDTO;
import com.example.app.dto.YearlyReportDTO;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportExportService {
    
    private static final NumberFormat VND_FORMAT = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    
    // Font cho tiếng Việt
    private PdfFont vietnameseFont;
    
    private PdfFont getVietnameseFont() {
        if (vietnameseFont == null) {
            try {
                // Thử dùng font Arial từ Windows
                vietnameseFont = PdfFontFactory.createFont("c:/windows/fonts/arial.ttf", "Identity-H");
            } catch (Exception e) {
                log.warn("Cannot load Arial font, using Helvetica: {}", e.getMessage());
                try {
                    // Fallback to Helvetica (không hỗ trợ tiếng Việt tốt nhưng ít nhất không crash)
                    vietnameseFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
                } catch (IOException ex) {
                    throw new RuntimeException("Cannot create font", ex);
                }
            }
        }
        return vietnameseFont;
    }
    
    /**
     * Xuất báo cáo tháng ra PDF
     */
    public byte[] exportMonthlyReportToPDF(MonthlyReportDTO report) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Header
        addPDFHeader(document, "BÁO CÁO HOẠT ĐỘNG IN ẤN", 
            report.getMonthName() + " / " + report.getYear());
        
        // Thống kê tổng quan
        addPDFSection(document, "TỔNG QUAN");
        Table statsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}));
        statsTable.setWidth(UnitValue.createPercentValue(100));
        
        addStatCell(statsTable, "Tổng lệnh in", report.getTotalPrintJobs().toString());
        addStatCell(statsTable, "Tổng trang in", report.getTotalPagesPrinted().toString());
        addStatCell(statsTable, "Doanh thu", formatCurrency(report.getTotalRevenue()));
        addStatCell(statsTable, "SV hoạt động", report.getTotalStudentsActive().toString());
        
        document.add(statsTable);
        document.add(new Paragraph("\n"));
        
        // Phân bổ khổ giấy
        addPDFSection(document, "PHÂN BỔ THEO KHỔ GIẤY");
        Table paperTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}));
        paperTable.setWidth(UnitValue.createPercentValue(100));
        
        addHeaderCell(paperTable, "Khổ giấy");
        addHeaderCell(paperTable, "Số lượng");
        addHeaderCell(paperTable, "Tỷ lệ");
        
        addDataCell(paperTable, "A4");
        addDataCell(paperTable, report.getPaperSizeDistribution().getA4Count().toString());
        addDataCell(paperTable, String.format("%.1f%%", report.getPaperSizeDistribution().getA4Percentage()));
        
        addDataCell(paperTable, "A3");
        addDataCell(paperTable, report.getPaperSizeDistribution().getA3Count().toString());
        addDataCell(paperTable, String.format("%.1f%%", report.getPaperSizeDistribution().getA3Percentage()));
        
        document.add(paperTable);
        document.add(new Paragraph("\n"));
        
        // Top 5 sinh viên
        addPDFSection(document, "TOP 5 SINH VIÊN IN NHIỀU NHẤT");
        Table studentTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 2, 1.5f, 1, 1}));
        studentTable.setWidth(UnitValue.createPercentValue(100));
        
        addHeaderCell(studentTable, "#");
        addHeaderCell(studentTable, "Tên sinh viên");
        addHeaderCell(studentTable, "Email");
        addHeaderCell(studentTable, "Số trang");
        addHeaderCell(studentTable, "Số lệnh");
        
        int rank = 1;
        for (MonthlyReportDTO.TopStudent student : report.getTopStudents()) {
            addDataCell(studentTable, String.valueOf(rank++));
            addDataCell(studentTable, student.getStudentName());
            addDataCell(studentTable, student.getStudentEmail());
            addDataCell(studentTable, student.getTotalPages().toString());
            addDataCell(studentTable, student.getTotalJobs().toString());
        }
        
        document.add(studentTable);
        document.add(new Paragraph("\n"));
        
        // Top 3 máy in
        addPDFSection(document, "TOP 3 MÁY IN BẬN NHẤT");
        Table printerTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 2, 2, 1, 1}));
        printerTable.setWidth(UnitValue.createPercentValue(100));
        
        addHeaderCell(printerTable, "#");
        addHeaderCell(printerTable, "Tên máy in");
        addHeaderCell(printerTable, "Vị trí");
        addHeaderCell(printerTable, "Số lệnh");
        addHeaderCell(printerTable, "Số trang");
        
        rank = 1;
        for (MonthlyReportDTO.TopPrinter printer : report.getTopPrinters()) {
            addDataCell(printerTable, String.valueOf(rank++));
            addDataCell(printerTable, printer.getPrinterName());
            addDataCell(printerTable, printer.getLocation());
            addDataCell(printerTable, printer.getTotalJobs().toString());
            addDataCell(printerTable, printer.getTotalPages().toString());
        }
        
        document.add(printerTable);
        
        // Footer
        addPDFFooter(document);
        
        document.close();
        return baos.toByteArray();
    }
    
    /**
     * Xuất báo cáo năm ra PDF
     */
    public byte[] exportYearlyReportToPDF(YearlyReportDTO report) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Header
        addPDFHeader(document, "BÁO CÁO HOẠT ĐỘNG IN ẤN NĂM", String.valueOf(report.getYear()));
        
        // Thống kê tổng quan
        addPDFSection(document, "TỔNG QUAN");
        Table statsTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}));
        statsTable.setWidth(UnitValue.createPercentValue(100));
        
        addStatCell(statsTable, "Tổng lệnh in", report.getTotalPrintJobs().toString());
        addStatCell(statsTable, "Tổng trang in", report.getTotalPagesPrinted().toString());
        addStatCell(statsTable, "Doanh thu", formatCurrency(report.getTotalRevenue()));
        addStatCell(statsTable, "SV hoạt động", report.getTotalStudentsActive().toString());
        
        document.add(statsTable);
        document.add(new Paragraph("\n"));
        
        // Tháng hoạt động nhiều nhất
        addPDFSection(document, "THÁNG HOẠT ĐỘNG NHIỀU NHẤT");
        Paragraph activeMonth = new Paragraph(report.getMostActiveMonthName() + " - " + 
            report.getMostActiveMonthJobs() + " lệnh in")
            .setFont(getVietnameseFont())
            .setFontSize(14)
            .setBold();
        document.add(activeMonth);
        document.add(new Paragraph("\n"));
        
        // Phân bổ khổ giấy
        addPDFSection(document, "PHÂN BỔ THEO KHỔ GIẤY");
        Table paperTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1}));
        paperTable.setWidth(UnitValue.createPercentValue(100));
        
        addHeaderCell(paperTable, "Khổ giấy");
        addHeaderCell(paperTable, "Số lượng");
        addHeaderCell(paperTable, "Tỷ lệ");
        
        addDataCell(paperTable, "A4");
        addDataCell(paperTable, report.getPaperSizeDistribution().getA4Count().toString());
        addDataCell(paperTable, String.format("%.1f%%", report.getPaperSizeDistribution().getA4Percentage()));
        
        addDataCell(paperTable, "A3");
        addDataCell(paperTable, report.getPaperSizeDistribution().getA3Count().toString());
        addDataCell(paperTable, String.format("%.1f%%", report.getPaperSizeDistribution().getA3Percentage()));
        
        document.add(paperTable);
        document.add(new Paragraph("\n"));
        
        // Top 5 sinh viên
        addPDFSection(document, "TOP 5 SINH VIÊN IN NHIỀU NHẤT");
        Table studentTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 2, 1.5f, 1, 1}));
        studentTable.setWidth(UnitValue.createPercentValue(100));
        
        addHeaderCell(studentTable, "#");
        addHeaderCell(studentTable, "Tên sinh viên");
        addHeaderCell(studentTable, "Email");
        addHeaderCell(studentTable, "Số trang");
        addHeaderCell(studentTable, "Số lệnh");
        
        int rank = 1;
        for (YearlyReportDTO.TopStudent student : report.getTopStudents()) {
            addDataCell(studentTable, String.valueOf(rank++));
            addDataCell(studentTable, student.getStudentName());
            addDataCell(studentTable, student.getStudentEmail());
            addDataCell(studentTable, student.getTotalPages().toString());
            addDataCell(studentTable, student.getTotalJobs().toString());
        }
        
        document.add(studentTable);
        document.add(new Paragraph("\n"));
        
        // Top 3 máy in
        addPDFSection(document, "TOP 3 MÁY IN BẬN NHẤT");
        Table printerTable = new Table(UnitValue.createPercentArray(new float[]{0.5f, 2, 2, 1, 1}));
        printerTable.setWidth(UnitValue.createPercentValue(100));
        
        addHeaderCell(printerTable, "#");
        addHeaderCell(printerTable, "Tên máy in");
        addHeaderCell(printerTable, "Vị trí");
        addHeaderCell(printerTable, "Số lệnh");
        addHeaderCell(printerTable, "Số trang");
        
        rank = 1;
        for (YearlyReportDTO.TopPrinter printer : report.getTopPrinters()) {
            addDataCell(printerTable, String.valueOf(rank++));
            addDataCell(printerTable, printer.getPrinterName());
            addDataCell(printerTable, printer.getLocation());
            addDataCell(printerTable, printer.getTotalJobs().toString());
            addDataCell(printerTable, printer.getTotalPages().toString());
        }
        
        document.add(printerTable);
        
        // Footer
        addPDFFooter(document);
        
        document.close();
        return baos.toByteArray();
    }

    
    /**
     * Xuất báo cáo tháng ra Excel
     */
    public byte[] exportMonthlyReportToExcel(MonthlyReportDTO report) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        
        // Sheet 1: Tổng quan
        Sheet overviewSheet = workbook.createSheet("Tổng quan");
        createMonthlyOverviewSheet(overviewSheet, report, workbook);
        
        // Sheet 2: Top sinh viên
        Sheet studentSheet = workbook.createSheet("Top sinh viên");
        createTopStudentsSheet(studentSheet, report.getTopStudents(), workbook);
        
        // Sheet 3: Top máy in
        Sheet printerSheet = workbook.createSheet("Top máy in");
        createTopPrintersSheet(printerSheet, report.getTopPrinters(), workbook);
        
        // Sheet 4: Thống kê theo ngày
        Sheet dailySheet = workbook.createSheet("Thống kê theo ngày");
        createDailyStatsSheet(dailySheet, report.getDailyStats(), workbook);
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        
        return baos.toByteArray();
    }
    
    /**
     * Xuất báo cáo năm ra Excel
     */
    public byte[] exportYearlyReportToExcel(YearlyReportDTO report) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        
        // Sheet 1: Tổng quan
        Sheet overviewSheet = workbook.createSheet("Tổng quan");
        createYearlyOverviewSheet(overviewSheet, report, workbook);
        
        // Sheet 2: Top sinh viên
        Sheet studentSheet = workbook.createSheet("Top sinh viên");
        createTopStudentsSheetYearly(studentSheet, report.getTopStudents(), workbook);
        
        // Sheet 3: Top máy in
        Sheet printerSheet = workbook.createSheet("Top máy in");
        createTopPrintersSheetYearly(printerSheet, report.getTopPrinters(), workbook);
        
        // Sheet 4: Thống kê theo tháng
        Sheet monthlySheet = workbook.createSheet("Thống kê theo tháng");
        createMonthlyStatsSheet(monthlySheet, report.getMonthlyStats(), workbook);
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        
        return baos.toByteArray();
    }
    
    // ==================== PDF Helper Methods ====================
    
    private void addPDFHeader(Document document, String title, String subtitle) {
        PdfFont font = getVietnameseFont();
        
        Paragraph titlePara = new Paragraph(title)
            .setFont(font)
            .setFontSize(20)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER);
        document.add(titlePara);
        
        Paragraph subtitlePara = new Paragraph(subtitle)
            .setFont(font)
            .setFontSize(16)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER)
            .setFontColor(new DeviceRgb(147, 51, 234)); // Purple
        document.add(subtitlePara);
        
        Paragraph systemPara = new Paragraph("Hệ thống SPSS SIU - Smart Printing Service System")
            .setFont(font)
            .setFontSize(10)
            .setTextAlignment(TextAlignment.CENTER)
            .setFontColor(ColorConstants.GRAY);
        document.add(systemPara);
        
        Paragraph datePara = new Paragraph("Ngày tạo: " + LocalDateTime.now().format(DATE_FORMATTER))
            .setFont(font)
            .setFontSize(9)
            .setTextAlignment(TextAlignment.CENTER)
            .setFontColor(ColorConstants.GRAY);
        document.add(datePara);
        
        document.add(new Paragraph("\n"));
    }
    
    private void addPDFSection(Document document, String sectionTitle) {
        PdfFont font = getVietnameseFont();
        Paragraph section = new Paragraph(sectionTitle)
            .setFont(font)
            .setFontSize(14)
            .setBold()
            .setFontColor(new DeviceRgb(79, 70, 229)); // Indigo
        document.add(section);
    }
    
    private void addStatCell(Table table, String label, String value) {
        PdfFont font = getVietnameseFont();
        Cell cell = new Cell();
        cell.add(new Paragraph(label).setFont(font).setFontSize(10).setFontColor(ColorConstants.GRAY));
        cell.add(new Paragraph(value).setFont(font).setFontSize(16).setBold());
        cell.setBackgroundColor(new DeviceRgb(243, 244, 246));
        cell.setTextAlignment(TextAlignment.CENTER);
        table.addCell(cell);
    }
    
    private void addHeaderCell(Table table, String text) {
        PdfFont font = getVietnameseFont();
        Cell cell = new Cell();
        cell.add(new Paragraph(text).setFont(font).setBold().setFontSize(11));
        cell.setBackgroundColor(new DeviceRgb(79, 70, 229));
        cell.setFontColor(ColorConstants.WHITE);
        cell.setTextAlignment(TextAlignment.CENTER);
        table.addCell(cell);
    }
    
    private void addDataCell(Table table, String text) {
        PdfFont font = getVietnameseFont();
        Cell cell = new Cell();
        cell.add(new Paragraph(text).setFont(font).setFontSize(10));
        cell.setTextAlignment(TextAlignment.CENTER);
        table.addCell(cell);
    }
    
    private void addPDFFooter(Document document) {
        PdfFont font = getVietnameseFont();
        document.add(new Paragraph("\n\n"));
        Paragraph footer = new Paragraph("Báo cáo được tạo tự động bởi Hệ thống SPSS SIU")
            .setFont(font)
            .setFontSize(9)
            .setTextAlignment(TextAlignment.CENTER)
            .setFontColor(ColorConstants.GRAY);
        document.add(footer);
        
        Paragraph copyright = new Paragraph("© 2025 HCMIU - Smart Printing Service System")
            .setFont(font)
            .setFontSize(8)
            .setTextAlignment(TextAlignment.CENTER)
            .setFontColor(ColorConstants.LIGHT_GRAY);
        document.add(copyright);
    }
    
    // ==================== Excel Helper Methods ====================
    
    private void createMonthlyOverviewSheet(Sheet sheet, MonthlyReportDTO report, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        
        int rowNum = 0;
        
        // Title
        Row titleRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO THÁNG " + report.getMonth() + "/" + report.getYear());
        titleCell.setCellStyle(createTitleStyle(workbook));
        
        rowNum++; // Empty row
        
        // Thống kê chung
        createExcelRow(sheet, rowNum++, "Tổng lệnh in:", report.getTotalPrintJobs(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Lệnh thành công:", report.getSuccessfulJobs(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Lệnh thất bại:", report.getFailedJobs(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Tổng trang in:", report.getTotalPagesPrinted(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Tổng A4 tương đương:", report.getTotalA4Equivalent(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Doanh thu:", formatCurrency(report.getTotalRevenue()), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Sinh viên hoạt động:", report.getTotalStudentsActive(), headerStyle, dataStyle);
        
        rowNum++; // Empty row
        
        // Phân bổ khổ giấy
        Row paperHeaderRow = sheet.createRow(rowNum++);
        paperHeaderRow.createCell(0).setCellValue("PHÂN BỔ THEO KHỔ GIẤY");
        paperHeaderRow.getCell(0).setCellStyle(createTitleStyle(workbook));
        
        createExcelRow(sheet, rowNum++, "A4:", report.getPaperSizeDistribution().getA4Count() + 
            " (" + String.format("%.1f%%", report.getPaperSizeDistribution().getA4Percentage()) + ")", 
            headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "A3:", report.getPaperSizeDistribution().getA3Count() + 
            " (" + String.format("%.1f%%", report.getPaperSizeDistribution().getA3Percentage()) + ")", 
            headerStyle, dataStyle);
        
        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }
    
    private void createYearlyOverviewSheet(Sheet sheet, YearlyReportDTO report, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        
        int rowNum = 0;
        
        // Title
        Row titleRow = sheet.createRow(rowNum++);
        org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO NĂM " + report.getYear());
        titleCell.setCellStyle(createTitleStyle(workbook));
        
        rowNum++; // Empty row
        
        // Thống kê chung
        createExcelRow(sheet, rowNum++, "Tổng lệnh in:", report.getTotalPrintJobs(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Lệnh thành công:", report.getSuccessfulJobs(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Lệnh thất bại:", report.getFailedJobs(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Tổng trang in:", report.getTotalPagesPrinted(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Tổng A4 tương đương:", report.getTotalA4Equivalent(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Doanh thu:", formatCurrency(report.getTotalRevenue()), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Sinh viên hoạt động:", report.getTotalStudentsActive(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "TB doanh thu/SV:", formatCurrency(report.getAverageRevenuePerStudent()), headerStyle, dataStyle);
        
        rowNum++; // Empty row
        
        // Tháng hoạt động nhiều nhất
        Row activeMonthRow = sheet.createRow(rowNum++);
        activeMonthRow.createCell(0).setCellValue("THÁNG HOẠT ĐỘNG NHIỀU NHẤT");
        activeMonthRow.getCell(0).setCellStyle(createTitleStyle(workbook));
        
        createExcelRow(sheet, rowNum++, "Tháng:", report.getMostActiveMonthName(), headerStyle, dataStyle);
        createExcelRow(sheet, rowNum++, "Số lệnh in:", report.getMostActiveMonthJobs(), headerStyle, dataStyle);
        
        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }
    
    private void createTopStudentsSheet(Sheet sheet, java.util.List<MonthlyReportDTO.TopStudent> students, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        
        int rowNum = 0;
        
        // Header row
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("#");
        headerRow.createCell(1).setCellValue("Tên sinh viên");
        headerRow.createCell(2).setCellValue("Email");
        headerRow.createCell(3).setCellValue("Số trang");
        headerRow.createCell(4).setCellValue("Số lệnh");
        
        for (int i = 0; i < 5; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }
        
        // Data rows
        int rank = 1;
        for (MonthlyReportDTO.TopStudent student : students) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rank++);
            row.createCell(1).setCellValue(student.getStudentName());
            row.createCell(2).setCellValue(student.getStudentEmail());
            row.createCell(3).setCellValue(student.getTotalPages());
            row.createCell(4).setCellValue(student.getTotalJobs());
            
            for (int i = 0; i < 5; i++) {
                row.getCell(i).setCellStyle(dataStyle);
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createTopStudentsSheetYearly(Sheet sheet, java.util.List<YearlyReportDTO.TopStudent> students, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        
        int rowNum = 0;
        
        // Header row
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("#");
        headerRow.createCell(1).setCellValue("Tên sinh viên");
        headerRow.createCell(2).setCellValue("Email");
        headerRow.createCell(3).setCellValue("Số trang");
        headerRow.createCell(4).setCellValue("Số lệnh");
        
        for (int i = 0; i < 5; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }
        
        // Data rows
        int rank = 1;
        for (YearlyReportDTO.TopStudent student : students) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rank++);
            row.createCell(1).setCellValue(student.getStudentName());
            row.createCell(2).setCellValue(student.getStudentEmail());
            row.createCell(3).setCellValue(student.getTotalPages());
            row.createCell(4).setCellValue(student.getTotalJobs());
            
            for (int i = 0; i < 5; i++) {
                row.getCell(i).setCellStyle(dataStyle);
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createTopPrintersSheet(Sheet sheet, java.util.List<MonthlyReportDTO.TopPrinter> printers, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        
        int rowNum = 0;
        
        // Header row
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("#");
        headerRow.createCell(1).setCellValue("Tên máy in");
        headerRow.createCell(2).setCellValue("Vị trí");
        headerRow.createCell(3).setCellValue("Số lệnh");
        headerRow.createCell(4).setCellValue("Số trang");
        
        for (int i = 0; i < 5; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }
        
        // Data rows
        int rank = 1;
        for (MonthlyReportDTO.TopPrinter printer : printers) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rank++);
            row.createCell(1).setCellValue(printer.getPrinterName());
            row.createCell(2).setCellValue(printer.getLocation());
            row.createCell(3).setCellValue(printer.getTotalJobs());
            row.createCell(4).setCellValue(printer.getTotalPages());
            
            for (int i = 0; i < 5; i++) {
                row.getCell(i).setCellStyle(dataStyle);
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createTopPrintersSheetYearly(Sheet sheet, java.util.List<YearlyReportDTO.TopPrinter> printers, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        
        int rowNum = 0;
        
        // Header row
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("#");
        headerRow.createCell(1).setCellValue("Tên máy in");
        headerRow.createCell(2).setCellValue("Vị trí");
        headerRow.createCell(3).setCellValue("Số lệnh");
        headerRow.createCell(4).setCellValue("Số trang");
        
        for (int i = 0; i < 5; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }
        
        // Data rows
        int rank = 1;
        for (YearlyReportDTO.TopPrinter printer : printers) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rank++);
            row.createCell(1).setCellValue(printer.getPrinterName());
            row.createCell(2).setCellValue(printer.getLocation());
            row.createCell(3).setCellValue(printer.getTotalJobs());
            row.createCell(4).setCellValue(printer.getTotalPages());
            
            for (int i = 0; i < 5; i++) {
                row.getCell(i).setCellStyle(dataStyle);
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createDailyStatsSheet(Sheet sheet, java.util.List<MonthlyReportDTO.DailyStats> dailyStats, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        
        int rowNum = 0;
        
        // Header row
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Ngày");
        headerRow.createCell(1).setCellValue("Số lệnh");
        headerRow.createCell(2).setCellValue("Số trang");
        
        for (int i = 0; i < 3; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }
        
        // Data rows
        for (MonthlyReportDTO.DailyStats stat : dailyStats) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(stat.getDay());
            row.createCell(1).setCellValue(stat.getJobs());
            row.createCell(2).setCellValue(stat.getPages());
            
            for (int i = 0; i < 3; i++) {
                row.getCell(i).setCellStyle(dataStyle);
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 3; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createMonthlyStatsSheet(Sheet sheet, java.util.List<YearlyReportDTO.MonthlyStats> monthlyStats, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);
        
        int rowNum = 0;
        
        // Header row
        Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Tháng");
        headerRow.createCell(1).setCellValue("Số lệnh");
        headerRow.createCell(2).setCellValue("Số trang");
        
        for (int i = 0; i < 3; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }
        
        // Data rows
        for (YearlyReportDTO.MonthlyStats stat : monthlyStats) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(stat.getMonthName());
            row.createCell(1).setCellValue(stat.getJobs());
            row.createCell(2).setCellValue(stat.getPages());
            
            for (int i = 0; i < 3; i++) {
                row.getCell(i).setCellStyle(dataStyle);
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 3; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createExcelRow(Sheet sheet, int rowNum, String label, Object value, CellStyle headerStyle, CellStyle dataStyle) {
        Row row = sheet.createRow(rowNum);
        org.apache.poi.ss.usermodel.Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(headerStyle);
        
        org.apache.poi.ss.usermodel.Cell valueCell = row.createCell(1);
        if (value instanceof Integer) {
            valueCell.setCellValue((Integer) value);
        } else {
            valueCell.setCellValue(value.toString());
        }
        valueCell.setCellStyle(dataStyle);
    }
    
    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        return style;
    }
    
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    private String formatCurrency(BigDecimal amount) {
        return VND_FORMAT.format(amount);
    }
}
