package com.example.app.service.impl;

import com.example.app.entity.Document;
import com.example.app.entity.PrintJob;
import com.example.app.entity.Printer;
import com.example.app.repository.DocumentRepository;
import com.example.app.repository.PrintJobRepository;
import com.example.app.repository.PrinterRepository;
import com.example.app.service.NotificationService;
import com.example.app.service.interfaces.IPrintQueueService;
import com.example.app.service.PrintJobStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.print.*;
import javax.print.attribute.HashPrintRequestAttributeSet;
import javax.print.attribute.PrintRequestAttributeSet;
import javax.print.attribute.standard.*;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.Socket;
import java.time.LocalDateTime;
import java.util.List;

/**
 * SERVICE IMPLEMENTATION: Print Queue Service
 * Xử lý hàng đợi in - gửi job đến máy in thật qua IPP/JetDirect
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PrintQueueServiceImpl implements IPrintQueueService {

    private final PrintJobRepository printJobRepository;
    private final PrinterRepository printerRepository;
    private final DocumentRepository documentRepository;
    private final PrintJobStatusService statusService;
    private final NotificationService notificationService;

    @Value("${print.queue.enabled:false}")
    private boolean printQueueEnabled;

    @Value("${print.queue.max-retry-attempts:3}")
    private int maxRetryAttempts;

    @Value("${print.queue.connection-timeout-seconds:10}")
    private int connectionTimeout;

    @Value("${print.queue.mock-mode:false}")
    private boolean mockMode;

    @Value("${print.queue.mock-print-duration-seconds:30}")
    private int mockPrintDuration;
    
    @Value("${print.queue.printing-timeout-minutes:10}")
    private int printingTimeoutMinutes;

    /**
     * Scheduled job - chạy mỗi 5 giây để quét job pending
     * Xử lý jobs theo thứ tự FIFO (First In First Out)
     * CHỈ xử lý khi KHÔNG CÓ job nào đang Printing
     */
    @Scheduled(fixedDelayString = "${print.queue.scan-interval-seconds:30}000")
    @Transactional
    public void processPendingJobs() {
        if (!printQueueEnabled) {
            log.debug("Print queue processing is disabled. Set print.queue.enabled=true to enable.");
            return;
        }

        log.debug("Scanning for pending print jobs...");
        
        // Kiểm tra và xử lý các job "Printing" bị timeout
        checkAndHandleStuckJobs();
        
        // Kiểm tra xem có job nào đang Printing không
        List<PrintJob> printingJobs = printJobRepository.findByJobStatus("Printing");
        if (!printingJobs.isEmpty()) {
            log.info("Found {} jobs currently printing. Waiting for them to complete...", printingJobs.size());
            return; // Đợi jobs đang Printing hoàn tất
        }
        
        List<PrintJob> pendingJobs = printJobRepository.findByJobStatus("Pending");
        
        if (pendingJobs.isEmpty()) {
            log.debug("No pending print jobs found.");
            return;
        }

        log.info("Found {} pending print jobs. Processing first job...", pendingJobs.size());

        // Chỉ xử lý job đầu tiên (FIFO - First In First Out)
        // Các jobs khác sẽ được xử lý ở lần scan tiếp theo
        PrintJob firstJob = pendingJobs.get(0);
        
        try {
            log.info("Processing job {} (Printer: {}, Status: {})", 
                firstJob.getJobId(), firstJob.getPrinterId(), firstJob.getJobStatus());
            sendJobToPrinter(firstJob.getJobId());
        } catch (Exception e) {
            log.error("Error processing job {}: {}", firstJob.getJobId(), e.getMessage(), e);
        }
    }

    /**
     * Kiểm tra và xử lý các job "Printing" bị kẹt quá lâu
     * Nếu job ở trạng thái "Printing" quá X phút, tự động chuyển sang "Failed"
     */
    private void checkAndHandleStuckJobs() {
        List<PrintJob> printingJobs = printJobRepository.findByJobStatus("Printing");
        
        if (printingJobs.isEmpty()) {
            return;
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime timeoutThreshold = now.minusMinutes(printingTimeoutMinutes);
        
        for (PrintJob job : printingJobs) {
            LocalDateTime startedAt = job.getStartedAt();
            
            // Nếu không có StartedAt, dùng SubmittedAt
            if (startedAt == null) {
                startedAt = job.getSubmittedAt();
            }
            
            // Nếu vẫn null, skip
            if (startedAt == null) {
                log.warn("Job {} has no StartedAt or SubmittedAt timestamp. Skipping timeout check.", job.getJobId());
                continue;
            }
            
            // Kiểm tra timeout
            if (startedAt.isBefore(timeoutThreshold)) {
                log.warn("Job {} has been printing for more than {} minutes. Marking as Failed.", 
                    job.getJobId(), printingTimeoutMinutes);
                
                // Lấy printer để release reserves
                try {
                    Printer printer = printerRepository.findById(job.getPrinterId()).orElse(null);
                    
                    if (printer != null) {
                        // Release reserves
                        int sheetsUsed = job.getTotalSheetsUsed() * job.getNumCopies();
                        int pagesUsed = job.getTotalPagesToPrint() * job.getNumCopies();
                        
                        printer.releasePaperReserve(job.getPaperSize(), sheetsUsed);
                        printer.releaseTonerReserve(pagesUsed, job.getColorMode());
                        printerRepository.save(printer);
                        
                        log.info("Released reserves for stuck job {}", job.getJobId());
                    }
                } catch (Exception e) {
                    log.error("Error releasing reserves for stuck job {}: {}", job.getJobId(), e.getMessage());
                }
                
                // Update job status
                updateJobStatus(job, "Failed", 
                    String.format("Timeout: Job bị kẹt quá %d phút", printingTimeoutMinutes));
            }
        }
    }
    
    /**
     * Gửi job đến máy in thật
     */
    @Override
    @Transactional
    public boolean sendJobToPrinter(Integer jobId) {
        PrintJob job = printJobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Print job not found: " + jobId));

        if (!"Pending".equals(job.getJobStatus())) {
            log.warn("Job {} is not in Pending status. Current status: {}", jobId, job.getJobStatus());
            return false;
        }

        Printer printer = printerRepository.findById(job.getPrinterId())
                .orElseThrow(() -> new RuntimeException("Printer not found: " + job.getPrinterId()));

        // Kiểm tra IP address
        if (printer.getIpAddress() == null || printer.getIpAddress().trim().isEmpty()) {
            log.error("Printer {} has no IP address configured.", printer.getPrinterId());
            updateJobStatus(job, "Failed", "Máy in chưa cấu hình IP address");
            return false;
        }

        // Kiểm tra máy in có active không
        if (!"Active".equals(printer.getStatus())) {
            log.error("Printer {} is not active. Status: {}", printer.getPrinterId(), printer.getStatus());
            updateJobStatus(job, "Failed", "Máy in không sẵn sàng");
            return false;
        }

        // Cập nhật status sang Printing và commit ngay lập tức
        log.info("Calling statusService.updateStatusAndCommit for job {}", jobId);
        statusService.updateStatusAndCommit(job, "Printing", null);
        log.info("After statusService.updateStatusAndCommit for job {}", jobId);
        
        // Gửi thông báo đang in
        try {
            Document document = documentRepository.findById(job.getDocumentId()).orElse(null);
            String documentName = document != null ? document.getOriginalFileName() : "Tài liệu";
            notificationService.createPrintingNotification(job.getStudentId(), documentName);
        } catch (Exception e) {
            log.warn("Could not create printing notification: {}", e.getMessage());
        }

        try {
            // Gửi đến máy in
            boolean success = sendToPrinterViaNetwork(job, printer);

            if (success) {
                updateJobStatus(job, "Completed", null);
                job.setCompletedAt(LocalDateTime.now());
                
                // Gửi thông báo in thành công
                try {
                    Document document = documentRepository.findById(job.getDocumentId()).orElse(null);
                    String documentName = document != null ? document.getOriginalFileName() : "Tài liệu";
                    notificationService.createPrintSuccessNotification(
                        job.getStudentId(), 
                        documentName, 
                        printer.getLocation()
                    );
                } catch (Exception e) {
                    log.warn("Could not create print success notification: {}", e.getMessage());
                }
                
                // Cập nhật tổng số trang đã in của máy
                printer.setTotalPagesPrinted(
                    printer.getTotalPagesPrinted() + job.getTotalPagesToPrint()
                );
                
                // Release reserves first
                int sheetsUsed = job.getTotalSheetsUsed() * job.getNumCopies();
                int pagesUsed = job.getTotalPagesToPrint() * job.getNumCopies();
                
                printer.releasePaperReserve(job.getPaperSize(), sheetsUsed);
                printer.releaseTonerReserve(pagesUsed, job.getColorMode());
                
                log.info("Released {} sheets of {} and toner for {} pages from reserves", 
                    sheetsUsed, job.getPaperSize(), pagesUsed);
                
                // Then deduct actual paper and toner
                deductPaper(printer, job.getPaperSize(), sheetsUsed);
                deductToner(printer, pagesUsed, job.getColorMode());
                
                // Cập nhật trạng thái máy in dựa trên giấy/mực
                printer.updateStatusBasedOnSupplies();
                
                printerRepository.save(printer);
                
                log.info("Job {} completed successfully on printer {}", jobId, printer.getPrinterId());
                return true;
            } else {
                // Thất bại, kiểm tra retry
                int currentRetry = (job.getNotes() != null && job.getNotes().contains("Retry:")) 
                    ? extractRetryCount(job.getNotes()) : 0;
                
                if (currentRetry < maxRetryAttempts) {
                    updateJobStatus(job, "Pending", "Retry: " + (currentRetry + 1));
                    log.warn("Job {} failed, will retry ({}/{})", jobId, currentRetry + 1, maxRetryAttempts);
                    // Keep reserves for retry
                } else {
                    updateJobStatus(job, "Failed", "Đã thử " + maxRetryAttempts + " lần nhưng thất bại");
                    
                    // Release reserves on final failure
                    int sheetsUsed = job.getTotalSheetsUsed() * job.getNumCopies();
                    int pagesUsed = job.getTotalPagesToPrint() * job.getNumCopies();
                    
                    printer.releasePaperReserve(job.getPaperSize(), sheetsUsed);
                    printer.releaseTonerReserve(pagesUsed, job.getColorMode());
                    printerRepository.save(printer);
                    
                    log.error("Job {} failed after {} attempts. Released reserves.", jobId, maxRetryAttempts);
                }
                return false;
            }
        } catch (Exception e) {
            log.error("Error sending job {} to printer: {}", jobId, e.getMessage(), e);
            updateJobStatus(job, "Failed", "Lỗi: " + e.getMessage());
            
            // Release reserves on error (printer variable already declared at method start)
            int sheetsUsed = job.getTotalSheetsUsed() * job.getNumCopies();
            int pagesUsed = job.getTotalPagesToPrint() * job.getNumCopies();
            
            printer.releasePaperReserve(job.getPaperSize(), sheetsUsed);
            printer.releaseTonerReserve(pagesUsed, job.getColorMode());
            printerRepository.save(printer);
            
            log.info("Released reserves for failed job {}", jobId);
            
            return false;
        }
    }

    /**
     * Gửi job đến máy in qua mạng (IPP hoặc JetDirect)
     * Đây là implementation cơ bản sử dụng Java Print API
     * 
     * MOCK MODE: Nếu mock-mode=true, sẽ giả lập in thành công sau X giây
     */
    private boolean sendToPrinterViaNetwork(PrintJob job, Printer printer) {
        // MOCK MODE: Simulate printing
        if (mockMode) {
            log.info("Mock printing job {} (duration: {}s)", job.getJobId(), mockPrintDuration);
            
            try {
                Thread.sleep(mockPrintDuration * 1000L);
                return true;
            } catch (InterruptedException e) {
                log.error("Mock printing interrupted for job {}", job.getJobId());
                Thread.currentThread().interrupt();
                return false;
            }
        }
        
        // REAL MODE: In thật qua máy in
        try {
            // Kiểm tra kết nối đến máy in
            if (!testPrinterConnection(printer.getIpAddress())) {
                log.error("Cannot connect to printer at {}", printer.getIpAddress());
                return false;
            }

            // Lấy file path của document
            String documentPath = getDocumentFilePath(job);
            if (documentPath == null) {
                log.error("Document file not found for job {}", job.getJobId());
                return false;
            }

            // Sử dụng Java Print API
            PrintService printService = findNetworkPrintService(printer.getIpAddress());
            
            if (printService == null) {
                log.error("Print service not found for printer {}", printer.getIpAddress());
                return false;
            }

            // Cấu hình in
            PrintRequestAttributeSet attributes = buildPrintAttributes(job);

            // Tạo print job
            DocPrintJob docPrintJob = printService.createPrintJob();

            // Đọc file
            try (InputStream is = new FileInputStream(documentPath)) {
                Doc doc = new SimpleDoc(is, DocFlavor.INPUT_STREAM.AUTOSENSE, null);
                docPrintJob.print(doc, attributes);
            }

            log.info("Successfully sent job {} to printer {}", job.getJobId(), printer.getPrinterId());
            return true;

        } catch (Exception e) {
            log.error("Error sending to printer: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Test kết nối đến máy in qua port 9100 (JetDirect) hoặc 631 (IPP)
     */
    private boolean testPrinterConnection(String ipAddress) {
        // Thử JetDirect port 9100
        try (Socket socket = new Socket(ipAddress, 9100)) {
            socket.setSoTimeout(connectionTimeout * 1000);
            log.debug("Successfully connected to printer at {}:9100", ipAddress);
            return true;
        } catch (Exception e) {
            log.debug("Cannot connect via JetDirect (9100): {}", e.getMessage());
        }

        // Thử IPP port 631
        try (Socket socket = new Socket(ipAddress, 631)) {
            socket.setSoTimeout(connectionTimeout * 1000);
            log.debug("Successfully connected to printer at {}:631", ipAddress);
            return true;
        } catch (Exception e) {
            log.debug("Cannot connect via IPP (631): {}", e.getMessage());
        }

        return false;
    }

    /**
     * Tìm print service cho network printer
     */
    private PrintService findNetworkPrintService(String ipAddress) {
        // Tìm trong các printer có sẵn
        PrintService[] printServices = PrintServiceLookup.lookupPrintServices(null, null);
        
        for (PrintService service : printServices) {
            String name = service.getName().toLowerCase();
            if (name.contains(ipAddress) || name.contains(ipAddress.replace(".", "-"))) {
                return service;
            }
        }

        // Nếu không tìm thấy, trả về default printer
        // Trong production, bạn nên cấu hình printer với CUPS hoặc Windows Print Server
        PrintService defaultService = PrintServiceLookup.lookupDefaultPrintService();
        if (defaultService != null) {
            log.warn("Using default printer instead of {}", ipAddress);
        }
        return defaultService;
    }

    /**
     * Build print attributes từ PrintJob
     */
    private PrintRequestAttributeSet buildPrintAttributes(PrintJob job) {
        PrintRequestAttributeSet attributes = new HashPrintRequestAttributeSet();

        // Paper size
        MediaSizeName mediaSize = "A3".equalsIgnoreCase(job.getPaperSize()) 
            ? MediaSizeName.ISO_A3 
            : MediaSizeName.ISO_A4;
        attributes.add(mediaSize);

        // Copies
        attributes.add(new Copies(job.getNumCopies()));

        // Duplex (2-sided printing)
        if (!job.getIsSingleSided()) {
            attributes.add(Sides.DUPLEX);
        } else {
            attributes.add(Sides.ONE_SIDED);
        }

        // Color mode
        if ("Color".equalsIgnoreCase(job.getColorMode())) {
            attributes.add(Chromaticity.COLOR);
        } else {
            attributes.add(Chromaticity.MONOCHROME);
        }

        return attributes;
    }

    /**
     * Lấy file path của document từ job
     * TODO: Implement logic lấy file path từ Document entity
     */
    private String getDocumentFilePath(PrintJob job) {
        // Giả sử file được lưu trong uploads/documents/{documentId}.pdf
        // Bạn cần implement logic lấy path thật từ Document entity
        String uploadDir = System.getProperty("user.dir") + "/uploads/documents/";
        return uploadDir + job.getDocumentId() + ".pdf";
    }

    /**
     * Cập nhật status của job
     */
    private void updateJobStatus(PrintJob job, String status, String notes) {
        job.setJobStatus(status);
        if (notes != null) {
            job.setNotes(notes);
        }
        printJobRepository.save(job);
    }

    /**
     * Lấy số lần retry từ notes
     */
    private int extractRetryCount(String notes) {
        try {
            if (notes != null && notes.contains("Retry:")) {
                String[] parts = notes.split("Retry:");
                if (parts.length > 1) {
                    return Integer.parseInt(parts[1].trim().split(" ")[0]);
                }
            }
        } catch (Exception e) {
            log.debug("Cannot extract retry count from notes: {}", notes);
        }
        return 0;
    }
    
    /**
     * Trừ giấy sau khi in
     */
    private void deductPaper(Printer printer, String paperSize, int sheets) {
        if ("A3".equalsIgnoreCase(paperSize)) {
            int remaining = printer.getA3PaperRemaining() - sheets;
            printer.setA3PaperRemaining(Math.max(0, remaining));
            log.info("Deducted {} sheets of A3. Remaining: {}", sheets, printer.getA3PaperRemaining());
        } else {
            int remaining = printer.getA4PaperRemaining() - sheets;
            printer.setA4PaperRemaining(Math.max(0, remaining));
            log.info("Deducted {} sheets of A4. Remaining: {}", sheets, printer.getA4PaperRemaining());
        }
    }
    
    /**
     * Trừ mực sau khi in
     * Ước tính: 1 trang = 0.01% mực (1000 trang = 10% mực)
     */
    private void deductToner(Printer printer, int pages, String colorMode) {
        double tonerUsedPercent = pages * 0.01; // 1 trang = 0.01%
        
        if ("Color".equalsIgnoreCase(colorMode)) {
            // In màu: trừ cả 4 màu
            printer.setTonerBlackRemaining(Math.max(0, (int)(printer.getTonerBlackRemaining() - tonerUsedPercent)));
            printer.setTonerCyanRemaining(Math.max(0, (int)(printer.getTonerCyanRemaining() - tonerUsedPercent)));
            printer.setTonerMagentaRemaining(Math.max(0, (int)(printer.getTonerMagentaRemaining() - tonerUsedPercent)));
            printer.setTonerYellowRemaining(Math.max(0, (int)(printer.getTonerYellowRemaining() - tonerUsedPercent)));
            log.info("Deducted {:.2f}% toner (Color). Black remaining: {}%", tonerUsedPercent, printer.getTonerBlackRemaining());
        } else {
            // In đen trắng: chỉ trừ mực đen
            printer.setTonerBlackRemaining(Math.max(0, (int)(printer.getTonerBlackRemaining() - tonerUsedPercent)));
            log.info("Deducted {:.2f}% toner (Black). Remaining: {}%", tonerUsedPercent, printer.getTonerBlackRemaining());
        }
    }
}
