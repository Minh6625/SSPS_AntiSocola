package com.example.app.service.interfaces;

/**
 * SERVICE INTERFACE: Print Queue Service
 * Xử lý hàng đợi in - gửi job đến máy in thật
 */
public interface IPrintQueueService {
    
    /**
     * Quét và xử lý các print job có status = "Pending"
     * Method này sẽ được gọi định kỳ bởi scheduled job
     */
    void processPendingJobs();
    
    /**
     * Gửi một job cụ thể đến máy in
     * @param jobId ID của print job
     * @return true nếu gửi thành công, false nếu thất bại
     */
    boolean sendJobToPrinter(Integer jobId);
}
