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
}
