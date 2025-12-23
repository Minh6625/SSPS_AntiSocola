package com.example.app.controller;

import com.example.app.dto.ApiResponseDTO;
import com.example.app.dto.NotificationResponseDTO;
import com.example.app.service.NotificationService;
import com.example.app.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "API quản lý thông báo cho sinh viên")
public class NotificationController {
    
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;
    
    /**
     * Lấy danh sách thông báo của sinh viên (có phân trang)
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo", description = "Lấy tất cả thông báo của sinh viên đang đăng nhập")
    public ResponseEntity<ApiResponseDTO<NotificationResponseDTO>> getNotifications(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        String userId = extractUserId(authHeader);
        NotificationResponseDTO response = notificationService.getNotifications(userId, page, size);
        
        return ResponseEntity.ok(ApiResponseDTO.<NotificationResponseDTO>builder()
                .success(true)
                .message("Lấy danh sách thông báo thành công")
                .data(response)
                .build());
    }
    
    /**
     * Lấy số lượng thông báo chưa đọc
     */
    @GetMapping("/unread-count")
    @Operation(summary = "Đếm thông báo chưa đọc", description = "Lấy số lượng thông báo chưa đọc")
    public ResponseEntity<ApiResponseDTO<Map<String, Long>>> getUnreadCount(
            @RequestHeader("Authorization") String authHeader) {
        
        String userId = extractUserId(authHeader);
        long count = notificationService.getUnreadCount(userId);
        
        return ResponseEntity.ok(ApiResponseDTO.<Map<String, Long>>builder()
                .success(true)
                .message("Lấy số thông báo chưa đọc thành công")
                .data(Map.of("unreadCount", count))
                .build());
    }
    
    /**
     * Đánh dấu một thông báo đã đọc
     */
    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Đánh dấu đã đọc", description = "Đánh dấu một thông báo là đã đọc")
    public ResponseEntity<ApiResponseDTO<Void>> markAsRead(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer notificationId) {
        
        String userId = extractUserId(authHeader);
        boolean success = notificationService.markAsRead(userId, notificationId);
        
        if (success) {
            return ResponseEntity.ok(ApiResponseDTO.<Void>builder()
                    .success(true)
                    .message("Đã đánh dấu thông báo là đã đọc")
                    .build());
        } else {
            return ResponseEntity.badRequest().body(ApiResponseDTO.<Void>builder()
                    .success(false)
                    .message("Không tìm thấy thông báo hoặc không có quyền truy cập")
                    .build());
        }
    }
    
    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    @PutMapping("/read-all")
    @Operation(summary = "Đánh dấu tất cả đã đọc", description = "Đánh dấu tất cả thông báo là đã đọc")
    public ResponseEntity<ApiResponseDTO<Map<String, Integer>>> markAllAsRead(
            @RequestHeader("Authorization") String authHeader) {
        
        String userId = extractUserId(authHeader);
        int count = notificationService.markAllAsRead(userId);
        
        return ResponseEntity.ok(ApiResponseDTO.<Map<String, Integer>>builder()
                .success(true)
                .message("Đã đánh dấu tất cả thông báo là đã đọc")
                .data(Map.of("markedCount", count))
                .build());
    }
    
    /**
     * Extract userId từ JWT token
     */
    private String extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.extractUserId(token);
    }
}
