package com.example.app.service.impl;

import com.example.app.dto.*;
import com.example.app.entity.Semester;
import com.example.app.entity.SystemConfig;
import com.example.app.repository.AllowedFileTypeRepository;
import com.example.app.repository.SemesterRepository;
import com.example.app.repository.SystemConfigRepository;
import com.example.app.service.interfaces.ISystemSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * SERVICE IMPLEMENTATION: System Settings
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SystemSettingsServiceImpl implements ISystemSettingsService {
    
    private final SystemConfigRepository systemConfigRepository;
    private final SemesterRepository semesterRepository;
    private final AllowedFileTypeRepository allowedFileTypeRepository;
    
    @Override
    @Transactional(readOnly = true)
    public SystemSettingsResponseDTO getAllSettings() {
        log.info("Getting all system settings");
        
        // Get all configs
        List<SystemConfig> configs = systemConfigRepository.findAll();
        Map<String, SystemConfigDTO> configMap = configs.stream()
            .collect(Collectors.toMap(
                SystemConfig::getConfigKey,
                config -> new SystemConfigDTO(
                    config.getConfigKey(),
                    config.getConfigValue(),
                    config.getDescription(),
                    config.getDataType()
                )
            ));
        
        // Get all semesters
        List<SemesterDTO> semesters = getAllSemesters();
        
        // Get current semester
        SemesterDTO currentSemester = getCurrentSemester();
        
        // Get allowed file types
        List<AllowedFileTypeDTO> allowedFileTypes = allowedFileTypeRepository.findAll().stream()
            .map(ft -> new AllowedFileTypeDTO(
                ft.getFileTypeId(),
                ft.getFileExtension(),
                ft.getMimeType(),
                ft.getMaxFileSizeMB(),
                ft.getIsAllowed()
            ))
            .collect(Collectors.toList());
        
        return new SystemSettingsResponseDTO(configMap, semesters, currentSemester, allowedFileTypes);
    }
    
    @Override
    @Transactional(readOnly = true)
    public SystemConfigDTO getConfig(String configKey) {
        log.info("Getting config: {}", configKey);
        
        SystemConfig config = systemConfigRepository.findByConfigKey(configKey)
            .orElseThrow(() -> new RuntimeException("Config not found: " + configKey));
        
        return new SystemConfigDTO(
            config.getConfigKey(),
            config.getConfigValue(),
            config.getDescription(),
            config.getDataType()
        );
    }
    
    @Override
    public SystemConfigDTO updateConfig(UpdateSystemConfigRequestDTO request) {
        log.info("Updating config: {} = {}", request.getConfigKey(), request.getConfigValue());
        
        SystemConfig config = systemConfigRepository.findByConfigKey(request.getConfigKey())
            .orElseThrow(() -> new RuntimeException("Config not found: " + request.getConfigKey()));
        
        // Validation: allowed_file_extensions không được để trống
        if ("allowed_file_extensions".equals(request.getConfigKey())) {
            String value = request.getConfigValue();
            if (value == null || value.trim().isEmpty()) {
                throw new IllegalArgumentException("Phải chọn ít nhất 1 định dạng file cho phép");
            }
            // Kiểm tra format: phải là danh sách các extension cách nhau bởi dấu phẩy
            String[] extensions = value.split(",");
            if (extensions.length == 0) {
                throw new IllegalArgumentException("Phải chọn ít nhất 1 định dạng file cho phép");
            }
        }
        
        config.setConfigValue(request.getConfigValue());
        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(request.getUpdatedBy());
        
        SystemConfig saved = systemConfigRepository.save(config);
        
        return new SystemConfigDTO(
            saved.getConfigKey(),
            saved.getConfigValue(),
            saved.getDescription(),
            saved.getDataType()
        );
    }
    
    @Override
    public Map<String, SystemConfigDTO> updateMultipleConfigs(Map<String, String> configs, String updatedBy) {
        log.info("Updating {} configs", configs.size());
        
        Map<String, SystemConfigDTO> result = new HashMap<>();
        
        for (Map.Entry<String, String> entry : configs.entrySet()) {
            UpdateSystemConfigRequestDTO request = new UpdateSystemConfigRequestDTO(
                entry.getKey(),
                entry.getValue(),
                updatedBy
            );
            result.put(entry.getKey(), updateConfig(request));
        }
        
        return result;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SemesterDTO> getAllSemesters() {
        log.info("Getting all semesters");
        
        return semesterRepository.findAllByOrderByStartDateDesc().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public SemesterDTO getCurrentSemester() {
        log.info("Getting current semester");
        
        return semesterRepository.findByIsCurrentTrue()
            .map(this::convertToDTO)
            .orElse(null);
    }
    
    @Override
    public SemesterDTO createSemester(CreateSemesterRequestDTO request) {
        log.info("Creating semester: {}", request.getSemesterCode());
        
        // Check if semester code already exists
        if (semesterRepository.existsBySemesterCode(request.getSemesterCode())) {
            throw new RuntimeException("Mã học kỳ đã tồn tại: " + request.getSemesterCode());
        }
        
        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        
        // If this is set as current, unset all other current semesters
        if (Boolean.TRUE.equals(request.getIsCurrent())) {
            semesterRepository.unsetAllCurrent();
        }
        
        Semester semester = new Semester();
        semester.setSemesterCode(request.getSemesterCode());
        semester.setSemesterName(request.getSemesterName());
        semester.setAcademicYear(request.getAcademicYear());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setDefaultA4Pages(request.getDefaultA4Pages());
        semester.setPageAllocationDate(request.getPageAllocationDate());
        semester.setIsActive(true);
        semester.setIsCurrent(request.getIsCurrent());
        semester.setCreatedBy(request.getCreatedBy());
        
        Semester saved = semesterRepository.save(semester);
        
        return convertToDTO(saved);
    }
    
    @Override
    public SemesterDTO updateSemester(UpdateSemesterRequestDTO request) {
        log.info("Updating semester: {}", request.getSemesterId());
        
        Semester semester = semesterRepository.findById(request.getSemesterId())
            .orElseThrow(() -> new RuntimeException("Học kỳ không tồn tại"));
        
        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        
        // If this is set as current, unset all other current semesters
        if (Boolean.TRUE.equals(request.getIsCurrent()) && !semester.getIsCurrent()) {
            semesterRepository.unsetAllCurrent();
        }
        
        semester.setSemesterName(request.getSemesterName());
        semester.setAcademicYear(request.getAcademicYear());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setDefaultA4Pages(request.getDefaultA4Pages());
        semester.setPageAllocationDate(request.getPageAllocationDate());
        
        if (request.getIsActive() != null) {
            semester.setIsActive(request.getIsActive());
        }
        if (request.getIsCurrent() != null) {
            semester.setIsCurrent(request.getIsCurrent());
        }
        
        semester.setUpdatedBy(request.getUpdatedBy());
        
        Semester saved = semesterRepository.save(semester);
        
        return convertToDTO(saved);
    }
    
    @Override
    public SemesterDTO setCurrentSemester(Integer semesterId, String updatedBy) {
        log.info("Setting current semester: {}", semesterId);
        
        Semester semester = semesterRepository.findById(semesterId)
            .orElseThrow(() -> new RuntimeException("Học kỳ không tồn tại"));
        
        // Unset all current semesters
        semesterRepository.unsetAllCurrent();
        
        // Set this semester as current
        semester.setIsCurrent(true);
        semester.setUpdatedBy(updatedBy);
        
        Semester saved = semesterRepository.save(semester);
        
        return convertToDTO(saved);
    }
    
    @Override
    public void deleteSemester(Integer semesterId) {
        log.info("Deleting semester: {}", semesterId);
        
        Semester semester = semesterRepository.findById(semesterId)
            .orElseThrow(() -> new RuntimeException("Học kỳ không tồn tại"));
        
        // Don't allow deleting current semester
        if (Boolean.TRUE.equals(semester.getIsCurrent())) {
            throw new RuntimeException("Không thể xóa học kỳ hiện tại");
        }
        
        // Soft delete
        semester.setIsActive(false);
        semesterRepository.save(semester);
    }
    
    private SemesterDTO convertToDTO(Semester semester) {
        return new SemesterDTO(
            semester.getSemesterId(),
            semester.getSemesterCode(),
            semester.getSemesterName(),
            semester.getAcademicYear(),
            semester.getStartDate(),
            semester.getEndDate(),
            semester.getDefaultA4Pages(),
            semester.getPageAllocationDate(),
            semester.getIsActive(),
            semester.getIsCurrent()
        );
    }
}
