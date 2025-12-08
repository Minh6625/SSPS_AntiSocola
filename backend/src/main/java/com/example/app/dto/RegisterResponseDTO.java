package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Register Response - Output
 * Tuân thủ Layered Architecture - Controller mapping từ Entity sang DTO này
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponseDTO {
    private String message;
    private String userId;
    private String email;
    private String fullName;
}
