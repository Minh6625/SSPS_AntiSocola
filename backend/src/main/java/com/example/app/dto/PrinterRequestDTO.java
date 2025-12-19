package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * DTO: Printer request for CREATE and UPDATE operations
 */
public class PrinterRequestDTO {
    
    @NotBlank(message = "Tên máy in không được để trống")
    private String printerName;
    
    @NotNull(message = "Brand ID không được để trống")
    private Long brandId;
    
    @NotNull(message = "Model ID không được để trống")
    private Long modelId;
    
    @NotNull(message = "Room ID không được để trống")
    private Long roomId;
    
    private String ipAddress;
    private String paperSizes;
    private Boolean colorPrinting;
    private Boolean duplexPrinting;
    private String status;
    private LocalDate lastMaintenanceDate;

    // Getters and Setters
    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public Long getBrandId() {
        return brandId;
    }

    public void setBrandId(Long brandId) {
        this.brandId = brandId;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getPaperSizes() {
        return paperSizes;
    }

    public void setPaperSizes(String paperSizes) {
        this.paperSizes = paperSizes;
    }

    public Boolean getColorPrinting() {
        return colorPrinting;
    }

    public void setColorPrinting(Boolean colorPrinting) {
        this.colorPrinting = colorPrinting;
    }

    public Boolean getDuplexPrinting() {
        return duplexPrinting;
    }

    public void setDuplexPrinting(Boolean duplexPrinting) {
        this.duplexPrinting = duplexPrinting;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getLastMaintenanceDate() {
        return lastMaintenanceDate;
    }

    public void setLastMaintenanceDate(LocalDate lastMaintenanceDate) {
        this.lastMaintenanceDate = lastMaintenanceDate;
    }
}
