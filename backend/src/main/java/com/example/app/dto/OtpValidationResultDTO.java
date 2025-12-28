package com.example.app.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO: Kết quả validate OTP với thông tin chi tiết
 * 
 * Dùng để trả về:
 * - Trạng thái validate (success/fail)
 * - Số lần nhập sai còn lại
 * - Thời gian khóa (nếu bị khóa)
 * - Thời gian OTP hết hạn
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpValidationResultDTO {
    
    private boolean valid;
    
    private String message;
    
    // Số lần nhập sai còn lại (0 = bị khóa)
    private Integer remainingAttempts;
    
    // Thời gian khóa còn lại (giây), null nếu không bị khóa
    private Long lockRemainingSeconds;
    
    // Thời gian OTP hết hạn còn lại (giây), null nếu đã hết hạn
    private Long otpRemainingSeconds;
    
    // Có bị khóa không
    private boolean locked;
    
    // OTP đã hết hạn chưa
    private boolean expired;
    
    // Error code để frontend xử lý
    private String errorCode;
    
    // Các error code
    public static final String ERROR_INVALID_OTP = "INVALID_OTP";
    public static final String ERROR_EXPIRED_OTP = "EXPIRED_OTP";
    public static final String ERROR_LOCKED = "ACCOUNT_LOCKED";
    public static final String ERROR_MAX_ATTEMPTS = "MAX_ATTEMPTS_EXCEEDED";
    public static final String ERROR_NOT_FOUND = "OTP_NOT_FOUND";
}
