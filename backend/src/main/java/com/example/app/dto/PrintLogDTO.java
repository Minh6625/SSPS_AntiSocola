package com.example.app.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO cho Print Log response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrintLogDTO {
    
    private Integer logId;
    private Integer jobId;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String printerId;
    private String printerName;
    private String printerLocation;
    private String documentName;
    private String paperSize;
    private Integer pagesPrinted;
    private Integer a4EquivalentUsed;
    private LocalDateTime printTime;
    private Integer durationSeconds;
    private String status;
    private String statusDisplay;
    private String fileType;
    private String errorMessage; // Nếu có lỗi
    
    // Constructor từ entity
    public PrintLogDTO(com.example.app.entity.PrintLog printLog) {
        this.logId = printLog.getLogId();
        this.jobId = printLog.getJobId();
        this.studentId = printLog.getStudentId();
        this.printerId = printLog.getPrinterId();
        this.documentName = printLog.getDocumentName();
        this.paperSize = printLog.getPaperSize();
        this.pagesPrinted = printLog.getPagesPrinted();
        this.a4EquivalentUsed = printLog.getA4EquivalentUsed();
        this.printTime = printLog.getPrintTime();
        this.durationSeconds = printLog.getDurationSeconds();
        this.status = printLog.getStatus();
        
        // Set display values
        this.statusDisplay = getStatusDisplay(printLog.getStatus());
        this.fileType = getFileType(printLog.getDocumentName());
        
        // Set student info if available
        if (printLog.getStudent() != null) {
            this.studentName = printLog.getStudent().getFullName();
            this.studentEmail = printLog.getStudent().getEmail();
        }
        
        // Set printer info if available
        if (printLog.getPrinter() != null) {
            this.printerName = printLog.getPrinter().getPrinterName();
            this.printerLocation = printLog.getPrinter().getLocation();
        }
    }
    
    private String getStatusDisplay(String status) {
        switch (status) {
            case "Pending": return "Đang chờ xử lý";
            case "Printing": return "Đang in";
            case "Success": return "Hoàn thành";
            case "Completed": return "Hoàn thành";
            case "Failed": return "Thất bại";
            case "Cancelled": return "Đã hủy";
            default: return status;
        }
    }
    
    private String getFileType(String fileName) {
        if (fileName == null) return "unknown";
        
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "pdf": return "pdf";
            case "doc":
            case "docx": return "docx";
            case "xls":
            case "xlsx": return "xlsx";
            case "ppt":
            case "pptx": return "pptx";
            case "txt": return "txt";
            case "jpg":
            case "jpeg":
            case "png": return "image";
            default: return "file";
        }
    }
}