package com.example.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

/**
 * Input DTO: Yêu cầu mua thêm trang in
 */
public class PurchasePagesRequestDTO {
    
    @NotNull(message = "Số trang A4 không được để trống")
    @Min(value = 0, message = "Số trang A4 phải từ 0 đến 1000")
    @Max(value = 1000, message = "Số trang A4 phải từ 0 đến 1000")
    private Integer a4Pages = 0;
    
    @NotNull(message = "Số trang A3 không được để trống")
    @Min(value = 0, message = "Số trang A3 phải từ 0 đến 500")
    @Max(value = 500, message = "Số trang A3 phải từ 0 đến 500")
    private Integer a3Pages = 0;
    
    // Constructors
    public PurchasePagesRequestDTO() {}
    
    public PurchasePagesRequestDTO(Integer a4Pages, Integer a3Pages) {
        this.a4Pages = a4Pages;
        this.a3Pages = a3Pages;
    }
    
    // Getters & Setters
    public Integer getA4Pages() { return a4Pages; }
    public void setA4Pages(Integer a4Pages) { this.a4Pages = a4Pages; }
    
    public Integer getA3Pages() { return a3Pages; }
    public void setA3Pages(Integer a3Pages) { this.a3Pages = a3Pages; }
}
