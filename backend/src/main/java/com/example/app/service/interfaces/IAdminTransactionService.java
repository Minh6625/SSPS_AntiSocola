package com.example.app.service.interfaces;

import com.example.app.dto.AdminTransactionDTO;
import com.example.app.dto.AdminTransactionResponseDTO;

/**
 * Service Interface: Quản lý giao dịch cho SPSO
 */
public interface IAdminTransactionService {
    
    /**
     * Lấy danh sách tất cả giao dịch với filter và pagination
     * @param page - số trang (0-indexed)
     * @param size - số item mỗi trang
     * @param keyword - từ khóa tìm kiếm (mã giao dịch, mã sinh viên)
     * @param type - loại giao dịch (Allocate, Purchase, Use)
     * @param startDate - ngày bắt đầu (format: yyyy-MM-dd)
     * @param endDate - ngày kết thúc (format: yyyy-MM-dd)
     * @return AdminTransactionResponseDTO
     */
    AdminTransactionResponseDTO getAllTransactions(Integer page, Integer size, String keyword,
                                                   String type, String startDate, String endDate);
    
    /**
     * Lấy chi tiết một giao dịch
     * @param transactionId - ID giao dịch
     * @return AdminTransactionDTO
     */
    AdminTransactionDTO getTransactionById(Integer transactionId);
    
    /**
     * Lấy thống kê giao dịch
     * @return AdminTransactionResponseDTO với thống kê
     */
    AdminTransactionResponseDTO getTransactionStats();
}
