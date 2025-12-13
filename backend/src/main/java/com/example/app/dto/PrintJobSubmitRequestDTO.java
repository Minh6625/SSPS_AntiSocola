package com.example.app.dto;

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
    private Integer documentId;
    private String printerId;
    private String paperSize;          // A4, A3
    private String pageRange;          // "1-5,10,15-20" hoặc null (all pages)
    private Boolean duplex;            // true: 2 mặt, false: 1 mặt
    private Integer copies;            // số bản copy (1-10)
    private String colorMode;          // BlackWhite, Color, Grayscale
    private String colorPageRange;     // Trang in màu (khi colorMode = BlackWhite)
}
