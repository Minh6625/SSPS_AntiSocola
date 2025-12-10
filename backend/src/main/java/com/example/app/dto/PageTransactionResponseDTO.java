package com.example.app.dto;

import java.util.List;

/**
 * Pagination Response DTO: Trả về danh sách giao dịch với pagination
 */
public class PageTransactionResponseDTO {
    
    private List<PageTransactionDTO> content;
    private Integer totalElements;
    private Integer totalPages;
    private Integer currentPage;
    private Integer pageSize;
    
    // Constructors
    public PageTransactionResponseDTO() {}
    
    public PageTransactionResponseDTO(List<PageTransactionDTO> content, Integer totalElements, 
                                     Integer totalPages, Integer currentPage, Integer pageSize) {
        this.content = content;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
    }
    
    // Getters & Setters
    public List<PageTransactionDTO> getContent() { return content; }
    public void setContent(List<PageTransactionDTO> content) { this.content = content; }
    
    public Integer getTotalElements() { return totalElements; }
    public void setTotalElements(Integer totalElements) { this.totalElements = totalElements; }
    
    public Integer getTotalPages() { return totalPages; }
    public void setTotalPages(Integer totalPages) { this.totalPages = totalPages; }
    
    public Integer getCurrentPage() { return currentPage; }
    public void setCurrentPage(Integer currentPage) { this.currentPage = currentPage; }
    
    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
}
