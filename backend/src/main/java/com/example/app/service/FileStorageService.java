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
    
    // Sử dụng thư mục uploads ở project root
    private final Path uploadPath;
    
    public FileStorageService() {
        // Lấy project root directory
        String projectRoot = System.getProperty("user.dir");
        this.uploadPath = Paths.get(projectRoot, "uploads");
        
        // Tạo thư mục nếu chưa tồn tại
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("✅ Tạo thư mục uploads: {}", uploadPath.toAbsolutePath());
            } else {
                logger.info("📁 Thư mục uploads tồn tại: {}", uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.error("❌ Lỗi tạo thư mục uploads", e);
        }
    }
    
    /**
     * Lưu file vật lý lên server
     * @param file MultipartFile từ request
     * @return Tên file được lưu (với UUID prefix để đảm bảo unique)
     * @throws IOException Nếu không thể lưu file
     */
    public String saveFile(MultipartFile file) throws IOException {
        
        // Lấy original filename và extension
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isEmpty()) {
            throw new IOException("Tên file không hợp lệ");
        }
        
        // Validate tên file (kiểm tra ký tự đặc biệt)
        validateFileName(originalFileName);
        
        // Tách extension
        String fileExtension = getFileExtension(originalFileName);
        
        // Tạo unique filename (UUID + original extension)
        String uniqueFileName = UUID.randomUUID() + "." + fileExtension;
        
        // Đường dẫn đầy đủ
        Path filePath = uploadPath.resolve(uniqueFileName);
        
        // Lưu file
        file.transferTo(filePath.toFile());
        logger.info("✅ Tệp đã lưu thành công: {} → {}", uniqueFileName, filePath.toAbsolutePath());
        
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
            Path filePath = uploadPath.resolve(fileName);
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                logger.info("✅ Xóa file thành công: {}", fileName);
            }
            return deleted;
        } catch (IOException e) {
            logger.error("❌ Lỗi khi xóa file: {}", fileName, e);
            return false;
        }
    }
    
    /**
     * Lấy đường dẫn tuyệt đối của file
     * @param fileName Tên file
     * @return Đường dẫn tuyệt đối
     */
    public String getFilePath(String fileName) {
        return uploadPath.resolve(fileName).toAbsolutePath().toString();
    }
    
    /**
     * Validate tên file (kiểm tra ký tự đặc biệt)
     * Những ký tự không được phép: / \ : * ? " < > |
     * @param fileName Tên file cần kiểm tra
     * @throws IOException Nếu tên file chứa ký tự không hợp lệ
     */
    private void validateFileName(String fileName) throws IOException {
        // Kiểm tra ký tự đặc biệt không được phép trong tên file (Windows/Unix)
        if (fileName.matches(".*[/\\\\:*?\"<>|].*")) {
            throw new IOException(
                "Tên file chứa ký tự không được phép: / \\ : * ? \" < > |"
            );
        }
        
        // Kiểm tra độ dài tên file (max 255 characters)
        if (fileName.length() > 255) {
            throw new IOException("Tên file quá dài (tối đa 255 ký tự)");
        }
        
        logger.debug("Tên file hợp lệ: {}", fileName);
    }
}
