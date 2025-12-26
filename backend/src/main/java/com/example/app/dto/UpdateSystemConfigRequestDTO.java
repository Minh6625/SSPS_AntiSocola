package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Update System Config Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSystemConfigRequestDTO {
    @NotBlank(message = "Config key không được để trống")
    private String configKey;
    
    @NotBlank(message = "Config value không được để trống")
    private String configValue;
    
    private String updatedBy;
}
