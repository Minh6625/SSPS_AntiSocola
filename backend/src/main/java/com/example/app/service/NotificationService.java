package com.example.app.service;

import com.example.app.dto.NotificationDTO;
import com.example.app.dto.NotificationResponseDTO;
import com.example.app.entity.Notification;
import com.example.app.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    /**
     * Lấy danh sách thông báo của sinh viên (có phân trang)
     */
    public NotificationResponseDTO getNotifications(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
        
        List<NotificationDTO> notifications = notificationPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        long unreadCount = notificationRepository.countByRecipientIdAndIsReadFalse(userId);
        
        return NotificationResponseDTO.builder()
                .notifications(notifications)
                .unreadCount(unreadCount)
                .totalPages(notificationPage.getTotalPages())
                .totalElements(notificationPage.getTotalElements())
                .currentPage(page)
                .build();
    }
    
    /**
     * Lấy số lượng thông báo chưa đọc
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }
    
    /**
     * Đánh dấu một thông báo đã đọc
     */
    @Transactional
    public boolean markAsRead(String userId, Integer notificationId) {
        return notificationRepository.findById(notificationId)
                .filter(n -> n.getRecipientId().equals(userId))
                .map(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                    return true;
                })
                .orElse(false);
    }
    
    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    @Transactional
    public int markAllAsRead(String userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    
    // ==================== TẠO THÔNG BÁO ====================
    
    /**
     * Tạo thông báo đăng nhập thành công
     */
    public void createLoginSuccessNotification(String userId) {
        createNotification(userId, 
                "Đăng nhập thành công", 
                "Bạn đã đăng nhập thành công vào hệ thống lúc " + LocalDateTime.now(),
                "Success");
    }
    
    /**
     * Tạo thông báo đăng nhập thất bại (từ thiết bị lạ)
     */
    public void createLoginFailedNotification(String userId, String reason) {
        createNotification(userId,
                "Cảnh báo đăng nhập",
                "Có một lần đăng nhập thất bại vào tài khoản của bạn. Lý do: " + reason,
                "Warning");
    }
    
    /**
     * Tạo thông báo mua trang thành công
     */
    public void createPurchaseSuccessNotification(String userId, int pageCount, double amount) {
        createNotification(userId,
                "Mua trang thành công",
                String.format("Bạn đã mua thành công %d trang với số tiền %.0f VNĐ. Số dư trang đã được cập nhật.", 
                        pageCount, amount),
                "Success");
    }
    
    /**
     * Tạo thông báo mua trang thất bại
     */
    public void createPurchaseFailedNotification(String userId, String reason) {
        createNotification(userId,
                "Mua trang thất bại",
                "Giao dịch mua trang không thành công. Lý do: " + reason,
                "Error");
    }
    
    /**
     * Tạo thông báo in tài liệu thành công
     */
    public void createPrintSuccessNotification(String userId, String documentName, String printerName) {
        createNotification(userId,
                "In tài liệu thành công",
                String.format("Tài liệu '%s' đã được gửi đến máy in '%s' thành công.", 
                        documentName, printerName),
                "Success");
    }
    
    /**
     * Tạo thông báo in tài liệu thất bại
     */
    public void createPrintFailedNotification(String userId, String documentName, String reason) {
        createNotification(userId,
                "In tài liệu thất bại",
                String.format("Không thể in tài liệu '%s'. Lý do: %s", documentName, reason),
                "Error");
    }
    
    /**
     * Tạo thông báo chung
     */
    @Transactional
    public Notification createNotification(String recipientId, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        Notification saved = notificationRepository.save(notification);
        log.info("Created notification for user {}: {}", recipientId, title);
        return saved;
    }
    
    /**
     * Convert Entity to DTO
     */
    private NotificationDTO toDTO(Notification notification) {
        return NotificationDTO.builder()
                .notificationId(notification.getNotificationId())
                .recipientId(notification.getRecipientId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .notificationType(notification.getNotificationType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
