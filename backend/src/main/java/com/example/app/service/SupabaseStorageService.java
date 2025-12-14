package com.example.app.service;

import com.example.app.exception.ApplicationException;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * SERVICE: Supabase Storage
 * Chịu trách nhiệm upload file lên Supabase Storage
 */
@Service
public class SupabaseStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(SupabaseStorageService.class);
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    @Value("${supabase.bucket-name:documents}")
    private String bucketName;
    
    private final OkHttpClient httpClient;
    
    public SupabaseStorageService() {
        this.httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build();
    }
    
    /**
     * Upload file lên Supabase Storage
     * @param file MultipartFile từ request
     * @return URL của file đã upload
     * @throws IOException Nếu không thể upload file
     */
    public String uploadFile(MultipartFile file) throws IOException {
        
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
        
        // URL endpoint của Supabase Storage
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", 
            supabaseUrl, bucketName, uniqueFileName);
        
        logger.info("🔄 Đang upload file lên Supabase: {} → {}", originalFileName, uniqueFileName);
        
        try {
            // Tạo request body với file content
            RequestBody requestBody = RequestBody.create(
                file.getBytes(),
                MediaType.parse(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
            );
            
            // Tạo HTTP request
            Request request = new Request.Builder()
                .url(uploadUrl)
                .addHeader("Authorization", "Bearer " + supabaseKey)
                .addHeader("apikey", supabaseKey)
                .post(requestBody)
                .build();
            
            // Thực hiện request
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    logger.error("❌ Lỗi khi upload file lên Supabase: {} - {}", response.code(), errorBody);
                    throw new IOException("Không thể upload file lên Supabase: " + errorBody);
                }
                
                // URL public của file
                String publicUrl = String.format("%s/storage/v1/object/public/%s/%s", 
                    supabaseUrl, bucketName, uniqueFileName);
                
                logger.info("✅ Upload thành công: {}", publicUrl);
                return publicUrl;
            }
            
        } catch (IOException e) {
            logger.error("❌ Lỗi khi upload file lên Supabase", e);
            throw e;
        }
    }
    
    /**
     * Xóa file từ Supabase Storage
     * @param fileName Tên file cần xóa
     * @return true nếu xóa thành công
     */
    public boolean deleteFile(String fileName) {
        try {
            String deleteUrl = String.format("%s/storage/v1/object/%s/%s", 
                supabaseUrl, bucketName, fileName);
            
            Request request = new Request.Builder()
                .url(deleteUrl)
                .addHeader("Authorization", "Bearer " + supabaseKey)
                .addHeader("apikey", supabaseKey)
                .delete()
                .build();
            
            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    logger.info("✅ Xóa file thành công từ Supabase: {}", fileName);
                    return true;
                } else {
                    logger.error("❌ Lỗi khi xóa file từ Supabase: {}", response.code());
                    return false;
                }
            }
            
        } catch (IOException e) {
            logger.error("❌ Lỗi khi xóa file từ Supabase: {}", fileName, e);
            return false;
        }
    }
    
    /**
     * Download file từ Supabase Storage
     * @param fileUrl URL của file trên Supabase
     * @return Byte array của file
     * @throws IOException Nếu không thể download file
     */
    public byte[] downloadFile(String fileUrl) throws IOException {
        Request request = new Request.Builder()
            .url(fileUrl)
            .get()
            .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Không thể download file từ Supabase: " + response.code());
            }
            
            if (response.body() == null) {
                throw new IOException("Response body rỗng");
            }
            
            return response.body().bytes();
        }
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
    
    /**
     * Trích xuất tên file từ URL
     * @param fileUrl URL đầy đủ của file
     * @return Tên file (VD: "abc-123.pdf")
     */
    public String extractFileNameFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return "";
        }
        
        // URL format: https://xxx.supabase.co/storage/v1/object/public/documents/abc-123.pdf
        String[] parts = fileUrl.split("/");
        return parts[parts.length - 1];
    }
}
