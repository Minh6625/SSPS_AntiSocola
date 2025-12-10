package com.example.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO: Output DTO cho Document API
 * Sử dụng khi trả về thông tin tài liệu
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponseDTO {
    
    private Integer documentId;
    
    private String originalFileName;
    
    private String storedFileName;
    
    private String fileExtension;
    
    private BigDecimal fileSizeKB;
    
    private Integer totalPages;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime uploadDate;
    
    private Boolean isDeleted;
}
