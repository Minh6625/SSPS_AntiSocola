package com.example.app.controller;

import com.example.app.dto.SepayWebhookDTO;
import com.example.app.entity.PendingPayment;
import com.example.app.service.PaymentService;
import com.example.app.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for payment operations and SePay webhook
 */
@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@Tag(name = "Payment", description = "API thanh toán và webhook SePay")
@Slf4j
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${sepay.bank-name:MBBank}")
    private String bankName;

    @Value("${sepay.bank-account:0937833154}")
    private String bankAccount;

    @Value("${sepay.account-name:Le Tan Dat}")
    private String accountName;

    /**
     * POST /hooks/sepay-payment
     * Webhook endpoint for SePay to call when payment is received
     * This endpoint is PUBLIC (no JWT required) but validates SePay API key
     */
    @PostMapping("/hooks/sepay-payment")
    @Operation(summary = "SePay Webhook", description = "Endpoint nhận callback từ SePay khi có giao dịch")
    public ResponseEntity<Map<String, Object>> handleSepayWebhook(
            @RequestBody SepayWebhookDTO webhook,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        log.info("=== SePay Webhook Received ===");
        log.info("Webhook data: {}", webhook);
        log.info("Auth header present: {}", authHeader != null);

        Map<String, Object> response = new HashMap<>();

        try {
            boolean processed = paymentService.processWebhook(webhook, authHeader);
            
            response.put("success", processed);
            response.put("message", processed ? "Webhook processed successfully" : "Webhook processing failed");
            
            log.info("Webhook processed: {}", processed);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing webhook: ", e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * POST /api/payment/create
     * Create a pending payment and get QR code info
     */
    @PostMapping("/api/payment/create")
    @Operation(summary = "Tạo giao dịch thanh toán", description = "Tạo giao dịch chờ thanh toán và lấy thông tin QR")
    public ResponseEntity<?> createPayment(
            HttpServletRequest request,
            @RequestBody CreatePaymentRequest paymentRequest
    ) {
        log.info("=== Create Payment Request ===");
        
        try {
            // Extract and validate token
            String token = extractTokenFromRequest(request);
            if (token == null || jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String studentId = jwtUtil.extractUserId(token);
            if (studentId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            log.info("Creating payment for student: {}, A4: {}, A3: {}", 
                    studentId, paymentRequest.getA4Pages(), paymentRequest.getA3Pages());

            // Create pending payment
            PendingPayment payment = paymentService.createPendingPayment(
                    studentId, 
                    paymentRequest.getA4Pages(), 
                    paymentRequest.getA3Pages()
            );

            // Build QR URL
            String qrContent = payment.getPaymentCode();
            String qrUrl = String.format(
                    "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s",
                    bankAccount, bankName, payment.getAmount(), qrContent
            );

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentCode", payment.getPaymentCode());
            response.put("amount", payment.getAmount());
            response.put("a4Pages", payment.getA4Pages());
            response.put("a3Pages", payment.getA3Pages());
            response.put("qrUrl", qrUrl);
            response.put("bankName", bankName);
            response.put("bankAccount", bankAccount);
            response.put("accountName", accountName);
            response.put("expiresAt", payment.getExpiresAt().toString());
            response.put("message", "Vui lòng chuyển khoản với nội dung: " + payment.getPaymentCode());

            log.info("Payment created successfully: {}", payment.getPaymentCode());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error creating payment: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /api/payment/status/{paymentCode}
     * Check payment status
     */
    @GetMapping("/api/payment/status/{paymentCode}")
    @Operation(summary = "Kiểm tra trạng thái thanh toán", description = "Kiểm tra trạng thái của giao dịch")
    public ResponseEntity<?> getPaymentStatus(
            HttpServletRequest request,
            @PathVariable String paymentCode
    ) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null || jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            PendingPayment payment = paymentService.getPendingPayment(paymentCode);

            Map<String, Object> response = new HashMap<>();
            response.put("paymentCode", payment.getPaymentCode());
            response.put("status", payment.getStatus());
            response.put("amount", payment.getAmount());
            response.put("a4Pages", payment.getA4Pages());
            response.put("a3Pages", payment.getA3Pages());
            response.put("createdAt", payment.getCreatedAt().toString());
            response.put("expiresAt", payment.getExpiresAt().toString());
            
            if (payment.getCompletedAt() != null) {
                response.put("completedAt", payment.getCompletedAt().toString());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting payment status: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /api/payment/pending
     * Get active pending payments for current user
     */
    @GetMapping("/api/payment/pending")
    @Operation(summary = "Lấy danh sách giao dịch đang chờ", description = "Lấy các giao dịch đang chờ thanh toán")
    public ResponseEntity<?> getPendingPayments(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null || jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String studentId = jwtUtil.extractUserId(token);
            List<PendingPayment> payments = paymentService.getActivePendingPayments(studentId);

            return ResponseEntity.ok(payments);

        } catch (Exception e) {
            log.error("Error getting pending payments: ", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * DELETE /api/payment/cancel/{paymentCode}
     * Cancel a pending payment
     */
    @DeleteMapping("/api/payment/cancel/{paymentCode}")
    @Operation(summary = "Hủy giao dịch", description = "Hủy giao dịch đang chờ thanh toán")
    public ResponseEntity<?> cancelPayment(
            HttpServletRequest request,
            @PathVariable String paymentCode
    ) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null || jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String studentId = jwtUtil.extractUserId(token);
            paymentService.cancelPendingPayment(paymentCode, studentId);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã hủy giao dịch"));

        } catch (Exception e) {
            log.error("Error cancelling payment: ", e);
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Extract JWT token from request
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Request DTO for creating payment
     */
    public static class CreatePaymentRequest {
        private Integer a4Pages;
        private Integer a3Pages;

        public Integer getA4Pages() { return a4Pages != null ? a4Pages : 0; }
        public void setA4Pages(Integer a4Pages) { this.a4Pages = a4Pages; }
        public Integer getA3Pages() { return a3Pages != null ? a3Pages : 0; }
        public void setA3Pages(Integer a3Pages) { this.a3Pages = a3Pages; }
    }
}
