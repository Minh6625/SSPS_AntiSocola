package com.example.app.service;

import com.example.app.dto.PrintLogDTO;
import com.example.app.dto.PrintLogFilterDTO;
import com.example.app.dto.PrintLogStatsDTO;
import com.example.app.entity.PrintLog;
import com.example.app.repository.PrintLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PrintLogService {
    
    private final PrintLogRepository printLogRepository;
    private static final int MAX_EXPORT_ROWS = 10000;
    
    /**
     * Lấy danh sách print logs với filters và pagination
     */
    public Page<PrintLogDTO> getPrintLogs(PrintLogFilterDTO filter) {
        log.info("Getting print logs with filter: {}", filter);
        
        // Validate filter
        validateFilter(filter);
        
        // Create pageable
        Sort sort = createSort(filter.getSortBy(), filter.getSortDirection());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);
        
        // Query database
        Page<PrintLog> printLogs = printLogRepository.findLogsWithFilters(
            filter.getStudentSearch(),
            filter.getPrinterId(),
            filter.getStatus(),
            filter.getStartDate(),
            filter.getEndDate(),
            filter.getDocumentName(),
            pageable
        );
        
        // Convert to DTO
        return printLogs.map(PrintLogDTO::new);
    }
    
    /**
     * Lấy chi tiết một print log
     */
    public Optional<PrintLogDTO> getPrintLogById(Integer logId) {
        log.info("Getting print log detail for ID: {}", logId);
        
        return printLogRepository.findById(logId)
            .map(PrintLogDTO::new);
    }
    
    /**
     * Đếm số lượng logs với filter (cho export)
     */
    public Long countLogsWithFilter(PrintLogFilterDTO filter) {
        return printLogRepository.countLogsWithFilters(
            filter.getStudentSearch(),
            filter.getPrinterId(),
            filter.getStatus(),
            filter.getStartDate(),
            filter.getEndDate(),
            filter.getDocumentName()
        );
    }
    
    /**
     * Lấy logs cho export (không pagination)
     */
    public List<PrintLogDTO> getLogsForExport(PrintLogFilterDTO filter) {
        log.info("Getting logs for export with filter: {}", filter);
        
        // Kiểm tra số lượng
        Long count = countLogsWithFilter(filter);
        if (count > MAX_EXPORT_ROWS) {
            throw new IllegalArgumentException(
                String.format("Vượt quá %d lệnh in. Hiện tại có %d lệnh. Vui lòng thu hẹp bộ lọc.", 
                    MAX_EXPORT_ROWS, count)
            );
        }
        
        List<PrintLog> printLogs = printLogRepository.findLogsForExport(
            filter.getStudentSearch(),
            filter.getPrinterId(),
            filter.getStatus(),
            filter.getStartDate(),
            filter.getEndDate(),
            filter.getDocumentName()
        );
        
        return printLogs.stream()
            .map(PrintLogDTO::new)
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy thống kê print logs
     */
    public PrintLogStatsDTO getPrintLogStats(PrintLogFilterDTO filter) {
        log.info("Getting print log statistics with filter: {}", filter);
        
        // Lấy tất cả logs với filter
        List<PrintLog> logs = printLogRepository.findLogsForExport(
            filter.getStudentSearch(),
            filter.getPrinterId(),
            filter.getStatus(),
            filter.getStartDate(),
            filter.getEndDate(),
            filter.getDocumentName()
        );
        
        if (logs.isEmpty()) {
            return new PrintLogStatsDTO(0L, 0L, 0L, 0L, 0L, 0L, 0, 0, 0);
        }
        
        // Tính toán thống kê
        long totalLogs = logs.size();
        long completedLogs = logs.stream().mapToLong(log -> "Completed".equals(log.getStatus()) ? 1 : 0).sum();
        long failedLogs = logs.stream().mapToLong(log -> "Failed".equals(log.getStatus()) ? 1 : 0).sum();
        long cancelledLogs = logs.stream().mapToLong(log -> "Cancelled".equals(log.getStatus()) ? 1 : 0).sum();
        long pendingLogs = logs.stream().mapToLong(log -> "Pending".equals(log.getStatus()) ? 1 : 0).sum();
        long printingLogs = logs.stream().mapToLong(log -> "Printing".equals(log.getStatus()) ? 1 : 0).sum();
        
        int totalPages = logs.stream().mapToInt(PrintLog::getPagesPrinted).sum();
        int maxPages = logs.stream().mapToInt(PrintLog::getPagesPrinted).max().orElse(0);
        int minPages = logs.stream().mapToInt(PrintLog::getPagesPrinted).min().orElse(0);
        
        return new PrintLogStatsDTO(
            totalLogs, completedLogs, failedLogs, cancelledLogs, 
            pendingLogs, printingLogs, totalPages, maxPages, minPages
        );
    }
    
    /**
     * Validate filter parameters
     */
    private void validateFilter(PrintLogFilterDTO filter) {
        if (!filter.isValidDateRange()) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        
        if (!filter.isValidPageSize()) {
            throw new IllegalArgumentException("Kích thước trang không hợp lệ (1-100)");
        }
        
        if (!filter.isValidPage()) {
            throw new IllegalArgumentException("Số trang không hợp lệ");
        }
        
        if (!filter.isValidSortBy()) {
            throw new IllegalArgumentException("Tiêu chí sắp xếp không hợp lệ");
        }
        
        if (!filter.isValidSortDirection()) {
            throw new IllegalArgumentException("Thứ tự sắp xếp không hợp lệ");
        }
        
        // Validate date range không quá 1 năm
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            LocalDateTime oneYearLater = filter.getStartDate().plusYears(1);
            if (filter.getEndDate().isAfter(oneYearLater)) {
                throw new IllegalArgumentException("Khoảng thời gian tối đa là 1 năm");
            }
        }
        
        // Validate không chọn ngày tương lai
        LocalDateTime now = LocalDateTime.now();
        if (filter.getStartDate() != null && filter.getStartDate().isAfter(now)) {
            throw new IllegalArgumentException("Không thể chọn ngày tương lai");
        }
        if (filter.getEndDate() != null && filter.getEndDate().isAfter(now)) {
            throw new IllegalArgumentException("Không thể chọn ngày tương lai");
        }
    }
    
    /**
     * Tạo Sort object
     */
    private Sort createSort(String sortBy, String sortDirection) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection) 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
            
        // Map sort fields
        String field = switch (sortBy) {
            case "studentName" -> "student.fullName";
            case "pagesPrinted" -> "pagesPrinted";
            case "status" -> "status";
            default -> "printTime";
        };
        
        return Sort.by(direction, field);
    }
}