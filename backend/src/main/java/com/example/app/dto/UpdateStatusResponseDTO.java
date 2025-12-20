package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Response sau khi cập nhật trạng thái sinh viên
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusResponseDTO {
    private String studentId;
    private String studentName;
    private String previousStatus;
    private String newStatus;
    private String message;
}
