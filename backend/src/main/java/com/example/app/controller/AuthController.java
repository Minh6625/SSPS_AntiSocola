package com.example.app.controller;

import com.example.app.dto.LoginRequestDTO;
import com.example.app.dto.LoginResponseDTO;
import com.example.app.dto.RegisterRequestDTO;
import com.example.app.dto.VerifyOtpRequestDTO;
import com.example.app.dto.InitiateRegistrationRequestDTO;
import com.example.app.dto.InitiateRegistrationResponseDTO;
import com.example.app.dto.VerifyRegistrationOtpRequestDTO;
import com.example.app.dto.VerifyRegistrationOtpResponseDTO;
import com.example.app.dto.ForgotPasswordRequestDTO;
import com.example.app.dto.ForgotPasswordResponseDTO;
import com.example.app.dto.VerifyPasswordResetOtpRequestDTO;
import com.example.app.dto.VerifyPasswordResetOtpResponseDTO;
import com.example.app.dto.GoogleAuthRequestDTO;
import com.example.app.entity.User;
import com.example.app.repository.UserRepository;
import com.example.app.service.interfaces.IAuthService;
import com.example.app.service.RegistrationService;
import com.example.app.service.PasswordResetService;
import com.example.app.service.GoogleOAuthService;
import com.example.app.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@Tag(name = "Authentication", description = "API xác thực - Đăng nhập, OTP, Refresh Token")
@Slf4j
public class AuthController {

    @Autowired
    private IAuthService authService;
    
    @Autowired
    private RegistrationService registrationService;
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    @Autowired
    private GoogleOAuthService googleOAuthService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;

    @Value("${jwt.refresh.expiration:604800000}")
    private Long refreshTokenExpiration;

