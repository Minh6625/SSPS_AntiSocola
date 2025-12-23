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
    private String status = "Active";  // Active, Inactive, Maintenance, Error, OutOfPaper, OutOfToner, OutOfBoth
    
    // Paper management
    @Column(name = "A4PaperRemaining")
    private Integer a4PaperRemaining = 500;  // Số tờ A4 còn lại
    
    @Column(name = "A3PaperRemaining")
    private Integer a3PaperRemaining = 250;  // Số tờ A3 còn lại
    
    @Column(name = "A4PaperCapacity")
    private Integer a4PaperCapacity = 500;  // Dung lượng khay A4
    
    @Column(name = "A3PaperCapacity")
    private Integer a3PaperCapacity = 250;  // Dung lượng khay A3
    
    // Toner management
    @Column(name = "TonerBlackRemaining")
    private Integer tonerBlackRemaining = 100;  // % mực đen còn lại
    
    @Column(name = "TonerCyanRemaining")
    private Integer tonerCyanRemaining = 100;  // % mực xanh
    
    @Column(name = "TonerMagentaRemaining")
    private Integer tonerMagentaRemaining = 100;  // % mực đỏ
    
    @Column(name = "TonerYellowRemaining")
    private Integer tonerYellowRemaining = 100;  // % mực vàng
    
    @Column(name = "TonerLastReplaced")
    private LocalDateTime tonerLastReplaced;  // Lần thay mực cuối
    
    // Reserved resources (for pending print jobs to prevent race conditions)
    @Column(name = "A4PaperReserved")
    private Integer a4PaperReserved = 0;  // Số tờ A4 đã được reserve cho các job pending
    
    @Column(name = "A3PaperReserved")
    private Integer a3PaperReserved = 0;  // Số tờ A3 đã được reserve cho các job pending
    
    @Column(name = "TonerBlackReserved")
    private Integer tonerBlackReserved = 0;  // % mực đen đã được reserve
    
    @Column(name = "TonerCyanReserved")
    private Integer tonerCyanReserved = 0;  // % mực xanh đã được reserve
    
    @Column(name = "TonerMagentaReserved")
    private Integer tonerMagentaReserved = 0;  // % mực đỏ đã được reserve
    
    @Column(name = "TonerYellowReserved")
    private Integer tonerYellowReserved = 0;  // % mực vàng đã được reserve
    
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
    
    /**
     * Get available A4 paper (remaining - reserved)
     */
    @Transient
    public int getA4PaperAvailable() {
        int remaining = (a4PaperRemaining != null) ? a4PaperRemaining : 0;
        int reserved = (a4PaperReserved != null) ? a4PaperReserved : 0;
        return Math.max(0, remaining - reserved);
    }
    
    /**
     * Get available A3 paper (remaining - reserved)
     */
    @Transient
    public int getA3PaperAvailable() {
        int remaining = (a3PaperRemaining != null) ? a3PaperRemaining : 0;
        int reserved = (a3PaperReserved != null) ? a3PaperReserved : 0;
        return Math.max(0, remaining - reserved);
    }
    
    /**
     * Get available black toner (remaining - reserved)
     */
    @Transient
    public int getTonerBlackAvailable() {
        int remaining = (tonerBlackRemaining != null) ? tonerBlackRemaining : 0;
        int reserved = (tonerBlackReserved != null) ? tonerBlackReserved : 0;
        return Math.max(0, remaining - reserved);
    }
    
    /**
     * Check if printer has enough paper for a job (checks AVAILABLE = remaining - reserved)
     */
    @Transient
    public boolean hasEnoughPaper(String paperSize, int sheets) {
        if ("A3".equalsIgnoreCase(paperSize)) {
            return getA3PaperAvailable() >= sheets;
        } else {
            return getA4PaperAvailable() >= sheets;
        }
    }
    
    /**
     * Check if printer has enough toner (checks AVAILABLE = remaining - reserved)
     */
    @Transient
    public boolean hasEnoughToner() {
        return getTonerBlackAvailable() > 5; // > 5%
    }
    
    /**
     * Reserve paper for a pending print job
     * This prevents race conditions when multiple users submit jobs simultaneously
     */
    @Transient
    public void reservePaper(String paperSize, int sheets) {
        if ("A3".equalsIgnoreCase(paperSize)) {
            a3PaperReserved = (a3PaperReserved != null ? a3PaperReserved : 0) + sheets;
        } else {
            a4PaperReserved = (a4PaperReserved != null ? a4PaperReserved : 0) + sheets;
        }
    }
    
    /**
     * Release paper reservation (when job completes or is cancelled)
     */
    @Transient
    public void releasePaperReserve(String paperSize, int sheets) {
        if ("A3".equalsIgnoreCase(paperSize)) {
            a3PaperReserved = Math.max(0, (a3PaperReserved != null ? a3PaperReserved : 0) - sheets);
        } else {
            a4PaperReserved = Math.max(0, (a4PaperReserved != null ? a4PaperReserved : 0) - sheets);
        }
    }
    
    /**
     * Reserve toner for a pending print job
     * Estimate: 1 page = 0.01% toner (1000 pages = 10% toner)
     */
    @Transient
    public void reserveToner(int pages, String colorMode) {
        int tonerPercent = (int) Math.ceil(pages * 0.01);
        
        if ("Color".equalsIgnoreCase(colorMode)) {
            tonerBlackReserved = (tonerBlackReserved != null ? tonerBlackReserved : 0) + tonerPercent;
            tonerCyanReserved = (tonerCyanReserved != null ? tonerCyanReserved : 0) + tonerPercent;
            tonerMagentaReserved = (tonerMagentaReserved != null ? tonerMagentaReserved : 0) + tonerPercent;
            tonerYellowReserved = (tonerYellowReserved != null ? tonerYellowReserved : 0) + tonerPercent;
        } else {
            tonerBlackReserved = (tonerBlackReserved != null ? tonerBlackReserved : 0) + tonerPercent;
        }
    }
    
    /**
     * Release toner reservation (when job completes or is cancelled)
     */
    @Transient
    public void releaseTonerReserve(int pages, String colorMode) {
        int tonerPercent = (int) Math.ceil(pages * 0.01);
        
        if ("Color".equalsIgnoreCase(colorMode)) {
            tonerBlackReserved = Math.max(0, (tonerBlackReserved != null ? tonerBlackReserved : 0) - tonerPercent);
            tonerCyanReserved = Math.max(0, (tonerCyanReserved != null ? tonerCyanReserved : 0) - tonerPercent);
            tonerMagentaReserved = Math.max(0, (tonerMagentaReserved != null ? tonerMagentaReserved : 0) - tonerPercent);
            tonerYellowReserved = Math.max(0, (tonerYellowReserved != null ? tonerYellowReserved : 0) - tonerPercent);
        } else {
            tonerBlackReserved = Math.max(0, (tonerBlackReserved != null ? tonerBlackReserved : 0) - tonerPercent);
        }
    }
    
    /**
     * Check if printer is available for printing
     */
    @Transient
    public boolean isAvailable() {
        return "Active".equals(status);
    }
    
    /**
     * Auto-update status based on paper and toner levels
     */
    @Transient
    public void updateStatusBasedOnSupplies() {
        boolean outOfPaper = (a4PaperRemaining <= 0 && a3PaperRemaining <= 0);
        boolean outOfToner = (tonerBlackRemaining <= 5);
        
        if (outOfPaper && outOfToner) {
            this.status = "OutOfBoth";
        } else if (outOfPaper) {
            this.status = "OutOfPaper";
        } else if (outOfToner) {
            this.status = "OutOfToner";
        } else if ("OutOfPaper".equals(this.status) || 
                   "OutOfToner".equals(this.status) || 
                   "OutOfBoth".equals(this.status)) {
            // Nếu đã được nạp lại, chuyển về Active
            this.status = "Active";
        }
    }
}

