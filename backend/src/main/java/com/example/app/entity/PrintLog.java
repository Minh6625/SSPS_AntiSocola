package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: PrintLogs - Lịch sử in (Log)
 */
@Entity
@Table(name = "PrintLogs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrintLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LogID")
    private Integer logId;
    
    @Column(name = "JobID", nullable = false)
    private Integer jobId;
    
    @Column(name = "StudentID", nullable = false, length = 20)
    private String studentId;
    
    @Column(name = "PrinterID", nullable = false, length = 20)
    private String printerId;
    
    @Column(name = "DocumentName", nullable = false, length = 255)
    private String documentName;
    
    @Column(name = "PaperSize", nullable = false, length = 10)
    private String paperSize;
    
    @Column(name = "PagesPrinted", nullable = false)
    private Integer pagesPrinted;
    
    @Column(name = "A4EquivalentUsed", nullable = false)
    private Integer a4EquivalentUsed;
    
    @Column(name = "PrintTime")
    private LocalDateTime printTime;
    
    @Column(name = "DurationSeconds")
    private Integer durationSeconds;
    
    @Column(name = "Status", nullable = false, length = 20)
    private String status;  // Success, Failed
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "JobID", insertable = false, updatable = false)
    private PrintJob printJob;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentID", insertable = false, updatable = false)
    private User student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PrinterID", insertable = false, updatable = false)
    private Printer printer;
    
    @PrePersist
    protected void onCreate() {
        if (printTime == null) {
            printTime = LocalDateTime.now();
        }
    }
}
