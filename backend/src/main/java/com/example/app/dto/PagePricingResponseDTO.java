package com.example.app.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO: Page Pricing Response
 * Response data for pricing information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagePricingResponseDTO {
    private String paperSize;           // A4, A3, A5
    private BigDecimal pricePerPage;    // Giá mỗi trang
    private String currency;            // VND
    private String notes;               // Ghi chú
}
