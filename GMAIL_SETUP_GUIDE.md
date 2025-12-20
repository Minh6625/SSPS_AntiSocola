# 📧 Hướng dẫn Setup Gmail App Password cho OTP

## Tại sao cần Gmail App Password?

Google không cho phép apps bên thứ 3 sử dụng password Gmail thường. Bạn cần tạo "App Password" để ứng dụng có thể gửi email OTP.

## 📝 Các bước Setup Gmail App Password

### Bước 1: Enable 2-Factor Authentication

1. Truy cập https://myaccount.google.com/security
2. Tìm phần "2-Step Verification"
3. Click "Get Started" và làm theo hướng dẫn
4. Verify bằng phone number hoặc authenticator app

### Bước 2: Tạo App Password

1. Sau khi enable 2FA, quay lại https://myaccount.google.com/security
2. Tìm "App passwords" (hoặc truy cập trực tiếp: https://myaccount.google.com/apppasswords)
3. Click "Select app" → chọn "Mail"
4. Click "Select device" → chọn "Other (Custom name)"
5. Đặt tên: "SSPS Backend" hoặc "Heroku SSPS"
6. Click "Generate"
7. **Copy 16-digit password** (dạng: xxxx xxxx xxxx xxxx)
8. **LƯU Ý**: Password này chỉ hiện 1 lần, lưu lại ngay!

### Bước 3: Configure Local Environment

Tạo file `.env` trong thư mục `backend/` (để test local):

```properties
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**LƯU Ý**: File `.env` không được commit lên Git!

### Bước 4: Configure Heroku

```powershell
# Set email config cho Heroku
heroku config:set MAIL_USERNAME="your-email@gmail.com" -a spss-be
heroku config:set MAIL_PASSWORD="xxxx xxxx xxxx xxxx" -a spss-be

# Verify config
heroku config:get MAIL_USERNAME -a spss-be
heroku config:get MAIL_PASSWORD -a spss-be
```

## 🧪 Test Email Configuration

### Test từ Local

1. Start backend: `cd backend && mvn spring-boot:run`
2. Call API test OTP:
   ```bash
   curl -X POST http://localhost:8080/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```
3. Check email inbox

### Test từ Heroku

```powershell
# Xem logs realtime
heroku logs --tail -a spss-be

# Trong logs, tìm các dòng liên quan đến email:
# - "Sending OTP email to..."
# - "Email sent successfully"
# - Hoặc error messages nếu có
```

## 🐛 Troubleshooting

### Lỗi: "Username and Password not accepted"

**Nguyên nhân**: Chưa bật 2FA hoặc App Password sai
**Giải pháp**:

- Verify đã bật 2-Step Verification
- Tạo lại App Password mới
- Copy chính xác 16 ký tự (bỏ dấu cách giữa các nhóm 4 ký tự)

### Lỗi: "Connection timeout"

**Nguyên nhân**: SMTP port bị block hoặc firewall
**Giải pháp**:

- Verify MAIL_PORT=587
- Check firewall/antivirus
- Try MAIL_PORT=465 với SSL

### Lỗi: "Could not connect to SMTP host"

**Nguyên nhân**: Heroku không thể kết nối đến Gmail
**Giải pháp**:

- Gmail có thể block suspicious activity
- Truy cập https://accounts.google.com/DisplayUnlockCaptcha
- Click "Continue" để allow access
- Try again

### Email không được gửi nhưng không có error

**Nguyên nhân**: Email bị Gmail block hoặc vào spam
**Giải pháp**:

- Check Gmail's "Sent" folder
- Check spam folder của recipient
- Verify MAIL_FROM_ADDRESS không bị blacklist

## 🔒 Security Best Practices

1. **Không commit App Password vào Git**

   - Add `.env` vào `.gitignore`
   - Chỉ dùng Heroku Config Vars cho production

2. **Một App Password cho mỗi môi trường**

   - Development: 1 password
   - Production: 1 password khác
   - Dễ revoke nếu bị leak

3. **Regular Rotation**

   - Đổi App Password mỗi 3-6 tháng
   - Revoke passwords cũ không dùng

4. **Monitor Usage**
   - Check Gmail activity log định kỳ
   - Alert nếu có unusual activity

## 📧 Alternative Email Providers

Nếu không muốn dùng Gmail, có thể dùng:

### SendGrid (Khuyến nghị cho production)

```powershell
# Free tier: 100 emails/day
heroku addons:create sendgrid:starter -a spss-be

# Config tự động set, không cần MAIL_USERNAME/PASSWORD
```

### Mailgun

```powershell
# Free tier: 5,000 emails/month
heroku addons:create mailgun:starter -a spss-be
```

### Amazon SES

- Giá rẻ: $0.10/1000 emails
- Reliable và scalable
- Cần setup AWS account

## 📊 Email Template Configuration

Backend đã có email templates tại:

- `src/main/resources/templates/otp-email.html` (nếu có)
- Hoặc inline trong `EmailService.java`

Customize email content trong code hoặc template files.

## ✅ Final Checklist

- [ ] Gmail 2FA đã được enable
- [ ] App Password đã được tạo và lưu lại
- [ ] `.env` file có MAIL_USERNAME và MAIL_PASSWORD (local)
- [ ] Heroku config có MAIL_USERNAME và MAIL_PASSWORD (production)
- [ ] Test gửi OTP thành công từ local
- [ ] Test gửi OTP thành công từ Heroku
- [ ] Email không vào spam
- [ ] Logs không có error liên quan đến email
- [ ] App Password không bị commit lên Git

---

**Xong! Bây giờ hệ thống đã sẵn sàng gửi OTP emails. 📧✅**
