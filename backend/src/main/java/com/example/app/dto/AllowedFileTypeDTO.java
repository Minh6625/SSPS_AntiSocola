package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: AllowedFileType
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllowedFileTypeDTO {
    private Integer fileTypeId;
    private String fileExtension;
    private String mimeType;
    private Integer maxFileSizeMB;
    private Boolean isAllowed;
}
