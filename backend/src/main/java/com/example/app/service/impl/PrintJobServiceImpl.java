package com.example.app.service.impl;

import com.example.app.dto.PrintJobResponseDTO;
import com.example.app.dto.PrintJobSubmitRequestDTO;
import com.example.app.entity.*;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.*;
import com.example.app.service.NotificationService;
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
    private final SystemConfigRepository systemConfigRepository;
    private final NotificationService notificationService;
    
    @Override
    public PrintJobResponseDTO submitPrintJob(String studentId, PrintJobSubmitRequestDTO request) {
        try {
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
        
        // 1.5. Validate file extension
        String fileExtension = document.getFileExtension();
        String allowedExtensions = systemConfigRepository.findByConfigKey("allowed_file_extensions")
            .map(config -> config.getConfigValue())
            .orElse("pdf,docx,pptx,xlsx");
        
        String[] allowedExtensionsArray = allowedExtensions.toLowerCase().split(",");
        boolean isAllowed = false;
        for (String ext : allowedExtensionsArray) {
            if (ext.trim().equals(fileExtension.toLowerCase())) {
                isAllowed = true;
                break;
            }
        }
        
        if (!isAllowed) {
            throw new BusinessException(
                String.format("Loại file '%s' không còn được phép in. Các loại được phép: %s", 
                    fileExtension, allowedExtensions)
            );
        }
        
        // 1.6. Validate file size
        int maxFileSizeMB = systemConfigRepository.findByConfigKey("max_file_size_mb")
            .map(config -> {
                try {
                    return Integer.parseInt(config.getConfigValue());
                } catch (NumberFormatException e) {
                    return 50;
                }
            })
            .orElse(50);
        
        double fileSizeMB = document.getFileSizeKB().doubleValue() / 1024.0;
        if (fileSizeMB > maxFileSizeMB) {
            throw new BusinessException(
                String.format("File quá lớn (%.1f MB). Kích thước tối đa hiện tại: %d MB", 
                    fileSizeMB, maxFileSizeMB)
            );
        }
        
        // 2. Validate printer
        Printer printer = printerRepository.findById(request.getPrinterId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy máy in"));
        
        if (!"Active".equals(printer.getStatus())) {
            String errorMsg = "Máy in không khả dụng";
            if ("OutOfPaper".equals(printer.getStatus())) {
                errorMsg = "Máy in đã hết giấy";
            } else if ("OutOfToner".equals(printer.getStatus())) {
                errorMsg = "Máy in đã hết mực";
            } else if ("OutOfBoth".equals(printer.getStatus())) {
                errorMsg = "Máy in đã hết giấy và mực";
            }
            throw new BusinessException(errorMsg);
        }
        
        // 3. Calculate pages
        int totalPagesToPrint = calculateTotalPages(document.getTotalPages(), request.getPageRange());
        int totalSheetsUsed = calculateSheetsUsed(totalPagesToPrint, request.getDuplex());
        int a4EquivalentPages = calculateA4Equivalent(
            totalSheetsUsed, 
            request.getPaperSize(), 
            request.getCopies()
        );
        
        // 4. Check printer supplies
        int sheetsNeeded = totalSheetsUsed * request.getCopies();
        
        if (!printer.hasEnoughPaper(request.getPaperSize(), sheetsNeeded)) {
            int available = "A3".equalsIgnoreCase(request.getPaperSize()) 
                ? printer.getA3PaperAvailable() 
                : printer.getA4PaperAvailable();
            
            printer.updateStatusBasedOnSupplies();
            printerRepository.save(printer);
            
            throw new BusinessException(
                String.format("Máy in không đủ giấy %s. Cần %d tờ, còn %d tờ khả dụng. Vui lòng chọn máy in khác.", 
                    request.getPaperSize(), sheetsNeeded, available)
            );
        }
        
        if (!printer.hasEnoughToner()) {
            printer.updateStatusBasedOnSupplies();
            printerRepository.save(printer);
            throw new BusinessException("Máy in sắp hết mực, vui lòng chọn máy in khác");
        }
        
        // 5. Check page balance
        PageBalance pageBalance = pageBalanceRepository.findById(studentId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy số dư trang in"));
        
        int currentBalance = pageBalance.getA4Balance();
        
        if (currentBalance < a4EquivalentPages) {
            throw new BusinessException(
                String.format("Số dư không đủ. Cần %d trang, hiện có %d trang", 
                    a4EquivalentPages, currentBalance)
            );
        }
        
        // 6. Create print job
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
        log.info("Created print job {} for student {}: {} pages", savedJob.getJobId(), studentId, a4EquivalentPages);
        
        // 6.1. Reserve printer resources
        printer.reservePaper(request.getPaperSize(), sheetsNeeded);
        printer.reserveToner(totalPagesToPrint * request.getCopies(), request.getColorMode());
        printerRepository.save(printer);
        
        // 7. Deduct pages from balance
        deductPages(pageBalance, a4EquivalentPages, request.getPaperSize());
        int newBalance = pageBalance.getA4Balance();
        
        // 8. Create page transaction
        PageTransaction transaction = new PageTransaction();
        transaction.setStudentId(studentId);
        transaction.setTransactionType("Use");
        transaction.setA4Pages(-a4EquivalentPages);
        transaction.setBalanceAfterA4(newBalance);
        transaction.setNotes("JobID: " + savedJob.getJobId());
        transaction.setCreatedAt(LocalDateTime.now());
        pageTransactionRepository.save(transaction);
        
        // Create notification
        notificationService.createPrintSuccessNotification(
                studentId, 
                document.getOriginalFileName(), 
                printer.getPrinterName()
        );
        
        return convertToDTO(savedJob);
        } catch (ResourceNotFoundException | BusinessException e) {
            log.error("Business error in submitPrintJob: {}", e.getMessage());
            // Tạo thông báo in thất bại
            try {
                Document doc = documentRepository.findById(request.getDocumentId()).orElse(null);
                String docName = doc != null ? doc.getOriginalFileName() : "Tài liệu";
                notificationService.createPrintFailedNotification(studentId, docName, e.getMessage());
            } catch (Exception ex) {
                log.warn("Could not create print failed notification: {}", ex.getMessage());
            }
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in submitPrintJob", e);
            // Tạo thông báo in thất bại
            try {
                Document doc = documentRepository.findById(request.getDocumentId()).orElse(null);
                String docName = doc != null ? doc.getOriginalFileName() : "Tài liệu";
                notificationService.createPrintFailedNotification(studentId, docName, "Lỗi hệ thống");
            } catch (Exception ex) {
                log.warn("Could not create print failed notification: {}", ex.getMessage());
            }
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
            if ("Printing".equals(job.getJobStatus())) {
                throw new BusinessException("Không thể hủy lệnh in đang được in. Vui lòng đợi in xong.");
            } else if ("Completed".equals(job.getJobStatus())) {
                throw new BusinessException("Không thể hủy lệnh in đã hoàn thành");
            } else if ("Cancelled".equals(job.getJobStatus())) {
                throw new BusinessException("Lệnh in đã bị hủy trước đó");
            } else if ("Failed".equals(job.getJobStatus())) {
                throw new BusinessException("Không thể hủy lệnh in đã thất bại");
            } else {
                throw new BusinessException("Chỉ có thể hủy lệnh in đang chờ");
            }
        }
        
        // Release reserved printer resources
        Printer printer = printerRepository.findById(job.getPrinterId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy máy in"));
        
        int sheetsToRelease = job.getTotalSheetsUsed() * job.getNumCopies();
        int pagesToRelease = job.getTotalPagesToPrint() * job.getNumCopies();
        
        printer.releasePaperReserve(job.getPaperSize(), sheetsToRelease);
        printer.releaseTonerReserve(pagesToRelease, job.getColorMode());
        printerRepository.save(printer);
        
        job.setJobStatus("Cancelled");
        printJobRepository.save(job);
        
        // Refund pages
        PageBalance pageBalance = pageBalanceRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy số dư trang"));
        
        refundPages(pageBalance, job.getA4EquivalentPages(), job.getPaperSize());
        int newBalance = pageBalance.getA4Balance(); // Get updated balance
        
        // Create refund transaction
        PageTransaction transaction = new PageTransaction();
        transaction.setStudentId(studentId);
        transaction.setTransactionType("Allocate");
        transaction.setA4Pages(job.getA4EquivalentPages());
        transaction.setBalanceAfterA4(newBalance);
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
     * Luôn trừ từ A4Balance (đã quy đổi A3 = 2×A4)
     */
    private void deductPages(PageBalance balance, int a4Equivalent, String paperSize) {
        balance.setA4Balance(balance.getA4Balance() - a4Equivalent);
        balance.setLastUpdated(LocalDateTime.now());
        pageBalanceRepository.save(balance);
    }
    
    /**
     * Hoàn trả pages khi cancel
     * Luôn hoàn trả vào A4Balance (đã quy đổi A3 = 2×A4)
     */
    private void refundPages(PageBalance balance, int a4Equivalent, String paperSize) {
        balance.setA4Balance(balance.getA4Balance() + a4Equivalent);
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
