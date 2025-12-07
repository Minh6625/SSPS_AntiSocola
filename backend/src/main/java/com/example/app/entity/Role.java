package com.example.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * ENTITY: Roles - Vai trò
 */
@Entity
@Table(name = "Roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoleID")
    private Integer roleId;
    
    @Column(name = "RoleName", nullable = false, unique = true, length = 50)
    private String roleName;
    
    @Column(name = "Description", length = 200)
    private String description;
}
