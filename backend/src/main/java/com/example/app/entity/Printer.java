package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ENTITY: Printers - Máy in (Updated with Reference Tables)
 */
@Entity
@Table(name = "Printers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Printer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PrinterID")
    private Long printerId;
    
    @Column(name = "PrinterName", nullable = false, length = 100)
    private String printerName;
    
    // Foreign Keys thay vì text fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BrandID", nullable = false)
    private Brand brand;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ModelID", nullable = false)
    private PrinterModel model;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoomID", nullable = false)
    private Room room;
    
    @Column(name = "IPAddress", length = 50)
    private String ipAddress;
    
    // Cấu hình máy (có thể override defaults từ PrinterModels)
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
    
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * Helper method to get formatted location string
     * @return Location in format "Campus - Building - Room"
     */
    @Transient
    public String getLocation() {
        if (room != null && room.getBuilding() != null && room.getBuilding().getCampus() != null) {
            return String.format("%s - %s - %s", 
                room.getBuilding().getCampus().getCampusName(),
                room.getBuilding().getBuildingCode(),
                room.getRoomNumber());
        }
        return "";
    }
}

