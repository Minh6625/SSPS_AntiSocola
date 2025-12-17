package com.example.app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🔐 Mã xác thực OTP - HCMIU SSPS");
            helper.setText(buildOtpEmailHtmlBody(otpCode, expirationMinutes), true);

            mailSender.send(mimeMessage);
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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🔐 Mã xác thực OTP - HCMIU SSPS");
            helper.setText(buildOtpEmailHtmlBody(otpCode, expirationMinutes), true);

            mailSender.send(mimeMessage);
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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🎉 Chào mừng bạn đến với HCMIU SSPS");
            helper.setText(buildWelcomeEmailHtmlBody(fullName, toEmail), true);

            mailSender.send(mimeMessage);
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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("✅ Xác nhận mua trang in - HCMIU SSPS");
            helper.setText(buildPurchaseConfirmationHtmlBody(fullName, pages, totalPrice), true);

            mailSender.send(mimeMessage);
            log.info("Purchase confirmation email sent to: {}", toEmail);
            return true;

        } catch (Exception e) {
            log.error("Failed to send purchase confirmation to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Xây dựng nội dung email OTP (HTML đẹp)
     */
    private String buildOtpEmailHtmlBody(String otpCode, int expirationMinutes) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mã xác thực OTP - HCMIU SSPS</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                            🔐 Mã Xác Thực OTP
                        </h1>
                        <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                            HCMIU SSPS - Hệ thống in thông minh
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 500;">
                                Chào bạn! 👋
                            </h2>
                            <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
                                Mã xác thực OTP của bạn đã sẵn sàng
                            </p>
                        </div>
                        
                        <!-- OTP Code Box -->
                        <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 15px; padding: 25px; text-align: center; margin: 30px 0; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);">
                            <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px; font-weight: 500; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">
                                Mã xác thực của bạn
                            </p>
                            <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 15px; margin: 10px 0;">
                                <span style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                    %s
                                </span>
                            </div>
                            <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
                                ⏰ Có hiệu lực trong %d phút
                            </p>
                        </div>
                        
                        <!-- Instructions -->
                        <div style="background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                                📋 Hướng dẫn sử dụng:
                            </h3>
                            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                                <li>Nhập mã OTP này vào trang xác thực</li>
                                <li>Mã sẽ hết hạn sau <strong>%d phút</strong></li>
                                <li><strong>KHÔNG</strong> chia sẻ mã này với bất kỳ ai</li>
                            </ul>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
                            <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
                                🛡️ <strong>Lưu ý bảo mật:</strong> Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này và liên hệ với bộ phận hỗ trợ.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                        <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                            Hệ thống in HCMIU SSPS
                        </p>
                        <p style="color: #6c757d; margin: 0 0 15px 0; font-size: 14px;">
                            Trường Đại học Quốc tế - ĐHQG TP.HCM
                        </p>
                        <a href="https://www.ssps.hcmiu.edu.vn" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">
                            🌐 www.ssps.hcmiu.edu.vn
                        </a>
                        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                            <p style="color: #adb5bd; margin: 0; font-size: 12px;">
                                © 2024 HCMIU SSPS. Email được gửi tự động, vui lòng không trả lời.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, otpCode, expirationMinutes, expirationMinutes);
    }
    
    /**
     * Xây dựng nội dung email OTP (Text thuần - fallback)
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
     * Xây dựng nội dung email chào mừng (HTML)
     */
    private String buildWelcomeEmailHtmlBody(String fullName, String email) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chào mừng đến với HCMIU SSPS</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #28a745 0%%, #20c997 100%%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                            🎉 Chào Mừng Bạn!
                        </h1>
                        <p style="color: #e8f5e8; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                            HCMIU SSPS - Hệ thống in thông minh
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 500;">
                                Chào %s! 👋
                            </h2>
                            <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
                                Chúc mừng bạn đã tạo tài khoản thành công!
                            </p>
                        </div>
                        
                        <!-- Account Info -->
                        <div style="background: linear-gradient(135deg, #28a745 0%%, #20c997 100%%); border-radius: 15px; padding: 25px; text-align: center; margin: 30px 0; box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);">
                            <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px; font-weight: 500; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">
                                Tài khoản của bạn
                            </p>
                            <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 15px; margin: 10px 0;">
                                <span style="color: #ffffff; font-size: 18px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                    📧 %s
                                </span>
                            </div>
                        </div>
                        
                        <!-- Features -->
                        <div style="background-color: #f8fff9; border-left: 4px solid #28a745; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                                🚀 Bây giờ bạn có thể:
                            </h3>
                            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                                <li>📄 Tải tài liệu để in</li>
                                <li>🖨️ Chọn máy in và cấu hình thông số in</li>
                                <li>💰 Quản lý số dư trang in</li>
                                <li>📊 Xem lịch sử in của bạn</li>
                                <li>🛒 Mua thêm trang in khi cần thiết</li>
                            </ul>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://www.ssps.hcmiu.edu.vn" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%%, #20c997 100%%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); transition: all 0.3s ease;">
                                🌐 Truy cập hệ thống ngay
                            </a>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                        <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                            Hệ thống in HCMIU SSPS
                        </p>
                        <p style="color: #6c757d; margin: 0 0 15px 0; font-size: 14px;">
                            Trường Đại học Quốc tế - ĐHQG TP.HCM
                        </p>
                        <a href="https://www.ssps.hcmiu.edu.vn" style="color: #28a745; text-decoration: none; font-size: 14px; font-weight: 500;">
                            🌐 www.ssps.hcmiu.edu.vn
                        </a>
                        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                            <p style="color: #adb5bd; margin: 0; font-size: 12px;">
                                © 2024 HCMIU SSPS. Nếu bạn cần hỗ trợ, vui lòng liên hệ bộ phận kỹ thuật.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, fullName, email);
    }
    
    /**
     * Xây dựng nội dung email chào mừng (Text thuần - fallback)
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
     * Xây dựng nội dung email xác nhận mua trang (HTML)
     */
    private String buildPurchaseConfirmationHtmlBody(String fullName, int pages, double totalPrice) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận mua trang in - HCMIU SSPS</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #17a2b8 0%%, #6f42c1 100%%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                            ✅ Xác Nhận Thanh Toán
                        </h1>
                        <p style="color: #e8f4f8; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                            HCMIU SSPS - Hệ thống in thông minh
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 500;">
                                Chào %s! 🎉
                            </h2>
                            <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
                                Giao dịch mua trang in của bạn đã thành công!
                            </p>
                        </div>
                        
                        <!-- Purchase Details -->
                        <div style="background: linear-gradient(135deg, #17a2b8 0%%, #6f42c1 100%%); border-radius: 15px; padding: 25px; margin: 30px 0; box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3);">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 500; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">
                                    Chi tiết giao dịch
                                </p>
                            </div>
                            
                            <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 20px; margin: 15px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <span style="color: #ffffff; font-size: 16px; font-weight: 500;">📄 Số trang A4:</span>
                                    <span style="color: #ffffff; font-size: 20px; font-weight: 700;">%d trang</span>
                                </div>
                                <div style="border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 15px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="color: #ffffff; font-size: 16px; font-weight: 500;">💰 Tổng tiền:</span>
                                        <span style="color: #ffffff; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                            %,.0f VND
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Success Message -->
                        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                            <p style="color: #155724; margin: 0; font-size: 16px; font-weight: 600;">
                                ✅ Số dư trang của bạn đã được cập nhật thành công!
                            </p>
                            <p style="color: #155724; margin: 10px 0 0 0; font-size: 14px;">
                                Bạn có thể bắt đầu sử dụng ngay bây giờ.
                            </p>
                        </div>
                        
                        <!-- Next Steps -->
                        <div style="background-color: #f8f9ff; border-left: 4px solid #17a2b8; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                                🚀 Bước tiếp theo:
                            </h3>
                            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                                <li>Tải tài liệu cần in lên hệ thống</li>
                                <li>Chọn máy in và cấu hình thông số</li>
                                <li>Xác nhận và bắt đầu in</li>
                            </ul>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://www.ssps.hcmiu.edu.vn" style="display: inline-block; background: linear-gradient(135deg, #17a2b8 0%%, #6f42c1 100%%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);">
                                🖨️ Bắt đầu in ngay
                            </a>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                        <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                            Cảm ơn bạn đã sử dụng dịch vụ HCMIU SSPS! 🙏
                        </p>
                        <p style="color: #6c757d; margin: 0 0 15px 0; font-size: 14px;">
                            Trường Đại học Quốc tế - ĐHQG TP.HCM
                        </p>
                        <a href="https://www.ssps.hcmiu.edu.vn" style="color: #17a2b8; text-decoration: none; font-size: 14px; font-weight: 500;">
                            🌐 www.ssps.hcmiu.edu.vn
                        </a>
                        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                            <p style="color: #adb5bd; margin: 0; font-size: 12px;">
                                © 2024 HCMIU SSPS. Email được gửi tự động, vui lòng không trả lời.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, fullName, pages, totalPrice);
    }
    
    /**
     * Xây dựng nội dung email xác nhận mua trang (Text thuần - fallback)
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
