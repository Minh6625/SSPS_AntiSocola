package com.example.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequestDTO {
    
    @NotNull(message = "ID tòa nhà không được để trống")
    private Integer buildingId;
    
    @NotBlank(message = "Số phòng không được để trống")
    @Size(max = 20, message = "Số phòng không được vượt quá 20 ký tự")
    private String roomNumber;
    
    @Size(max = 100, message = "Tên phòng không được vượt quá 100 ký tự")
    private String roomName;
    
    @Size(max = 50, message = "Loại phòng không được vượt quá 50 ký tự")
    private String roomType;
    
    private Integer capacity;
    
    private Boolean isActive = true;
}
