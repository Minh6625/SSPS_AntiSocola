package com.example.app.dto;

import java.time.LocalDateTime;

/**
 * Output DTO: Trả về thông tin giao dịch trang in
 */
public class PageTransactionDTO {
    
    private Integer transactionId;
    private String transactionType;  // ALLOCATED, PURCHASED, DEDUCTED
    private Integer a4Pages;
    private Integer a3Pages;
    private String notes;
    private LocalDateTime createdAt;
    
    // Constructors
    public PageTransactionDTO() {}
    
    public PageTransactionDTO(Integer transactionId, String transactionType, Integer a4Pages, 
                             Integer a3Pages, String notes, LocalDateTime createdAt) {
        this.transactionId = transactionId;
        this.transactionType = transactionType;
        this.a4Pages = a4Pages;
        this.a3Pages = a3Pages;
        this.notes = notes;
        this.createdAt = createdAt;
    }
    
    // Getters & Setters
    public Integer getTransactionId() { return transactionId; }
    public void setTransactionId(Integer transactionId) { this.transactionId = transactionId; }
    
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    
    public Integer getA4Pages() { return a4Pages; }
    public void setA4Pages(Integer a4Pages) { this.a4Pages = a4Pages; }
    
    public Integer getA3Pages() { return a3Pages; }
    public void setA3Pages(Integer a3Pages) { this.a3Pages = a3Pages; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
