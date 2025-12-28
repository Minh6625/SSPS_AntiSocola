package com.example.app.service;

import com.example.app.dto.OtpValidationResultDTO;
import com.example.app.entity.EmailOtpCode;
import com.example.app.repository.EmailOtpCodeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP Service - Generate, validate, cleanup, send via email
 * 
 * Config from .env:
 * - OTP_LENGTH: 6
 * - OTP_EXPIRATION_MINUTES: 5 (mặc định 5 phút)
 * - OTP_MAX_ATTEMPTS: 3 (mặc định 3 lần)
 * - OTP_LOCK_MINUTES: 5 (khóa 5 phút khi nhập sai quá số lần)
 * - OTP_RESEND_COOLDOWN_SECONDS: 60
 */
@Service
@Slf4j
public class OtpService {
    
    // Danh sách tài khoản test cố định (nhận OTP qua DB, không gửi email)
    private static final List<String> TEST_ACCOUNTS = Arrays.asList(
        "student.test@edu.vn",
        "spso.test@edu.vn",
        "admin.test@edu.vn"
    );
    
    // In-memory lock storage (email -> lockUntil timestamp)
    // Trong production nên dùng Redis
    private final Map<String, LocalDateTime> lockMap = new ConcurrentHashMap<>();
    
    @Autowired
    private EmailOtpCodeRepository otpRepository;

    @Autowired
    private EmailService emailService;
    
    @Value("${otp.length:6}")
    private int otpLength;

    @Value("${otp.expiration.minutes:5}")
    private int otpExpirationMinutes;

    @Value("${otp.max.attempts:3}")
    private int maxAttempts;
    
    @Value("${otp.lock.minutes:5}")
    private int lockMinutes;
    
