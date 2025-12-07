package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: PageBalance - Số dư trang in
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
    
    @Column(name = "TotalA4Equivalent", insertable = false, updatable = false)
    private Integer totalA4Equivalent;  // Computed column
    
    @Column(name = "LastUpdated")
    private LocalDateTime lastUpdated;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "StudentID")
    private User student;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
