package com.example.app.service.interfaces;

import com.example.app.dto.PageBalanceResponseDTO;
import com.example.app.dto.PageTransactionResponseDTO;
import com.example.app.dto.PurchasePagesResponseDTO;

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
    
    /**
     * Mua thêm trang in
     * @param studentId - ID sinh viên
     * @param pages - số trang A4 muốn mua
     * @return PurchasePagesResponseDTO
     */
    PurchasePagesResponseDTO purchasePages(String studentId, Integer pages);
    
    /**
     * Trừ số dư trang (khi in)
     * @param studentId ID sinh viên
     * @param a4Pages Số trang A4 cần trừ
     * @param a3Pages Số trang A3 cần trừ
     */
    void deductBalance(String studentId, int a4Pages, int a3Pages);
    
    /**
     * Cộng thêm số dư trang (khi mua)
     * @param studentId ID sinh viên
     * @param a4Pages Số trang A4 cần cộng
     * @param a3Pages Số trang A3 cần cộng
     */
    void addBalance(String studentId, int a4Pages, int a3Pages);
    
    /**
     * Kiểm tra có đủ số dư không
     * @param studentId ID sinh viên
     * @param a4Pages Số trang A4 cần kiểm tra
     * @param a3Pages Số trang A3 cần kiểm tra
     * @return true nếu đủ số dư
     */
    boolean hasSufficientBalance(String studentId, int a4Pages, int a3Pages);
}
