package com.example.app.dto;

import java.time.LocalDateTime;

/**
 * Output DTO: Trả data về Frontend (KHÔNG lộ Entity)
 */
public class UserResponseDTO {
    
    private Long id;
    private String email;
    private String fullName;
    private LocalDateTime createdAt;
    
    // Constructors
    public UserResponseDTO() {}
    
    public UserResponseDTO(Long id, String email, String fullName, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.createdAt = createdAt;
    }
    
    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
