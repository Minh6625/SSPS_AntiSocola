package com.example.app.dto;

import java.math.BigDecimal;

/**
 * Output DTO: Kết quả mua thêm trang in
 */
public class PurchasePagesResponseDTO {
    
    private String message;
    private Integer pagesA4;
    private Integer pagesA3;
    private Integer totalA4Equivalent;
    private BigDecimal totalPrice;
    private Integer pagesPurchased;
    
    // Constructors
    public PurchasePagesResponseDTO() {}
    
    public PurchasePagesResponseDTO(String message, Integer pagesA4, Integer pagesA3, 
                                   Integer totalA4Equivalent, BigDecimal totalPrice, Integer pagesPurchased) {
        this.message = message;
        this.pagesA4 = pagesA4;
        this.pagesA3 = pagesA3;
        this.totalA4Equivalent = totalA4Equivalent;
        this.totalPrice = totalPrice;
        this.pagesPurchased = pagesPurchased;
    }
    
    // Getters & Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Integer getPagesA4() { return pagesA4; }
    public void setPagesA4(Integer pagesA4) { this.pagesA4 = pagesA4; }
    
    public Integer getPagesA3() { return pagesA3; }
    public void setPagesA3(Integer pagesA3) { this.pagesA3 = pagesA3; }
    
    public Integer getTotalA4Equivalent() { return totalA4Equivalent; }
    public void setTotalA4Equivalent(Integer totalA4Equivalent) { this.totalA4Equivalent = totalA4Equivalent; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public Integer getPagesPurchased() { return pagesPurchased; }
    public void setPagesPurchased(Integer pagesPurchased) { this.pagesPurchased = pagesPurchased; }
}
