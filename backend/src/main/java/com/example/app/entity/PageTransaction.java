package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ENTITY: PageTransactions - Lịch sử cấp/mua trang
 */
@Entity
@Table(name = "PageTransactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TransactionID")
    private Integer transactionId;
    
    @Column(name = "StudentID", nullable = false, length = 20)
    private String studentId;
    
    @Column(name = "TransactionType", nullable = false, length = 20)
    private String transactionType;  // Allocate, Purchase, Use
    
    @Column(name = "A4Pages", nullable = false)
    private Integer a4Pages = 0;
    
    @Column(name = "A3Pages", nullable = false)
    private Integer a3Pages = 0;
    
    @Column(name = "Amount", precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "PaymentMethod", length = 50)
    private String paymentMethod;
    
    @Column(name = "TransactionStatus", length = 20)
    private String transactionStatus = "Completed";  // Pending, Completed, Failed
    
    @Column(name = "Semester", length = 20)
    private String semester;
    
    @Column(name = "Notes", length = 500)
    private String notes;
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "CreatedBy", length = 20)
    private String createdBy;
    
    // Getter/Setter cho balanceAfter được tự động generate bởi @Data
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentID", insertable = false, updatable = false)
    private User student;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
