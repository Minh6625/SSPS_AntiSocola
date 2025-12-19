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
    private Integer totalPagesPrinted;
    private LocalDate lastMaintenanceDate;
    private LocalDateTime createdAt;

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
}
