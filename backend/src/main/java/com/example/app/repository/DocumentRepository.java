package com.example.app.repository;

import com.example.app.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: Document
 * Truy vấn tài liệu từ database
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
    
    /**
     * Lấy danh sách tài liệu của sinh viên (phân trang)
     * @param studentId ID của sinh viên
     * @param pageable Thông tin phân trang
     * @return Page của Document
     */
    Page<Document> findByStudentIdAndIsDeletedFalse(String studentId, Pageable pageable);
    
    /**
     * Lấy danh sách tài liệu của sinh viên theo extension
     * @param studentId ID của sinh viên
     * @param fileExtension Loại file (pdf, docx, ...)
     * @param pageable Thông tin phân trang
     * @return Page của Document
     */
    Page<Document> findByStudentIdAndFileExtensionAndIsDeletedFalse(
        String studentId, 
        String fileExtension, 
        Pageable pageable
    );
    
    /**
     * Kiểm tra storedFileName đã tồn tại chưa (đảm bảo unique)
     * @param storedFileName Tên file lưu trữ
     * @return true nếu tồn tại
     */
    boolean existsByStoredFileName(String storedFileName);
    
    /**
     * Lấy document theo ID
     * @param documentId ID tài liệu
     * @return Document nếu tồn tại và chưa bị xóa
     */
    Optional<Document> findByDocumentIdAndIsDeletedFalse(Integer documentId);
}
