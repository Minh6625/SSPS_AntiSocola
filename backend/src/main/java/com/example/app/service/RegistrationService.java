package com.example.app.service;

import com.example.app.dto.InitiateRegistrationRequestDTO;
import com.example.app.dto.InitiateRegistrationResponseDTO;
import com.example.app.dto.VerifyRegistrationOtpRequestDTO;
import com.example.app.dto.VerifyRegistrationOtpResponseDTO;
import com.example.app.entity.User;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.UserRepository;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.entity.PageBalance;
import com.example.app.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * SERVICE: Quản lý luồng đăng ký 2 bước với OTP
 * 
 * Bước 1: initiateRegistration() - Validate + Gửi OTP
 * Bước 2: verifyRegistrationOtp() - Verify OTP + Tạo tài khoản
 * 
 * Tuân thủ Layered Architecture:
 * - Chứa TOÀN BỘ business logic
 * - Throw BusinessException khi lỗi
 * - Trả về Entity (không phải DTO)
 */
@Service
@Slf4j
public class RegistrationService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PageBalanceRepository pageBalanceRepository;
    
    @Autowired
    private OtpService otpService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Value("${app.registration.default-a4-pages:50}")
    private int defaultA4Pages;
    
    @Value("${app.registration.default-a3-pages:10}")
    private int defaultA3Pages;
    
    /**
     * BƯỚC 1: Khởi tạo đăng ký - Validate + Gửi OTP
     * 
     * Business Rules:
     * 1. Email phải @siu.edu.vn
     * 2. Email không được trùng
     * 3. Phone không được trùng
     * 4. Password phải khớp
     * 5. Password phải đủ mạnh (min 8, số + chữ)
     * 
     * Output: Registration token (JWT) + OTP sent
     * 
     * Note: Không dùng @Transactional vì method này chỉ read DB + gửi OTP
     * Nếu dùng @Transactional, exception từ OTP service sẽ rollback transaction
     */
    public InitiateRegistrationResponseDTO initiateRegistration(InitiateRegistrationRequestDTO request) {
        log.info("Initiating registration for email: {} - Phone: {}", request.getEmail(), request.getPhone());
        
        // Rule 1: Validate email domain
        if (!request.getEmail().endsWith("@siu.edu.vn")) {
            throw new BusinessException("Email phải là địa chỉ @siu.edu.vn");
        }
        
        // Rule 2: Check email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email đã được sử dụng");
        }
        
        // Rule 3: Check phone exists
        if (userRepository.existsByPhoneNumber(request.getPhone())) {
            throw new BusinessException("Số điện thoại đã được sử dụng");
        }
        
        // Rule 4: Password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Mật khẩu xác nhận không khớp");
        }
        
        // Generate OTP (6 digits)
        // Note: Pass null for userId vì user chưa được tạo trong DB
        // OtpService sẽ dùng email để lưu OTP
        String otpCode = otpService.generateAndSendOtp(
            null,  // userId = null (user chưa tồn tại)
            request.getEmail(),
            "Register2FA"
        );
        
        // Create registration token (JWT) - valid 15 minutes
        String registrationToken = jwtUtil.generateRegistrationToken(
            request.getEmail(),
            request.getPhone(),
            request.getFullName(),
            request.getPassword()
        );
        
        log.info("OTP sent for registration: {}", request.getEmail());
        
        return new InitiateRegistrationResponseDTO(
            "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
            registrationToken,
            request.getEmail(),
            true
        );
    }
    
    /**
     * BƯỚC 2: Xác thực OTP + Tạo tài khoản
     * 
     * Business Rules:
     * 1. Validate registration token (JWT)
     * 2. Validate OTP (hợp lệ, chưa hết hạn, < 5 attempts)
     * 3. Tạo User entity (auto-generate studentId)
     * 4. Tạo PageBalance (cấp phát trang mặc định)
     * 5. Mark OTP as consumed
     * 
     * Output: User entity + Account created
     */
    @Transactional
    public VerifyRegistrationOtpResponseDTO verifyRegistrationOtp(VerifyRegistrationOtpRequestDTO request) {
        log.info("Verifying registration OTP for email: {}", request.getEmail());
        
        // Step 1: Validate registration token
        if (!jwtUtil.isTokenValid(request.getRegistrationToken())) {
            throw new BusinessException("Registration token không hợp lệ hoặc đã hết hạn");
        }
        
        // Extract data từ token
        String tokenEmail = jwtUtil.extractEmail(request.getRegistrationToken());
        String phone = jwtUtil.extractPhone(request.getRegistrationToken());
        String fullName = jwtUtil.extractFullName(request.getRegistrationToken());
        String password = jwtUtil.extractPassword(request.getRegistrationToken());
        
        // Verify email match
        if (!tokenEmail.equals(request.getEmail())) {
            throw new BusinessException("Email không khớp với registration token");
        }
        
        // Step 2: Validate OTP (dùng email vì user chưa tồn tại)
        if (!otpService.validateOtpByEmail(request.getEmail(), request.getOtpCode(), "Register2FA")) {
            throw new BusinessException("OTP không hợp lệ hoặc đã hết hạn");
        }
        
        // Step 3: Auto-generate studentId (format: STU + timestamp + random)
        String studentId = generateStudentId();
        
        // Step 4: Create User entity
        User user = new User();
        user.setUserId(studentId);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setPhoneNumber(phone);
        user.setUserType("Student");
        user.setStatus("Active");
        user.setIsTwoFactorEnabled(false);
        user.setEmailVerifiedAt(LocalDateTime.now());  // Mark email as verified
        user.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User created: {} - {}", savedUser.getUserId(), savedUser.getEmail());
        
        // Step 5: Create PageBalance (allocate default pages)
        PageBalance pageBalance = new PageBalance();
        pageBalance.setStudentId(studentId);
        pageBalance.setA4Balance(defaultA4Pages);
        pageBalance.setA3Balance(defaultA3Pages);
        pageBalance.setLastUpdated(LocalDateTime.now());
        
        pageBalanceRepository.save(pageBalance);
        log.info("PageBalance created for student: {} (A4: {}, A3: {})", 
            studentId, defaultA4Pages, defaultA3Pages);
        
        // Step 6: Mark OTP as consumed (dùng email vì user chưa tồn tại)
        otpService.deleteOtpByEmail(request.getEmail(), "Register2FA");
        log.info("OTP consumed for registration: {}", request.getEmail());
        
        return new VerifyRegistrationOtpResponseDTO(
            "Đăng ký thành công! Vui lòng đăng nhập.",
            savedUser.getUserId(),
            savedUser.getEmail(),
            savedUser.getFullName(),
            savedUser.getUserType(),
            true
        );
    }
    
    /**
     * Generate unique student ID
     * Format: STU + YY + random 8 digits
     * Example: STU2412345678
     */
    private String generateStudentId() {
        String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
        String random = String.format("%08d", (int)(Math.random() * 100000000));
        String studentId = "STU" + year + random;
        
        // Ensure uniqueness
        while (userRepository.existsByUserId(studentId)) {
            random = String.format("%08d", (int)(Math.random() * 100000000));
            studentId = "STU" + year + random;
        }
        
        return studentId;
    }
}
