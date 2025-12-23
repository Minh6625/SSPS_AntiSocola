package com.example.app.service;

import com.example.app.dto.LoginResponseDTO;
import com.example.app.entity.PageBalance;
import com.example.app.entity.User;
import com.example.app.exception.BusinessException;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.repository.UserRepository;
import com.example.app.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

/**
 * SERVICE: Google OAuth - Đăng ký/Đăng nhập bằng Google
 */
@Service
@Slf4j
public class GoogleOAuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PageBalanceRepository pageBalanceRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationService notificationService;

    @Value("${google.client.id:}")
    private String googleClientId;

    @Value("${app.registration.default-a4-pages:50}")
    private int defaultA4Pages;

    @Value("${app.registration.default-a3-pages:10}")
    private int defaultA3Pages;

    /**
     * Verify Google ID Token và đăng ký/đăng nhập user
     */
    @Transactional
    public LoginResponseDTO authenticateWithGoogle(String idToken, String action) {
        log.info("Google OAuth authentication - action: {}", action);

        // Verify Google ID Token
        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);
        
        String email = payload.getEmail();
        String fullName = (String) payload.get("name");
        String googleId = payload.getSubject();

        log.info("Google user: {} - {}", email, fullName);

        // Validate email domain @siu.edu.vn
        if (!email.endsWith("@siu.edu.vn")) {
            throw new BusinessException("Chỉ chấp nhận email @siu.edu.vn. Email của bạn: " + email);
        }

        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // User exists - Login
            User user = existingUser.get();
            
            if (!"Active".equals(user.getStatus())) {
                throw new BusinessException("Tài khoản đã bị vô hiệu hóa");
            }

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Tạo thông báo đăng nhập thành công
            notificationService.createLoginSuccessNotification(user.getUserId());

            return generateLoginResponse(user);
        } else {
            // User not exists
            if ("login".equals(action)) {
                throw new BusinessException("Tài khoản chưa tồn tại. Vui lòng đăng ký trước.");
            }

            // Register new user
            return registerGoogleUser(email, fullName, googleId);
        }
    }

    /**
     * Verify Google ID Token
     */
    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), 
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            
            if (googleIdToken == null) {
                throw new BusinessException("Google token không hợp lệ");
            }

            return googleIdToken.getPayload();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error verifying Google token: {}", e.getMessage());
            throw new BusinessException("Xác thực Google thất bại: " + e.getMessage());
        }
    }

    /**
     * Register new user from Google
     */
    private LoginResponseDTO registerGoogleUser(String email, String fullName, String googleId) {
        log.info("Registering new Google user: {}", email);

        // Generate student ID
        String studentId = generateStudentId();

        // Create user
        User user = new User();
        user.setUserId(studentId);
        user.setEmail(email);
        user.setPasswordHash("GOOGLE_OAUTH_" + googleId); // Mark as Google OAuth user
        user.setFullName(fullName != null ? fullName : email.split("@")[0]);
        user.setUserType("Student");
        user.setStatus("Active");
        user.setIsTwoFactorEnabled(false);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Google user created: {} - {}", savedUser.getUserId(), savedUser.getEmail());

        // Create PageBalance
        PageBalance pageBalance = new PageBalance();
        pageBalance.setStudentId(studentId);
        pageBalance.setA4Balance(defaultA4Pages + (defaultA3Pages * 2)); // Convert A3 to A4 equivalent
        pageBalance.setLastUpdated(LocalDateTime.now());

        pageBalanceRepository.save(pageBalance);
        log.info("PageBalance created for Google user: {} (Total A4: {})", studentId, defaultA4Pages + (defaultA3Pages * 2));

        return generateLoginResponse(savedUser);
    }

    /**
     * Generate login response with JWT tokens
     */
    private LoginResponseDTO generateLoginResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(
                user.getUserId(), 
                user.getEmail(), 
                user.getUserType()
        );
        String refreshToken = jwtUtil.generateRefreshToken(
                user.getUserId(), 
                user.getEmail()
        );

        LoginResponseDTO response = new LoginResponseDTO();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getUserType());
        response.setRequireOtp(false);
        response.setMessage("Đăng nhập thành công với Google");

        return response;
    }

    /**
     * Generate unique student ID
     */
    private String generateStudentId() {
        String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
        String random = String.format("%08d", (int) (Math.random() * 100000000));
        String studentId = "STU" + year + random;

        while (userRepository.existsByUserId(studentId)) {
            random = String.format("%08d", (int) (Math.random() * 100000000));
            studentId = "STU" + year + random;
        }

        return studentId;
    }
}
