package com.example.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ENTITY: Buildings - Tòa nhà (Reference Table)
 */
@Entity
@Table(name = "Buildings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"CampusID", "BuildingCode"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Building {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BuildingID")
    private Integer buildingId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CampusID", nullable = false)
    @JsonIgnore
    private Campus campus;
    
    // Expose CampusID for JSON without accessing lazy relationship
    @Column(name = "CampusID", insertable = false, updatable = false)
    private Integer campusId;
    
    @Column(name = "BuildingCode", nullable = false, length = 20)
    private String buildingCode;
    
    @Column(name = "BuildingName", length = 100)
    private String buildingName;
    
    @Column(name = "FloorCount")
    private Integer floorCount;
    
    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "building", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Room> rooms;
    
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
