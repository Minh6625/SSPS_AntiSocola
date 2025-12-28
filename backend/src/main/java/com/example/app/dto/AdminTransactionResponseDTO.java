package com.example.app.dto;

import java.util.List;

/**
 * Response DTO cho danh sách giao dịch (SPSO)
 */
public class AdminTransactionResponseDTO {
    
    private List<AdminTransactionDTO> content;
    private int totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    
    // Statistics
    private long totalAllocateTransactions;
    private long totalPurchaseTransactions;
    private long totalUseTransactions;
    
    public AdminTransactionResponseDTO() {}
    
    public AdminTransactionResponseDTO(List<AdminTransactionDTO> content, int totalElements, 
                                       int totalPages, int currentPage, int pageSize) {
        this.content = content;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
    }
    
    // Getters & Setters
    public List<AdminTransactionDTO> getContent() { return content; }
    public void setContent(List<AdminTransactionDTO> content) { this.content = content; }
    
    public int getTotalElements() { return totalElements; }
    public void setTotalElements(int totalElements) { this.totalElements = totalElements; }
    
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    
    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }
    
    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
    
    public long getTotalAllocateTransactions() { return totalAllocateTransactions; }
    public void setTotalAllocateTransactions(long totalAllocateTransactions) { this.totalAllocateTransactions = totalAllocateTransactions; }
    
    public long getTotalPurchaseTransactions() { return totalPurchaseTransactions; }
    public void setTotalPurchaseTransactions(long totalPurchaseTransactions) { this.totalPurchaseTransactions = totalPurchaseTransactions; }
    
    public long getTotalUseTransactions() { return totalUseTransactions; }
    public void setTotalUseTransactions(long totalUseTransactions) { this.totalUseTransactions = totalUseTransactions; }
}
