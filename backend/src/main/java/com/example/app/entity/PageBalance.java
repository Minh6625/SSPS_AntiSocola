package com.example.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ENTITY: PageBalance
 * Quản lý số dư trang in của sinh viên
 * 
 * Mapping: PageBalance (StudentID) → Users (UserID)
 */
@Entity
@Table(name = "PageBalance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageBalance {
    
    @Id
    @Column(name = "StudentID", length = 20)
    private String studentId;
    
    @Column(name = "A4Balance", nullable = false)
    private Integer a4Balance = 0;
    
    @Column(name = "A3Balance", nullable = false)
    private Integer a3Balance = 0;
    
    @Column(name = "LastUpdated", nullable = false)
    private LocalDateTime lastUpdated = LocalDateTime.now();
    
    // Foreign Key
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentID", insertable = false, updatable = false)
    private User student;
}
