package com.example.app.service.interfaces;

import com.example.app.dto.UserCreateDTO;
import com.example.app.dto.UserResponseDTO;

import java.util.List;

/**
 * USER SERVICE INTERFACE
 * Định nghĩa Contract cho Business Logic Layer
 * Tuân thủ Dependency Inversion Principle (SOLID)
 */
public interface IUserService {
    
    /**
     * Lấy tất cả users
     */
    List<UserResponseDTO> getAllUsers();
    
    /**
     * Lấy user theo ID
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    UserResponseDTO getUserById(Long id);
    
    /**
     * Tạo mới user
     * @throws IllegalArgumentException nếu email đã tồn tại
     */
    UserResponseDTO createUser(UserCreateDTO dto);
    
    /**
     * Cập nhật user
     * @throws ResourceNotFoundException nếu không tìm thấy
     * @throws IllegalArgumentException nếu email mới đã tồn tại
     */
    UserResponseDTO updateUser(Long id, UserCreateDTO dto);
    
    /**
     * Xóa user
     * @throws ResourceNotFoundException nếu không tìm thấy
     */
    void deleteUser(Long id);
}
