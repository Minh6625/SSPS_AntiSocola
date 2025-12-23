package com.example.app.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Integer notificationId;
    private String recipientId;
    private String title;
    private String message;
    private String notificationType;  // Info, Warning, Error, Success
    private Boolean isRead;
    private LocalDateTime createdAt;
}
