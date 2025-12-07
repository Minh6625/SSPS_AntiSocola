package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ENTITY: Printers - Máy in
 */
@Entity
@Table(name = "Printers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Printer {
    
    @Id
    @Column(name = "PrinterID", length = 20)
    private String printerId;
    
    @Column(name = "PrinterName", nullable = false, length = 100)
    private String printerName;
    
    @Column(name = "Brand", nullable = false, length = 50)
    private String brand;
    
    @Column(name = "Model", nullable = false, length = 100)
    private String model;
    
    @Column(name = "Location", nullable = false, length = 200)
    private String location;
    
    @Column(name = "Campus", nullable = false, length = 50)
    private String campus;
    
    @Column(name = "Building", nullable = false, length = 50)
    private String building;
    
    @Column(name = "RoomNumber", nullable = false, length = 20)
    private String roomNumber;
    
    @Column(name = "PaperSizes", length = 50)
    private String paperSizes = "A4,A3";
    
    @Column(name = "ColorPrinting")
    private Boolean colorPrinting = false;
    
    @Column(name = "DuplexPrinting")
    private Boolean duplexPrinting = true;
    
    @Column(name = "Status", length = 20)
    private String status = "Active";  // Active, Inactive, Maintenance, Error
    
    @Column(name = "TotalPagesPrinted")
    private Integer totalPagesPrinted = 0;
    
    @Column(name = "LastMaintenanceDate")
    private LocalDate lastMaintenanceDate;
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "CreatedBy", length = 20)
    private String createdBy;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
