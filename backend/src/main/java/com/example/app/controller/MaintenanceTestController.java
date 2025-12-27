package com.example.app.controller;

import com.example.app.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * TEST CONTROLLER: Maintenance Mode
 * Endpoint để test maintenance mode
 */
@RestController
@RequestMapping("/api/test/maintenance")
@RequiredArgsConstructor
@Slf4j
public class MaintenanceTestController {
    
    private final SystemConfigRepository systemConfigRepository;
    
    /**
     * GET /api/test/maintenance/status
     * Kiểm tra trạng thái maintenance mode
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMaintenanceStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        String maintenanceValue = systemConfigRepository.findByConfigKey("system_maintenance_mode")
            .map(config -> config.getConfigValue())
            .orElse("NOT_FOUND");
        
        boolean isMaintenanceMode = "true".equalsIgnoreCase(maintenanceValue);
        
        Map<String, Object> response = new HashMap<>();
        response.put("maintenanceMode", isMaintenanceMode);
        response.put("configValue", maintenanceValue);
        response.put("username", auth != null ? auth.getName() : "anonymous");
        response.put("authorities", auth != null ? auth.getAuthorities().toString() : "none");
        response.put("message", "Interceptor should block this if maintenance is ON and user is Student");
        
        log.info("Maintenance status check: mode={}, user={}, role={}", 
            isMaintenanceMode, 
            auth != null ? auth.getName() : "anonymous",
            auth != null ? auth.getAuthorities() : "none");
        
        return ResponseEntity.ok(response);
    }
}
