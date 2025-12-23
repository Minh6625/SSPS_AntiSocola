package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

/**
 * ENTITY: PendingPayments - Lưu trữ các giao dịch đang chờ thanh toán
 */
@Entity
@Table(name = "PendingPayments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingPayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private Integer paymentId;
    
    @Column(name = "PaymentCode", nullable = false, unique = true, length = 50)
    private String paymentCode;  // Unique code for matching with bank transfer content
    
    @Column(name = "StudentID", nullable = false, length = 20)
    private String studentId;
    
    @Column(name = "A4Pages", nullable = false)
    private Integer a4Pages;
    
    @Column(name = "Amount", nullable = false)
    private Long amount;  // Total amount in VND
    
    @Column(name = "Status", nullable = false, length = 20)
    private String status;  // PENDING, COMPLETED, EXPIRED, CANCELLED
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "ExpiresAt")
    private LocalDateTime expiresAt;  // Payment expires after 15 minutes
    
    @Column(name = "CompletedAt")
    private LocalDateTime completedAt;
    
    @Column(name = "BankTransactionId", length = 100)
    private String bankTransactionId;  // Reference from bank
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusMinutes(15);
        }
        if (status == null) {
            status = "PENDING";
        }
    }
}
