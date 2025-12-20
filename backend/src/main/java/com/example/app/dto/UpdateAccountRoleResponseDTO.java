package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO: Response sau khi đổi role
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAccountRoleResponseDTO {
    private String userId;
    private String fullName;
    private String previousRole;
    private String newRole;
    private String message;
}
