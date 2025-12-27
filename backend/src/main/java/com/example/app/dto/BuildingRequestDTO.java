package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuildingRequestDTO {
    
    @NotNull(message = "ID cơ sở không được để trống")
    private Integer campusId;
    
    @NotBlank(message = "Mã tòa nhà không được để trống")
    @Size(max = 20, message = "Mã tòa nhà không được vượt quá 20 ký tự")
    private String buildingCode;
    
    @Size(max = 100, message = "Tên tòa nhà không được vượt quá 100 ký tự")
    private String buildingName;
    
    private Integer floorCount;
    
    private Boolean isActive = true;
}
