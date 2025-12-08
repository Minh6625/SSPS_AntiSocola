package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: AllowedFileTypes - Loại file được phép
 */
@Entity
@Table(name = "AllowedFileTypes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllowedFileType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FileTypeID")
    private Integer fileTypeId;
    
    @Column(name = "FileExtension", nullable = false, unique = true, length = 10)
    private String fileExtension;
    
    @Column(name = "MimeType", nullable = false, length = 100)
    private String mimeType;
    
    @Column(name = "MaxFileSizeMB", nullable = false)
    private Integer maxFileSizeMB = 50;
    
    @Column(name = "IsAllowed", nullable = false)
    private Boolean isAllowed = true;
    
    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "UpdatedBy", length = 20)
    private String updatedBy;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
