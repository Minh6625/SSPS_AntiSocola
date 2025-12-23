package com.example.app.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO: Printer information for list endpoints.
 */
public class PrinterResponseDTO {
    private Long printerId;
    private String printerName;
    private String brand;
    private String model;
    private String location;
    private String campus;
    private String building;
    private String roomNumber;
    private String ipAddress;
    private String paperSizes;
    private Boolean colorPrinting;
    private Boolean duplexPrinting;
    private String status;
    private String statusMessage; // Human-readable status message
    private Integer totalPagesPrinted;
    private LocalDate lastMaintenanceDate;
    private LocalDateTime createdAt;
    
    // Paper supplies
    private Integer a4PaperRemaining;
    private Integer a3PaperRemaining;
    private Integer a4PaperCapacity;
    private Integer a3PaperCapacity;
    
    // Toner supplies
    private Integer tonerBlackRemaining;
    private Integer tonerCyanRemaining;
    private Integer tonerMagentaRemaining;
    private Integer tonerYellowRemaining;
    private LocalDateTime tonerLastReplaced;

    public Long getPrinterId() {
        return printerId;
    }

    public void setPrinterId(Long printerId) {
        this.printerId = printerId;
    }

    public String getPrinterName() {
        return printerName;
    }

    public void setPrinterName(String printerName) {
        this.printerName = printerName;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCampus() {
        return campus;
    }

    public void setCampus(String campus) {
        this.campus = campus;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
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

    public Integer getTotalPagesPrinted() {
        return totalPagesPrinted;
    }

    public void setTotalPagesPrinted(Integer totalPagesPrinted) {
        this.totalPagesPrinted = totalPagesPrinted;
    }

    public LocalDate getLastMaintenanceDate() {
        return lastMaintenanceDate;
    }

    public void setLastMaintenanceDate(LocalDate lastMaintenanceDate) {
        this.lastMaintenanceDate = lastMaintenanceDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public Integer getA4PaperRemaining() {
        return a4PaperRemaining;
    }

    public void setA4PaperRemaining(Integer a4PaperRemaining) {
        this.a4PaperRemaining = a4PaperRemaining;
    }

    public Integer getA3PaperRemaining() {
        return a3PaperRemaining;
    }

    public void setA3PaperRemaining(Integer a3PaperRemaining) {
        this.a3PaperRemaining = a3PaperRemaining;
    }

    public Integer getA4PaperCapacity() {
        return a4PaperCapacity;
    }

    public void setA4PaperCapacity(Integer a4PaperCapacity) {
        this.a4PaperCapacity = a4PaperCapacity;
    }

    public Integer getA3PaperCapacity() {
        return a3PaperCapacity;
    }

    public void setA3PaperCapacity(Integer a3PaperCapacity) {
        this.a3PaperCapacity = a3PaperCapacity;
    }

    public Integer getTonerBlackRemaining() {
        return tonerBlackRemaining;
    }

    public void setTonerBlackRemaining(Integer tonerBlackRemaining) {
        this.tonerBlackRemaining = tonerBlackRemaining;
    }

    public Integer getTonerCyanRemaining() {
        return tonerCyanRemaining;
    }

    public void setTonerCyanRemaining(Integer tonerCyanRemaining) {
        this.tonerCyanRemaining = tonerCyanRemaining;
    }

    public Integer getTonerMagentaRemaining() {
        return tonerMagentaRemaining;
    }

    public void setTonerMagentaRemaining(Integer tonerMagentaRemaining) {
        this.tonerMagentaRemaining = tonerMagentaRemaining;
    }

    public Integer getTonerYellowRemaining() {
        return tonerYellowRemaining;
    }

    public void setTonerYellowRemaining(Integer tonerYellowRemaining) {
        this.tonerYellowRemaining = tonerYellowRemaining;
    }

    public LocalDateTime getTonerLastReplaced() {
        return tonerLastReplaced;
    }

    public void setTonerLastReplaced(LocalDateTime tonerLastReplaced) {
        this.tonerLastReplaced = tonerLastReplaced;
    }
}
