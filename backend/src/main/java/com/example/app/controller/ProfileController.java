package com.example.app.controller;

import com.example.app.dto.ChangePasswordRequestDTO;
import com.example.app.dto.UpdateProfileRequestDTO;
import com.example.app.dto.UserProfileDTO;
import com.example.app.service.ProfileService;
import com.example.app.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Profile Management", description = "API quản lý thông tin cá nhân")
public class ProfileController {
    
    private final ProfileService profileService;
    private final JwtUtil jwtUtil;
    
    /**
     * Lấy userId từ JWT token trong request
     */
    private String getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Không tìm thấy token xác thực");
    }
    
    @Operation(summary = "Lấy thông tin cá nhân", description = "Lấy thông tin cá nhân của user đang đăng nhập")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy thông tin thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy user")
    })
    @GetMapping
    public ResponseEntity<UserProfileDTO> getMyProfile(HttpServletRequest request) {
        String userId = getUserIdFromRequest(request);
        UserProfileDTO profile = profileService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @Operation(summary = "Cập nhật thông tin cá nhân", description = "Cập nhật họ tên, số điện thoại")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
    })
    @PutMapping
    public ResponseEntity<UserProfileDTO> updateMyProfile(
            HttpServletRequest request,
            @Valid @RequestBody UpdateProfileRequestDTO updateRequest) {
        String userId = getUserIdFromRequest(request);
        UserProfileDTO profile = profileService.updateProfile(userId, updateRequest);
        return ResponseEntity.ok(profile);
    }
    
    @Operation(summary = "Đổi mật khẩu", description = "Đổi mật khẩu tài khoản")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Đổi mật khẩu thành công"),
        @ApiResponse(responseCode = "400", description = "Mật khẩu không hợp lệ"),
        @ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
    })
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            HttpServletRequest request,
            @Valid @RequestBody ChangePasswordRequestDTO changeRequest) {
        String userId = getUserIdFromRequest(request);
        profileService.changePassword(userId, changeRequest);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
