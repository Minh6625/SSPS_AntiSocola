package com.example.app.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO cho filter parameters
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrintLogFilterDTO {
    
    private String studentSearch; // Tìm kiếm theo MSSV, tên, hoặc email
    private Long printerId;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String documentName;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "printTime";
    private String sortDirection = "DESC";
    
    // Constructor with String printerId for controller
    public PrintLogFilterDTO(String studentSearch, String printerId, String status,
                             LocalDateTime startDate, LocalDateTime endDate, String documentName,
                             Integer page, Integer size, String sortBy, String sortDirection) {
        this.studentSearch = studentSearch;
        this.printerId = (printerId != null && !printerId.isEmpty()) ? Long.parseLong(printerId) : null;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.documentName = documentName;
        this.page = page;
        this.size = size;
        this.sortBy = sortBy;
        this.sortDirection = sortDirection;
    }
    
    // Validation methods
    public boolean isValidDateRange() {
        if (startDate == null || endDate == null) {
            return true; // Null dates are valid (no filter)
        }
        return !endDate.isBefore(startDate);
    }
    
    public boolean isValidPageSize() {
        return size != null && size > 0 && size <= 100;
    }
    
    public boolean isValidPage() {
        return page != null && page >= 0;
    }
    
    public boolean isValidSortBy() {
        if (sortBy == null) return true;
        return sortBy.matches("^(printTime|studentName|pagesPrinted|status)$");
    }
    
    public boolean isValidSortDirection() {
        if (sortDirection == null) return true;
        return sortDirection.matches("^(ASC|DESC)$");
    }
}