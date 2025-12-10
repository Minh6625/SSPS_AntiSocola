package com.example.app.repository;

import com.example.app.entity.AllowedFileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * REPOSITORY: AllowedFileType
 * Truy vấn các loại file được phép upload
 */
@Repository
public interface AllowedFileTypeRepository extends JpaRepository<AllowedFileType, Integer> {
    
    /**
     * Tìm loại file theo extension
     * @param fileExtension VD: "pdf", "docx"
     * @return AllowedFileType nếu tồn tại
     */
    Optional<AllowedFileType> findByFileExtensionIgnoreCase(String fileExtension);
    
    /**
     * Kiểm tra xem file type có được phép không
     * @param fileExtension VD: "pdf"
     * @return true nếu allowed, false nếu không
     */
    boolean existsByFileExtensionIgnoreCaseAndIsAllowedTrue(String fileExtension);
}
