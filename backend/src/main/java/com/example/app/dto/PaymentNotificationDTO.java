package com.example.app.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO for WebSocket payment notification to frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentNotificationDTO {
    
    private String status;  // "SUCCESS", "FAILED", "PENDING"
    private String message;
    private String transactionCode;
    private Long amount;
    private String studentId;
    private Integer a4Pages;
    private Integer a3Pages;
    private Integer newA4Balance;
    private Integer newA3Balance;
    private String timestamp;
}
