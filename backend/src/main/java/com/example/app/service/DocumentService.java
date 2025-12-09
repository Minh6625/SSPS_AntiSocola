package com.example.app.service;

import com.example.app.dto.DocumentResponseDTO;
import com.example.app.entity.AllowedFileType;
import com.example.app.entity.Document;
import com.example.app.exception.ApplicationException;
import com.example.app.repository.AllowedFileTypeRepository;
import com.example.app.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * SERVICE: Document
 * Chứa toàn bộ Business Logic cho Document/Upload
 * 
 * Quy tắc:
 * - Validate input đầu vào
 * - Check file type được phép
 * - Check file size
 * - Lưu file vật lý
 * - Lưu metadata vào DB
 * - Return DTO
 */
@Service
@RequiredArgsConstructor
public class DocumentService {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);
    private static final long MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
    private static final int DEFAULT_PAGES = 1; // Default pages nếu không detect được
    
    private final DocumentRepository documentRepository;
    private final AllowedFileTypeRepository allowedFileTypeRepository;
    private final FileStorageService fileStorageService;
    private final ModelMapper modelMapper;
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    /**
     * Upload document từ student
     * 
     * Business Logic:
     * 1. Validate file không null
     * 2. Validate file size (≤ 50 MB)
     * 3. Validate file extension (check DB AllowedFileTypes)
     * 4. Lưu file vật lý
     * 5. Lưu metadata vào DB
     * 6. Return DTO
     * 
     * @param file MultipartFile từ request
     * @param studentId ID sinh viên (từ JWT token)
     * @return DocumentResponseDTO chứa thông tin tài liệu
     * @throws ApplicationException Nếu validation fail
     */
    @Transactional
    public DocumentResponseDTO uploadDocument(MultipartFile file, String studentId) {
        
        // STEP 1: Validate file không null
        if (file == null || file.isEmpty()) {
            throw new ApplicationException("Tệp không được rỗng", 400);
        }
        
        logger.info("Bắt đầu upload file cho student: {}, originalName: {}", 
                    studentId, file.getOriginalFilename());
        
        // STEP 2: Lấy file extension và validate
        String fileExtension = fileStorageService.getFileExtension(file.getOriginalFilename());
        if (fileExtension.isEmpty()) {
            throw new ApplicationException("Tệp phải có extension hợp lệ", 400);
        }
        
        // STEP 3: Check file extension có được phép không
        if (!allowedFileTypeRepository.existsByFileExtensionIgnoreCaseAndIsAllowedTrue(fileExtension)) {
            throw new ApplicationException(
                String.format("Loại file '%s' không được phép. Các loại được phép: pdf, docx, pptx, xlsx", fileExtension), 
                400
            );
        }
        
        // STEP 4: Validate file size (≤ 50 MB)
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ApplicationException(
                String.format("Kích thước file không được vượt quá 50 MB (file hiện tại: %.2f MB)", 
                              file.getSize() / (1024.0 * 1024.0)), 
                400
            );
        }
        
        // STEP 5: Lấy maxFileSizeAllowed từ DB
        Optional<AllowedFileType> allowedFileTypeOpt = 
            allowedFileTypeRepository.findByFileExtensionIgnoreCase(fileExtension);
        
        if (allowedFileTypeOpt.isPresent()) {
            AllowedFileType allowedFileType = allowedFileTypeOpt.get();
            long maxSizeBytes = (long) allowedFileType.getMaxFileSizeMB() * 1024 * 1024;
            
            if (file.getSize() > maxSizeBytes) {
                throw new ApplicationException(
                    String.format("Kích thước file .%s không được vượt quá %d MB", 
                                  fileExtension, allowedFileType.getMaxFileSizeMB()), 
                    400
                );
            }
        }
        
        // STEP 6: Lưu file vật lý
        String storedFileName;
        try {
            storedFileName = fileStorageService.saveFile(file);
        } catch (IOException e) {
            logger.error("Lỗi khi lưu file: {}", file.getOriginalFilename(), e);
            throw new ApplicationException("Lỗi khi lưu file. Vui lòng thử lại", 500);
        }
        
        // STEP 7: Kiểm tra storedFileName đã tồn tại chưa (double-check unique)
        if (documentRepository.existsByStoredFileName(storedFileName)) {
            throw new ApplicationException("File đã tồn tại trong hệ thống. Vui lòng upload lại", 500);
        }
        
        // STEP 8: Tạo Document entity
        Document document = new Document();
        document.setStudentId(studentId);
        document.setOriginalFileName(file.getOriginalFilename());
        document.setStoredFileName(storedFileName);
        document.setFilePath(uploadDir + "/" + storedFileName);
        document.setFileExtension(fileExtension.toLowerCase());
        document.setFileSizeKB(new BigDecimal(fileStorageService.getFileSizeKB(file)));
        document.setTotalPages(detectPageCount(fileExtension)); // TODO: Implement PDF page count detection
        document.setUploadDate(LocalDateTime.now());
        document.setIsDeleted(false);
        
        // STEP 9: Lưu vào DB
        Document savedDocument = documentRepository.save(document);
        logger.info("Document lưu thành công: documentId={}, studentId={}", 
                    savedDocument.getDocumentId(), studentId);
        
        // STEP 10: Trả về DTO
        return modelMapper.map(savedDocument, DocumentResponseDTO.class);
    }
    
    /**
     * Lấy danh sách document của student (phân trang)
     * 
     * @param studentId ID sinh viên
     * @param page Số trang (0-indexed)
     * @param size Số lượng items per page
     * @param sortBy Field để sort (VD: "uploadDate")
     * @return Page<DocumentResponseDTO>
     */
    @Transactional(readOnly = true)
    public Page<DocumentResponseDTO> getDocumentsByStudentId(
            String studentId, 
            int page, 
            int size, 
            String sortBy) {
        
        Pageable pageable = PageRequest.of(
            page, 
            size, 
            Sort.by(Sort.Direction.DESC, sortBy != null ? sortBy : "uploadDate")
        );
        
        Page<Document> documents = documentRepository.findByStudentIdAndIsDeletedFalse(studentId, pageable);
        
        return documents.map(doc -> modelMapper.map(doc, DocumentResponseDTO.class));
    }
    
    /**
     * Lấy document theo ID
     * 
     * @param documentId ID tài liệu
     * @return DocumentResponseDTO
     * @throws ApplicationException Nếu document không tồn tại
     */
    @Transactional(readOnly = true)
    public DocumentResponseDTO getDocumentById(Integer documentId) {
        Document document = documentRepository.findByDocumentIdAndIsDeletedFalse(documentId)
            .orElseThrow(() -> new ApplicationException("Tài liệu không tồn tại hoặc đã bị xóa", 404));
        
        return modelMapper.map(document, DocumentResponseDTO.class);
    }
    
    /**
     * Soft-delete document (đánh dấu là deleted, không xóa vật lý)
     * 
     * @param documentId ID tài liệu
     * @param studentId ID sinh viên (để xác thực quyền)
     * @throws ApplicationException Nếu document không tồn tại hoặc không phải của student
     */
    @Transactional
    public void deleteDocument(Integer documentId, String studentId) {
        Document document = documentRepository.findByDocumentIdAndIsDeletedFalse(documentId)
            .orElseThrow(() -> new ApplicationException("Tài liệu không tồn tại", 404));
        
        // Kiểm tra quyền: chỉ student sở hữu document mới được xóa
        if (!document.getStudentId().equals(studentId)) {
            throw new ApplicationException("Bạn không có quyền xóa tài liệu này", 403);
        }
        
        document.setIsDeleted(true);
        documentRepository.save(document);
        logger.info("Document đã bị soft-delete: documentId={}", documentId);
    }
    
    /**
     * Detect số trang của file
     * TODO: Sử dụng Apache PDFBox hoặc library tương tự để detect PDF pages
     * Hiện tại default về 1 trang
     * 
     * @param fileExtension Loại file
     * @return Số trang (mặc định 1)
     */
    private int detectPageCount(String fileExtension) {
        // TODO: Implement PDF page detection logic
        // Có thể dùng Apache PDFBox library:
        // - Thêm dependency: org.apache.pdfbox:pdfbox
        // - Sử dụng PDDocument để đếm pages
        return DEFAULT_PAGES;
    }
}
