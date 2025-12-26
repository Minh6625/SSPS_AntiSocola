package com.example.app.repository;

import com.example.app.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY: Semester
 */
@Repository
public interface SemesterRepository extends JpaRepository<Semester, Integer> {
    
    /**
     * Tìm học kỳ theo code
     */
    Optional<Semester> findBySemesterCode(String semesterCode);
    
    /**
     * Tìm học kỳ hiện tại
     */
    Optional<Semester> findByIsCurrentTrue();
    
    /**
     * Lấy tất cả học kỳ đang active
     */
    List<Semester> findByIsActiveTrueOrderByStartDateDesc();
    
    /**
     * Lấy tất cả học kỳ (bao gồm inactive)
     */
    List<Semester> findAllByOrderByStartDateDesc();
    
    /**
     * Đặt tất cả học kỳ thành không phải current
     */
    @Modifying
    @Query("UPDATE Semester s SET s.isCurrent = false WHERE s.isCurrent = true")
    void unsetAllCurrent();
    
    /**
     * Kiểm tra xem có học kỳ nào trùng code không
     */
    boolean existsBySemesterCode(String semesterCode);
}
