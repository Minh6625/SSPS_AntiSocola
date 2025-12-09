package com.example.app.service.impl;

import com.example.app.dto.PageBalanceResponseDTO;
import com.example.app.entity.PageBalance;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.service.interfaces.IPageBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * SERVICE IMPLEMENTATION: Quản lý số dư trang in
 * Business Logic: Lấy số dư từ Repository và convert sang DTO
 */
@Service
public class PageBalanceServiceImpl implements IPageBalanceService {
    
    @Autowired
    private PageBalanceRepository pageBalanceRepository;
    
    @Override
    public PageBalanceResponseDTO getPageBalance(String studentId) {
        // Lấy số dư từ database
        PageBalance pageBalance = pageBalanceRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy số dư trang cho sinh viên: " + studentId));
        
        // Convert Entity → DTO
        return convertToResponseDTO(pageBalance);
    }
    
    /**
     * Convert PageBalance Entity → PageBalanceResponseDTO
     * Tính toán totalA4Equivalent = A4Balance + (A3Balance * 2)
     */
    private PageBalanceResponseDTO convertToResponseDTO(PageBalance pageBalance) {
        Integer totalA4Equivalent = pageBalance.getA4Balance() + (pageBalance.getA3Balance() * 2);
        
        return new PageBalanceResponseDTO(
            pageBalance.getA4Balance(),
            pageBalance.getA3Balance(),
            totalA4Equivalent,
            pageBalance.getLastUpdated()
        );
    }
}
