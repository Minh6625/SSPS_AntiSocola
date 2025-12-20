package com.example.app.service.interfaces;

import com.example.app.dto.*;
import org.springframework.data.domain.Page;

/**
 * STUDENT SERVICE INTERFACE
 * Định nghĩa Contract cho Business Logic Layer
 * Chỉ SPSO có quyền gọi các method này
 */
public interface IStudentService {
    
    /**
     * Lấy danh sách sinh viên với filter
     * @param filter Điều kiện tìm kiếm
     * @return Danh sách sinh viên phân trang
     */
    Page<StudentListDTO> getStudentList(StudentFilterDTO filter);
    
    /**
     * Lấy chi tiết sinh viên
     * @param studentId MSSV
     * @return Chi tiết sinh viên kèm thông tin trang in
     */
    StudentDetailDTO getStudentDetail(String studentId);
    
    /**
     * Cấp trang miễn phí cho sinh viên
     * @param request Thông tin cấp trang
     * @return Thông tin sau khi cấp trang
     */
    AllocatePageResponseDTO allocatePages(AllocatePageRequestDTO request);
    
    /**
     * Cập nhật trạng thái sinh viên (Active/Inactive/Suspended)
     * @param request Thông tin cập nhật
     * @return Thông tin sau khi cập nhật
     */
    UpdateStatusResponseDTO updateStudentStatus(UpdateStudentStatusRequestDTO request);
    
    /**
     * Lấy lịch sử in của sinh viên
     * @param studentId MSSV
     * @param pageNumber Trang
     * @param pageSize Số bản ghi/trang
     * @return Danh sách lịch sử in
     */
    Page<PrintLogDTO> getStudentPrintHistory(String studentId, Integer pageNumber, Integer pageSize);
    
    /**
     * Xóa sinh viên (Soft delete - chỉ đổi status)
     * @param studentId MSSV
     */
    void deleteStudent(String studentId);
}
