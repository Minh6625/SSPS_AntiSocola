package com.example.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: PrinterModels - Model máy in (Reference Table)
 */
@Entity
@Table(name = "PrinterModels", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"BrandID", "ModelName"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrinterModel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ModelID")
    private Integer modelId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BrandID", nullable = false)
    @JsonIgnore
    private Brand brand;
    
    // Expose BrandID for JSON without accessing lazy relationship
    @Column(name = "BrandID", insertable = false, updatable = false)
    private Integer brandId;
    
    @Column(name = "ModelName", nullable = false, length = 100)
    private String modelName;
    
    @Column(name = "ModelDescription", length = 200)
    private String modelDescription;
    
    @Column(name = "DefaultPaperSizes", length = 50)
    private String defaultPaperSizes = "A4,A3";
    
    @Column(name = "DefaultColorPrinting")
    private Boolean defaultColorPrinting = false;
    
    @Column(name = "DefaultDuplexPrinting")
    private Boolean defaultDuplexPrinting = true;
    
    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
