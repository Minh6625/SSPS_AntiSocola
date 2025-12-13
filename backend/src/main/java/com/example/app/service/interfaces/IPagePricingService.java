package com.example.app.service.interfaces;

import com.example.app.dto.PagePricingResponseDTO;

import java.util.List;

/**
 * Service Interface: Quản lý bảng giá trang in
 */
public interface IPagePricingService {
    
    /**
     * Lấy tất cả giá đang active
     */
    List<PagePricingResponseDTO> getAllActivePricing();
    
    /**
     * Lấy giá theo paper size
     */
    PagePricingResponseDTO getPricing(String paperSize);
}
