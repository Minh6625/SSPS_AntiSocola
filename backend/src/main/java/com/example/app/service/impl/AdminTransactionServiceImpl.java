package com.example.app.service.impl;

import com.example.app.dto.AdminTransactionDTO;
import com.example.app.dto.AdminTransactionResponseDTO;
import com.example.app.entity.PageTransaction;
import com.example.app.entity.User;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.PageTransactionRepository;
import com.example.app.repository.UserRepository;
import com.example.app.service.interfaces.IAdminTransactionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE IMPLEMENTATION: Quản lý giao dịch cho SPSO
 */
@Service
@Slf4j
@Transactional(readOnly = true)
public class AdminTransactionServiceImpl implements IAdminTransactionService {
    
    @Autowired
    private PageTransactionRepository pageTransactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public AdminTransactionResponseDTO getAllTransactions(Integer page, Integer size, String keyword,
                                                          String type, String startDate, String endDate) {
        log.info("Fetching all transactions - page: {}, size: {}, keyword: {}, type: {}, startDate: {}, endDate: {}",
                page, size, keyword, type, startDate, endDate);
        
        // Validate pagination params
        if (page == null || page < 0) page = 0;
        if (size == null || size <= 0) size = 10;
        
        Pageable pageable = PageRequest.of(page, size);
        Page<PageTransaction> transactionPage;
        
        // Parse dates if provided
        LocalDateTime start = null;
        LocalDateTime end = null;
        if (startDate != null && !startDate.isEmpty()) {
            start = LocalDate.parse(startDate).atStartOfDay();
        }
        if (endDate != null && !endDate.isEmpty()) {
            end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
        }
        
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasType = type != null && !type.trim().isEmpty();
        boolean hasDateRange = start != null && end != null;
        
        // Query based on filters
        if (hasKeyword && hasType && hasDateRange) {
            transactionPage = pageTransactionRepository.searchByKeywordTypeAndDateRange(
                keyword.trim(), type, start, end, pageable);
        } else if (hasKeyword && hasType) {
            transactionPage = pageTransactionRepository.searchByKeywordAndType(keyword.trim(), type, pageable);
        } else if (hasKeyword && hasDateRange) {
            transactionPage = pageTransactionRepository.searchByKeywordAndDateRange(
                keyword.trim(), start, end, pageable);
        } else if (hasType && hasDateRange) {
            transactionPage = pageTransactionRepository.findByTypeAndDateRange(type, start, end, pageable);
        } else if (hasKeyword) {
            transactionPage = pageTransactionRepository.searchByKeyword(keyword.trim(), pageable);
        } else if (hasType) {
            transactionPage = pageTransactionRepository.findByTransactionType(type, pageable);
        } else if (hasDateRange) {
            transactionPage = pageTransactionRepository.findByDateRange(start, end, pageable);
        } else {
            transactionPage = pageTransactionRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        
        // Convert to DTO
        List<AdminTransactionDTO> dtoList = transactionPage.getContent()
                .stream()
                .map(this::convertToAdminDTO)
                .collect(Collectors.toList());
        
        AdminTransactionResponseDTO response = new AdminTransactionResponseDTO(
            dtoList,
            (int) transactionPage.getTotalElements(),
            transactionPage.getTotalPages(),
            page,
            size
        );
        
        // Add statistics
        response.setTotalAllocateTransactions(pageTransactionRepository.countByTransactionType("Allocate"));
        response.setTotalPurchaseTransactions(pageTransactionRepository.countByTransactionType("Purchase"));
        response.setTotalUseTransactions(pageTransactionRepository.countByTransactionType("Use"));
        
        return response;
    }
    
    @Override
    public AdminTransactionDTO getTransactionById(Integer transactionId) {
        log.info("Fetching transaction by ID: {}", transactionId);
        
        PageTransaction transaction = pageTransactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch với ID: " + transactionId));
        
        return convertToAdminDTO(transaction);
    }
    
    @Override
    public AdminTransactionResponseDTO getTransactionStats() {
        log.info("Fetching transaction statistics");
        
        AdminTransactionResponseDTO response = new AdminTransactionResponseDTO();
        response.setTotalAllocateTransactions(pageTransactionRepository.countByTransactionType("Allocate"));
        response.setTotalPurchaseTransactions(pageTransactionRepository.countByTransactionType("Purchase"));
        response.setTotalUseTransactions(pageTransactionRepository.countByTransactionType("Use"));
        response.setTotalElements((int) pageTransactionRepository.count());
        
        return response;
    }
    
    /**
     * Convert PageTransaction Entity → AdminTransactionDTO
     */
    private AdminTransactionDTO convertToAdminDTO(PageTransaction transaction) {
        // Lấy thông tin sinh viên
        String studentName = null;
        String studentEmail = null;
        
        try {
            User student = userRepository.findById(transaction.getStudentId()).orElse(null);
            if (student != null) {
                studentName = student.getFullName();
                studentEmail = student.getEmail();
            }
        } catch (Exception e) {
            log.warn("Could not fetch student info for ID: {}", transaction.getStudentId());
        }
        
        return new AdminTransactionDTO(
            transaction.getTransactionId(),
            transaction.getTransactionCode(),
            transaction.getStudentId(),
            studentName,
            studentEmail,
            transaction.getTransactionType(),
            transaction.getA4Pages(),
            transaction.getBalanceAfterA4(),
            transaction.getAmount(),
            transaction.getPaymentMethod(),
            transaction.getTransactionStatus(),
            transaction.getSemester(),
            transaction.getNotes(),
            transaction.getCreatedAt(),
            transaction.getCreatedBy()
        );
    }
}
