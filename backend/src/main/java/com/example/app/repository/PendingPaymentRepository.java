package com.example.app.repository;

import com.example.app.entity.PendingPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PendingPaymentRepository extends JpaRepository<PendingPayment, Integer> {
    
    Optional<PendingPayment> findByPaymentCode(String paymentCode);
    
    Optional<PendingPayment> findByPaymentCodeAndStatus(String paymentCode, String status);
    
    List<PendingPayment> findByStudentIdAndStatus(String studentId, String status);
    
    List<PendingPayment> findByStatusAndExpiresAtBefore(String status, LocalDateTime dateTime);
    
    @Query("SELECT p FROM PendingPayment p WHERE p.status = 'PENDING' AND p.amount = :amount AND p.expiresAt > :now")
    List<PendingPayment> findPendingByAmount(@Param("amount") Long amount, @Param("now") LocalDateTime now);
    
    @Query("SELECT p FROM PendingPayment p WHERE p.status = 'PENDING' AND p.studentId = :studentId AND p.expiresAt > :now ORDER BY p.createdAt DESC")
    List<PendingPayment> findActivePendingByStudentId(@Param("studentId") String studentId, @Param("now") LocalDateTime now);
}
