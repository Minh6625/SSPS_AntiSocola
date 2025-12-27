package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampusRequestDTO {
    
    @NotBlank(message = "Mã cơ sở không được để trống")
    @Size(max = 20, message = "Mã cơ sở không được vượt quá 20 ký tự")
    private String campusCode;
    
    @NotBlank(message = "Tên cơ sở không được để trống")
    @Size(max = 100, message = "Tên cơ sở không được vượt quá 100 ký tự")
    private String campusName;
    
    @Size(max = 200, message = "Địa chỉ không được vượt quá 200 ký tự")
    private String address;
    
    private Boolean isActive = true;
}
