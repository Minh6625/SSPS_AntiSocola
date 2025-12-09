package com.example.app.controller;

import com.example.app.dto.DocumentResponseDTO;
import com.example.app.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

/**
 * CONTROLLER: Document
 * 
 * API Endpoints:
 * - POST /api/documents/upload - Tải tài liệu lên
 * - GET /api/documents - Lấy danh sách tài liệu
 * - GET /api/documents/{id} - Lấy chi tiết tài liệu
 * - DELETE /api/documents/{id} - Xóa tài liệu
 * 
 * Authorization: Chỉ Student và SPSO có quyền truy cập
 */
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);
    
    private final DocumentService documentService;
    
    /**
     * API: POST /api/documents/upload
     * Tải tài liệu lên
     * 
     * Request:
     *   Content-Type: multipart/form-data
     *   Body: form data với field "file"
     * 
     * Response:
     *   201 Created
     *   {
     *     "success": true,
     *     "message": "Tài liệu tải lên thành công",
     *     "data": { DocumentResponseDTO }
     *   }
     * 
     * @param file MultipartFile từ request (required)
     * @param authentication Spring Security Authentication (chứa studentId)
     * @return ResponseEntity với status 201 Created
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        logger.info("Request upload document từ user: {}", authentication.getName());
        
        // Lấy studentId từ authentication principal
        // Giả sử principal là String (studentId) hoặc Object có method getName()
        String studentId = authentication.getName();
        
        // Gọi service (Business Logic)
        DocumentResponseDTO documentDTO = documentService.uploadDocument(file, studentId);
        
        // Chuẩn bị response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tài liệu tải lên thành công");
        response.put("data", documentDTO);
        
        logger.info("Upload document thành công: documentId={}, studentId={}", 
                    documentDTO.getDocumentId(), studentId);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * API: GET /api/documents
     * Lấy danh sách tài liệu của student (phân trang)
     * 
     * Query Parameters:
     *   - page: Số trang (default: 0)
     *   - size: Số lượng items per page (default: 10)
     *   - sortBy: Field để sort (default: uploadDate)
     * 
     * Response:
     *   200 OK
     *   {
     *     "success": true,
     *     "message": "Lấy danh sách tài liệu thành công",
     *     "data": {
     *       "content": [ DocumentResponseDTO[], ],
     *       "totalElements": 100,
     *       "totalPages": 10,
     *       "currentPage": 0,
     *       "pageSize": 10
     *     }
     *   }
     * 
     * @param page Số trang (default: 0)
     * @param size Số lượng items per page (default: 10)
     * @param sortBy Field để sort (default: uploadDate)
     * @param authentication Spring Security Authentication
     * @return ResponseEntity với danh sách document
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "uploadDate") String sortBy,
            Authentication authentication) {
        
        logger.info("Request get documents từ user: {}, page: {}, size: {}", 
                    authentication.getName(), page, size);
        
        String studentId = authentication.getName();
        
        // Gọi service
        Page<DocumentResponseDTO> documentsPage = documentService.getDocumentsByStudentId(
            studentId, 
            page, 
            size, 
            sortBy
        );
        
        // Chuẩn bị response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy danh sách tài liệu thành công");
        
        Map<String, Object> data = new HashMap<>();
        data.put("content", documentsPage.getContent());
        data.put("totalElements", documentsPage.getTotalElements());
        data.put("totalPages", documentsPage.getTotalPages());
        data.put("currentPage", documentsPage.getNumber());
        data.put("pageSize", documentsPage.getSize());
        
        response.put("data", data);
        
        logger.info("Lấy danh sách documents thành công: totalElements={}", 
                    documentsPage.getTotalElements());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * API: GET /api/documents/{id}
     * Lấy chi tiết tài liệu theo ID
     * 
     * Response:
     *   200 OK
     *   {
     *     "success": true,
     *     "message": "Lấy thông tin tài liệu thành công",
     *     "data": { DocumentResponseDTO }
     *   }
     * 
     * @param documentId ID tài liệu
     * @return ResponseEntity với chi tiết document
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<Map<String, Object>> getDocumentById(
            @PathVariable Integer documentId) {
        
        logger.info("Request get document: documentId={}", documentId);
        
        // Gọi service
        DocumentResponseDTO documentDTO = documentService.getDocumentById(documentId);
        
        // Chuẩn bị response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Lấy thông tin tài liệu thành công");
        response.put("data", documentDTO);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * API: DELETE /api/documents/{id}
     * Xóa tài liệu (soft-delete)
     * 
     * Response:
     *   200 OK
     *   {
     *     "success": true,
     *     "message": "Xóa tài liệu thành công"
     *   }
     * 
     * @param documentId ID tài liệu
     * @param authentication Spring Security Authentication
     * @return ResponseEntity với message
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Map<String, Object>> deleteDocument(
            @PathVariable Integer documentId,
            Authentication authentication) {
        
        logger.info("Request delete document: documentId={}, studentId={}", 
                    documentId, authentication.getName());
        
        String studentId = authentication.getName();
        
        // Gọi service (sẽ throw exception nếu không có quyền)
        documentService.deleteDocument(documentId, studentId);
        
        // Chuẩn bị response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Xóa tài liệu thành công");
        
        logger.info("Xóa document thành công: documentId={}", documentId);
        
        return ResponseEntity.ok(response);
    }
}
