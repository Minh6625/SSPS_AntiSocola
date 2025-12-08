package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ENTITY: PrinterMaintenance - Log bảo trì máy in
 */
@Entity
@Table(name = "PrinterMaintenance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrinterMaintenance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaintenanceID")
    private Integer maintenanceId;
    
    @Column(name = "PrinterID", nullable = false, length = 20)
    private String printerId;
    
    @Column(name = "MaintenanceDate", nullable = false)
    private LocalDate maintenanceDate;
    
    @Column(name = "MaintenanceType", nullable = false, length = 20)
    private String maintenanceType;  // Routine, Repair, Emergency, Upgrade
    
    @Column(name = "Description", length = 500)
    private String description;
    
    @Column(name = "Technician", length = 100)
    private String technician;
    
    @Column(name = "Cost", precision = 12, scale = 2)
    private BigDecimal cost;
    
    @Column(name = "DurationMinutes")
    private Integer durationMinutes;
    
    @Column(name = "PerformedBy", length = 20)
    private String performedBy;
    
    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PrinterID", insertable = false, updatable = false)
    private Printer printer;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
