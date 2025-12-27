package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuildingDTO {
    private Integer buildingId;
    private Integer campusId;
    private String campusName;
    private String buildingCode;
    private String buildingName;
    private Integer floorCount;
    private Boolean isActive;
}
