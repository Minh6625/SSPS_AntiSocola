package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: SystemConfig - Cấu hình hệ thống
 */
@Entity
@Table(name = "SystemConfig")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {
    
    @Id
    @Column(name = "ConfigKey", length = 100)
    private String configKey;
    
    @Column(name = "ConfigValue", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String configValue;
    
    @Column(name = "Description", length = 500)
    private String description;
    
    @Column(name = "DataType", nullable = false, length = 20)
    private String dataType;  // String, Integer, Decimal, Boolean, JSON
    
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
    
    @Column(name = "UpdatedBy", length = 20)
    private String updatedBy;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
