package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO: System Settings Response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingsResponseDTO {
    private Map<String, SystemConfigDTO> configs;
    private List<SemesterDTO> semesters;
    private SemesterDTO currentSemester;
    private List<AllowedFileTypeDTO> allowedFileTypes;
}
