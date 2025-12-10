package com.example.app.repository;

import com.example.app.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    /**
     * Tìm kiếm tài liệu của sinh viên theo tên file (hỗ trợ pagination)
     * @param studentId ID của sinh viên
     * @param search Từ khóa tìm kiếm (tìm trong originalFileName)
     * @param pageable Thông tin phân trang
     * @return Page của Document
     */
    @Query("SELECT d FROM Document d " +
           "WHERE d.studentId = :studentId " +
           "AND d.isDeleted = false " +
           "AND LOWER(d.originalFileName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Document> searchDocumentsByStudentId(
        @Param("studentId") String studentId,
        @Param("search") String search,
        Pageable pageable
    );
    
    /**
     * Tìm kiếm tài liệu của sinh viên theo tên file và loại file
     * @param studentId ID của sinh viên
     * @param search Từ khóa tìm kiếm
     * @param fileExtension Loại file (pdf, docx, ...)
     * @param pageable Thông tin phân trang
     * @return Page của Document
     */
    @Query("SELECT d FROM Document d " +
           "WHERE d.studentId = :studentId " +
           "AND d.isDeleted = false " +
           "AND LOWER(d.originalFileName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "AND LOWER(d.fileExtension) = LOWER(:fileExtension)")
    Page<Document> searchDocumentsByStudentIdAndFileType(
        @Param("studentId") String studentId,
        @Param("search") String search,
        @Param("fileExtension") String fileExtension,
        Pageable pageable
    );
    
    /**
     * Lấy tài liệu của sinh viên theo loại file (hỗ trợ pagination)
     * @param studentId ID của sinh viên
     * @param fileExtension Loại file
     * @param pageable Thông tin phân trang
     * @return Page của Document
     */
    @Query("SELECT d FROM Document d " +
           "WHERE d.studentId = :studentId " +
           "AND d.isDeleted = false " +
           "AND LOWER(d.fileExtension) = LOWER(:fileExtension)")
    Page<Document> findByStudentIdAndFileType(
        @Param("studentId") String studentId,
        @Param("fileExtension") String fileExtension,
        Pageable pageable
    );
    
    /**
     * Lấy tất cả documents của sinh viên (không phân trang)
     * @param studentId ID của sinh viên
     * @return List của Document
     */
    List<Document> findByStudentIdAndIsDeletedFalse(String studentId);
}
