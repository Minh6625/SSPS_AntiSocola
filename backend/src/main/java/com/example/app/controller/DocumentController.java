package com.example.app.controller;

import com.example.app.dto.DocumentResponseDTO;
import com.example.app.exception.ApplicationException;
import com.example.app.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Document", description = "API quản lý tài liệu (Student only)")
public class DocumentController {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);
    private final DocumentService documentService;
    
    private void checkStudentRole(Authentication authentication) {
        if (authentication == null || !authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("Student"))) {
            throw new ApplicationException("Chỉ Student có quyền sử dụng", 403);
        }
    }
    
    @PostMapping("/upload")
    @Operation(summary = "Upload tài liệu")
        public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        logger.info("📤 POST /api/documents/upload được gọi!");
        checkStudentRole(authentication);
        
        String studentId = authentication.getName();
        
        try {
            DocumentResponseDTO result = documentService.uploadDocument(
                file, studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tải lên tài liệu thành công");
            response.put("data", result);
            
            logger.info("✅ Upload success: {}", result.getDocumentId());
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            logger.error("❌ Upload error: {}", e.getMessage(), e);
            throw new ApplicationException("Lỗi: " + e.getMessage(), 400);
        }
    }
    
    @GetMapping({"", "/"})
    @Operation(summary = "Lấy danh sách tài liệu")
    public ResponseEntity<Map<String, Object>> getDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "uploadDate") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        
        logger.info("📋 GET /api/documents được gọi!");
        checkStudentRole(authentication);
        
        String studentId = authentication.getName();
        logger.info("Student: {}, page: {}, size: {}", studentId, page, size);
        
        try {
            Page<DocumentResponseDTO> docsPage = documentService.getDocumentsByStudentId(
                studentId, page, size, sortBy, sortDirection, fileType, search);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách tài liệu thành công");
            
            Map<String, Object> data = new HashMap<>();
            data.put("content", docsPage.getContent());
            data.put("totalElements", docsPage.getTotalElements());
            data.put("totalPages", docsPage.getTotalPages());
            data.put("currentPage", docsPage.getNumber());
            data.put("pageSize", docsPage.getSize());
            response.put("data", data);
            
            logger.info("✅ Success: {} docs", docsPage.getTotalElements());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("❌ Error: {}", e.getMessage(), e);
            throw new ApplicationException("Lỗi: " + e.getMessage(), 500);
        }
    }
    
    @GetMapping("/{documentId}")
    public ResponseEntity<Map<String, Object>> getDocumentById(
            @PathVariable Integer documentId,
            Authentication authentication) {
        
        checkStudentRole(authentication);
        logger.info("Request get document: documentId={}", documentId);
        
        DocumentResponseDTO documentDTO = documentService.getDocumentById(documentId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thông tin tài liệu thành công");
        response.put("data", documentDTO);
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Map<String, Object>> deleteDocument(
            @PathVariable Integer documentId,
            Authentication authentication) {
        
        checkStudentRole(authentication);
        
        logger.info("Request delete document: documentId={}, studentId={}", 
                    documentId, authentication.getName());
        
        String studentId = authentication.getName();
        documentService.deleteDocument(documentId, studentId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa tài liệu thành công");
        
        logger.info("Xóa document thành công: documentId={}", documentId);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{documentId}/download")
    public ResponseEntity<?> downloadDocument(
            @PathVariable Integer documentId,
            Authentication authentication) {
        
        checkStudentRole(authentication);
        
        logger.info("Request download document: documentId={}, studentId={}", 
                    documentId, authentication.getName());
        
        String studentId = authentication.getName();
        
        try {
            byte[] fileBytes = documentService.downloadDocument(documentId, studentId);
            DocumentResponseDTO documentDTO = documentService.getDocumentById(documentId);
            
            // Xác định Content-Type dựa vào file extension
            String contentType = "application/octet-stream";
            String extension = documentDTO.getFileExtension().toLowerCase();
            switch (extension) {
                case "pdf":
                    contentType = "application/pdf";
                    break;
                case "docx":
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                case "xlsx":
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    break;
                case "pptx":
                    contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                    break;
                case "doc":
                    contentType = "application/msword";
                    break;
                case "xls":
                    contentType = "application/vnd.ms-excel";
                    break;
                case "ppt":
                    contentType = "application/vnd.ms-powerpoint";
                    break;
            }
            
            // Encode filename để hỗ trợ UTF-8 và tên file đúng
            String encodedFilename = URLEncoder.encode(documentDTO.getOriginalFileName(), StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");
            
            return ResponseEntity.ok()
                .header("Content-Disposition", 
                    "attachment; filename*=UTF-8''" + encodedFilename)
                .header("Content-Type", contentType)
                .body(fileBytes);
            
        } catch (Exception e) {
            logger.error("Lỗi khi download document: documentId={}", documentId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi download file");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/recount-pages")
    @Operation(summary = "Recount pages for all documents (Admin/Debug)")
    public ResponseEntity<Map<String, Object>> recountAllPages(Authentication authentication) {
        
        checkStudentRole(authentication);
        String studentId = authentication.getName();
        
        logger.info("Request recount pages for all documents: studentId={}", studentId);
        
        try {
            int updatedCount = documentService.recountPagesForAllDocuments(studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật lại số trang cho " + updatedCount + " tài liệu");
            response.put("data", Map.of("updatedCount", updatedCount));
            
            logger.info("✅ Recount pages success: {} documents updated", updatedCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Recount pages error: {}", e.getMessage(), e);
            throw new ApplicationException("Lỗi: " + e.getMessage(), 500);
        }
    }
}
