package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Response sau khi cấp trang miễn phí
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllocatePageResponseDTO {
    private String studentId;
    private String studentName;
    private Integer a4PagesAllocated;
    private Integer a3PagesAllocated;
    private Integer newA4Balance;
    private Integer newA3Balance;
    private Integer totalA4Equivalent;
    private String message;
}
