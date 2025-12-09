package com.example.app.service.interfaces;

import com.example.app.dto.PageBalanceResponseDTO;

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
}
