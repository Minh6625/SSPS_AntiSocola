package com.example.app.service.impl;

import com.example.app.dto.UserCreateDTO;
import com.example.app.dto.UserResponseDTO;
import com.example.app.entity.User;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.UserRepository;
import com.example.app.service.interfaces.IUserService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE IMPLEMENTATION - Business Logic
 * DEMO MODE: Sử dụng data cứng trong bộ nhớ thay vì database
 */
@Service
public class UserServiceImpl implements IUserService {
    
    // DEMO: Dữ liệu mẫu trong bộ nhớ
    private List<User> mockUsers = new ArrayList<>();
    private Long nextId = 1L;
    
    // Constructor không cần inject Repository nữa
    public UserServiceImpl() {
        // Khởi tạo dữ liệu mẫu
        initMockData();
    }
    
    /**
     * Tạo dữ liệu mẫu ban đầu
     */
    private void initMockData() {
        User user1 = new User("admin@example.com", "Nguyễn Văn A");
        user1.setId(nextId++);
        mockUsers.add(user1);

        User user2 = new User("user@example.com", "Trần Thị B");
        user2.setId(nextId++);
        mockUsers.add(user2);

        User user3 = new User("test@example.com", "Lê Văn C");
        user3.setId(nextId++);
        mockUsers.add(user3);
    }
    
    @Override
    public List<UserResponseDTO> getAllUsers() {
        return mockUsers.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = mockUsers.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToResponseDTO(user);
    }
    
    @Override
    public UserResponseDTO createUser(UserCreateDTO dto) {
        boolean emailExists = mockUsers.stream()
                .anyMatch(u -> u.getEmail().equals(dto.getEmail()));
        if (emailExists) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        User user = new User(dto.getEmail(), dto.getFullName());
        user.setId(nextId++);
        mockUsers.add(user);
        
        return convertToResponseDTO(user);
    }
    
    @Override
    public UserResponseDTO updateUser(Long id, UserCreateDTO dto) {
        User user = mockUsers.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        boolean emailExists = mockUsers.stream()
                .anyMatch(u -> !u.getId().equals(id) && u.getEmail().equals(dto.getEmail()));
        if (emailExists) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        
        return convertToResponseDTO(user);
    }
    
    @Override
    public void deleteUser(Long id) {
        boolean removed = mockUsers.removeIf(u -> u.getId().equals(id));
        if (!removed) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
    }
    
    private UserResponseDTO convertToResponseDTO(User user) {
        return new UserResponseDTO(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getCreatedAt()
        );
    }
}
