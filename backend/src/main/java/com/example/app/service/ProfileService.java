package com.example.app.service;

import com.example.app.dto.ChangePasswordRequestDTO;
import com.example.app.dto.UpdateProfileRequestDTO;
import com.example.app.dto.UserProfileDTO;
import com.example.app.entity.User;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service xử lý thông tin cá nhân
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Lấy thông tin cá nhân theo userId
     */
    public UserProfileDTO getProfile(String userId) {
        log.info("Getting profile for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        
        return new UserProfileDTO(user);
    }
    
    /**
     * Cập nhật thông tin cá nhân
     */
    @Transactional
    public UserProfileDTO updateProfile(String userId, UpdateProfileRequestDTO request) {
        log.info("Updating profile for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        
        // Cập nhật các trường được phép
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        
        User savedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", userId);
        
        return new UserProfileDTO(savedUser);
    }

    /**
     * Đổi mật khẩu
     */
    @Transactional
    public void changePassword(String userId, ChangePasswordRequestDTO request) {
        log.info("Changing password for user: {}", userId);
        
        // Validate confirm password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Mật khẩu xác nhận không khớp");
        }
        
        // Validate new password != current password
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BusinessException("Mật khẩu mới phải khác mật khẩu hiện tại");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Mật khẩu hiện tại không đúng");
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", userId);
    }
}
