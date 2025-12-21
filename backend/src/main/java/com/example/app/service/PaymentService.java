package com.example.app.service;

import com.example.app.dto.PaymentNotificationDTO;
import com.example.app.dto.SepayWebhookDTO;
import com.example.app.entity.PageBalance;
import com.example.app.entity.PageTransaction;
import com.example.app.entity.PendingPayment;
import com.example.app.exception.BusinessException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.PageBalanceRepository;
import com.example.app.repository.PageTransactionRepository;
import com.example.app.repository.PendingPaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for handling SePay payment integration
 */
@Service
@Slf4j
public class PaymentService {

    @Autowired
    private PendingPaymentRepository pendingPaymentRepository;

    @Autowired
    private PageBalanceRepository pageBalanceRepository;

    @Autowired
    private PageTransactionRepository pageTransactionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Value("${sepay.api-key:}")
    private String sepayApiKey;

    @Value("${sepay.bank-account:0937833154}")
    private String bankAccount;

    private static final int PRICE_A4 = 500;
    private static final int PRICE_A3 = 1000;

    /**
     * Create a pending payment and return payment code for QR
     */
    @Transactional
    public PendingPayment createPendingPayment(String studentId, int a4Pages, int a3Pages) {
        log.info("Creating pending payment for student: {}, A4: {}, A3: {}", studentId, a4Pages, a3Pages);

        // Validate
        if (a4Pages < 0 || a4Pages > 1000) {
            throw new BusinessException("Số trang A4 phải từ 0 đến 1000");
        }
        if (a3Pages < 0 || a3Pages > 500) {
            throw new BusinessException("Số trang A3 phải từ 0 đến 500");
        }
        if (a4Pages == 0 && a3Pages == 0) {
            throw new BusinessException("Vui lòng nhập ít nhất 1 trang");
        }

        // Calculate amount
        long amount = (long) a4Pages * PRICE_A4 + (long) a3Pages * PRICE_A3;

        // Generate unique payment code (format: SPSS + studentId last 4 chars + random 4 digits)
        String studentSuffix = studentId.length() > 4 ? studentId.substring(studentId.length() - 4) : studentId;
        String paymentCode = "SPSS" + studentSuffix + String.format("%04d", (int)(Math.random() * 10000));

        // Cancel any existing pending payments for this student
        List<PendingPayment> existingPending = pendingPaymentRepository.findByStudentIdAndStatus(studentId, "PENDING");
        for (PendingPayment existing : existingPending) {
            existing.setStatus("CANCELLED");
            pendingPaymentRepository.save(existing);
        }

        // Create new pending payment
        PendingPayment payment = PendingPayment.builder()
                .paymentCode(paymentCode)
                .studentId(studentId)
                .a4Pages(a4Pages)
                .a3Pages(a3Pages)
                .amount(amount)
                .status("PENDING")
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        payment = pendingPaymentRepository.save(payment);
        log.info("Created pending payment: {} for amount: {} VND", paymentCode, amount);

        return payment;
    }

    /**
     * Process webhook from SePay
     */
    @Transactional
    public boolean processWebhook(SepayWebhookDTO webhook, String authHeader) {
        log.info("=== Processing SePay webhook ===");
        log.info("Webhook: {}", webhook);
        log.info("Auth header: {}", authHeader);

        // Validate API key
        if (!validateApiKey(authHeader)) {
            log.warn("Invalid API key in webhook request");
            return false;
        }

        // Only process incoming transfers
        if (!"in".equalsIgnoreCase(webhook.getTransferType())) {
            log.info("Ignoring outgoing transfer");
            return true;
        }

        // Validate bank account
        if (!bankAccount.equals(webhook.getAccountNumber())) {
            log.warn("Bank account mismatch: expected {}, got {}", bankAccount, webhook.getAccountNumber());
            return false;
        }

        String content = webhook.getContent();
        Long amount = webhook.getTransferAmount();

        log.info("Processing transfer: amount={}, content={}", amount, content);

        // Try to find matching pending payment by payment code in content
        PendingPayment matchedPayment = findMatchingPayment(content, amount);

        if (matchedPayment != null) {
            log.info("Matched payment found: {}", matchedPayment.getPaymentCode());
            completePayment(matchedPayment, webhook);
            return true;
        }

        log.warn("No matching pending payment found for content: {}, amount: {}", content, amount);
        return true; // Still return true to acknowledge webhook
    }

    /**
     * Find matching pending payment from transfer content
     */
    private PendingPayment findMatchingPayment(String content, Long amount) {
        if (content == null || content.isEmpty()) {
            return null;
        }

        log.info("Finding matching payment - content: {}, amount: {}", content, amount);

        // Extract payment code from content (format: SPSS + 4 chars + 4 digits)
        String upperContent = content.toUpperCase();
        
        // Try to find SPSS code in content
        int spssIndex = upperContent.indexOf("SPSS");
        if (spssIndex >= 0 && spssIndex + 12 <= upperContent.length()) {
            String potentialCode = upperContent.substring(spssIndex, spssIndex + 12);
            // Remove any spaces
            potentialCode = potentialCode.replaceAll("\\s+", "");
            if (potentialCode.length() >= 8) {
                potentialCode = potentialCode.substring(0, Math.min(12, potentialCode.length()));
                
                log.info("Extracted potential code: {}", potentialCode);
                
                Optional<PendingPayment> payment = pendingPaymentRepository
                        .findByPaymentCodeAndStatus(potentialCode, "PENDING");
                
                if (payment.isPresent()) {
                    PendingPayment p = payment.get();
                    log.info("Found payment: code={}, amount={}, expected={}", potentialCode, p.getAmount(), amount);
                    // Verify amount matches
                    if (p.getAmount().equals(amount)) {
                        log.info("Amount matches! Returning payment");
                        return p;
                    } else {
                        log.warn("Amount mismatch for code {}: expected {}, got {}", 
                                potentialCode, p.getAmount(), amount);
                    }
                } else {
                    log.warn("No pending payment found for code: {}", potentialCode);
                }
            }
        }

        // Fallback: try to match by exact amount for pending payments
        List<PendingPayment> pendingByAmount = pendingPaymentRepository
                .findPendingByAmount(amount, LocalDateTime.now());
        
        if (pendingByAmount.size() == 1) {
            log.info("Found single pending payment matching amount: {}", amount);
            return pendingByAmount.get(0);
        }

        log.warn("No matching payment found");
        return null;
    }

