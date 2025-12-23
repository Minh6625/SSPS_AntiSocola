package com.example.app.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
    private List<NotificationDTO> notifications;
    private long unreadCount;
    private int totalPages;
    private long totalElements;
    private int currentPage;
}
