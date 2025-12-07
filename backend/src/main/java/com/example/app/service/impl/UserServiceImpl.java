package com.example.app.service.impl;

import com.example.app.dto.UserCreateDTO;
import com.example.app.dto.UserResponseDTO;
import com.example.app.entity.User;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.UserRepository;
import com.example.app.service.interfaces.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE IMPLEMENTATION - Business Logic
 */
@Service
public class UserServiceImpl implements IUserService {
    
    @Autowired
    private UserRepository userRepository;
    
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
        return convertToResponseDTO(savedUser);
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
