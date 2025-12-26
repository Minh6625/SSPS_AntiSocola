package com.example.app.service.impl;

import com.example.app.dto.UserCreateDTO;
import com.example.app.dto.UserResponseDTO;
import com.example.app.entity.PageBalance;
import com.example.app.entity.PageTransaction;
import com.example.app.entity.User;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.repository.PageTransactionRepository;
import com.example.app.repository.SystemConfigRepository;
import com.example.app.repository.UserRepository;
import com.example.app.service.interfaces.IUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE IMPLEMENTATION - Business Logic
 */
@Service
@Slf4j
public class UserServiceImpl implements IUserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PageBalanceRepository pageBalanceRepository;
    
    @Autowired
    private PageTransactionRepository pageTransactionRepository;
    
    @Autowired
    private SystemConfigRepository systemConfigRepository;
    
    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public UserResponseDTO getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return convertToResponseDTO(user);
    }
    
    @Override
    @Transactional
    public UserResponseDTO createUser(UserCreateDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        User user = new User();
        user.setUserId(dto.getUserId());
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPasswordHash(dto.getPassword()); // Should be hashed
        user.setUserType(dto.getUserType() != null ? dto.getUserType() : "Student");
        user.setStatus("Active");
        user.setIsTwoFactorEnabled(false);
        
        User savedUser = userRepository.save(user);
        log.info("User created by SPSO: {} - {} ({})", savedUser.getUserId(), 
            savedUser.getEmail(), savedUser.getUserType());
        
        // Nếu là Student, tạo PageBalance với số trang từ SystemConfig
        if ("Student".equalsIgnoreCase(savedUser.getUserType())) {
            createInitialPageBalance(savedUser.getUserId());
        }
        
        return convertToResponseDTO(savedUser);
    }
    
    /**
     * Tạo PageBalance ban đầu cho sinh viên mới
     * Số trang lấy từ SystemConfig (default_a4_pages_per_semester)
     */
    private void createInitialPageBalance(String studentId) {
        // Lấy số trang cấp phát từ SystemConfig
        int pagesToAllocate = systemConfigRepository.findByConfigKey("default_a4_pages_per_semester")
            .map(config -> {
                try {
                    return Integer.parseInt(config.getConfigValue());
                } catch (NumberFormatException e) {
                    log.warn("Invalid default_a4_pages_per_semester: {}. Using default 100", 
                        config.getConfigValue());
                    return 100;
                }
            })
            .orElse(100); // Default fallback
        
        LocalDateTime now = LocalDateTime.now();
        
        // Tạo PageBalance
        PageBalance pageBalance = new PageBalance();
        pageBalance.setStudentId(studentId);
        pageBalance.setA4Balance(pagesToAllocate);
        pageBalance.setLastUpdated(now);
        
        pageBalanceRepository.save(pageBalance);
        log.info("PageBalance created for new student (SPSO): {} (A4: {} from SystemConfig)", 
            studentId, pagesToAllocate);
        
        // Tạo PageTransaction để audit trail
        PageTransaction transaction = new PageTransaction();
        transaction.setStudentId(studentId);
        transaction.setTransactionType("Allocate");
        transaction.setA4Pages(pagesToAllocate);
        transaction.setBalanceAfterA4(pagesToAllocate);
        transaction.setNotes("Cấp phát ban đầu khi tạo tài khoản (SPSO)");
        transaction.setCreatedAt(now);
        transaction.setCreatedBy("SPSO");
        
        pageTransactionRepository.save(transaction);
        log.info("PageTransaction created for initial allocation: {}", studentId);
    }
    
    @Override
    public UserResponseDTO updateUser(String userId, UserCreateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPasswordHash(dto.getPassword()); // Should be hashed
        }
        
        User updatedUser = userRepository.save(user);
        return convertToResponseDTO(updatedUser);
    }
    
    @Override
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }
    
    private UserResponseDTO convertToResponseDTO(User user) {
        return new UserResponseDTO(
            user.getUserId(),
            user.getEmail(),
            user.getFullName(),
            user.getCreatedAt()
        );
    }
}
