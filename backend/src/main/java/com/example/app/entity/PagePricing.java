package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ENTITY: PagePricing - Bảng giá trang in
 */
@Entity
@Table(name = "PagePricing")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagePricing {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PricingID")
    private Integer pricingId;
    
    @Column(name = "PaperSize", nullable = false, length = 10)
    private String paperSize;  // A4, A3, A5
    
    @Column(name = "PricePerPage", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerPage;
    
    @Column(name = "Currency", nullable = false, length = 10)
    private String currency = "VND";
    
    @Column(name = "EffectiveFrom", nullable = false)
    private LocalDate effectiveFrom;
    
    @Column(name = "EffectiveTo")
    private LocalDate effectiveTo;
    
    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "Notes", length = 255)
    private String notes;
}
