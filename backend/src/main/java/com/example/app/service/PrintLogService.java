package com.example.app.service;

import com.example.app.dto.PrintLogDTO;
import com.example.app.dto.PrintLogFilterDTO;
import com.example.app.dto.PrintLogStatsDTO;
import com.example.app.entity.PrintJob;
import com.example.app.repository.PrintJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.JoinType;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * SERVICE: PrintLog - Nhật ký in (dựa trên PrintJobs)
 * SPSO xem tất cả lệnh in trong hệ thống
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PrintLogService {
    
    private final PrintJobRepository printJobRepository;
    private static final int MAX_EXPORT_ROWS = 10000;

    /**
     * Lấy danh sách print logs với filters và pagination
     */
    public Page<PrintLogDTO> getPrintLogs(PrintLogFilterDTO filter) {
        log.info("Getting print logs with filter: {}", filter);
        
        try {
            // Create pageable
            Sort sort = createSort(filter.getSortBy(), filter.getSortDirection());
            Pageable pageable = PageRequest.of(
                filter.getPage() != null ? filter.getPage() : 0, 
                filter.getSize() != null ? filter.getSize() : 20, 
                sort
            );
            
            // Apply filters using Specification
            Page<PrintJob> printJobs = printJobRepository.findAll(createSpecification(filter), pageable);
            
            // Convert to DTO
            return printJobs.map(this::convertToDTO);
        } catch (Exception e) {
            log.error("Error getting print logs: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Lấy chi tiết một print log
     */
    public Optional<PrintLogDTO> getPrintLogById(Integer logId) {
        log.info("Getting print log detail for ID: {}", logId);
        return printJobRepository.findById(logId).map(this::convertToDTO);
    }
    
    /**
     * Đếm số lượng logs với filter
     */
    public Long countLogsWithFilter(PrintLogFilterDTO filter) {
        return printJobRepository.count();
    }
    
    /**
     * Lấy logs cho export
     */
    public List<PrintLogDTO> getLogsForExport(PrintLogFilterDTO filter) {
        log.info("Getting logs for export");
        
        Long count = countLogsWithFilter(filter);
        if (count > MAX_EXPORT_ROWS) {
            throw new IllegalArgumentException(
                String.format("Vượt quá %d lệnh in. Hiện tại có %d lệnh.", MAX_EXPORT_ROWS, count)
            );
        }
        
        List<PrintJob> jobs = printJobRepository.findAll(Sort.by(Sort.Direction.DESC, "submittedAt"));
        return jobs.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Lấy thống kê print logs
     */
    public PrintLogStatsDTO getPrintLogStats(PrintLogFilterDTO filter) {
        log.info("Getting print log statistics");
        
        try {
            List<PrintJob> jobs = printJobRepository.findAll(createSpecification(filter));
            
            if (jobs.isEmpty()) {
                return new PrintLogStatsDTO(0L, 0L, 0L, 0L, 0L, 0L, 0, 0, 0);
            }
            
            long totalLogs = jobs.size();
            long completedLogs = jobs.stream().filter(j -> "Completed".equals(j.getJobStatus())).count();
            long failedLogs = jobs.stream().filter(j -> "Failed".equals(j.getJobStatus())).count();
            long cancelledLogs = jobs.stream().filter(j -> "Cancelled".equals(j.getJobStatus())).count();
            long pendingLogs = jobs.stream().filter(j -> "Pending".equals(j.getJobStatus())).count();
            long printingLogs = jobs.stream().filter(j -> "Printing".equals(j.getJobStatus())).count();
            
            int totalPages = jobs.stream().mapToInt(j -> j.getA4EquivalentPages() != null ? j.getA4EquivalentPages() : 0).sum();
            int maxPages = jobs.stream().mapToInt(j -> j.getA4EquivalentPages() != null ? j.getA4EquivalentPages() : 0).max().orElse(0);
            int minPages = jobs.stream().mapToInt(j -> j.getA4EquivalentPages() != null ? j.getA4EquivalentPages() : 0).min().orElse(0);
            
            return new PrintLogStatsDTO(totalLogs, completedLogs, failedLogs, cancelledLogs, pendingLogs, printingLogs, totalPages, maxPages, minPages);
        } catch (Exception e) {
            log.error("Error getting stats: {}", e.getMessage());
            return new PrintLogStatsDTO(0L, 0L, 0L, 0L, 0L, 0L, 0, 0, 0);
        }
    }

    /**
     * Convert PrintJob to PrintLogDTO
     */
    private PrintLogDTO convertToDTO(PrintJob job) {
        PrintLogDTO dto = new PrintLogDTO();
        dto.setLogId(job.getJobId());
        dto.setJobId(job.getJobId());
        dto.setStudentId(job.getStudentId());
        dto.setPrinterId(job.getPrinterId());
        dto.setPaperSize(job.getPaperSize());
        dto.setPagesPrinted(job.getTotalPagesToPrint() != null ? job.getTotalPagesToPrint() : 0);
        dto.setA4EquivalentUsed(job.getA4EquivalentPages() != null ? job.getA4EquivalentPages() : 0);
        dto.setPrintTime(job.getSubmittedAt());
        dto.setStatus(job.getJobStatus());
        dto.setStatusDisplay(getStatusDisplay(job.getJobStatus()));
        dto.setErrorMessage(job.getErrorMessage());
        
        // Calculate duration
        if (job.getStartedAt() != null && job.getCompletedAt() != null) {
            dto.setDurationSeconds((int) java.time.Duration.between(job.getStartedAt(), job.getCompletedAt()).getSeconds());
        }
        
        // Load document name
        try {
            if (job.getDocument() != null) {
                dto.setDocumentName(job.getDocument().getOriginalFileName());
                dto.setFileType(getFileType(job.getDocument().getOriginalFileName()));
            }
        } catch (Exception e) {
            log.debug("Could not load document for job {}", job.getJobId());
        }
        
        // Load student info
        try {
            if (job.getStudent() != null) {
                dto.setStudentName(job.getStudent().getFullName());
                dto.setStudentEmail(job.getStudent().getEmail());
            }
        } catch (Exception e) {
            log.debug("Could not load student for job {}", job.getJobId());
        }
        
        // Load printer info
        try {
            if (job.getPrinter() != null) {
                dto.setPrinterName(job.getPrinter().getPrinterName());
                dto.setPrinterLocation(job.getPrinter().getLocation());
            }
        } catch (Exception e) {
            log.debug("Could not load printer for job {}", job.getJobId());
        }
        
        return dto;
    }
    
    private String getStatusDisplay(String status) {
        if (status == null) return "";
        return switch (status) {
            case "Pending" -> "Đang chờ";
            case "Printing" -> "Đang in";
            case "Completed" -> "Hoàn thành";
            case "Failed" -> "Thất bại";
            case "Cancelled" -> "Đã hủy";
            default -> status;
        };
    }
    
    private String getFileType(String fileName) {
        if (fileName == null) return "file";
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot < 0) return "file";
        String ext = fileName.substring(lastDot + 1).toLowerCase();
        return switch (ext) {
            case "pdf" -> "pdf";
            case "doc", "docx" -> "docx";
            case "xls", "xlsx" -> "xlsx";
            case "ppt", "pptx" -> "pptx";
            default -> "file";
        };
    }
    
    private Sort createSort(String sortBy, String sortDirection) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String field = switch (sortBy != null ? sortBy : "printTime") {
            case "studentName" -> "studentId";
            case "pagesPrinted" -> "totalPagesToPrint";
            case "status" -> "jobStatus";
            default -> "submittedAt";
        };
        return Sort.by(direction, field);
    }
    
    /**
     * Tạo Specification cho filter
     */
    private Specification<PrintJob> createSpecification(PrintLogFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Filter by student search (ID, name, email)
            if (filter.getStudentSearch() != null && !filter.getStudentSearch().trim().isEmpty()) {
                String search = "%" + filter.getStudentSearch().trim().toLowerCase() + "%";
                var studentJoin = root.join("student", JoinType.LEFT);
                Predicate studentIdLike = cb.like(cb.lower(root.get("studentId")), search);
                Predicate nameLike = cb.like(cb.lower(studentJoin.get("fullName")), search);
                Predicate emailLike = cb.like(cb.lower(studentJoin.get("email")), search);
                predicates.add(cb.or(studentIdLike, nameLike, emailLike));
            }
            
            // Filter by printer ID
            if (filter.getPrinterId() != null) {
                predicates.add(cb.equal(root.get("printerId"), filter.getPrinterId()));
            }
            
            // Filter by status - map frontend values to backend values
            if (filter.getStatus() != null && !filter.getStatus().trim().isEmpty()) {
                String status = filter.getStatus().trim();
                // Map "Success" from frontend to "Completed" in database
                if ("Success".equals(status)) {
                    status = "Completed";
                }
                predicates.add(cb.equal(root.get("jobStatus"), status));
            }
            
            // Filter by date range
            if (filter.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("submittedAt"), filter.getStartDate()));
            }
            if (filter.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("submittedAt"), filter.getEndDate()));
            }
            
            // Filter by document name
            if (filter.getDocumentName() != null && !filter.getDocumentName().trim().isEmpty()) {
                var docJoin = root.join("document", JoinType.LEFT);
                predicates.add(cb.like(
                    cb.lower(docJoin.get("originalFileName")), 
                    "%" + filter.getDocumentName().toLowerCase() + "%"
                ));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
