package com.example.app.service.impl;

import com.example.app.entity.PrintJob;
import com.example.app.entity.Printer;
import com.example.app.repository.PrintJobRepository;
import com.example.app.repository.PrinterRepository;
import com.example.app.service.interfaces.IPrintQueueService;
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

    @Value("${print.queue.enabled:false}")
    private boolean printQueueEnabled;

    @Value("${print.queue.max-retry-attempts:3}")
    private int maxRetryAttempts;

    @Value("${print.queue.connection-timeout-seconds:10}")
    private int connectionTimeout;

    /**
     * Scheduled job - chạy mỗi 30 giây để quét job pending
     */
    @Scheduled(fixedDelayString = "${print.queue.scan-interval-seconds:30}000")
    @Transactional
    public void processPendingJobs() {
        if (!printQueueEnabled) {
            log.debug("Print queue processing is disabled. Set print.queue.enabled=true to enable.");
            return;
        }

        log.info("Scanning for pending print jobs...");
        
        List<PrintJob> pendingJobs = printJobRepository.findByJobStatus("Pending");
        
        if (pendingJobs.isEmpty()) {
            log.debug("No pending print jobs found.");
            return;
        }

        log.info("Found {} pending print jobs. Processing...", pendingJobs.size());

        for (PrintJob job : pendingJobs) {
            try {
                sendJobToPrinter(job.getJobId());
            } catch (Exception e) {
                log.error("Error processing job {}: {}", job.getJobId(), e.getMessage());
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

        // Cập nhật status sang Printing
        updateJobStatus(job, "Printing", null);

        try {
            // Gửi đến máy in
            boolean success = sendToPrinterViaNetwork(job, printer);

            if (success) {
                updateJobStatus(job, "Completed", null);
                job.setCompletedAt(LocalDateTime.now());
                
                // Cập nhật tổng số trang đã in của máy
                printer.setTotalPagesPrinted(
                    printer.getTotalPagesPrinted() + job.getTotalPagesToPrint()
                );
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
                } else {
                    updateJobStatus(job, "Failed", "Đã thử " + maxRetryAttempts + " lần nhưng thất bại");
                    log.error("Job {} failed after {} attempts", jobId, maxRetryAttempts);
                }
                return false;
            }
        } catch (Exception e) {
            log.error("Error sending job {} to printer: {}", jobId, e.getMessage(), e);
            updateJobStatus(job, "Failed", "Lỗi: " + e.getMessage());
            return false;
        }
    }

    /**
     * Gửi job đến máy in qua mạng (IPP hoặc JetDirect)
     * Đây là implementation cơ bản sử dụng Java Print API
     */
    private boolean sendToPrinterViaNetwork(PrintJob job, Printer printer) {
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
}
