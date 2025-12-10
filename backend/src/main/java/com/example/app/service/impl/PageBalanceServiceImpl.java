package com.example.app.service.impl;

import com.example.app.dto.PageBalanceResponseDTO;
import com.example.app.dto.PageTransactionDTO;
import com.example.app.dto.PageTransactionResponseDTO;
import com.example.app.dto.PurchasePagesRequestDTO;
import com.example.app.dto.PurchasePagesResponseDTO;
import com.example.app.entity.PageBalance;
import com.example.app.entity.PageTransaction;
import com.example.app.entity.User;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.exception.BusinessException;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.repository.PageTransactionRepository;
import com.example.app.repository.UserRepository;
import com.example.app.service.interfaces.IPageBalanceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    
    @Autowired
    private UserRepository userRepository;
    
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
        return new PageTransactionDTO(
            transaction.getTransactionId(),
            transaction.getTransactionType(),
            transaction.getA4Pages(),
            transaction.getA3Pages(),
            0,  // balanceAfter - không sử dụng
            transaction.getNotes(),
            transaction.getCreatedAt()
        );
    }
    
    @Override
    @Transactional
    public PurchasePagesResponseDTO purchasePages(String studentId, Integer pages) {
        log.info("Processing purchase pages for student: {}, pages: {}", studentId, pages);
        
        // Validate input
        if (pages == null || pages <= 0) {
            throw new BusinessException("Số trang phải lớn hơn 0");
        }
        
        // Lấy số dư hiện tại
        PageBalance pageBalance = pageBalanceRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy số dư trang cho sinh viên: " + studentId));
        
        // Tính giá (500 VND/trang A4)
        Integer pricePerPage = 500;
        BigDecimal totalPrice = BigDecimal.valueOf(pages * pricePerPage);
        
        log.info("Purchase details - Pages: {}, Price per page: {}, Total: {}", pages, pricePerPage, totalPrice);
        
        // Mock payment - Giả sử thanh toán thành công
        boolean paymentSuccess = true;
        if (!paymentSuccess) {
            throw new BusinessException("Thanh toán thất bại. Vui lòng thử lại.");
        }
        
        // Cập nhật số dư (thêm trang A4)
        pageBalance.setA4Balance(pageBalance.getA4Balance() + pages);
        pageBalance.setLastUpdated(LocalDateTime.now());
        pageBalanceRepository.save(pageBalance);
        
        log.info("Balance updated - New A4 balance: {}", pageBalance.getA4Balance());
        
        // Tạo transaction record
        PageTransaction transaction = new PageTransaction();
        transaction.setStudentId(studentId);
        transaction.setTransactionType("Purchase");  // Phải là "Purchase" không phải "PURCHASED"
        transaction.setA4Pages(pages);
        transaction.setA3Pages(0);
        transaction.setAmount(totalPrice);
        transaction.setPaymentMethod("SIUPay");
        transaction.setTransactionStatus("Completed");
        transaction.setNotes("Mua " + pages + " trang A4 với giá " + totalPrice + " VND");
        transaction.setCreatedBy(studentId);
        pageTransactionRepository.save(transaction);
        
        log.info("Transaction created - ID: {}", transaction.getTransactionId());
        
        // Tính A4 tương đương
        Integer totalA4Equivalent = pageBalance.getA4Balance() + (pageBalance.getA3Balance() * 2);
        
        // Trả về response
        return new PurchasePagesResponseDTO(
            "Mua trang in thành công! Đã thêm " + pages + " trang A4 vào tài khoản của bạn.",
            pageBalance.getA4Balance(),
            pageBalance.getA3Balance(),
            totalA4Equivalent,
            totalPrice,
            pages
        );
    }
    
    @Override
    @Transactional
    public void deductBalance(String studentId, int a4Pages, int a3Pages) {
        PageBalance balance = pageBalanceRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy số dư trang của sinh viên"));
        
        if (balance.getA4Balance() < a4Pages) {
            throw new RuntimeException("Không đủ số dư trang A4");
        }
        
        if (balance.getA3Balance() < a3Pages) {
            throw new RuntimeException("Không đủ số dư trang A3");
        }
        
        balance.setA4Balance(balance.getA4Balance() - a4Pages);
        balance.setA3Balance(balance.getA3Balance() - a3Pages);
        pageBalanceRepository.save(balance);
    }
    
    @Override
    @Transactional
    public void addBalance(String studentId, int a4Pages, int a3Pages) {
        PageBalance balance = pageBalanceRepository.findByStudentId(studentId)
                .orElseGet(() -> createDefaultBalance(studentId));
        
        balance.setA4Balance(balance.getA4Balance() + a4Pages);
        balance.setA3Balance(balance.getA3Balance() + a3Pages);
        pageBalanceRepository.save(balance);
    }
    
    @Override
    public boolean hasSufficientBalance(String studentId, int a4Pages, int a3Pages) {
        PageBalance balance = pageBalanceRepository.findByStudentId(studentId)
                .orElse(null);
        
        if (balance == null) {
            return false;
        }
        
        return balance.getA4Balance() >= a4Pages && balance.getA3Balance() >= a3Pages;
    }
    
    /**
     * Tạo số dư mặc định cho sinh viên mới
     * Mặc định: 100 trang A4, 50 trang A3
     */
    private PageBalance createDefaultBalance(String studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));
        
        PageBalance balance = new PageBalance();
        balance.setStudentId(studentId);
        balance.setStudent(student);
        balance.setA4Balance(100); // Số dư mặc định
        balance.setA3Balance(50);  // Số dư mặc định
        balance.setLastUpdated(LocalDateTime.now());
        
        return pageBalanceRepository.save(balance);
    }
}
