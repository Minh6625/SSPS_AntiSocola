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
        log.info("Student {} submitting print job for document {}", studentId, request.getDocumentId());
        
        // 1. Validate document
        Document document = documentRepository.findById(request.getDocumentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài liệu"));
        
        if (!document.getStudentId().equals(studentId)) {
            throw new BusinessException("Bạn không có quyền in tài liệu này");
        }
        
        if (document.getIsDeleted()) {
            throw new BusinessException("Tài liệu đã bị xóa");
        }
        
        // 2. Validate printer
        Printer printer = printerRepository.findById(request.getPrinterId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy máy in"));
        
        if (!"Active".equals(printer.getStatus())) {
            throw new BusinessException("Máy in không khả dụng");
        }
        
        // 3. Calculate pages
        int totalPagesToPrint = calculateTotalPages(document.getTotalPages(), request.getPageRange());
        int totalSheetsUsed = calculateSheetsUsed(totalPagesToPrint, request.getDuplex());
        int a4EquivalentPages = calculateA4Equivalent(
            totalSheetsUsed, 
            request.getPaperSize(), 
            request.getCopies()
        );
        
        // 4. Check page balance
        PageBalance pageBalance = pageBalanceRepository.findById(studentId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy số dư trang in"));
        
        int currentBalance = pageBalance.getA4Balance() + (pageBalance.getA3Balance() * 2);
        
        if (currentBalance < a4EquivalentPages) {
            throw new BusinessException(
                String.format("Số dư không đủ. Cần %d trang, hiện có %d trang", 
                    a4EquivalentPages, currentBalance)
            );
        }
        
        // 5. Create print job
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
        
        PrintJob savedJob = printJobRepository.save(printJob);
        
        // 6. Deduct pages from balance
        deductPages(pageBalance, a4EquivalentPages, request.getPaperSize());
        
        // 7. Create page transaction (Use)
        PageTransaction transaction = new PageTransaction();
        transaction.setStudentId(studentId);
        transaction.setTransactionType("Use");
        transaction.setA4Pages(-a4EquivalentPages);
        transaction.setA3Pages(0);
        transaction.setNotes("JobID: " + savedJob.getJobId());
        transaction.setCreatedAt(LocalDateTime.now());
        pageTransactionRepository.save(transaction);
        
        log.info("Print job {} created successfully for student {}", savedJob.getJobId(), studentId);
        
        return convertToDTO(savedJob);
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
     */
    private PrintJobResponseDTO convertToDTO(PrintJob job) {
        return PrintJobResponseDTO.builder()
                .jobId(job.getJobId())
                .documentId(job.getDocumentId())
                .documentName(job.getDocument() != null ? job.getDocument().getOriginalFileName() : null)
                .printerId(job.getPrinterId())
                .printerName(job.getPrinter() != null ? job.getPrinter().getPrinterName() : null)
                .studentId(job.getStudentId())
                .studentName(job.getStudent() != null ? job.getStudent().getFullName() : null)
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
