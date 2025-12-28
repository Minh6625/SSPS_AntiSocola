package com.example.app.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho SPSO xem chi tiết giao dịch (bao gồm thông tin sinh viên)
 */
public class AdminTransactionDTO {
    
    private Integer transactionId;
    private String transactionCode;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String transactionType;
    private Integer a4Pages;
    private Integer balanceAfterA4;
    private BigDecimal amount;
    private String paymentMethod;
    private String transactionStatus;
    private String semester;
    private String notes;
    private LocalDateTime createdAt;
    private String createdBy;
    
    // Constructors
    public AdminTransactionDTO() {}
    
    public AdminTransactionDTO(Integer transactionId, String transactionCode, String studentId,
                               String studentName, String studentEmail, String transactionType,
                               Integer a4Pages, Integer balanceAfterA4, BigDecimal amount,
                               String paymentMethod, String transactionStatus, String semester,
                               String notes, LocalDateTime createdAt, String createdBy) {
        this.transactionId = transactionId;
        this.transactionCode = transactionCode;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.transactionType = transactionType;
        this.a4Pages = a4Pages;
        this.balanceAfterA4 = balanceAfterA4;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.transactionStatus = transactionStatus;
        this.semester = semester;
        this.notes = notes;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }
    
    // Getters & Setters
    public Integer getTransactionId() { return transactionId; }
    public void setTransactionId(Integer transactionId) { this.transactionId = transactionId; }
    
    public String getTransactionCode() { return transactionCode; }
    public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    
    public Integer getA4Pages() { return a4Pages; }
    public void setA4Pages(Integer a4Pages) { this.a4Pages = a4Pages; }
    
    public Integer getBalanceAfterA4() { return balanceAfterA4; }
    public void setBalanceAfterA4(Integer balanceAfterA4) { this.balanceAfterA4 = balanceAfterA4; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getTransactionStatus() { return transactionStatus; }
    public void setTransactionStatus(String transactionStatus) { this.transactionStatus = transactionStatus; }
    
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