    @PostMapping("/login")
    @Operation(
        summary = "Đăng nhập", 
        description = "Đăng nhập bằng email và mật khẩu. Nếu bật 2FA sẽ trả về 202, cần verify OTP"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Đăng nhập thành công"),
        @ApiResponse(responseCode = "202", description = "Cần xác thực OTP"),
        @ApiResponse(responseCode = "401", description = "Email hoặc mật khẩu không chính xác")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest,
                                   HttpServletResponse response) {
        try {
            log.info("Login attempt for email: {}", loginRequest.getEmail());
            
            LoginResponseDTO loginResponse = authService.login(loginRequest);
            
            // Nếu cần OTP, trả về 202 Accepted
            if (loginResponse.getRequireOtp() != null && loginResponse.getRequireOtp()) {
                log.info("OTP required for user: {}", loginRequest.getEmail());
                return new ResponseEntity<>(loginResponse, HttpStatus.ACCEPTED);
            }
            
            // Thành công: Set refresh token as HttpOnly Cookie
            setRefreshTokenCookie(response, loginResponse.getRefreshToken());
            
            log.info("User logged in successfully: {}", loginResponse.getUserId());
            return new ResponseEntity<>(loginResponse, HttpStatus.OK);
            
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", String.valueOf(System.currentTimeMillis()));
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/verify-otp")
    @Operation(
        summary = "Xác thực OTP",
        description = "Gửi mã OTP để hoàn tất đăng nhập 2FA"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "OTP xác thực thành công"),
        @ApiResponse(responseCode = "401", description = "OTP không hợp lệ hoặc đã hết hạn")
    })
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO verifyRequest,
                                       HttpServletResponse response) {
        try {
            log.info("OTP verification attempt for email: {}", verifyRequest.getEmail());
            
            LoginResponseDTO loginResponse = authService.verifyOtp(verifyRequest);
            
            // Set refresh token as HttpOnly Cookie
            setRefreshTokenCookie(response, loginResponse.getRefreshToken());
            
            log.info("OTP verified successfully for user: {}", loginResponse.getUserId());
            return new ResponseEntity<>(loginResponse, HttpStatus.OK);
            
        } catch (Exception e) {
            log.error("OTP verification failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", String.valueOf(System.currentTimeMillis()));
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/refresh-token")
    @Operation(
        summary = "Làm mới Access Token",
        description = "Sử dụng Refresh Token để lấy Access Token mới (15 phút)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Access token làm mới thành công"),
        @ApiResponse(responseCode = "401", description = "Refresh token không hợp lệ hoặc hết hạn")
    })
    public ResponseEntity<?> refreshToken(@RequestBody(required = false) Map<String, String> request) {
        try {
            String refreshToken = null;
            
            if (request != null && request.containsKey("refreshToken")) {
                refreshToken = request.get("refreshToken");
            }
            
            if (refreshToken == null || refreshToken.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Refresh token không được cung cấp");
                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
            }
            
            // Validate refresh token
            if (jwtUtil.isTokenExpired(refreshToken)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Refresh token đã hết hạn");
                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
            }
            
            String userId = jwtUtil.extractUserId(refreshToken);
            String email = jwtUtil.extractEmail(refreshToken);
            
            // Lấy role từ database
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
            
            String role = user.getUserType(); // Lấy role thực từ database (Student/SPSO/Admin)
            String newAccessToken = jwtUtil.generateAccessToken(userId, email, role);
            
            Map<String, Object> response_body = new HashMap<>();
            response_body.put("accessToken", newAccessToken);
            response_body.put("message", "Access token đã được cập nhật");
            response_body.put("timestamp", System.currentTimeMillis());
            
            log.info("Access token refreshed for user: {}", userId);
            return new ResponseEntity<>(response_body, HttpStatus.OK);
            
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", String.valueOf(System.currentTimeMillis()));
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * POST /api/auth/initiate-registration
     * BƯỚC 1: Khởi tạo đăng ký - Validate + Gửi OTP
     * 
     * Request: { email, studentId, fullName, password, confirmPassword }
     * Response: { message, registrationToken, email, otpSent }
     * 
     * Tuân thủ Layered Architecture:
     * - Nhận DTO, validate với @Valid
     * - Gọi Service (nhận DTO response)
     * - Trả về DTO
     */
    @PostMapping("/initiate-registration")
    @Operation(
        summary = "Bước 1: Khởi tạo đăng ký - Gửi OTP",
        description = "Validate thông tin đăng ký và gửi OTP về email"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "OTP đã được gửi"),
        @ApiResponse(responseCode = "400", description = "Validation error hoặc email/phone đã tồn tại")
    })
    public ResponseEntity<?> initiateRegistration(
            @Valid @RequestBody InitiateRegistrationRequestDTO request) {
        try {
            log.info("Initiate registration for email: {} - Phone: {}", 
                request.getEmail(), request.getPhone());
            
            InitiateRegistrationResponseDTO response = registrationService.initiateRegistration(request);
            
            log.info("Registration initiated successfully: {}", request.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration initiation failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", String.valueOf(System.currentTimeMillis()));
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * POST /api/auth/verify-registration-otp
     * BƯỚC 2: Xác thực OTP + Tạo tài khoản
     * 
     * Request: { email, otpCode, registrationToken }
     * Response: { message, userId, email, fullName, userType, accountCreated }
     * 
     * Tuân thủ Layered Architecture:
     * - Nhận DTO, validate với @Valid
     * - Gọi Service (nhận DTO response)
     * - Trả về DTO
     */
    @PostMapping("/verify-registration-otp")
    @Operation(
        summary = "Bước 2: Xác thực OTP - Tạo tài khoản",
        description = "Verify OTP và tạo tài khoản sinh viên"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Tài khoản đã được tạo"),
        @ApiResponse(responseCode = "400", description = "OTP không hợp lệ hoặc đã hết hạn")
    })
    public ResponseEntity<?> verifyRegistrationOtp(
            @Valid @RequestBody VerifyRegistrationOtpRequestDTO request) {
        try {
            log.info("Verify registration OTP for email: {}", request.getEmail());
            
            VerifyRegistrationOtpResponseDTO response = registrationService.verifyRegistrationOtp(request);
            
            log.info("Registration completed successfully: {}", request.getEmail());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Registration OTP verification failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", String.valueOf(System.currentTimeMillis()));
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * POST /api/auth/forgot-password
     * BƯỚC 1: Khởi tạo đặt lại mật khẩu - Gửi OTP
     * 
     * Request: { email }
     * Response: { message, email (masked), resetToken, otpExpirationMinutes }
     */
    @PostMapping("/forgot-password")
    @Operation(
        summary = "Bước 1: Quên mật khẩu - Gửi OTP",
        description = "Người dùng nhập email để nhận OTP đặt lại mật khẩu"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "OTP đã được gửi"),
        @ApiResponse(responseCode = "400", description = "Email không tồn tại")
    })
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO request) {
        try {
            log.info("Forgot password request for email: {}", request.getEmail());
            
            ForgotPasswordResponseDTO response = passwordResetService.initiatePasswordReset(request);
            
            log.info("Password reset initiated successfully: {}", request.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Forgot password failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", String.valueOf(System.currentTimeMillis()));
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * POST /api/auth/verify-password-reset-otp
     * BƯỚC 2: Xác thực OTP + Đặt mật khẩu mới
     * 
     * Request: { email, otpCode, newPassword, confirmPassword }
     * Response: { message, email, userId }
     */
    @PostMapping("/verify-password-reset-otp")
    @Operation(
        summary = "Bước 2: Xác thực OTP - Đặt mật khẩu mới",
        description = "Verify OTP và cập nhật mật khẩu mới"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Mật khẩu đã được đặt lại"),
        @ApiResponse(responseCode = "400", description = "OTP không hợp lệ hoặc mật khẩu không khớp")
    })
    public ResponseEntity<?> verifyPasswordResetOtp(
            @Valid @RequestBody VerifyPasswordResetOtpRequestDTO request) {
        try {
            log.info("Verify password reset OTP for email: {}", request.getEmail());
            
            VerifyPasswordResetOtpResponseDTO response = passwordResetService.verifyPasswordResetOtp(request);
            
            log.info("Password reset completed successfully: {}", request.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Password reset OTP verification failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", String.valueOf(System.currentTimeMillis()));
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * POST /api/auth/google
     * Đăng ký/Đăng nhập bằng Google OAuth
     * 
     * Request: { idToken, action }
     * Response: LoginResponseDTO
     * 
     * Flow:
     * 1. Frontend gọi Google Sign-In, nhận ID token
     * 2. Frontend gửi ID token về backend
     * 3. Backend verify token với Google
     * 4. Nếu email @siu.edu.vn → tạo/đăng nhập user
     */
    @PostMapping("/google")
    @Operation(
        summary = "Google OAuth - Đăng ký/Đăng nhập",
        description = "Xác thực với Google ID token. Email phải là @siu.edu.vn"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Đăng nhập/Đăng ký thành công"),
        @ApiResponse(responseCode = "400", description = "Token không hợp lệ hoặc email không phải @siu.edu.vn")
    })
    public ResponseEntity<?> googleAuth(
            @Valid @RequestBody GoogleAuthRequestDTO request,
            HttpServletResponse response) {
        try {
            log.info("Google OAuth request - action: {}", request.getAction());
            
            LoginResponseDTO loginResponse = googleOAuthService.authenticateWithGoogle(
                    request.getIdToken(),
                    request.getAction() != null ? request.getAction() : "register"
            );
            
            // Set refresh token as HttpOnly Cookie
            setRefreshTokenCookie(response, loginResponse.getRefreshToken());
            
            log.info("Google OAuth successful for user: {}", loginResponse.getEmail());
            return ResponseEntity.ok(loginResponse);
            
        } catch (Exception e) {
            log.error("Google OAuth failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", String.valueOf(System.currentTimeMillis()));
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Set refresh token as HttpOnly Cookie
     * Chặn XSS: JavaScript không thể đọc cookie
     */
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);      // Chặn XSS (JS không thể đọc)
        cookie.setSecure(true);        // Chỉ gửi qua HTTPS
        cookie.setPath("/");
        cookie.setMaxAge((int)(refreshTokenExpiration / 1000)); // Convert ms to seconds
        response.addCookie(cookie);
    }
}
