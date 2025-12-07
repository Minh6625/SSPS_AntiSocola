package com.example.app.service.impl;

import com.example.app.dto.LoginRequestDTO;
import com.example.app.dto.LoginResponseDTO;
import com.example.app.dto.RegisterRequestDTO;
import com.example.app.dto.VerifyOtpRequestDTO;
import com.example.app.entity.TrustedDevice;
import com.example.app.entity.User;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.SystemConfigRepository;
import com.example.app.repository.TrustedDeviceRepository;
import com.example.app.repository.UserRepository;
import com.example.app.service.DeviceFingerprintService;
import com.example.app.service.OtpService;
import com.example.app.service.RefreshTokenService;
import com.example.app.service.interfaces.IAuthService;
import com.example.app.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class AuthServiceImpl implements IAuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private OtpService otpService;
    
    @Autowired
    private RefreshTokenService refreshTokenService;
    
    @Autowired
    private DeviceFingerprintService deviceFingerprintService;
    
    @Autowired
    private SystemConfigRepository systemConfigRepository;
    
    @Autowired
    private TrustedDeviceRepository trustedDeviceRepository;
    
    @Autowired
    private HttpServletRequest httpServletRequest;

    @Override
    @Transactional
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        // Tìm user theo email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Email hoặc mật khẩu không chính xác"));

        // Kiểm tra password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new ResourceNotFoundException("Email hoặc mật khẩu không chính xác");
        }

        // Kiểm tra trạng thái tài khoản
        if (!"Active".equals(user.getStatus())) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }

        // Device ID từ request hoặc tạo mới
        String deviceId = loginRequest.getDeviceId() != null ? 
            loginRequest.getDeviceId() : UUID.randomUUID().toString();
        
        // Check if device is trusted (skip OTP if yes)
        boolean isTrustedDevice = isTrustedDevice(user.getUserId(), deviceId);
        
        if (isTrustedDevice) {
            // Device trusted → Skip OTP, generate tokens directly
            log.info("Login from trusted device, skipping OTP for user: {}", user.getUserId());
            return generateTokensAndLogin(user, deviceId);
        }
        
        // Device not trusted → ALWAYS require OTP (Option A: 2FA for all new devices)
        String otpCode = otpService.generateAndSendOtp(user.getUserId(), user.getEmail(), "Login2FA");
        
        // otpCode sẽ null cho production account (chỉ gửi email)
        // otpCode có giá trị cho test account (hiển thị trực tiếp)
        String message = otpCode != null 
            ? "OTP đã được tạo (test account - xem trong response)"
            : "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.";
        
        log.info("OTP sent for new/untrusted device login: {}", user.getEmail());
        
        return LoginResponseDTO.requireOtp(message, otpCode);
    }
    
    /**
     * Verify OTP và generate tokens
     */
    @Transactional
    public LoginResponseDTO verifyOtp(VerifyOtpRequestDTO verifyRequest) {
        // Tìm user
        User user = userRepository.findByEmail(verifyRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        
        // Validate OTP
        if (!otpService.validateOtp(user.getUserId(), verifyRequest.getOtpCode(), "Login2FA")) {
            throw new RuntimeException("OTP không hợp lệ hoặc đã hết hạn");
        }
        
        // Delete OTP sau khi dùng
        otpService.deleteOtp(user.getUserId(), "Login2FA");
        
        String deviceId = verifyRequest.getDeviceId() != null ? 
            verifyRequest.getDeviceId() : UUID.randomUUID().toString();
        
        // Register trusted device nếu chọn "Ghi nhớ tôi"
        if (verifyRequest.getRememberDevice() != null && verifyRequest.getRememberDevice()) {
            String deviceFingerprint = deviceFingerprintService.generateFingerprint(httpServletRequest);
            saveTrustedDevice(user.getUserId(), deviceId, deviceFingerprint);
            log.info("Device registered as trusted for user: {}", user.getUserId());
        }
        
        // Generate tokens
        return generateTokensAndLogin(user, deviceId);
    }
    
    /**
     * Generate access + refresh tokens và update login info
     */
    private LoginResponseDTO generateTokensAndLogin(User user, String deviceId) {
        // Tạo access token (15 phút)
        String accessToken = jwtUtil.generateAccessToken(
            user.getUserId(), 
            user.getEmail(), 
            user.getUserType()
        );
        
        // Tạo refresh token (7 ngày)
        String refreshToken = jwtUtil.generateRefreshToken(
            user.getUserId(), 
            user.getEmail()
        );
        
        // Lấy device fingerprint
        String deviceFingerprint = deviceFingerprintService.generateFingerprint(httpServletRequest);
        String ipAddress = getClientIpAddress();
        
        // Lưu refresh token vào DB
        refreshTokenService.createRefreshToken(
            user, 
            deviceId, 
            deviceFingerprint, 
            refreshToken,
            ipAddress
        );
        
        // Cập nhật last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("User logged in successfully: {}", user.getUserId());
        
        // Trả về response
        return new LoginResponseDTO(
            accessToken,
            refreshToken,
            user.getUserId(),
            user.getEmail(),
            user.getFullName(),
            user.getUserType()
        );
    }
    
    /**
     * Check if device is trusted (not expired)
     */
    private boolean isTrustedDevice(String userId, String deviceId) {
        return trustedDeviceRepository
            .findByUserIdAndDeviceIdAndExpiresAtAfterAndRevokedAtIsNull(
                userId, 
                deviceId, 
                LocalDateTime.now()
            )
            .isPresent();
    }
    
    /**
     * Save device as trusted (7 days)
     */
    private void saveTrustedDevice(String userId, String deviceId, String deviceFingerprint) {
        TrustedDevice trustedDevice = new TrustedDevice();
        trustedDevice.setUserId(userId);
        trustedDevice.setDeviceId(deviceId);
        trustedDevice.setDeviceFingerprint(deviceFingerprint);
        trustedDevice.setTrustedAt(LocalDateTime.now());
        trustedDevice.setExpiresAt(LocalDateTime.now().plusDays(7)); // 7 days
        
        trustedDeviceRepository.save(trustedDevice);
        log.info("Device {} registered as trusted for user {}", deviceId, userId);
    }
    
    private String getClientIpAddress() {
        String xForwardedFor = httpServletRequest.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return httpServletRequest.getRemoteAddr();
    }

    @Override
    public String register(RegisterRequestDTO registerRequest) {
        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Kiểm tra MSSV đã tồn tại
        if (userRepository.existsByUserId(registerRequest.getStudentId())) {
            throw new RuntimeException("MSSV đã được sử dụng");
        }

        // Tạo user mới
        User user = new User();
        user.setUserId(registerRequest.getStudentId());  // MSSV làm UserID
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword())); // Hash password
        user.setFullName(registerRequest.getFullName());
        user.setUserType("Student"); // Mặc định là Student
        user.setStatus("Active");
        user.setIsTwoFactorEnabled(false);

        userRepository.save(user);

        return "Đăng ký thành công! Vui lòng đăng nhập.";
    }
}
