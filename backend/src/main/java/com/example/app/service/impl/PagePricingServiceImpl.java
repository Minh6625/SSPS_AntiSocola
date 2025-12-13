package com.example.app.service.impl;

import com.example.app.dto.PagePricingResponseDTO;
import com.example.app.entity.PagePricing;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.PagePricingRepository;
import com.example.app.service.interfaces.IPagePricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE IMPLEMENTATION: PagePricing
 */
@Service
@Transactional
@RequiredArgsConstructor
public class PagePricingServiceImpl implements IPagePricingService {
    
    private final PagePricingRepository pagePricingRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<PagePricingResponseDTO> getAllActivePricing() {
        List<PagePricing> pricings = pagePricingRepository.findAllActivePricing();
        
        return pricings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PagePricingResponseDTO getPricing(String paperSize) {
        PagePricing pricing = pagePricingRepository.findActivePricing(paperSize)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy giá cho " + paperSize));
        
        return convertToDTO(pricing);
    }
    
    /**
     * Convert Entity to DTO
     */
    private PagePricingResponseDTO convertToDTO(PagePricing pricing) {
        return new PagePricingResponseDTO(
                pricing.getPaperSize(),
                pricing.getPricePerPage(),
                pricing.getCurrency(),
                pricing.getNotes()
        );
    }
}
