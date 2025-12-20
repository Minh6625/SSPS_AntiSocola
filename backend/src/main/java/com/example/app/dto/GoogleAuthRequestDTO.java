package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Google OAuth Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequestDTO {
    
    @NotBlank(message = "Google ID token không được để trống")
    private String idToken;
    
    private String action; // "register" or "login"
}
