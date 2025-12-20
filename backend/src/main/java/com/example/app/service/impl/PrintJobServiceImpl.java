package com.example.app.service.impl;

import com.example.app.dto.PrintJobResponseDTO;
import com.example.app.dto.PrintJobSubmitRequestDTO;
import com.example.app.entity.*;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.*;
import com.example.app.service.interfaces.IPrintJobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SERVICE IMPLEMENTATION: PrintJob
 * Xử lý logic gửi lệnh in và quản lý print jobs
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PrintJobServiceImpl implements IPrintJobService {
    
    private final PrintJobRepository printJobRepository;
    private final DocumentRepository documentRepository;
    private final PrinterRepository printerRepository;
    private final PageBalanceRepository pageBalanceRepository;
    private final PageTransactionRepository pageTransactionRepository;
    
    @Override
    public PrintJobResponseDTO submitPrintJob(String studentId, PrintJobSubmitRequestDTO request) {
        try {
            log.info("========== SUBMIT PRINT JOB START ==========");
            log.info("Student {} submitting print job for document {}", studentId, request.getDocumentId());
            log.info("Request: printerId={}, paperSize={}, pageRange={}, duplex={}, copies={}", 
                    request.getPrinterId(), request.getPaperSize(), request.getPageRange(), 
                    request.getDuplex(), request.getCopies());
            
            // 1. Validate document
            log.info("Step 1: Validating document {}", request.getDocumentId());
            Document document = documentRepository.findById(request.getDocumentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài liệu"));
        
        if (!document.getStudentId().equals(studentId)) {
            log.warn("Student {} tried to print document {} owned by {}", studentId, document.getDocumentId(), document.getStudentId());
            throw new BusinessException("Bạn không có quyền in tài liệu này");
        }
        
        if (document.getIsDeleted()) {
            log.warn("Document {} is deleted", document.getDocumentId());
            throw new BusinessException("Tài liệu đã bị xóa");
        }
        
        log.info("Document validated: {} pages", document.getTotalPages());
        
        // 2. Validate printer
        log.info("Step 2: Validating printer {}", request.getPrinterId());
        Printer printer = printerRepository.findById(request.getPrinterId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy máy in"));
        
        if (!"Active".equals(printer.getStatus())) {
            log.warn("Printer {} is not active. Status: {}", printer.getPrinterId(), printer.getStatus());
            throw new BusinessException("Máy in không khả dụng");
        }
        
        log.info("Printer validated: {}", printer.getPrinterName());
        
        // 3. Calculate pages
        log.info("Step 3: Calculating pages");
        int totalPagesToPrint = calculateTotalPages(document.getTotalPages(), request.getPageRange());
        int totalSheetsUsed = calculateSheetsUsed(totalPagesToPrint, request.getDuplex());
        int a4EquivalentPages = calculateA4Equivalent(
            totalSheetsUsed, 
            request.getPaperSize(), 
            request.getCopies()
        );
        
        log.info("Calculated: totalPages={}, sheets={}, a4Equivalent={}", totalPagesToPrint, totalSheetsUsed, a4EquivalentPages);
        
        // 4. Check page balance
        log.info("Step 4: Checking page balance for student {}", studentId);
        PageBalance pageBalance = pageBalanceRepository.findById(studentId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy số dư trang in"));
        
        int currentBalance = pageBalance.getA4Balance() + (pageBalance.getA3Balance() * 2);
        
        log.info("Current balance: {} (A4={}, A3={}), Required: {}", currentBalance, pageBalance.getA4Balance(), pageBalance.getA3Balance(), a4EquivalentPages);
        
        if (currentBalance < a4EquivalentPages) {
            log.warn("Insufficient balance. Need: {}, Have: {}", a4EquivalentPages, currentBalance);
            throw new BusinessException(
                String.format("Số dư không đủ. Cần %d trang, hiện có %d trang", 
                    a4EquivalentPages, currentBalance)
            );
        }
        
        // 5. Create print job
        log.info("Step 5: Creating print job");
        PrintJob printJob = new PrintJob();
        printJob.setStudentId(studentId);
        printJob.setDocumentId(request.getDocumentId());
        printJob.setPrinterId(request.getPrinterId());
        printJob.setPaperSize(request.getPaperSize());
        printJob.setPagesToPrint(request.getPageRange() != null ? request.getPageRange() : "all");
        printJob.setColorMode(request.getColorMode() != null ? request.getColorMode() : "BlackWhite");
        printJob.setColorPageRange(request.getColorPageRange());
        printJob.setIsSingleSided(!request.getDuplex());
        printJob.setNumCopies(request.getCopies());
        printJob.setTotalPagesToPrint(totalPagesToPrint);
        printJob.setTotalSheetsUsed(totalSheetsUsed);
        printJob.setA4EquivalentPages(a4EquivalentPages);
        printJob.setJobStatus("Pending");
        printJob.setSubmittedAt(LocalDateTime.now());
        
        log.info("Step 6: Saving print job to database");
        PrintJob savedJob = printJobRepository.save(printJob);
        log.info("Print job saved with ID: {}", savedJob.getJobId());
        
        // 6. Deduct pages from balance
        log.info("Step 7: Deducting pages from balance");
        deductPages(pageBalance, a4EquivalentPages, request.getPaperSize());
        
        // 7. Create page transaction (Use)
        log.info("Step 8: Creating page transaction");
        PageTransaction transaction = new PageTransaction();
        transaction.setStudentId(studentId);
        transaction.setTransactionType("Use");
        transaction.setA4Pages(-a4EquivalentPages);
        transaction.setA3Pages(0);
        transaction.setNotes("JobID: " + savedJob.getJobId());
        transaction.setCreatedAt(LocalDateTime.now());
        pageTransactionRepository.save(transaction);
        
        log.info("Print job {} created successfully for student {}", savedJob.getJobId(), studentId);
        log.info("========== SUBMIT PRINT JOB END ==========");
        
        return convertToDTO(savedJob);
        } catch (ResourceNotFoundException | BusinessException e) {
            log.error("Business error in submitPrintJob: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in submitPrintJob", e);
            throw new BusinessException("Lỗi hệ thống khi tạo lệnh in: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PrintJobResponseDTO> getStudentPrintJobs(String studentId) {
        List<PrintJob> jobs = printJobRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
        return jobs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PrintJobResponseDTO getPrintJobById(Integer jobId, String studentId) {
        PrintJob job = printJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lệnh in"));
        
        if (!job.getStudentId().equals(studentId)) {
            throw new BusinessException("Bạn không có quyền xem lệnh in này");
        }
        
        return convertToDTO(job);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PrintJobResponseDTO> getRecentJobs(String studentId, int limit) {
        List<PrintJob> jobs = printJobRepository.findTop5ByStudentIdOrderBySubmittedAtDesc(studentId);
        return jobs.stream()
                .limit(limit)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public void cancelPrintJob(Integer jobId, String studentId) {
        PrintJob job = printJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lệnh in"));
        
        if (!job.getStudentId().equals(studentId)) {
            throw new BusinessException("Bạn không có quyền hủy lệnh in này");
        }
        
        if (!"Pending".equals(job.getJobStatus())) {
            throw new BusinessException("Chỉ có thể hủy lệnh in đang chờ");
        }
        
        job.setJobStatus("Cancelled");
        printJobRepository.save(job);
        
        // Refund pages
        PageBalance pageBalance = pageBalanceRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy số dư trang"));
        
        refundPages(pageBalance, job.getA4EquivalentPages(), job.getPaperSize());
        
        // Create refund transaction
        PageTransaction transaction = new PageTransaction();
        transaction.setStudentId(studentId);
        transaction.setTransactionType("Allocate");
        transaction.setA4Pages(job.getA4EquivalentPages());
        transaction.setA3Pages(0);
        transaction.setNotes("Refund - Cancelled JobID: " + jobId);
        transaction.setCreatedAt(LocalDateTime.now());
        pageTransactionRepository.save(transaction);
    }
    
    // ============ PRIVATE HELPER METHODS ============
    
    /**
     * Tính số trang cần in từ page range
     */
    private int calculateTotalPages(int documentPages, String pageRange) {
        if (pageRange == null || pageRange.trim().isEmpty() || "all".equalsIgnoreCase(pageRange)) {
            return documentPages;
        }
        
        int total = 0;
        String[] ranges = pageRange.split(",");
        
        for (String range : ranges) {
            range = range.trim();
            if (range.contains("-")) {
                String[] parts = range.split("-");
                int start = Integer.parseInt(parts[0].trim());
                int end = Integer.parseInt(parts[1].trim());
                total += (end - start + 1);
            } else {
                total += 1;
            }
        }
        
        return total;
    }
    
    /**
     * Tính số tờ giấy (sheets) dựa trên duplex
     */
    private int calculateSheetsUsed(int pages, Boolean duplex) {
        if (duplex) {
            return (int) Math.ceil(pages / 2.0);
        }
        return pages;
    }
    
    /**
     * Tính A4 equivalent
     */
    private int calculateA4Equivalent(int sheets, String paperSize, int copies) {
        int a4Equiv = sheets;
        
        // A3 = 2x A4
        if ("A3".equalsIgnoreCase(paperSize)) {
            a4Equiv *= 2;
        }
        
        // Multiply by copies
        a4Equiv *= copies;
        
        return a4Equiv;
    }
    
    /**
     * Trừ pages từ balance
     */
    private void deductPages(PageBalance balance, int a4Equivalent, String paperSize) {
        if ("A3".equalsIgnoreCase(paperSize)) {
            // Trừ từ A3 trước
            int a3ToDeduct = a4Equivalent / 2;
            int remainingA4 = a4Equivalent % 2;
            
            if (balance.getA3Balance() >= a3ToDeduct) {
                balance.setA3Balance(balance.getA3Balance() - a3ToDeduct);
                balance.setA4Balance(balance.getA4Balance() - remainingA4);
            } else {
                // Không đủ A3, convert sang A4
                int neededA4 = a4Equivalent;
                balance.setA4Balance(balance.getA4Balance() - neededA4);
            }
        } else {
            // Trừ A4
            balance.setA4Balance(balance.getA4Balance() - a4Equivalent);
        }
        
        balance.setLastUpdated(LocalDateTime.now());
        pageBalanceRepository.save(balance);
    }
    
    /**
     * Hoàn trả pages khi cancel
     */
    private void refundPages(PageBalance balance, int a4Equivalent, String paperSize) {
        if ("A3".equalsIgnoreCase(paperSize)) {
            int a3ToRefund = a4Equivalent / 2;
            int remainingA4 = a4Equivalent % 2;
            balance.setA3Balance(balance.getA3Balance() + a3ToRefund);
            balance.setA4Balance(balance.getA4Balance() + remainingA4);
        } else {
            balance.setA4Balance(balance.getA4Balance() + a4Equivalent);
        }
        
        balance.setLastUpdated(LocalDateTime.now());
        pageBalanceRepository.save(balance);
    }
    
    /**
     * Convert Entity to DTO
     * Safely handles lazy-loaded relationships to avoid LazyInitializationException
     */
    private PrintJobResponseDTO convertToDTO(PrintJob job) {
        // Safely get document name
        String documentName = null;
        try {
            Document doc = documentRepository.findById(job.getDocumentId()).orElse(null);
            if (doc != null) {
                documentName = doc.getOriginalFileName();
            }
        } catch (Exception e) {
            log.warn("Could not load document for job {}: {}", job.getJobId(), e.getMessage());
        }
        
        // Safely get printer name
        String printerName = null;
        try {
            Printer printer = printerRepository.findById(job.getPrinterId()).orElse(null);
            if (printer != null) {
                printerName = printer.getPrinterName();
            }
        } catch (Exception e) {
            log.warn("Could not load printer for job {}: {}", job.getJobId(), e.getMessage());
        }
        
        return PrintJobResponseDTO.builder()
                .jobId(job.getJobId())
                .documentId(job.getDocumentId())
                .documentName(documentName)
                .printerId(job.getPrinterId())
                .printerName(printerName)
                .studentId(job.getStudentId())
                .studentName(null)  // Not needed for student viewing their own jobs
                .paperSize(job.getPaperSize())
                .pageRange(job.getPagesToPrint())
                .duplex(!job.getIsSingleSided())
                .isSingleSided(job.getIsSingleSided())
                .copies(job.getNumCopies())
                .colorMode(job.getColorMode())
                .colorPageRange(job.getColorPageRange())
                .totalPagesToPrint(job.getTotalPagesToPrint())
                .totalSheetsUsed(job.getTotalSheetsUsed())
                .a4EquivalentPages(job.getA4EquivalentPages())
                .jobStatus(job.getJobStatus())
                .submittedAt(job.getSubmittedAt())
                .startedAt(job.getStartedAt())
                .completedAt(job.getCompletedAt())
                .errorMessage(job.getErrorMessage())
                .build();
    }
}
