package com.example.app.dto;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

/**
 * DTO: Input DTO cho Document Upload API
 * Chứa MultipartFile được gửi từ Client
 */
public class DocumentUploadRequestDTO {
    
    @NotNull(message = "Tệp không được rỗng")
    private MultipartFile file;
    
    public DocumentUploadRequestDTO() {}
    
    public DocumentUploadRequestDTO(MultipartFile file) {
        this.file = file;
    }
    
    public MultipartFile getFile() {
        return file;
    }
    
    public void setFile(MultipartFile file) {
        this.file = file;
    }
}
