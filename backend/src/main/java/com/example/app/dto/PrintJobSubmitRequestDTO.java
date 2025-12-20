package com.example.app.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * DTO: Print Job Submit Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrintJobSubmitRequestDTO {
    @NotNull(message = "Document ID không được để trống")
    private Integer documentId;
    
    @NotNull(message = "Printer ID không được để trống")
    private Long printerId;
    
    @NotNull(message = "Paper size không được để trống")
    private String paperSize;          // A4, A3
    
    private String pageRange;          // "1-5,10,15-20" hoặc null (all pages)
    
    @NotNull(message = "Duplex không được để trống")
    private Boolean duplex;            // true: 2 mặt, false: 1 mặt
    
    @NotNull(message = "Số bản copy không được để trống")
    @Min(value = 1, message = "Số bản copy phải từ 1 đến 10")
    @Max(value = 10, message = "Số bản copy phải từ 1 đến 10")
    private Integer copies;            // số bản copy (1-10)
    
    private String colorMode;          // BlackWhite, Color, Grayscale
    private String colorPageRange;     // Trang in màu (khi colorMode = BlackWhite)
}
