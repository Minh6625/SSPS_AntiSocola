package com.example.app.service.impl;

import com.example.app.dto.PagePricingResponseDTO;
import com.example.app.entity.PagePricing;
import com.example.app.entity.SystemConfig;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.PagePricingRepository;
import com.example.app.repository.SystemConfigRepository;
import com.example.app.service.interfaces.IPagePricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE IMPLEMENTATION: PagePricing
 * Lấy giá từ SystemConfig (a4_price_per_page)
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PagePricingServiceImpl implements IPagePricingService {
    
    private final PagePricingRepository pagePricingRepository;
    private final SystemConfigRepository systemConfigRepository;
    
    private static final String CONFIG_A4_PRICE = "a4_price_per_page";
    private static final BigDecimal DEFAULT_A4_PRICE = new BigDecimal("500");
    
    @Override
    @Transactional(readOnly = true)
    public List<PagePricingResponseDTO> getAllActivePricing() {
        // Lấy giá A4 từ SystemConfig
        BigDecimal a4Price = getA4PriceFromConfig();
        
        List<PagePricingResponseDTO> result = new ArrayList<>();
        
        // A4 pricing từ config
        result.add(new PagePricingResponseDTO(
                "A4",
                a4Price,
                "VND",
                "Giá mỗi trang A4 (từ cấu hình hệ thống)"
        ));
        
        // A3 = 2x A4
        result.add(new PagePricingResponseDTO(
                "A3",
                a4Price.multiply(new BigDecimal("2")),
                "VND",
                "Giá mỗi trang A3 (= 2 trang A4)"
        ));
        
        return result;
    }
    
    @Override
    @Transactional(readOnly = true)
    public PagePricingResponseDTO getPricing(String paperSize) {
        BigDecimal a4Price = getA4PriceFromConfig();
        
        if ("A4".equalsIgnoreCase(paperSize)) {
            return new PagePricingResponseDTO(
                    "A4",
                    a4Price,
                    "VND",
                    "Giá mỗi trang A4 (từ cấu hình hệ thống)"
            );
        } else if ("A3".equalsIgnoreCase(paperSize)) {
            return new PagePricingResponseDTO(
                    "A3",
                    a4Price.multiply(new BigDecimal("2")),
                    "VND",
                    "Giá mỗi trang A3 (= 2 trang A4)"
            );
        }
        
        throw new ResourceNotFoundException("Không tìm thấy giá cho " + paperSize);
    }
    
    /**
     * Lấy giá A4 từ SystemConfig
     */
    private BigDecimal getA4PriceFromConfig() {
        try {
            return systemConfigRepository.findByConfigKey(CONFIG_A4_PRICE)
                    .map(config -> new BigDecimal(config.getConfigValue()))
                    .orElse(DEFAULT_A4_PRICE);
        } catch (Exception e) {
            log.warn("Error reading A4 price from config, using default: {}", e.getMessage());
            return DEFAULT_A4_PRICE;
        }
    }
}
