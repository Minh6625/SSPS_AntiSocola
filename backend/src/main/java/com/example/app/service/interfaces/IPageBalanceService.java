package com.example.app.service.interfaces;

import com.example.app.dto.PageBalanceResponseDTO;
import com.example.app.dto.PageTransactionResponseDTO;

/**
 * Service Interface: Quản lý số dư trang in
 */
public interface IPageBalanceService {
    
    /**
     * Lấy số dư trang của sinh viên hiện tại
     * @param studentId - ID sinh viên
     * @return PageBalanceResponseDTO
     */
    PageBalanceResponseDTO getPageBalance(String studentId);
    
    /**
     * Lấy lịch sử giao dịch trang in
     * @param studentId - ID sinh viên
     * @param page - số trang (0-indexed)
     * @param size - số item mỗi trang
     * @param type - loại giao dịch (ALLOCATED, PURCHASED, DEDUCTED) - optional
     * @param startDate - ngày bắt đầu (format: yyyy-MM-dd) - optional
     * @param endDate - ngày kết thúc (format: yyyy-MM-dd) - optional
     * @return PageTransactionResponseDTO
     */
    PageTransactionResponseDTO getTransactionHistory(String studentId, Integer page, Integer size, 
                                                      String type, String startDate, String endDate);
}
