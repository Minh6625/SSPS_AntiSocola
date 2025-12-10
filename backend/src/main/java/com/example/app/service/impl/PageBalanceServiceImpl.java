package com.example.app.service.impl;

import com.example.app.dto.PageBalanceResponseDTO;
import com.example.app.dto.PageTransactionDTO;
import com.example.app.dto.PageTransactionResponseDTO;
import com.example.app.entity.PageBalance;
import com.example.app.entity.PageTransaction;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.repository.PageTransactionRepository;
import com.example.app.service.interfaces.IPageBalanceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE IMPLEMENTATION: Quản lý số dư trang in
 * Business Logic: Lấy số dư từ Repository và convert sang DTO
 */
@Service
@Slf4j
public class PageBalanceServiceImpl implements IPageBalanceService {
    
    @Autowired
    private PageBalanceRepository pageBalanceRepository;
    
    @Autowired
    private PageTransactionRepository pageTransactionRepository;
    
    @Override
    public PageBalanceResponseDTO getPageBalance(String studentId) {
        log.info("Fetching page balance for student: {}", studentId);
        
        // Lấy số dư từ database
        PageBalance pageBalance = pageBalanceRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy số dư trang cho sinh viên: " + studentId));
        
        // Convert Entity → DTO
        return convertToResponseDTO(pageBalance);
    }
    
    @Override
    public PageTransactionResponseDTO getTransactionHistory(String studentId, Integer page, Integer size,
                                                            String type, String startDate, String endDate) {
        log.info("Fetching transaction history for student: {}, page: {}, size: {}, type: {}, startDate: {}, endDate: {}",
                studentId, page, size, type, startDate, endDate);
        
        // Validate pagination params
        if (page == null || page < 0) page = 0;
        if (size == null || size <= 0) size = 10;
        
        Pageable pageable = PageRequest.of(page, size);
        Page<PageTransaction> transactionPage;
        
        // Query based on filters
        if (type != null && !type.isEmpty() && startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            // Filter by type AND date range
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
            transactionPage = pageTransactionRepository.findByStudentIdTypeAndDateRange(studentId, type, start, end, pageable);
        } else if (type != null && !type.isEmpty()) {
            // Filter by type only
            transactionPage = pageTransactionRepository.findByStudentIdAndType(studentId, type, pageable);
        } else if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            // Filter by date range only
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
            transactionPage = pageTransactionRepository.findByStudentIdAndDateRange(studentId, start, end, pageable);
        } else {
            // No filters - get all transactions
            transactionPage = pageTransactionRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable);
        }
        
        // Convert to DTO
        List<PageTransactionDTO> dtoList = transactionPage.getContent()
                .stream()
                .map(this::convertTransactionToDTO)
                .collect(Collectors.toList());
        
        return new PageTransactionResponseDTO(
            dtoList,
            (int) transactionPage.getTotalElements(),
            transactionPage.getTotalPages(),
            page,
            size
        );
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
    
    /**
     * Convert PageTransaction Entity → PageTransactionDTO
     */
    private PageTransactionDTO convertTransactionToDTO(PageTransaction transaction) {
        // Tính tổng trang A4 tương đương
        Integer totalPages = transaction.getA4Pages() + (transaction.getA3Pages() * 2);
        
        return new PageTransactionDTO(
            transaction.getTransactionId(),
            transaction.getTransactionType(),
            totalPages,
            transaction.getA3Pages(),
            transaction.getNotes(),
            transaction.getCreatedAt()
        );
    }
}
