package com.example.app.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * DTO: Print Job Response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrintJobResponseDTO {
    private Integer jobId;
    private Integer documentId;
    private String documentName;
    private String printerId;
    private String printerName;
    private String studentId;
    private String studentName;
    
    // Configuration
    private String paperSize;
    private String pageRange;
    private Boolean duplex;
    private Boolean isSingleSided;
    private Integer copies;
    private String colorMode;
    private String colorPageRange;
    
    // Calculation
    private Integer totalPagesToPrint;
    private Integer totalSheetsUsed;
    private Integer a4EquivalentPages;
    
    // Status
    private String jobStatus;
    private LocalDateTime submittedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String errorMessage;
}
