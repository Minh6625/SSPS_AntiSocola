package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: Users - Quản lý người dùng
 */
@Entity
@Table(name = "Users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @Column(name = "UserID", length = 20)
    private String userId;  // MSSV hoặc MSNV
    
    @Column(name = "Email", nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "PasswordHash", nullable = false, length = 100)
    private String passwordHash;
    
    @Column(name = "FullName", nullable = false, length = 100)
    private String fullName;
    
    @Column(name = "PhoneNumber", length = 15)
    private String phoneNumber;
    
    @Column(name = "UserType", nullable = false, length = 20)
    private String userType;  // Student, SPSO, Admin
    
    @Column(name = "Status", length = 20)
    private String status = "Active";  // Active, Inactive
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "LastLogin")
    private LocalDateTime lastLogin;
    
    @Column(name = "EmailVerifiedAt")
    private LocalDateTime emailVerifiedAt;
    
    @Column(name = "IsTwoFactorEnabled", nullable = false)
    private Boolean isTwoFactorEnabled = false;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "Active";
        }
    }
}
