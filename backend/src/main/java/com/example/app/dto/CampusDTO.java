package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Campus - Cho dropdown
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampusDTO {
    private Integer campusId;
    private String campusCode;
    private String campusName;
    private String address;
    private Boolean isActive;
    
    // Constructor for backward compatibility
    public CampusDTO(Integer campusId, String campusCode, String campusName, String address) {
        this.campusId = campusId;
        this.campusCode = campusCode;
        this.campusName = campusName;
        this.address = address;
        this.isActive = true;
    }
}
