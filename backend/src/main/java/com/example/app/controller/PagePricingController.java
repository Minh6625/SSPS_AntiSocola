package com.example.app.controller;

import com.example.app.dto.PagePricingResponseDTO;
import com.example.app.service.interfaces.IPagePricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST CONTROLLER: PagePricing
 * API endpoints for page pricing management
 */
@RestController
@RequestMapping("/api/page-pricing")
@RequiredArgsConstructor
@Tag(name = "Page Pricing", description = "API quản lý bảng giá trang in")
public class PagePricingController {
    
    private final IPagePricingService pagePricingService;
    
    /**
     * GET /api/page-pricing
     * Lấy tất cả giá đang active
     */
    @GetMapping
    @Operation(summary = "Lấy tất cả giá trang in", description = "Trả về danh sách giá trang in đang có hiệu lực")
    public ResponseEntity<List<PagePricingResponseDTO>> getAllActivePricing() {
        List<PagePricingResponseDTO> pricings = pagePricingService.getAllActivePricing();
        return ResponseEntity.ok(pricings);
    }
    
    /**
     * GET /api/page-pricing/{paperSize}
     * Lấy giá theo paper size
     */
    @GetMapping("/{paperSize}")
    @Operation(summary = "Lấy giá theo kích thước", description = "Lấy giá trang in theo kích thước giấy")
    public ResponseEntity<PagePricingResponseDTO> getPricing(@PathVariable String paperSize) {
        PagePricingResponseDTO pricing = pagePricingService.getPricing(paperSize.toUpperCase());
        return ResponseEntity.ok(pricing);
    }
}