    /**
     * Tạo OTP 6 chữ số và gửi qua email
     * 
     * Dùng cho cả login (userId có) và registration (userId null, dùng email)
     * 
     * Note: Không dùng @Transactional vì async email sending có thể fail
     * Nếu dùng @Transactional, exception từ async task sẽ rollback transaction
     */
    public String generateAndSendOtp(String userId, String email, String purpose) {
        try {
            String lockKey = email.toLowerCase() + ":" + purpose;
            
            // Kiểm tra có đang bị khóa không - nếu có thì không cho tạo OTP mới
            LocalDateTime lockUntil = lockMap.get(lockKey);
            if (lockUntil != null && LocalDateTime.now().isBefore(lockUntil)) {
                long remainingSeconds = ChronoUnit.SECONDS.between(LocalDateTime.now(), lockUntil);
                log.warn("Cannot generate OTP - account locked for email: {}, remaining: {}s", email, remainingSeconds);
                throw new RuntimeException("🔒 Tài khoản tạm khóa do nhập sai OTP quá nhiều lần. Vui lòng thử lại sau " + formatTime(remainingSeconds));
            }
            
            // Kiểm tra xem có OTP còn hiệu lực không - nếu có thì KHÔNG tạo mới
            var existingOtps = otpRepository.findByEmailAndPurpose(email, purpose);
            var validOtp = existingOtps.stream()
                .filter(otp -> otp.getConsumedAt() == null)
                .filter(otp -> otp.getExpiresAt() != null && LocalDateTime.now().isBefore(otp.getExpiresAt()))
                .filter(otp -> otp.getAttemptCount() == null || otp.getAttemptCount() < maxAttempts)
                .sorted((a, b) -> b.getExpiresAt().compareTo(a.getExpiresAt()))
                .findFirst()
                .orElse(null);
            
            if (validOtp != null) {
                // Đã có OTP còn hiệu lực - trả về code cũ (cho test account) hoặc null (production)
                log.info("Reusing existing valid OTP for email: {}, OTP ID: {}, expires in {} seconds", 
                    email, validOtp.getOtpId(), 
                    ChronoUnit.SECONDS.between(LocalDateTime.now(), validOtp.getExpiresAt()));
                
                boolean isTestAccount = TEST_ACCOUNTS.contains(email.toLowerCase());
                return isTestAccount ? validOtp.getCode() : null;
            }
            
            // Invalidate TẤT CẢ OTP cũ theo email và purpose (đánh dấu đã dùng)
            existingOtps.stream()
                .filter(otp -> otp.getConsumedAt() == null)
                .forEach(otp -> {
                    otp.setConsumedAt(LocalDateTime.now());
                    otpRepository.save(otp);
                    log.info("Invalidated old OTP for email: {}", email);
                });
            
            // Cũng invalidate theo userId nếu có
            if (userId != null) {
                otpRepository.findByUserIdAndPurpose(userId, purpose)
                    .stream()
                    .filter(otp -> otp.getConsumedAt() == null)
                    .forEach(otp -> {
                        otp.setConsumedAt(LocalDateTime.now());
                        otpRepository.save(otp);
                    });
            }
            otpRepository.flush();
            
            // Tạo OTP 6 chữ số
            String code = String.format("%06d", new Random().nextInt(1000000));
            
            // Lưu vào DB
            EmailOtpCode otpCode = new EmailOtpCode();
            otpCode.setUserId(userId);  // Có thể null cho registration
            otpCode.setEmail(email);    // Luôn có
            otpCode.setCode(code);
            otpCode.setPurpose(purpose);
            otpCode.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
            otpCode.setAttemptCount(0);
            otpCode.setMaxAttempts(maxAttempts);
            
            otpRepository.save(otpCode);
            
            log.info("New OTP generated for email: {}, purpose: {}", email, purpose);
            
            // Kiểm tra có phải tài khoản test không
            boolean isTestAccount = TEST_ACCOUNTS.contains(email.toLowerCase());
            
            if (isTestAccount) {
                // Tài khoản test: KHÔNG gửi email, user lấy OTP từ DB qua response
                log.info("OTP generated for TEST account {}: {} (available in response, not sent via email)", email, code);
            } else {
                // Tài khoản thật: GỬI email async, KHÔNG trả code trong response
                try {
                    emailService.sendOtpEmailAsync(email, code, otpExpirationMinutes);
                    log.info("OTP generated and sent via email to production account: {}", email);
                } catch (Exception emailException) {
                    // Email sending failed, but OTP is already saved in DB
                    // Log error but don't throw - user can still verify OTP
                    log.warn("Failed to send OTP email to {}, but OTP is saved in DB: {}", 
                        email, emailException.getMessage());
                }
            }
            
            // Trả code chỉ cho test account (production trả null)
            return isTestAccount ? code : null;
            
        } catch (Exception e) {
            log.error("Error in generateAndSendOtp: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate OTP: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo OTP mà không gửi email (dùng cho testing)
     */
    @Transactional
    public String generateOtpCode(String userId, String purpose) {
        try {
            // Xóa OTP cũ của user
            otpRepository.deleteByUserIdAndPurpose(userId, purpose);
            otpRepository.flush();
            
            // Tạo OTP 6 chữ số
            String code = String.format("%06d", new Random().nextInt(1000000));
            
            // Lưu vào DB
            EmailOtpCode otpCode = new EmailOtpCode();
            otpCode.setUserId(userId);
            otpCode.setCode(code);
            otpCode.setPurpose(purpose);
            otpCode.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
            otpCode.setAttemptCount(0);
            
            otpRepository.save(otpCode);
            
            log.info("OTP generated for user: {}", userId);
            return code;
        } catch (Exception e) {
            log.error("Error in generateOtpCode: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Validate OTP
     * 
     * Dùng cho cả login (userId có) và registration (userId null, dùng email)
     */
    @Transactional
    public boolean validateOtp(String userId, String code, String purpose) {
        try {
            var otp = otpRepository
                .findByUserIdAndCodeAndPurposeAndExpiresAtAfter(
                    userId, code, purpose, LocalDateTime.now()
                )
                .orElse(null);
            
            if (otp == null) {
                log.warn("OTP validation failed for user: {}", userId);
                return false;
            }
            
            // Check attempt count
            if (otp.getAttemptCount() >= maxAttempts) {
                otpRepository.delete(otp);
                log.warn("OTP max attempts exceeded for user: {}", userId);
                return false;
            }
            
            // Increment attempt
            otp.setAttemptCount(otp.getAttemptCount() + 1);
            otpRepository.save(otp);
            
            log.info("OTP validated successfully for user: {}", userId);
            return true;
        } catch (Exception e) {
            log.error("Error in validateOtp: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Validate OTP bằng email (dùng cho registration)
     */
    public boolean validateOtpByEmail(String email, String code, String purpose) {
        OtpValidationResultDTO result = validateOtpByEmailWithDetails(email, code, purpose);
        return result.isValid();
    }
    
    /**
     * Validate OTP bằng email với thông tin chi tiết
     * Trả về DTO chứa:
     * - Kết quả validate
     * - Số lần nhập sai còn lại
     * - Thời gian khóa (nếu bị khóa)
     * - Thời gian OTP hết hạn
     * 
     * Note: Không dùng @Transactional vì dùng saveAndFlush trực tiếp
     * và method này được gọi từ các service khác có @Transactional riêng
     */
    public OtpValidationResultDTO validateOtpByEmailWithDetails(String email, String code, String purpose) {
        try {
            String lockKey = email.toLowerCase() + ":" + purpose;
            
            // Kiểm tra có đang bị khóa không
            LocalDateTime lockUntil = lockMap.get(lockKey);
            if (lockUntil != null && LocalDateTime.now().isBefore(lockUntil)) {
                long remainingSeconds = ChronoUnit.SECONDS.between(LocalDateTime.now(), lockUntil);
                log.warn("Account locked for email: {}, remaining: {}s", email, remainingSeconds);
                return OtpValidationResultDTO.builder()
                    .valid(false)
                    .locked(true)
                    .lockRemainingSeconds(remainingSeconds)
                    .remainingAttempts(0)
                    .message("Tài khoản tạm khóa do nhập sai OTP quá nhiều lần. Vui lòng thử lại sau " + formatTime(remainingSeconds))
                    .errorCode(OtpValidationResultDTO.ERROR_LOCKED)
                    .build();
            }
            
            // Tìm OTP theo email và purpose (không check code trước)
            log.info("DEBUG - Finding OTP for email: {}, purpose: {}", email, purpose);
            var otpList = otpRepository.findByEmailAndPurpose(email, purpose);
            log.info("DEBUG - Found {} OTP records for email: {}, purpose: {}", otpList.size(), email, purpose);
            
            if (otpList.isEmpty()) {
                log.warn("No OTP found for email: {}", email);
                return OtpValidationResultDTO.builder()
                    .valid(false)
                    .message("Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại OTP mới.")
                    .errorCode(OtpValidationResultDTO.ERROR_NOT_FOUND)
                    .build();
            }
            
            // Lấy OTP mới nhất chưa consumed (sắp xếp theo thời gian tạo giảm dần)
            var otp = otpList.stream()
                .filter(o -> o.getConsumedAt() == null)
                .sorted((a, b) -> {
                    // Sắp xếp theo expiresAt giảm dần (OTP mới nhất có expiresAt xa nhất)
                    if (a.getExpiresAt() == null) return 1;
                    if (b.getExpiresAt() == null) return -1;
                    return b.getExpiresAt().compareTo(a.getExpiresAt());
                })
                .findFirst()
                .orElse(null);
                
            if (otp == null) {
                log.warn("All OTPs consumed for email: {}", email);
                return OtpValidationResultDTO.builder()
                    .valid(false)
                    .message("Mã OTP đã được sử dụng. Vui lòng yêu cầu gửi lại OTP mới.")
                    .errorCode(OtpValidationResultDTO.ERROR_NOT_FOUND)
                    .build();
            }
            
            // Kiểm tra OTP hết hạn
            if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
                log.warn("OTP expired for email: {}", email);
                return OtpValidationResultDTO.builder()
                    .valid(false)
                    .expired(true)
                    .otpRemainingSeconds(0L)
                    .message("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại OTP mới.")
                    .errorCode(OtpValidationResultDTO.ERROR_EXPIRED_OTP)
                    .build();
            }
            
            long otpRemainingSeconds = ChronoUnit.SECONDS.between(LocalDateTime.now(), otp.getExpiresAt());
            int currentAttempts = otp.getAttemptCount() != null ? otp.getAttemptCount() : 0;
            
            log.info("DEBUG - OTP validation for email: {}, OTP ID: {}, current attemptCount in DB: {}, code in DB: {}, code submitted: {}", 
                email, otp.getOtpId(), currentAttempts, otp.getCode(), code);
            
            // Kiểm tra code có đúng không
            if (!otp.getCode().equals(code)) {
                // Tăng số lần thử
                currentAttempts++;
                otp.setAttemptCount(currentAttempts);
                otpRepository.saveAndFlush(otp); // Dùng saveAndFlush thay vì save + flush riêng
                
                int remaining = maxAttempts - currentAttempts;
                
                log.info("DEBUG - After increment: OTP ID: {}, new attemptCount: {}, remaining: {}", 
                    otp.getOtpId(), currentAttempts, remaining);
                
                // Nếu hết lượt -> khóa tài khoản
                if (remaining <= 0) {
                    LocalDateTime newLockUntil = LocalDateTime.now().plusMinutes(lockMinutes);
                    lockMap.put(lockKey, newLockUntil);
                    long lockSeconds = lockMinutes * 60L;
                    
                    log.warn("Max attempts exceeded for email: {}, locked for {} minutes", email, lockMinutes);
                    return OtpValidationResultDTO.builder()
                        .valid(false)
                        .locked(true)
                        .lockRemainingSeconds(lockSeconds)
                        .remainingAttempts(0)
                        .message("🔒 Bạn đã nhập sai OTP " + maxAttempts + " lần. Tài khoản bị khóa " + lockMinutes + " phút.")
                        .errorCode(OtpValidationResultDTO.ERROR_MAX_ATTEMPTS)
                        .build();
                }
                
                log.warn("Invalid OTP for email: {}, remaining attempts: {}", email, remaining);
                return OtpValidationResultDTO.builder()
                    .valid(false)
                    .remainingAttempts(remaining)
                    .otpRemainingSeconds(otpRemainingSeconds)
                    .message("❌ Mã OTP không đúng. Còn " + remaining + " lần thử.")
                    .errorCode(OtpValidationResultDTO.ERROR_INVALID_OTP)
                    .build();
            }
            
            // OTP hợp lệ - xóa lock nếu có
            lockMap.remove(lockKey);
            
            log.info("OTP validated successfully for email: {}", email);
            return OtpValidationResultDTO.builder()
                .valid(true)
                .message("Xác thực OTP thành công!")
                .remainingAttempts(maxAttempts - currentAttempts)
                .otpRemainingSeconds(otpRemainingSeconds)
                .build();
                
        } catch (Exception e) {
            log.error("Error in validateOtpByEmailWithDetails: {}", e.getMessage(), e);
            return OtpValidationResultDTO.builder()
                .valid(false)
                .message("Lỗi hệ thống khi xác thực OTP: " + e.getMessage())
                .build();
        }
    }
    
    /**
     * Format thời gian còn lại thành chuỗi dễ đọc
     */
    private String formatTime(long seconds) {
        if (seconds < 60) {
            return seconds + " giây";
        }
        long minutes = seconds / 60;
        long remainingSeconds = seconds % 60;
        if (remainingSeconds == 0) {
            return minutes + " phút";
        }
        return minutes + " phút " + remainingSeconds + " giây";
    }
    
    /**
     * Kiểm tra email có đang bị khóa không
     */
    public OtpValidationResultDTO checkLockStatus(String email, String purpose) {
        String lockKey = email.toLowerCase() + ":" + purpose;
        LocalDateTime lockUntil = lockMap.get(lockKey);
        
        if (lockUntil != null && LocalDateTime.now().isBefore(lockUntil)) {
            long remainingSeconds = ChronoUnit.SECONDS.between(LocalDateTime.now(), lockUntil);
            return OtpValidationResultDTO.builder()
                .valid(false)
                .locked(true)
                .lockRemainingSeconds(remainingSeconds)
                .remainingAttempts(0)
                .message("Tài khoản tạm khóa. Vui lòng thử lại sau " + formatTime(remainingSeconds))
                .errorCode(OtpValidationResultDTO.ERROR_LOCKED)
                .build();
        }
        
        // Không bị khóa
        return OtpValidationResultDTO.builder()
            .valid(true)
            .locked(false)
            .build();
    }
    
    /**
     * Lấy thông tin OTP hiện tại (thời gian còn lại, số lần thử)
     */
    public OtpValidationResultDTO getOtpStatus(String email, String purpose) {
        // Kiểm tra lock trước
        OtpValidationResultDTO lockStatus = checkLockStatus(email, purpose);
        if (lockStatus.isLocked()) {
            return lockStatus;
        }
        
        var otpList = otpRepository.findByEmailAndPurpose(email, purpose);
        var otp = otpList.stream()
            .filter(o -> o.getConsumedAt() == null)
            .sorted((a, b) -> {
                // Sắp xếp theo expiresAt giảm dần (OTP mới nhất có expiresAt xa nhất)
                if (a.getExpiresAt() == null) return 1;
                if (b.getExpiresAt() == null) return -1;
                return b.getExpiresAt().compareTo(a.getExpiresAt());
            })
            .findFirst()
            .orElse(null);
            
        if (otp == null) {
            return OtpValidationResultDTO.builder()
                .valid(false)
                .message("Không có OTP nào đang hoạt động")
                .errorCode(OtpValidationResultDTO.ERROR_NOT_FOUND)
                .build();
        }
        
        if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
            return OtpValidationResultDTO.builder()
                .valid(false)
                .expired(true)
                .otpRemainingSeconds(0L)
                .message("OTP đã hết hạn")
                .errorCode(OtpValidationResultDTO.ERROR_EXPIRED_OTP)
                .build();
        }
        
        long otpRemainingSeconds = ChronoUnit.SECONDS.between(LocalDateTime.now(), otp.getExpiresAt());
        int currentAttempts = otp.getAttemptCount() != null ? otp.getAttemptCount() : 0;
        int remaining = maxAttempts - currentAttempts;
        
        return OtpValidationResultDTO.builder()
            .valid(true)
            .remainingAttempts(remaining)
            .otpRemainingSeconds(otpRemainingSeconds)
            .message("OTP còn hiệu lực " + formatTime(otpRemainingSeconds) + ", còn " + remaining + " lần thử")
            .build();
    }
    
    /**
     * Delete OTP sau khi dùng xong
     */
    @Transactional
    public void deleteOtp(String userId, String purpose) {
        try {
            otpRepository.deleteByUserIdAndPurpose(userId, purpose);
            log.info("OTP deleted for user: {}", userId);
        } catch (Exception e) {
            log.error("Error in deleteOtp: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Delete OTP bằng email (dùng cho registration)
     */
    @Transactional
    public void deleteOtpByEmail(String email, String purpose) {
        try {
            otpRepository.deleteByEmailAndPurpose(email, purpose);
            log.info("OTP deleted for email: {}", email);
        } catch (Exception e) {
            log.error("Error in deleteOtpByEmail: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Cleanup expired OTPs (chạy định kỳ)
     */
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
            log.info("Expired OTPs cleaned up");
        } catch (Exception e) {
            log.error("Error in cleanupExpiredOtps: {}", e.getMessage(), e);
        }
    }
}
