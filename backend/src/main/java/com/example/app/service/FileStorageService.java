package com.example.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * SERVICE: FileStorage
 * Chịu trách nhiệm lưu trữ file vật lý trên server
 * (Local storage - có thể mở rộng sang S3 sau này)
 */
@Service
public class FileStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    /**
     * Lưu file vật lý lên server
     * @param file MultipartFile từ request
     * @return Tên file được lưu (với UUID prefix để đảm bảo unique)
     * @throws IOException Nếu không thể lưu file
     */
    public String saveFile(MultipartFile file) throws IOException {
        
        // Tạo thư mục nếu chưa tồn tại
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            logger.info("Đã tạo thư mục upload: {}", uploadDir);
        }
        
        // Lấy original filename và extension
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isEmpty()) {
            throw new IOException("Tên file không hợp lệ");
        }
        
        // Tách extension
        String fileExtension = getFileExtension(originalFileName);
        
        // Tạo unique filename (UUID + original extension)
        String uniqueFileName = UUID.randomUUID() + "." + fileExtension;
        
        // Đường dẫn đầy đủ
        Path filePath = uploadPath.resolve(uniqueFileName);
        
        // Lưu file
        file.transferTo(filePath.toFile());
        logger.info("Tệp đã lưu thành công: {}", uniqueFileName);
        
        return uniqueFileName;
    }
    
    /**
     * Lấy extension của file (chữ thường)
     * @param fileName Tên file đầy đủ
     * @return Extension (VD: "pdf", "docx")
     */
    public String getFileExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return "";
        }
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return fileName.substring(lastDotIndex + 1).toLowerCase();
        }
        return "";
    }
    
    /**
     * Tính kích thước file (KB)
     * @param file MultipartFile
     * @return Kích thước tính bằng KB (làm tròn 2 chữ số)
     */
    public double getFileSizeKB(MultipartFile file) {
        return Math.round((double) file.getSize() / 1024 * 100.0) / 100.0;
    }
    
    /**
     * Xóa file từ server (nếu cần)
     * @param fileName Tên file cần xóa
     * @return true nếu xóa thành công
     */
    public boolean deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            logger.error("Lỗi khi xóa file: {}", fileName, e);
            return false;
        }
    }
}
