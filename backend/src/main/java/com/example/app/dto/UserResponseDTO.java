package com.example.app.dto;

import java.time.LocalDateTime;

/**
 * Output DTO: Trả data về Frontend (KHÔNG lộ Entity)
 */
public class UserResponseDTO {
    
    private String userId;
    private String email;
    private String fullName;
    private LocalDateTime createdAt;
    
    // Constructors
    public UserResponseDTO() {}
    
    public UserResponseDTO(String userId, String email, String fullName, LocalDateTime createdAt) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.createdAt = createdAt;
    }
    
    // Getters & Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
