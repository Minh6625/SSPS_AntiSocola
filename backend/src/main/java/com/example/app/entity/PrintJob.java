package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: PrintJobs - Lệnh in (Print Queue)
 */
@Entity
@Table(name = "PrintJobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrintJob {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JobID")
    private Integer jobId;
    
    @Column(name = "StudentID", nullable = false, length = 20)
    private String studentId;
    
    @Column(name = "DocumentID", nullable = false)
    private Integer documentId;
    
    @Column(name = "PrinterID", nullable = false, length = 20)
    private String printerId;
    
    @Column(name = "PaperSize", nullable = false, length = 10)
    private String paperSize = "A4";  // A4, A3, A5
    
    @Column(name = "PagesToPrint", nullable = false, length = 255)
    private String pagesToPrint;
    
    @Column(name = "ColorMode", length = 20)
    private String colorMode = "BlackWhite";  // Color, Grayscale, BlackWhite
    
    @Column(name = "ColorPageRange", length = 255)
    private String colorPageRange;  // Pages to print in color (e.g., "1-3,5,10-15")
    
    @Column(name = "IsSingleSided")
    private Boolean isSingleSided = false;
    
    @Column(name = "NumCopies")
    private Integer numCopies = 1;
    
    @Column(name = "TotalPagesToPrint", nullable = false)
    private Integer totalPagesToPrint;
    
    @Column(name = "TotalSheetsUsed", nullable = false)
    private Integer totalSheetsUsed;
    
    @Column(name = "A4EquivalentPages", nullable = false)
    private Integer a4EquivalentPages;
    
    @Column(name = "JobStatus", length = 20)
    private String jobStatus = "Pending";  // Pending, Printing, Completed, Failed, Cancelled
    
    @Column(name = "SubmittedAt")
    private LocalDateTime submittedAt;
    
    @Column(name = "StartedAt")
    private LocalDateTime startedAt;
    
    @Column(name = "CompletedAt")
    private LocalDateTime completedAt;
    
    @Column(name = "ErrorMessage", length = 500)
    private String errorMessage;
    
    @Column(name = "Notes", length = 500)
    private String notes;  // Ghi chú (VD: số lần retry)
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentID", insertable = false, updatable = false)
    private User student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DocumentID", insertable = false, updatable = false)
    private Document document;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PrinterID", insertable = false, updatable = false)
    private Printer printer;
    
    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}
