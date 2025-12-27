package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDTO {
    private Integer roomId;
    private Integer buildingId;
    private String buildingName;
    private String roomNumber;
    private String roomName;
    private String roomType;
    private Integer capacity;
    private Boolean isActive;
}
