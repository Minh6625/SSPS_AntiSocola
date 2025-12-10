package com.example.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Input DTO: Yêu cầu mua thêm trang in
 */
public class PurchasePagesRequestDTO {
    
    @NotNull(message = "Số trang không được để trống")
    @Min(value = 1, message = "Số trang phải >= 1")
    private Integer pages;
    
    // Constructors
    public PurchasePagesRequestDTO() {}
    
    public PurchasePagesRequestDTO(Integer pages) {
        this.pages = pages;
    }
    
    // Getters & Setters
    public Integer getPages() { return pages; }
    public void setPages(Integer pages) { this.pages = pages; }
}
