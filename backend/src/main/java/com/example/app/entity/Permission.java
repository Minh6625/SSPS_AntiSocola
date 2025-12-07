package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * ENTITY: Permissions - Quyền hạn
 */
@Entity
@Table(name = "Permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PermissionID")
    private Integer permissionId;
    
    @Column(name = "PermissionKey", nullable = false, unique = true, length = 100)
    private String permissionKey;
    
    @Column(name = "Description", length = 200)
    private String description;
}
