package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * ENTITY: UserRoles - Liên kết User với Role
 */
@Entity
@Table(name = "UserRoles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(UserRole.UserRoleId.class)
public class UserRole {
    
    @Id
    @Column(name = "UserID", length = 20)
    private String userId;
    
    @Id
    @Column(name = "RoleID")
    private Integer roleId;
    
    @Column(name = "AssignedAt", nullable = false)
    private LocalDateTime assignedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleID", insertable = false, updatable = false)
    private Role role;
    
    @PrePersist
    protected void onCreate() {
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
    }
    
    // Composite Key Class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRoleId implements Serializable {
        private String userId;
        private Integer roleId;
    }
}
