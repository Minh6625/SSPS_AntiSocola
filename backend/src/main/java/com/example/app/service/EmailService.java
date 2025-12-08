package com.example.app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * EmailService - Gửi email OTP và notifications (ASYNC)
 * 
 * Config từ .env:
 * - MAIL_USERNAME: tranvanminhk16@siu.edu.vn
 * - MAIL_PASSWORD: ouygotxdgdxsilvy (App Password)
 * - MAIL_FROM_ADDRESS: tranvanminhk16@siu.edu.vn
 * - MAIL_FROM_NAME: HCMIU SSPS System
 */
@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${email.from.address:no-reply@ssps.hcmiu.edu.vn}")
    private String fromAddress;

    @Value("${email.from.name:HCMIU SSPS System}")
    private String fromName;

    @Value("${email.otp.subject:Mã xác thực OTP - HCMIU SSPS}")
    private String otpSubject;

    /**
     * Gửi OTP qua email (ASYNC - không chờ)
     * 
     * @param toEmail Email nhận OTP
     * @param otpCode Mã OTP (6 chữ số)
     * @param expirationMinutes Thời gian hết hạn (phút)
     * @return true (ngay lập tức, email gửi async)
     */
    @Async("threadPoolTaskExecutor")
    public void sendOtpEmailAsync(String toEmail, String otpCode, int expirationMinutes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(otpSubject);
            message.setText(buildOtpEmailBody(otpCode, expirationMinutes));

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
    
    /**
     * Gửi OTP qua email (SYNC - chờ kết quả)
     */
    public boolean sendOtpEmail(String toEmail, String otpCode, int expirationMinutes) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(otpSubject);
            message.setText(buildOtpEmailBody(otpCode, expirationMinutes));

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
            return true;

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Gửi email xác nhận đăng ký
     */
    public boolean sendWelcomeEmail(String toEmail, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Chào mừng bạn đến với HCMIU SSPS");
            message.setText(buildWelcomeEmailBody(fullName, toEmail));

            mailSender.send(message);
            log.info("Welcome email sent to: {}", toEmail);
            return true;

        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Gửi email thông báo mua thêm trang
     */
    public boolean sendPurchaseConfirmationEmail(String toEmail, String fullName, 
                                                 int pages, double totalPrice) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Xác nhận mua trang in - HCMIU SSPS");
            message.setText(buildPurchaseConfirmationBody(fullName, pages, totalPrice));

            mailSender.send(message);
            log.info("Purchase confirmation email sent to: {}", toEmail);
            return true;

        } catch (Exception e) {
            log.error("Failed to send purchase confirmation to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Xây dựng nội dung email OTP
     */
    private String buildOtpEmailBody(String otpCode, int expirationMinutes) {
        return String.format(
            "Chào bạn,\n\n" +
            "Mã xác thực OTP của bạn là: %s\n\n" +
            "Mã này sẽ hết hạn sau %d phút.\n" +
            "Vui lòng KHÔNG chia sẻ mã này với bất kỳ ai.\n\n" +
            "Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.\n\n" +
            "---\n" +
            "Hệ thống in HCMIU SSPS\n" +
            "www.ssps.hcmiu.edu.vn",
            otpCode, expirationMinutes
        );
    }

    /**
     * Xây dựng nội dung email chào mừng
     */
    private String buildWelcomeEmailBody(String fullName, String email) {
        return String.format(
            "Chào %s,\n\n" +
            "Chúc mừng bạn đã tạo tài khoản thành công trên hệ thống HCMIU SSPS!\n\n" +
            "Email: %s\n\n" +
            "Bây giờ bạn có thể:\n" +
            "- Tải tài liệu để in\n" +
            "- Chọn máy in và cấu hình thông số in\n" +
            "- Quản lý số dư trang in\n" +
            "- Xem lịch sử in của bạn\n\n" +
            "Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận hỗ trợ.\n\n" +
            "---\n" +
            "Hệ thống in HCMIU SSPS\n" +
            "www.ssps.hcmiu.edu.vn",
            fullName, email
        );
    }

    /**
     * Xây dựng nội dung email xác nhận mua trang
     */
    private String buildPurchaseConfirmationBody(String fullName, int pages, double totalPrice) {
        return String.format(
            "Chào %s,\n\n" +
            "Xác nhận mua trang in:\n\n" +
            "Số trang A4: %d\n" +
            "Giá tiền: %.0f VND\n\n" +
            "Số dư trang của bạn đã được cập nhật.\n\n" +
            "Cảm ơn bạn đã sử dụng dịch vụ HCMIU SSPS!\n\n" +
            "---\n" +
            "Hệ thống in HCMIU SSPS\n" +
            "www.ssps.hcmiu.edu.vn",
            fullName, pages, totalPrice
        );
    }
}
