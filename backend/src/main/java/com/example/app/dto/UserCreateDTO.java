package com.example.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO LAYER - Data Transfer Object cho API
 * Input DTO: Nhận data từ Frontend
 */
public class UserCreateDTO {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;
    
    // Constructors
    public UserCreateDTO() {}
    
    public UserCreateDTO(String email, String fullName) {
        this.email = email;
        this.fullName = fullName;
    }
    
    // Getters & Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}
