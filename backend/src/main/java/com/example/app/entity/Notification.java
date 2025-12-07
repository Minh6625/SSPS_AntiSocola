package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: Notifications - Thông báo
 */
@Entity
@Table(name = "Notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NotificationID")
    private Integer notificationId;
    
    @Column(name = "RecipientID", nullable = false, length = 20)
    private String recipientId;
    
    @Column(name = "Title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "Message", nullable = false, length = 1000)
    private String message;
    
    @Column(name = "NotificationType", length = 20)
    private String notificationType = "Info";  // Info, Warning, Error, Success
    
    @Column(name = "IsRead")
    private Boolean isRead = false;
    
    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RecipientID", insertable = false, updatable = false)
    private User recipient;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
