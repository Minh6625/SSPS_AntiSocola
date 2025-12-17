package com.example.app.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO cho thông tin cá nhân đầy đủ
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    
    private String userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String userType;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private LocalDateTime emailVerifiedAt;
    private Boolean isTwoFactorEnabled;
    
    // Constructor từ Entity
    public UserProfileDTO(com.example.app.entity.User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.phoneNumber = user.getPhoneNumber();
        this.userType = user.getUserType();
        this.status = user.getStatus();
        this.createdAt = user.getCreatedAt();
        this.lastLogin = user.getLastLogin();
        this.emailVerifiedAt = user.getEmailVerifiedAt();
        this.isTwoFactorEnabled = user.getIsTwoFactorEnabled();
    }
}
