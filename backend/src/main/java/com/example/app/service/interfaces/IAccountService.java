package com.example.app.service.interfaces;

import com.example.app.dto.*;
import org.springframework.data.domain.Page;

/**
 * ACCOUNT SERVICE INTERFACE
 * Định nghĩa Contract cho Business Logic Layer - Quản lý tài khoản
 * Chỉ SPSO có quyền gọi các method này
 */
public interface IAccountService {
    
    /**
     * Lấy danh sách tài khoản với filter (tất cả roles)
     * @param filter Điều kiện tìm kiếm
     * @return Danh sách tài khoản phân trang
     */
    Page<AccountListDTO> getAccountList(AccountFilterDTO filter);
    
    /**
     * Lấy chi tiết tài khoản
     * @param userId User ID
     * @return Chi tiết tài khoản
     */
    AccountDetailDTO getAccountDetail(String userId);
    
    /**
     * Tạo tài khoản mới
     * @param request Thông tin tài khoản
     * @return Thông tin tài khoản đã tạo
     */
    CreateAccountResponseDTO createAccount(CreateAccountRequestDTO request);
    
    /**
     * Cập nhật trạng thái tài khoản (Active/Inactive/Suspended)
     * @param request Thông tin cập nhật
     * @return Thông tin sau khi cập nhật
     */
    UpdateStatusResponseDTO updateAccountStatus(UpdateAccountStatusRequestDTO request);
    
    /**
     * Đổi role cho tài khoản
     * @param request Thông tin đổi role
     * @return Thông tin sau khi đổi role
     */
    UpdateAccountRoleResponseDTO updateAccountRole(UpdateAccountRoleRequestDTO request);
    
    /**
     * Cấp trang miễn phí cho sinh viên
     * @param request Thông tin cấp trang
     * @return Thông tin sau khi cấp trang
     */
    AllocatePageResponseDTO allocatePages(AllocatePageRequestDTO request);
    
    /**
     * Lấy lịch sử in của sinh viên
     * @param userId User ID (phải là Student)
     * @param pageNumber Trang
     * @param pageSize Số bản ghi/trang
     * @return Danh sách lịch sử in
     */
    Page<PrintLogDTO> getAccountPrintHistory(String userId, Integer pageNumber, Integer pageSize);
    
    /**
     * Xóa tài khoản (Soft delete - chỉ đổi status)
     * @param userId User ID
     */
    void deleteAccount(String userId);
}
