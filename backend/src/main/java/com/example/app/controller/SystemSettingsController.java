package com.example.app.controller;

import com.example.app.dto.*;
import com.example.app.service.interfaces.ISystemSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * CONTROLLER: System Settings (SPSO only)
 * Quản lý cấu hình hệ thống và học kỳ
 */
@RestController
@RequestMapping("/api/spso/settings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "System Settings", description = "API quản lý cấu hình hệ thống (SPSO only)")
@PreAuthorize("hasRole('SPSO')")
public class SystemSettingsController {
    
    private final ISystemSettingsService systemSettingsService;
    
    /**
     * GET /api/spso/settings - Lấy tất cả cấu hình hệ thống
     */
    @GetMapping
    @Operation(summary = "Lấy tất cả cấu hình hệ thống", 
               description = "Lấy tất cả configs, semesters, file types")
    public ResponseEntity<SystemSettingsResponseDTO> getAllSettings() {
        log.info("SPSO requesting all system settings");
        
        SystemSettingsResponseDTO result = systemSettingsService.getAllSettings();
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/spso/settings/config/{configKey} - Lấy một config
     */
    @GetMapping("/config/{configKey}")
    @Operation(summary = "Lấy một config theo key")
    public ResponseEntity<SystemConfigDTO> getConfig(
            @Parameter(description = "Config key")
            @PathVariable String configKey) {
        log.info("SPSO requesting config: {}", configKey);
        
        SystemConfigDTO result = systemSettingsService.getConfig(configKey);
        return ResponseEntity.ok(result);
    }
    
    /**
     * PUT /api/spso/settings/config - Cập nhật một config
     */
    @PutMapping("/config")
    @Operation(summary = "Cập nhật một config")
    public ResponseEntity<SystemConfigDTO> updateConfig(
            @Valid @RequestBody UpdateSystemConfigRequestDTO request) {
        log.info("SPSO updating config: {} = {}", request.getConfigKey(), request.getConfigValue());
        
        SystemConfigDTO result = systemSettingsService.updateConfig(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * PUT /api/spso/settings/configs - Cập nhật nhiều configs cùng lúc
     */
    @PutMapping("/configs")
    @Operation(summary = "Cập nhật nhiều configs cùng lúc")
    public ResponseEntity<Map<String, SystemConfigDTO>> updateMultipleConfigs(
            @RequestBody Map<String, String> configs,
            @RequestParam String updatedBy) {
        log.info("SPSO updating {} configs", configs.size());
        
        Map<String, SystemConfigDTO> result = systemSettingsService.updateMultipleConfigs(configs, updatedBy);
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/spso/settings/semesters - Lấy tất cả học kỳ
     */
    @GetMapping("/semesters")
    @Operation(summary = "Lấy tất cả học kỳ")
    public ResponseEntity<List<SemesterDTO>> getAllSemesters() {
        log.info("SPSO requesting all semesters");
        
        List<SemesterDTO> result = systemSettingsService.getAllSemesters();
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/spso/settings/semesters/current - Lấy học kỳ hiện tại
     */
    @GetMapping("/semesters/current")
    @Operation(summary = "Lấy học kỳ hiện tại")
    public ResponseEntity<SemesterDTO> getCurrentSemester() {
        log.info("SPSO requesting current semester");
        
        SemesterDTO result = systemSettingsService.getCurrentSemester();
        return ResponseEntity.ok(result);
    }
    
    /**
     * POST /api/spso/settings/semesters - Tạo học kỳ mới
     */
    @PostMapping("/semesters")
    @Operation(summary = "Tạo học kỳ mới")
    public ResponseEntity<SemesterDTO> createSemester(
            @Valid @RequestBody CreateSemesterRequestDTO request) {
        log.info("SPSO creating semester: {}", request.getSemesterCode());
        
        SemesterDTO result = systemSettingsService.createSemester(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * PUT /api/spso/settings/semesters - Cập nhật học kỳ
     */
    @PutMapping("/semesters")
    @Operation(summary = "Cập nhật học kỳ")
    public ResponseEntity<SemesterDTO> updateSemester(
            @Valid @RequestBody UpdateSemesterRequestDTO request) {
        log.info("SPSO updating semester: {}", request.getSemesterId());
        
        SemesterDTO result = systemSettingsService.updateSemester(request);
        return ResponseEntity.ok(result);
    }
    
    /**
     * PUT /api/spso/settings/semesters/{semesterId}/set-current - Đặt học kỳ làm current
     */
    @PutMapping("/semesters/{semesterId}/set-current")
    @Operation(summary = "Đặt học kỳ làm current")
    public ResponseEntity<SemesterDTO> setCurrentSemester(
            @Parameter(description = "Semester ID")
            @PathVariable Integer semesterId,
            @RequestParam String updatedBy) {
        log.info("SPSO setting current semester: {}", semesterId);
        
        SemesterDTO result = systemSettingsService.setCurrentSemester(semesterId, updatedBy);
        return ResponseEntity.ok(result);
    }
    
    /**
     * DELETE /api/spso/settings/semesters/{semesterId} - Xóa học kỳ
     */
    @DeleteMapping("/semesters/{semesterId}")
    @Operation(summary = "Xóa học kỳ (soft delete)")
    public ResponseEntity<Void> deleteSemester(
            @Parameter(description = "Semester ID")
            @PathVariable Integer semesterId) {
        log.info("SPSO deleting semester: {}", semesterId);
        
        systemSettingsService.deleteSemester(semesterId);
        return ResponseEntity.noContent().build();
    }
}
