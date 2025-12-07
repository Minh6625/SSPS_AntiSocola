package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * ENTITY: RolePermissions - Liên kết Role với Permission
 */
@Entity
@Table(name = "RolePermissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(RolePermission.RolePermissionId.class)
public class RolePermission {
    
    @Id
    @Column(name = "RoleID")
    private Integer roleId;
    
    @Id
    @Column(name = "PermissionID")
    private Integer permissionId;
    
    @Column(name = "GrantedAt", nullable = false)
    private LocalDateTime grantedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleID", insertable = false, updatable = false)
    private Role role;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PermissionID", insertable = false, updatable = false)
    private Permission permission;
    
    @PrePersist
    protected void onCreate() {
        if (grantedAt == null) {
            grantedAt = LocalDateTime.now();
        }
    }
    
    // Composite Key Class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RolePermissionId implements Serializable {
        private Integer roleId;
        private Integer permissionId;
    }
}
