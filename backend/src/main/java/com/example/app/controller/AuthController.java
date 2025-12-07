package com.example.app.controller;

import com.example.app.dto.LoginRequestDTO;
import com.example.app.dto.LoginResponseDTO;
import com.example.app.dto.RegisterRequestDTO;
import com.example.app.dto.VerifyOtpRequestDTO;
import com.example.app.service.interfaces.IAuthService;
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
    private JwtUtil jwtUtil;

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
            
            // TODO: Lấy role từ database
            String newAccessToken = jwtUtil.generateAccessToken(userId, email, "User");
            
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

    @PostMapping("/register")
    @Operation(
        summary = "Đăng ký tài khoản", 
        description = "Đăng ký tài khoản sinh viên mới với email @hcmiu.edu.vn"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Đăng ký thành công"),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc email/MSSV đã tồn tại")
    })
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        try {
            log.info("Registration attempt for email: {}", registerRequest.getEmail());
            
            String message = authService.register(registerRequest);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            response.put("timestamp", String.valueOf(System.currentTimeMillis()));
            
            log.info("User registered successfully: {}", registerRequest.getEmail());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
            
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", String.valueOf(System.currentTimeMillis()));
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
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
