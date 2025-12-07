package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ENTITY: Documents - Tài liệu tải lên
 */
@Entity
@Table(name = "Documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DocumentID")
    private Integer documentId;
    
    @Column(name = "StudentID", nullable = false, length = 20)
    private String studentId;
    
    @Column(name = "OriginalFileName", nullable = false, length = 255)
    private String originalFileName;
    
    @Column(name = "StoredFileName", nullable = false, unique = true, length = 255)
    private String storedFileName;
    
    @Column(name = "FilePath", nullable = false, length = 500)
    private String filePath;
    
    @Column(name = "FileExtension", nullable = false, length = 10)
    private String fileExtension;
    
    @Column(name = "FileSizeKB", nullable = false, precision = 10, scale = 2)
    private BigDecimal fileSizeKB;
    
    @Column(name = "TotalPages", nullable = false)
    private Integer totalPages;
    
    @Column(name = "UploadDate")
    private LocalDateTime uploadDate;
    
    @Column(name = "IsDeleted")
    private Boolean isDeleted = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentID", insertable = false, updatable = false)
    private User student;
    
    @PrePersist
    protected void onCreate() {
        if (uploadDate == null) {
            uploadDate = LocalDateTime.now();
        }
    }
}
