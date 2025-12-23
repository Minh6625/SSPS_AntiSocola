package com.example.app.repository;

import com.example.app.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    
    // Lấy tất cả thông báo của user theo thứ tự mới nhất
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId, Pageable pageable);
    
    // Lấy thông báo chưa đọc
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(String recipientId);
    
    // Đếm số thông báo chưa đọc
    long countByRecipientIdAndIsReadFalse(String recipientId);
    
    // Đánh dấu tất cả thông báo đã đọc
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :recipientId AND n.isRead = false")
    int markAllAsRead(@Param("recipientId") String recipientId);
    
    // Lấy thông báo theo loại
    Page<Notification> findByRecipientIdAndNotificationTypeOrderByCreatedAtDesc(
            String recipientId, String notificationType, Pageable pageable);
}
