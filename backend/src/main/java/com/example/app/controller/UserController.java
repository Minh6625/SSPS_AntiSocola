package com.example.app.controller;

import com.example.app.dto.UserCreateDTO;
import com.example.app.dto.UserResponseDTO;
import com.example.app.service.interfaces.IUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CONTROLLER LAYER - Xử lý HTTP Request/Response
 * TUYỆT ĐỐI KHÔNG chứa Business Logic
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final IUserService userService;
    
    // Dependency Injection - Inject Interface (Dependency Inversion Principle)
    public UserController(IUserService userService) {
        this.userService = userService;
    }
    
    /**
     * GET /api/users - Lấy tất cả users
     */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * GET /api/users/{id} - Lấy user theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable String id) {
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    /**
     * POST /api/users - Tạo mới user
     * @Valid: Trigger Bean Validation
     */
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserCreateDTO dto) {
        UserResponseDTO user = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    /**
     * PUT /api/users/{id} - Cập nhật user
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserCreateDTO dto) {
        UserResponseDTO user = userService.updateUser(id, dto);
        return ResponseEntity.ok(user);
    }
    
    /**
     * DELETE /api/users/{id} - Xóa user
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
