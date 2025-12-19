package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Brand - Cho dropdown
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandDTO {
    private Integer brandId;
    private String brandName;
    private String brandDescription;
}
