package com.example.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * ENTITY: Rooms - Phòng (Reference Table)
 */
@Entity
@Table(name = "Rooms", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"BuildingID", "RoomNumber"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoomID")
    private Integer roomId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BuildingID", nullable = false)
    @JsonIgnore
    private Building building;
    
    // Expose BuildingID for JSON without accessing lazy relationship
    @Column(name = "BuildingID", insertable = false, updatable = false)
    private Integer buildingId;
    
    @Column(name = "RoomNumber", nullable = false, length = 20)
    private String roomNumber;
    
    @Column(name = "RoomName", length = 100)
    private String roomName;
    
    @Column(name = "RoomType", length = 50)
    private String roomType;
    
    @Column(name = "Capacity")
    private Integer capacity;
    
    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
    
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
