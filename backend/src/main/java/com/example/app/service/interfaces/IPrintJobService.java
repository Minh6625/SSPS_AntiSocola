package com.example.app.service.interfaces;

import com.example.app.dto.PrintJobResponseDTO;
import com.example.app.dto.PrintJobSubmitRequestDTO;

import java.util.List;

/**
 * Service Interface: Quản lý Print Job
 */
public interface IPrintJobService {
    
    /**
     * Gửi lệnh in mới
     */
    PrintJobResponseDTO submitPrintJob(String studentId, PrintJobSubmitRequestDTO request);
    
    /**
     * Lấy danh sách print jobs của student
     */
    List<PrintJobResponseDTO> getStudentPrintJobs(String studentId);
    
    /**
     * Lấy chi tiết print job
     */
    PrintJobResponseDTO getPrintJobById(Integer jobId, String studentId);
    
    /**
     * Lấy recent jobs của student (5 jobs gần nhất)
     */
    List<PrintJobResponseDTO> getRecentJobs(String studentId, int limit);
    
    /**
     * Hủy print job
     */
    void cancelPrintJob(Integer jobId, String studentId);
}
