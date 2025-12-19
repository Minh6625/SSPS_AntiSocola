package com.example.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ENTITY: Campuses - Campus (Reference Table)
 */
@Entity
@Table(name = "Campuses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Campus {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CampusID")
    private Integer campusId;
    
    @Column(name = "CampusCode", nullable = false, unique = true, length = 20)
    private String campusCode;
    
    @Column(name = "CampusName", nullable = false, length = 100)
    private String campusName;
    
    @Column(name = "Address", length = 200)
    private String address;
    
    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "campus", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Building> buildings;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
