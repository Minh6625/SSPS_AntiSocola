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
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
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
    private final SupabaseStorageService supabaseStorageService;
    private final ModelMapper modelMapper;
    
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
        String fileExtension = supabaseStorageService.getFileExtension(file.getOriginalFilename());
        if (fileExtension.isEmpty()) {
            throw new ApplicationException("Tệp phải có extension hợp lệ", 400);
        }
        
        // STEP 2.5: Validate tên file (ký tự đặc biệt) - xử lý IOException từ FileStorageService
        try {
            // Validation sẽ được gọi bên trong saveFile()
        } catch (Exception e) {
            // Exception sẽ được throw từ saveFile() ở bước 6
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
        
        // STEP 6: Upload file lên Supabase Storage
        String fileUrl;
        try {
            fileUrl = supabaseStorageService.uploadFile(file);
        } catch (IOException e) {
            // Kiểm tra nếu là lỗi validation tên file (ký tự đặc biệt, độ dài)
            String errorMessage = e.getMessage();
            if (errorMessage != null && 
                (errorMessage.contains("ký tự") || errorMessage.contains("dài"))) {
                logger.warn("Lỗi validation tên file: {}", errorMessage);
                throw new ApplicationException(errorMessage, 400); // 400 Bad Request
            }
            // Lỗi khác (IO error)
            logger.error("Lỗi khi upload file lên Supabase: {}", file.getOriginalFilename(), e);
            throw new ApplicationException("Lỗi khi upload file. Vui lòng thử lại", 500);
        }
        
        // STEP 7: Trích xuất tên file từ URL
        String storedFileName = supabaseStorageService.extractFileNameFromUrl(fileUrl);
        
        // STEP 7.5: Kiểm tra storedFileName đã tồn tại chưa (double-check unique)
        if (documentRepository.existsByStoredFileName(storedFileName)) {
            throw new ApplicationException("File đã tồn tại trong hệ thống. Vui lòng upload lại", 500);
        }
        
        // STEP 8: Tạo Document entity
        Document document = new Document();
        document.setStudentId(studentId);
        document.setOriginalFileName(file.getOriginalFilename());
        document.setStoredFileName(storedFileName);
        document.setFilePath(fileUrl); // Lưu URL Supabase thay vì đường dẫn local
        document.setFileExtension(fileExtension.toLowerCase());
        document.setFileSizeKB(new BigDecimal(supabaseStorageService.getFileSizeKB(file)));
        
        // Detect page count từ file bytes
        int pageCount = DEFAULT_PAGES;
        try {
            pageCount = detectPageCountFromBytes(file.getBytes(), fileExtension);
        } catch (IOException e) {
            logger.warn("Không thể đọc file bytes để detect pages, sử dụng mặc định: {}", DEFAULT_PAGES);
        }
        document.setTotalPages(pageCount);
        document.setUploadDate(LocalDateTime.now());
        document.setIsDeleted(false);
        
        // STEP 9: Lưu vào DB
        Document savedDocument = documentRepository.save(document);
        logger.info("Document lưu thành công: documentId={}, studentId={}, fileSizeKB={}", 
                    savedDocument.getDocumentId(), studentId, savedDocument.getFileSizeKB());
        
        // STEP 10: Trả về DTO
        DocumentResponseDTO responseDTO = modelMapper.map(savedDocument, DocumentResponseDTO.class);
        logger.info("DocumentResponseDTO mapped: fileSizeKB={}", responseDTO.getFileSizeKB());
        return responseDTO;
    }
    
    /**
     * Lấy danh sách document của student (phân trang + filter + search)
     * 
     * Business Logic:
     * - Validate page ≥ 0, size > 0 và ≤ 100
     * - Validate sortBy chỉ cho phép: uploadDate, fileName
     * - Validate sortDirection: ASC hoặc DESC
     * - Nếu fileType có → filter theo extension
     * - Nếu search có → tìm trong originalFileName (LIKE search%)
     * - Kết hợp filter + search (nếu cả hai có)
     * - Return Page<DocumentResponseDTO>
     * 
     * @param studentId ID sinh viên
     * @param page Số trang (0-indexed, default: 0)
     * @param size Số lượng items per page (default: 10, max: 100)
     * @param sortBy Field để sort (uploadDate, fileName; default: uploadDate)
     * @param sortDirection Hướng sort (ASC, DESC; default: DESC)
     * @param fileType Filter theo loại file (optional, VD: pdf, docx)
     * @param search Tìm kiếm trong tên file (optional)
     * @return Page<DocumentResponseDTO> chứa documents + pagination metadata
     * @throws ApplicationException Nếu validation fail
     */
    @Transactional(readOnly = true)
    public Page<DocumentResponseDTO> getDocumentsByStudentId(
            String studentId,
            int page,
            int size,
            String sortBy,
            String sortDirection,
            String fileType,
            String search) {
        
        // STEP 1: Validate page & size
        if (page < 0) {
            throw new ApplicationException("page phải ≥ 0", 400);
        }
        if (size <= 0 || size > 100) {
            throw new ApplicationException("size phải > 0 và ≤ 100", 400);
        }
        
        // STEP 2: Validate sortBy
        String validSortBy = "uploadDate"; // Default
        if (sortBy != null && !sortBy.isEmpty()) {
            if (sortBy.equalsIgnoreCase("uploadDate") || sortBy.equalsIgnoreCase("fileName")) {
                validSortBy = sortBy.equalsIgnoreCase("uploadDate") ? "uploadDate" : "originalFileName";
            } else {
                throw new ApplicationException(
                    "sortBy chỉ được phép: uploadDate, fileName", 400);
            }
        }
        
        // STEP 3: Validate sortDirection
        Sort.Direction direction = Sort.Direction.DESC; // Default
        if (sortDirection != null && !sortDirection.isEmpty()) {
            try {
                direction = Sort.Direction.fromString(sortDirection.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ApplicationException(
                    "sortDirection chỉ được phép: ASC, DESC", 400);
            }
        }
        
        // STEP 4: Tạo Pageable
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, validSortBy));
        
        // STEP 5: Xử lý filter + search
        Page<Document> documents;
        
        // Normalize search (trim, limit length)
        String normalizedSearch = null;
        if (search != null && !search.trim().isEmpty()) {
            normalizedSearch = search.trim();
            if (normalizedSearch.length() > 100) {
                normalizedSearch = normalizedSearch.substring(0, 100);
            }
        }
        
        // Normalize fileType (lowercase)
        String normalizedFileType = null;
        if (fileType != null && !fileType.trim().isEmpty()) {
            normalizedFileType = fileType.trim().toLowerCase();
        }
        
        logger.debug("getDocuments: studentId={}, fileType={}, search={}, page={}, size={}",
                     studentId, normalizedFileType, normalizedSearch, page, size);
        
        // STEP 6: Query based on filter/search combination
        if (normalizedFileType != null && normalizedSearch != null) {
            // Cả filter và search
            documents = documentRepository.searchDocumentsByStudentIdAndFileType(
                studentId, normalizedSearch, normalizedFileType, pageable);
        } else if (normalizedFileType != null) {
            // Chỉ filter
            documents = documentRepository.findByStudentIdAndFileType(
                studentId, normalizedFileType, pageable);
        } else if (normalizedSearch != null) {
            // Chỉ search
            documents = documentRepository.searchDocumentsByStudentId(
                studentId, normalizedSearch, pageable);
        } else {
            // Không filter, không search → lấy tất cả
            documents = documentRepository.findByStudentIdAndIsDeletedFalse(studentId, pageable);
        }
        
        logger.info("Get documents: studentId={}, totalElements={}, currentPage={}",
                    studentId, documents.getTotalElements(), page);
        
        // STEP 7: Map to DTO
        return documents.map(doc -> modelMapper.map(doc, DocumentResponseDTO.class));
    }
    
    /**
     * Lấy danh sách document của student (phân trang, overload cũ)
     * Giữ lại cho backward compatibility
     * 
     * @param studentId ID sinh viên
     * @param page Số trang
     * @param size Số lượng items per page
     * @param sortBy Field để sort
     * @return Page<DocumentResponseDTO>
     */
    @Transactional(readOnly = true)
    public Page<DocumentResponseDTO> getDocumentsByStudentId(
            String studentId, 
            int page, 
            int size, 
            String sortBy) {
        
        return getDocumentsByStudentId(studentId, page, size, sortBy, "DESC", null, null);
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
        
        logger.info("Document from DB: id={}, fileSizeKB={}", document.getDocumentId(), document.getFileSizeKB());
        
        DocumentResponseDTO responseDTO = modelMapper.map(document, DocumentResponseDTO.class);
        logger.info("DocumentResponseDTO mapped: id={}, fileSizeKB={}", responseDTO.getDocumentId(), responseDTO.getFileSizeKB());
        
        return responseDTO;
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
        
        // Xóa file trên Supabase Storage
        boolean deletedFromSupabase = supabaseStorageService.deleteFile(document.getStoredFileName());
        if (deletedFromSupabase) {
            logger.info("File đã xóa khỏi Supabase: {}", document.getStoredFileName());
        } else {
            logger.warn("Không thể xóa file khỏi Supabase: {}", document.getStoredFileName());
        }
        
        // Soft-delete trong database
        document.setIsDeleted(true);
        documentRepository.save(document);
        logger.info("Document đã bị soft-delete: documentId={}", documentId);
    }
    
    /**
     * Download file tài liệu
     * 
     * @param documentId ID tài liệu
     * @param studentId ID sinh viên (để xác thực quyền)
     * @return Byte array của file
     * @throws ApplicationException Nếu document không tồn tại hoặc không phải của student
     */
    @Transactional(readOnly = true)
    public byte[] downloadDocument(Integer documentId, String studentId) {
        Document document = documentRepository.findByDocumentIdAndIsDeletedFalse(documentId)
            .orElseThrow(() -> new ApplicationException("Tài liệu không tồn tại", 404));
        
        // Kiểm tra quyền: chỉ student sở hữu document mới được download
        if (!document.getStudentId().equals(studentId)) {
            throw new ApplicationException("Bạn không có quyền download tài liệu này", 403);
        }
        
        try {
            // Download file từ Supabase
            byte[] fileBytes = supabaseStorageService.downloadFile(document.getFilePath());
            
            logger.info("Document download thành công từ Supabase: documentId={}, studentId={}", 
                        documentId, studentId);
            
            return fileBytes;
            
        } catch (java.io.IOException e) {
            logger.error("Lỗi khi download file từ Supabase: {}", document.getFilePath(), e);
            throw new ApplicationException("Lỗi khi download file. Vui lòng thử lại", 500);
        }
    }
    
    /**
     * Detect số trang của file từ byte array
     * Hỗ trợ: PDF, DOCX, PPTX, XLSX
     * 
     * @param fileBytes Byte array của file
     * @param fileExtension Loại file
     * @return Số trang thực sự
     */
    private int detectPageCountFromBytes(byte[] fileBytes, String fileExtension) {
        if (fileBytes == null || fileBytes.length == 0) {
            logger.warn("File bytes rỗng để detect pages");
            return DEFAULT_PAGES;
        }
        
        try {
            switch (fileExtension.toLowerCase()) {
                case "pdf":
                    return detectPdfPagesFromBytes(fileBytes);
                    
                case "docx":
                    return detectDocxPagesFromBytes(fileBytes);
                    
                case "pptx":
                    return detectPptxPagesFromBytes(fileBytes);
                    
                case "xlsx":
                    return detectXlsxPagesFromBytes(fileBytes);
                    
                default:
                    logger.warn("Không hỗ trợ detect pages cho extension: {}", fileExtension);
                    return DEFAULT_PAGES;
            }
        } catch (Exception e) {
            logger.error("Lỗi khi detect page count từ bytes: {}", e.getMessage(), e);
            return DEFAULT_PAGES;
        }
    }
    
    /**
     * Detect số trang của file (dùng cho recount - deprecated)
     * @deprecated Use detectPageCountFromBytes() instead
     */
    @Deprecated
    private int detectPageCount(String filePath, String fileExtension) {
        File file = new File(filePath);
        
        if (!file.exists()) {
            logger.warn("File không tồn tại để detect pages: {}", filePath);
            return DEFAULT_PAGES;
        }
        
        try {
            switch (fileExtension.toLowerCase()) {
                case "pdf":
                    return detectPdfPages(file);
                    
                case "docx":
                    return detectDocxPages(file);
                    
                case "pptx":
                    return detectPptxPages(file);
                    
                case "xlsx":
                    return detectXlsxPages(file);
                    
                default:
                    logger.warn("Không hỗ trợ detect pages cho extension: {}", fileExtension);
                    return DEFAULT_PAGES;
            }
        } catch (Exception e) {
            logger.error("Lỗi khi detect page count: {}", filePath, e);
            return DEFAULT_PAGES;
        }
    }
    
    /**
     * Detect số trang của PDF file từ byte array
     */
    private int detectPdfPagesFromBytes(byte[] fileBytes) throws IOException {
        try (PDDocument document = PDDocument.load(fileBytes)) {
            int pageCount = document.getNumberOfPages();
            logger.info("PDF pages detected: {} pages", pageCount);
            return pageCount;
        }
    }
    
    /**
     * Detect số trang của DOCX file từ byte array
     */
    private int detectDocxPagesFromBytes(byte[] fileBytes) throws IOException {
        try (ByteArrayInputStream bis = new ByteArrayInputStream(fileBytes);
             XWPFDocument document = new XWPFDocument(bis)) {
            
            // Ước tính: ~30 paragraphs = 1 page (A4, font size 12)
            int paragraphs = document.getParagraphs().size();
            int estimatedPages = Math.max(1, (paragraphs + 29) / 30);
            
            logger.info("DOCX pages estimated: {} pages (~{} paragraphs)", 
                       estimatedPages, paragraphs);
            return estimatedPages;
        }
    }
    
    /**
     * Detect số trang của PPTX file từ byte array (số slides)
     */
    private int detectPptxPagesFromBytes(byte[] fileBytes) throws IOException {
        try (ByteArrayInputStream bis = new ByteArrayInputStream(fileBytes);
             XMLSlideShow ppt = new XMLSlideShow(bis)) {
            
            int slideCount = ppt.getSlides().size();
            logger.info("PPTX slides detected: {} slides", slideCount);
            return slideCount;
        }
    }
    
    /**
     * Detect số trang của XLSX file từ byte array (số sheets)
     */
    private int detectXlsxPagesFromBytes(byte[] fileBytes) throws IOException {
        try (ByteArrayInputStream bis = new ByteArrayInputStream(fileBytes);
             XSSFWorkbook workbook = new XSSFWorkbook(bis)) {
            
            int sheetCount = workbook.getNumberOfSheets();
            logger.info("XLSX sheets detected: {} sheets", sheetCount);
            return sheetCount;
        }
    }
    
    /**
     * Detect số trang của PDF file
     */
    private int detectPdfPages(File file) throws IOException {
        try (PDDocument document = PDDocument.load(file)) {
            int pageCount = document.getNumberOfPages();
            logger.info("PDF pages detected: {} pages in {}", pageCount, file.getName());
            return pageCount;
        }
    }
    
    /**
     * Detect số trang của DOCX file
     * Note: DOCX không có concept "page" rõ ràng, ước tính dựa trên số đoạn văn
     */
    private int detectDocxPages(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis)) {
            
            // Ước tính: ~30 paragraphs = 1 page (A4, font size 12)
            int paragraphs = document.getParagraphs().size();
            int estimatedPages = Math.max(1, (paragraphs + 29) / 30);
            
            logger.info("DOCX pages estimated: {} pages (~{} paragraphs) in {}", 
                       estimatedPages, paragraphs, file.getName());
            return estimatedPages;
        }
    }
    
    /**
     * Detect số trang của PPTX file (số slides)
     */
    private int detectPptxPages(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
             XMLSlideShow ppt = new XMLSlideShow(fis)) {
            
            int slideCount = ppt.getSlides().size();
            logger.info("PPTX slides detected: {} slides in {}", slideCount, file.getName());
            return slideCount;
        }
    }
    
    /**
     * Detect số trang của XLSX file (số sheets)
     */
    private int detectXlsxPages(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
             XSSFWorkbook workbook = new XSSFWorkbook(fis)) {
            
            int sheetCount = workbook.getNumberOfSheets();
            logger.info("XLSX sheets detected: {} sheets in {}", sheetCount, file.getName());
            return sheetCount;
        }
    }
    
    /**
     * Recount pages for all documents of a student
     * Useful for updating old documents after implementing page detection
     * 
     * @param studentId ID sinh viên
     * @return Số lượng documents đã được update
     */
    @Transactional
    public int recountPagesForAllDocuments(String studentId) {
        logger.info("Starting recount pages for studentId: {}", studentId);
        
        // Get all non-deleted documents of student
        var documents = documentRepository.findByStudentIdAndIsDeletedFalse(studentId);
        
        int updatedCount = 0;
        for (Document doc : documents) {
            try {
                // Recount pages
                int newPageCount = detectPageCount(doc.getFilePath(), doc.getFileExtension());
                
                if (doc.getTotalPages() != newPageCount) {
                    doc.setTotalPages(newPageCount);
                    documentRepository.save(doc);
                    updatedCount++;
                    logger.info("Updated pages for documentId={}: {} -> {} pages", 
                               doc.getDocumentId(), doc.getTotalPages(), newPageCount);
                }
                
            } catch (Exception e) {
                logger.error("Failed to recount pages for documentId={}: {}", 
                            doc.getDocumentId(), e.getMessage());
                // Continue với documents khác
            }
        }
        
        logger.info("Recount completed: {} documents updated", updatedCount);
        return updatedCount;
    }
}