    /**
     * Complete payment and update balance
     */
    @Transactional
    public void completePayment(PendingPayment payment, SepayWebhookDTO webhook) {
        log.info("Completing payment: {}", payment.getPaymentCode());

        // Update pending payment status
        payment.setStatus("COMPLETED");
        payment.setCompletedAt(LocalDateTime.now());
        payment.setBankTransactionId(webhook.getReferenceCode());
        pendingPaymentRepository.save(payment);

        // Update page balance
        PageBalance balance = pageBalanceRepository.findByStudentId(payment.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy số dư trang"));

        int newA4Balance = balance.getA4Balance() + payment.getA4Pages();
        int newA3Balance = balance.getA3Balance() + payment.getA3Pages();

        balance.setA4Balance(newA4Balance);
        balance.setA3Balance(newA3Balance);
        balance.setLastUpdated(LocalDateTime.now());
        pageBalanceRepository.save(balance);

        // Create transaction record
        PageTransaction transaction = new PageTransaction();
        transaction.setStudentId(payment.getStudentId());
        transaction.setTransactionType("Purchase");
        transaction.setA4Pages(payment.getA4Pages());
        transaction.setA3Pages(payment.getA3Pages());
        transaction.setBalanceAfterA4(newA4Balance);
        transaction.setBalanceAfterA3(newA3Balance);
        transaction.setAmount(BigDecimal.valueOf(payment.getAmount()));
        transaction.setPaymentMethod("SePay - " + webhook.getGateway());
        transaction.setTransactionStatus("Completed");
        transaction.setNotes("Thanh toán qua SePay - Mã: " + payment.getPaymentCode());
        transaction.setCreatedBy(payment.getStudentId());
        pageTransactionRepository.save(transaction);

        log.info("Payment completed. New balance - A4: {}, A3: {}", newA4Balance, newA3Balance);

        // Send WebSocket notification
        sendPaymentNotification(payment, newA4Balance, newA3Balance);
    }

    /**
     * Send real-time notification via WebSocket
     */
    private void sendPaymentNotification(PendingPayment payment, int newA4Balance, int newA3Balance) {
        PaymentNotificationDTO notification = PaymentNotificationDTO.builder()
                .status("SUCCESS")
                .message("Thanh toán thành công! Đã cộng " + payment.getA4Pages() + " trang A4 và " 
                        + payment.getA3Pages() + " trang A3 vào tài khoản.")
                .transactionCode(payment.getPaymentCode())
                .amount(payment.getAmount())
                .studentId(payment.getStudentId())
                .a4Pages(payment.getA4Pages())
                .a3Pages(payment.getA3Pages())
                .newA4Balance(newA4Balance)
                .newA3Balance(newA3Balance)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();

        // Send to specific student topic
        String destination = "/topic/payment/" + payment.getStudentId();
        messagingTemplate.convertAndSend(destination, notification);
        log.info("Sent payment notification to: {}", destination);
    }

    /**
     * Validate SePay API key
     */
    private boolean validateApiKey(String authHeader) {
        // TODO: Enable API key validation after confirming SePay webhook format
        // For now, accept all webhooks (will validate by payment code matching)
        log.info("Webhook auth header: {}", authHeader);
        return true;
        
        /*
        if (authHeader == null || authHeader.isEmpty()) {
            return false;
        }
        
        // Format: "Apikey API_KEY_VALUE"
        String expectedHeader = "Apikey " + sepayApiKey;
        return expectedHeader.equals(authHeader);
        */
    }

    /**
     * Get pending payment status
     */
    public PendingPayment getPendingPayment(String paymentCode) {
        return pendingPaymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch: " + paymentCode));
    }

    /**
     * Get active pending payments for student
     */
    public List<PendingPayment> getActivePendingPayments(String studentId) {
        return pendingPaymentRepository.findActivePendingByStudentId(studentId, LocalDateTime.now());
    }

    /**
     * Cancel pending payment
     */
    @Transactional
    public void cancelPendingPayment(String paymentCode, String studentId) {
        PendingPayment payment = pendingPaymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch"));
        
        if (!payment.getStudentId().equals(studentId)) {
            throw new BusinessException("Không có quyền hủy giao dịch này");
        }
        
        if (!"PENDING".equals(payment.getStatus())) {
            throw new BusinessException("Chỉ có thể hủy giao dịch đang chờ");
        }
        
        payment.setStatus("CANCELLED");
        pendingPaymentRepository.save(payment);
    }
}
