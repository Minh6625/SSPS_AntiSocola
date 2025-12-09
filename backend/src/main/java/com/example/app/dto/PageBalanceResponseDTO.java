package com.example.app.dto;

import java.time.LocalDateTime;

/**
 * Output DTO: Trả về số dư trang in cho Frontend
 */
public class PageBalanceResponseDTO {
    
    private Integer pagesA4;
    private Integer pagesA3;
    private Integer totalA4Equivalent;
    private LocalDateTime lastUpdated;
    
    // Constructors
    public PageBalanceResponseDTO() {}
    
    public PageBalanceResponseDTO(Integer pagesA4, Integer pagesA3, Integer totalA4Equivalent, LocalDateTime lastUpdated) {
        this.pagesA4 = pagesA4;
        this.pagesA3 = pagesA3;
        this.totalA4Equivalent = totalA4Equivalent;
        this.lastUpdated = lastUpdated;
    }
    
    // Getters & Setters
    public Integer getPagesA4() { return pagesA4; }
    public void setPagesA4(Integer pagesA4) { this.pagesA4 = pagesA4; }
    
    public Integer getPagesA3() { return pagesA3; }
    public void setPagesA3(Integer pagesA3) { this.pagesA3 = pagesA3; }
    
    public Integer getTotalA4Equivalent() { return totalA4Equivalent; }
    public void setTotalA4Equivalent(Integer totalA4Equivalent) { this.totalA4Equivalent = totalA4Equivalent; }
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
