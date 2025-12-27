package com.example.app.service.interfaces;

import com.example.app.dto.*;

import java.util.List;
import java.util.Map;

/**
 * SERVICE INTERFACE: System Settings
 */
public interface ISystemSettingsService {
    
    /**
     * Lấy tất cả cấu hình hệ thống
     */
    SystemSettingsResponseDTO getAllSettings();
    
    /**
     * Lấy một config theo key
     */
    SystemConfigDTO getConfig(String configKey);
    
    /**
     * Cập nhật một config
     */
    SystemConfigDTO updateConfig(UpdateSystemConfigRequestDTO request);
    
    /**
     * Cập nhật nhiều configs cùng lúc
     */
    Map<String, SystemConfigDTO> updateMultipleConfigs(Map<String, String> configs, String updatedBy);
    
    /**
     * Lấy tất cả học kỳ
     */
    List<SemesterDTO> getAllSemesters();
    
    /**
     * Lấy học kỳ hiện tại
     */
    SemesterDTO getCurrentSemester();
    
    /**
     * Tạo học kỳ mới
     */
    SemesterDTO createSemester(CreateSemesterRequestDTO request);
    
    /**
     * Cập nhật học kỳ
     */
    SemesterDTO updateSemester(UpdateSemesterRequestDTO request);
    
    /**
     * Đặt học kỳ làm current
     */
    SemesterDTO setCurrentSemester(Integer semesterId, String updatedBy);
    
    /**
     * Xóa học kỳ (soft delete)
     */
    void deleteSemester(Integer semesterId);
}
