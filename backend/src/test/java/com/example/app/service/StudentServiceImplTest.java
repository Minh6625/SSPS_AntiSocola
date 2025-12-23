package com.example.app.service;

import com.example.app.dto.*;
import com.example.app.entity.PageBalance;
import com.example.app.entity.PrintLog;
import com.example.app.entity.User;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.repository.PrintLogRepository;
import com.example.app.repository.StudentRepository;
import com.example.app.service.impl.StudentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit Tests cho StudentServiceImpl
 */
@ExtendWith(MockitoExtension.class)
class StudentServiceImplTest {
    
    @Mock
    private StudentRepository studentRepository;
    
    @Mock
    private PageBalanceRepository pageBalanceRepository;
    
    @Mock
    private PrintLogRepository printLogRepository;
    
    @Mock
    private ModelMapper modelMapper;
    
    @InjectMocks
    private StudentServiceImpl studentService;
    
    private User testStudent;
    private PageBalance testPageBalance;
    
    @BeforeEach
    void setUp() {
        testStudent = new User();
        testStudent.setUserId("S2123456");
        testStudent.setEmail("student@hcmiu.edu.vn");
        testStudent.setFullName("Nguyễn Văn A");
        testStudent.setPhoneNumber("0912345678");
        testStudent.setUserType("Student");
        testStudent.setStatus("Active");
        testStudent.setCreatedAt(LocalDateTime.now());
        
        testPageBalance = new PageBalance();
        testPageBalance.setStudentId("S2123456");
        testPageBalance.setA4Balance(120); // 100 A4 + (10 A3 * 2)
        testPageBalance.setLastUpdated(LocalDateTime.now());
    }
    
    @Test
    void testGetStudentList_Success() {
        // Arrange
        StudentFilterDTO filter = new StudentFilterDTO("S21", "Active", 1, 20, "studentId", "ASC");
        List<User> students = Arrays.asList(testStudent);
        Page<User> studentPage = new PageImpl<>(students, PageRequest.of(0, 20), 1);
        
        when(studentRepository.findStudentsWithFilter(anyString(), anyString(), any(Pageable.class)))
            .thenReturn(studentPage);
        when(pageBalanceRepository.findById("S2123456"))
            .thenReturn(Optional.of(testPageBalance));
        when(printLogRepository.countByStudentId("S2123456"))
            .thenReturn(5L);
        
        // Act
        Page<StudentListDTO> result = studentService.getStudentList(filter);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(studentRepository, times(1)).findStudentsWithFilter(anyString(), anyString(), any(Pageable.class));
    }
    
    @Test
    void testGetStudentDetail_Success() {
        // Arrange
        when(studentRepository.findStudentById("S2123456"))
            .thenReturn(Optional.of(testStudent));
        when(pageBalanceRepository.findById("S2123456"))
            .thenReturn(Optional.of(testPageBalance));
        when(printLogRepository.countByStudentId("S2123456"))
            .thenReturn(25L);
        when(printLogRepository.sumA4EquivalentByStudentId("S2123456"))
            .thenReturn(450);
        when(printLogRepository.findLastPrintTimeByStudentId("S2123456"))
            .thenReturn(LocalDateTime.now());
        
        // Act
        StudentDetailDTO result = studentService.getStudentDetail("S2123456");
        
        // Assert
        assertNotNull(result);
        assertEquals("S2123456", result.getStudentId());
        assertEquals("Nguyễn Văn A", result.getFullName());
        assertEquals(120, result.getA4Balance()); // A4 balance from pageBalance
        assertEquals(0, result.getA3Balance()); // No A3 support
        assertEquals(120, result.getTotalA4Equivalent()); // Same as A4 balance
        assertEquals(25L, result.getTotalPrintJobs());
        verify(studentRepository, times(1)).findStudentById("S2123456");
    }
    
    @Test
    void testGetStudentDetail_StudentNotFound() {
        // Arrange
        when(studentRepository.findStudentById("S9999999"))
            .thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            studentService.getStudentDetail("S9999999");
        });
    }
    
    @Test
    void testAllocatePages_Success() {
        // Arrange
        AllocatePageRequestDTO request = new AllocatePageRequestDTO("S2123456", 50, 5, "Cấp trang học kỳ 1");
        
        when(studentRepository.findStudentById("S2123456"))
            .thenReturn(Optional.of(testStudent));
        when(pageBalanceRepository.findById("S2123456"))
            .thenReturn(Optional.of(testPageBalance));
        when(pageBalanceRepository.save(any(PageBalance.class)))
            .thenReturn(testPageBalance);
        
        // Act
        studentService.allocatePages(request);
        
        // Assert
        verify(pageBalanceRepository, times(1)).save(any(PageBalance.class));
    }
    
    @Test
    void testAllocatePages_NegativePages() {
        // Arrange
        AllocatePageRequestDTO request = new AllocatePageRequestDTO("S2123456", -10, 5, "Invalid");
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            studentService.allocatePages(request);
        });
    }
    
    @Test
    void testUpdateStudentStatus_Success() {
        // Arrange
        UpdateStudentStatusRequestDTO request = new UpdateStudentStatusRequestDTO("S2123456", "Suspended", "Vi phạm");
        
        when(studentRepository.findStudentById("S2123456"))
            .thenReturn(Optional.of(testStudent));
        when(studentRepository.save(any(User.class)))
            .thenReturn(testStudent);
        
        // Act
        studentService.updateStudentStatus(request);
        
        // Assert
        verify(studentRepository, times(1)).save(any(User.class));
    }
    
    @Test
    void testUpdateStudentStatus_InvalidStatus() {
        // Arrange
        UpdateStudentStatusRequestDTO request = new UpdateStudentStatusRequestDTO("S2123456", "InvalidStatus", "");
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            studentService.updateStudentStatus(request);
        });
    }
    
    @Test
    void testDeleteStudent_Success() {
        // Arrange
        when(studentRepository.findStudentById("S2123456"))
            .thenReturn(Optional.of(testStudent));
        when(studentRepository.save(any(User.class)))
            .thenReturn(testStudent);
        
        // Act
        studentService.deleteStudent("S2123456");
        
        // Assert
        verify(studentRepository, times(1)).save(any(User.class));
        assertEquals("Inactive", testStudent.getStatus());
    }
}
