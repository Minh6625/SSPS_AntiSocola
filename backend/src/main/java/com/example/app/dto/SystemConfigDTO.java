package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: SystemConfig
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfigDTO {
    private String configKey;
    private String configValue;
    private String description;
    private String dataType;
}
