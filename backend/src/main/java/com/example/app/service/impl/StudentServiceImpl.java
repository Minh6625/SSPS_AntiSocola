package com.example.app.service.impl;

import com.example.app.dto.*;
import com.example.app.entity.PageBalance;
import com.example.app.entity.PrintLog;
import com.example.app.entity.User;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.repository.PrintLogRepository;
import com.example.app.repository.StudentRepository;
import com.example.app.service.interfaces.IStudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE LAYER - Business Logic
 * Xử lý logic quản lý sinh viên cho SPSO
 * Tuân thủ @Transactional cho data consistency
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudentServiceImpl implements IStudentService {
    
    private final StudentRepository studentRepository;
    private final PageBalanceRepository pageBalanceRepository;
    private final PrintLogRepository printLogRepository;
    private final ModelMapper modelMapper;
    
    /**
     * Lấy danh sách sinh viên với filter
     */
    @Override
    @Transactional(readOnly = true)
    public Page<StudentListDTO> getStudentList(StudentFilterDTO filter) {
        log.info("Fetching student list with filter: keyword={}, status={}, page={}", 
                 filter.getKeyword(), filter.getStatus(), filter.getPageNumber());
        
        // Validate input
        validateFilterInput(filter);
        
        // Build Pageable (without sort, since we handle it in query)
        Pageable pageable = PageRequest.of(
            filter.getPageNumber() - 1,  // Convert 1-based to 0-based
            filter.getPageSize()
        );
        
        // Query database based on sortBy
        String keyword = filter.getKeyword() != null ? filter.getKeyword() : "";
        Page<User> students;
        
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "studentId";
        switch (sortBy) {
            case "fullName":
                students = studentRepository.findStudentsWithFilterSortByName(
                    keyword, filter.getStatus(), pageable);
                break;
            case "lastLogin":
                students = studentRepository.findStudentsWithFilterSortByLastLogin(
                    keyword, filter.getStatus(), pageable);
                break;
            default:  // studentId
                students = studentRepository.findStudentsWithFilter(
                    keyword, filter.getStatus(), pageable);
                break;
        }
        
        // Map to DTO
        List<StudentListDTO> dtos = students.getContent().stream()
            .map(this::mapToStudentListDTO)
            .collect(Collectors.toList());
        
        log.info("Found {} students", dtos.size());
        return new PageImpl<>(dtos, pageable, students.getTotalElements());
    }
    
    /**
     * Lấy chi tiết sinh viên
     */
    @Override
    @Transactional(readOnly = true)
    public StudentDetailDTO getStudentDetail(String studentId) {
        log.info("Fetching student detail: {}", studentId);
        
        // Validate input
        if (studentId == null || studentId.trim().isEmpty()) {
            throw new IllegalArgumentException("Student ID không được để trống");
        }
        
        // Find student
        User student = studentRepository.findStudentById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Sinh viên không tồn tại: " + studentId));
        
        // Get page balance
        PageBalance pageBalance = pageBalanceRepository.findById(studentId)
            .orElse(new PageBalance(studentId, 0, LocalDateTime.now(), student));
        
        // Get statistics
        Long totalJobs = printLogRepository.countByStudentId(studentId);
        Integer totalPages = printLogRepository.sumA4EquivalentByStudentId(studentId);
        LocalDateTime lastPrint = printLogRepository.findLastPrintTimeByStudentId(studentId);
        
        // Map to DTO
        StudentDetailDTO dto = new StudentDetailDTO();
        dto.setStudentId(student.getUserId());
        dto.setEmail(student.getEmail());
        dto.setFullName(student.getFullName());
        dto.setPhoneNumber(student.getPhoneNumber());
        dto.setStatus(student.getStatus());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setLastLogin(student.getLastLogin());
        dto.setA4Balance(pageBalance.getA4Balance());
        dto.setA3Balance(0); // System stores only A4 equivalent (A3 = 2×A4)
        dto.setTotalA4Equivalent(pageBalance.getA4Balance()); // Total A4 equivalent
        dto.setTotalPrintJobs(totalJobs != null ? totalJobs : 0L);
        dto.setTotalPagesPrinted(totalPages != null ? totalPages.longValue() : 0L);
        dto.setLastPrintTime(lastPrint);
        
        log.info("Student detail fetched successfully: {}", studentId);
        return dto;
    }
    
    /**
     * Cấp trang miễn phí cho sinh viên
     */
    @Override
    @Transactional
    public AllocatePageResponseDTO allocatePages(AllocatePageRequestDTO request) {
        log.info("Allocating pages to student: {}, A4={}, A3={}", 
                 request.getStudentId(), request.getA4Pages(), request.getA3Pages());
        
        // Validate input
        if (request.getA4Pages() < 0 || request.getA3Pages() < 0) {
            throw new IllegalArgumentException("Số trang không được âm");
        }
        
        // Find student
        User student = studentRepository.findStudentById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Sinh viên không tồn tại"));
        
        // Get or create page balance
        PageBalance pageBalance = pageBalanceRepository.findById(request.getStudentId())
            .orElse(new PageBalance(request.getStudentId(), 0, LocalDateTime.now(), student));
        
        // Update balance (convert A3 to A4 equivalent)
        int totalA4ToAdd = request.getA4Pages() + (request.getA3Pages() * 2);
        pageBalance.setA4Balance(pageBalance.getA4Balance() + totalA4ToAdd);
        pageBalance.setLastUpdated(LocalDateTime.now());
        
        pageBalanceRepository.save(pageBalance);
        
        log.info("Pages allocated successfully to student: {}", request.getStudentId());
        
        // Build response
        return new AllocatePageResponseDTO(
            student.getUserId(),
            student.getFullName(),
            request.getA4Pages(),
            request.getA3Pages(),
            pageBalance.getA4Balance(),
            0, // No separate A3 balance
            pageBalance.getA4Balance(), // Total = A4 balance
            String.format("Đã cấp %d trang A4 và %d trang A3 cho sinh viên %s (tổng %d A4)", 
                         request.getA4Pages(), request.getA3Pages(), student.getFullName(), totalA4ToAdd)
        );
    }
    
    /**
     * Cập nhật trạng thái sinh viên
     */
    @Override
    @Transactional
    public UpdateStatusResponseDTO updateStudentStatus(UpdateStudentStatusRequestDTO request) {
        log.info("Updating student status: {}, status={}", 
                 request.getStudentId(), request.getStatus());
        
        // Validate status
        if (!isValidStatus(request.getStatus())) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + request.getStatus());
        }
        
        // Find student
        User student = studentRepository.findStudentById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Sinh viên không tồn tại"));
        
        String previousStatus = student.getStatus();
        
        // Update status
        student.setStatus(request.getStatus());
        studentRepository.save(student);
        
        log.info("Student status updated successfully: {}", request.getStudentId());
        
        // Build response
        return new UpdateStatusResponseDTO(
            student.getUserId(),
            student.getFullName(),
            previousStatus,
            request.getStatus(),
            String.format("Đã cập nhật trạng thái sinh viên %s từ '%s' sang '%s'", 
                         student.getFullName(), previousStatus, request.getStatus())
        );
    }
    
    /**
     * Lấy lịch sử in của sinh viên
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PrintLogDTO> getStudentPrintHistory(String studentId, Integer pageNumber, Integer pageSize) {
        log.info("Fetching print history for student: {}, page={}, size={}", 
                 studentId, pageNumber, pageSize);
        
        // Validate input
        if (studentId == null || studentId.trim().isEmpty()) {
            throw new IllegalArgumentException("Student ID không được để trống");
        }
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;
        
        // Verify student exists
        studentRepository.findStudentById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Sinh viên không tồn tại"));
        
        // Query database - không dùng Sort vì query đã có ORDER BY
        Pageable pageable = PageRequest.of(pageNumber - 1, pageSize);
        Page<PrintLog> logs = printLogRepository.findByStudentIdOrderByPrintTimeDesc(studentId, pageable);
        
        // Map to DTO
        List<PrintLogDTO> dtos = logs.getContent().stream()
            .map(printLog -> modelMapper.map(printLog, PrintLogDTO.class))
            .collect(Collectors.toList());
        
        log.info("Found {} print logs for student: {}", dtos.size(), studentId);
        return new PageImpl<>(dtos, pageable, logs.getTotalElements());
    }
    
    /**
     * Xóa sinh viên (Soft delete)
     */
    @Override
    @Transactional
    public void deleteStudent(String studentId) {
        log.info("Deleting student: {}", studentId);
        
        // Find student
        User student = studentRepository.findStudentById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Sinh viên không tồn tại"));
        
        // Soft delete - chỉ đổi status
        student.setStatus("Inactive");
        studentRepository.save(student);
        
        log.info("Student deleted (soft delete): {}", studentId);
    }
    
    // ============ HELPER METHODS ============
    
    /**
     * Map User entity to StudentListDTO
     */
    private StudentListDTO mapToStudentListDTO(User user) {
        StudentListDTO dto = new StudentListDTO();
        dto.setStudentId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setStatus(user.getStatus());
        dto.setLastLogin(user.getLastLogin());
        
        // Get page balance
        PageBalance pageBalance = pageBalanceRepository.findById(user.getUserId())
            .orElse(new PageBalance(user.getUserId(), 0, LocalDateTime.now(), user));
        dto.setA4Balance(pageBalance.getA4Balance());
        dto.setA3Balance(0); // No A3 support
        
        // Get total print jobs
        Long totalJobs = printLogRepository.countByStudentId(user.getUserId());
        dto.setTotalPrintJobs(totalJobs != null ? totalJobs : 0L);
        
        return dto;
    }
    
    /**
     * Validate filter input
     */
    private void validateFilterInput(StudentFilterDTO filter) {
        if (filter.getPageNumber() < 1) {
            filter.setPageNumber(1);
        }
        if (filter.getPageSize() < 1 || filter.getPageSize() > 100) {
            filter.setPageSize(20);
        }
        if (filter.getKeyword() == null) {
            filter.setKeyword("");
        }
    }
    
    /**
     * Check if status is valid
     */
    private boolean isValidStatus(String status) {
        return status != null && 
               (status.equals("Active") || status.equals("Inactive") || status.equals("Suspended"));
    }
}
