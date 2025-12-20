# ✅ Checklist Deployment Heroku - SSPS Project

## 📋 Chuẩn bị ban đầu (Chỉ làm 1 lần)

### 1. Cài đặt Heroku CLI

- [ ] Download từ https://devcenter.heroku.com/articles/heroku-cli
- [ ] Kiểm tra: `heroku --version`
- [ ] Login: `heroku login`
- [ ] Xác nhận login: `heroku auth:whoami`

### 2. Setup Git Remotes

```powershell
# Từ thư mục gốc c:\Dev\SSPS_AntiSocola
heroku git:remote -a spss-be -r heroku-backend
heroku git:remote -a spss-fe -r heroku-frontend

# Kiểm tra
git remote -v
```

### 3. Cấu hình Backend Environment Variables

```powershell
# Database
heroku config:set DATABASE_URL="jdbc:sqlserver://26.188.69.156:1433;databaseName=HCMSIU_SSPS;encrypt=true;trustServerCertificate=true" -a spss-be
heroku config:set DB_USERNAME="user_khach" -a spss-be
heroku config:set DB_PASSWORD="123456" -a spss-be

# JWT
heroku config:set JWT_SECRET="hcmiu-ssps-secret-key-for-jwt-token-generation-2024-minimum-256-bits" -a spss-be
heroku config:set JWT_ACCESS_EXPIRATION="900000" -a spss-be
heroku config:set JWT_REFRESH_EXPIRATION="604800000" -a spss-be

# Email (Thay YOUR_EMAIL và YOUR_APP_PASSWORD)
heroku config:set MAIL_HOST="smtp.gmail.com" -a spss-be
heroku config:set MAIL_PORT="587" -a spss-be
heroku config:set MAIL_USERNAME="your-email@gmail.com" -a spss-be
heroku config:set MAIL_PASSWORD="your-gmail-app-password" -a spss-be
heroku config:set MAIL_FROM_ADDRESS="no-reply@ssps.hcmiu.edu.vn" -a spss-be
heroku config:set MAIL_FROM_NAME="HCMIU SSPS System" -a spss-be

# OTP
heroku config:set OTP_LENGTH="6" -a spss-be
heroku config:set OTP_EXPIRATION_MINUTES="10" -a spss-be
heroku config:set OTP_MAX_ATTEMPTS="5" -a spss-be
heroku config:set OTP_RESEND_COOLDOWN_SECONDS="60" -a spss-be

# File Upload
heroku config:set FILE_UPLOAD_DIR="uploads" -a spss-be
heroku config:set MAX_FILE_SIZE="50MB" -a spss-be

# Supabase (nếu dùng)
heroku config:set SUPABASE_URL="https://your-project.supabase.co" -a spss-be
heroku config:set SUPABASE_KEY="your-supabase-anon-key" -a spss-be
heroku config:set SUPABASE_BUCKET_NAME="documents" -a spss-be
```

### 4. Cấu hình Frontend Environment Variables

```powershell
# API URL - SAU KHI DEPLOY BACKEND, LẤY URL BACKEND ĐỂ SET
heroku config:set NEXT_PUBLIC_API_URL="https://spss-be-xxxxx.herokuapp.com/api" -a spss-fe

# Node version
heroku config:set NODE_VERSION="20.x" -a spss-fe
```

### 5. Kiểm tra Database Connection

- [ ] Đảm bảo SQL Server (26.188.69.156) đang chạy
- [ ] Firewall cho phép kết nối từ Heroku
- [ ] Test connection từ local

---

## 🚀 Deploy lần đầu

### Backend Deploy

- [ ] Kiểm tra file `backend/Procfile` đã tồn tại
- [ ] Kiểm tra file `backend/system.properties` đã tồn tại
- [ ] Commit tất cả changes:
  ```powershell
  git add .
  git commit -m "feat: Setup for Heroku deployment"
  ```
- [ ] Deploy backend:
  ```powershell
  .\deploy-backend.ps1
  # Hoặc manual:
  git subtree push --prefix backend heroku-backend main
  ```
- [ ] Kiểm tra logs:
  ```powershell
  heroku logs --tail -a spss-be
  ```
- [ ] Test backend URL:
  ```
  https://spss-be-xxxxx.herokuapp.com/actuator/health
  ```

### Frontend Deploy

- [ ] Cập nhật NEXT_PUBLIC_API_URL với URL backend thực tế
- [ ] Kiểm tra file `frontend/Procfile` đã tồn tại
- [ ] Deploy frontend:
  ```powershell
  .\deploy-frontend.ps1
  # Hoặc manual:
  git subtree push --prefix frontend heroku-frontend main
  ```
- [ ] Kiểm tra logs:
  ```powershell
  heroku logs --tail -a spss-fe
  ```
- [ ] Test frontend URL:
  ```
  https://spss-fe-xxxxx.herokuapp.com
  ```

---

## 🔄 Deploy thường xuyên

### Quick Deploy (Dùng scripts)

```powershell
# Deploy cả 2
.\deploy-all.ps1

# Hoặc từng cái
.\deploy-backend.ps1
.\deploy-frontend.ps1
```

### Manual Deploy

```powershell
# Commit changes
git add .
git commit -m "Update: your changes"

# Push to GitHub
git push origin feat/deploy

# Deploy backend
git subtree push --prefix backend heroku-backend main

# Deploy frontend
git subtree push --prefix frontend heroku-frontend main
```

---

## 🧪 Testing sau mỗi lần Deploy

### Backend Tests

- [ ] Health check: `https://spss-be-xxxxx.herokuapp.com/actuator/health`
- [ ] Swagger UI: `https://spss-be-xxxxx.herokuapp.com/swagger-ui.html`
- [ ] Test login API
- [ ] Test database connection
- [ ] Kiểm tra logs không có error nghiêm trọng

### Frontend Tests

- [ ] Trang chủ load thành công
- [ ] Login page hoạt động
- [ ] API calls đến backend thành công
- [ ] CORS không có lỗi (check browser console)
- [ ] Images và assets load đúng

### Integration Tests

- [ ] Login flow hoàn chỉnh (Frontend → Backend)
- [ ] OTP email được gửi thành công
- [ ] Upload document hoạt động
- [ ] Print job có thể tạo
- [ ] Student dashboard hiển thị data

---

## 🐛 Troubleshooting Checklist

### Build Failed

- [ ] Kiểm tra logs: `heroku logs --tail -a spss-be`
- [ ] Kiểm tra Java version trong `system.properties`
- [ ] Kiểm tra Maven build local: `cd backend && mvn clean package`
- [ ] Kiểm tra Node version trong config

### Application Crashed

- [ ] Kiểm tra logs: `heroku logs --tail -a spss-be`
- [ ] Restart app: `heroku restart -a spss-be`
- [ ] Kiểm tra database connection
- [ ] Kiểm tra environment variables: `heroku config -a spss-be`

### Database Connection Failed

- [ ] Ping SQL Server từ local
- [ ] Kiểm tra firewall rules
- [ ] Verify credentials trong Heroku config
- [ ] Test connection string

### CORS Errors

- [ ] Thêm frontend URL vào CORS config trong backend
- [ ] Restart backend sau khi update CORS
- [ ] Clear browser cache
- [ ] Check browser console cho chi tiết lỗi

### Email/OTP Not Working

- [ ] Verify Gmail app password
- [ ] Check MAIL_USERNAME và MAIL_PASSWORD trong Heroku config
- [ ] Test SMTP connection
- [ ] Check spam folder

---

## 📊 Monitoring Commands

```powershell
# Xem logs realtime
heroku logs --tail -a spss-be
heroku logs --tail -a spss-fe

# Xem 100 dòng logs gần nhất
heroku logs -n 100 -a spss-be

# Kiểm tra trạng thái app
heroku ps -a spss-be
heroku ps -a spss-fe

# Xem config variables
heroku config -a spss-be
heroku config -a spss-fe

# Restart apps
heroku restart -a spss-be
heroku restart -a spss-fe

# Open apps in browser
heroku open -a spss-be
heroku open -a spss-fe

# Xem thông tin app
heroku info -a spss-be
heroku info -a spss-fe
```

---

## 🔐 Security Checklist

- [ ] Không commit sensitive data (passwords, API keys) vào Git
- [ ] Tất cả secrets đều dùng Heroku Config Vars
- [ ] JWT_SECRET là random và đủ dài (>256 bits)
- [ ] Database password mạnh
- [ ] Email app password được bảo vệ
- [ ] CORS chỉ cho phép frontend domain cụ thể (không dùng \*)
- [ ] HTTPS được enable cho cả backend và frontend

---

## 📝 Lưu ý quan trọng

1. **Database External**:

   - SQL Server đang ở external (26.188.69.156)
   - Cần đảm bảo server luôn running
   - Firewall phải cho phép Heroku IPs

2. **Heroku Free Tier Limitations**:

   - Apps sleep sau 30 phút không hoạt động
   - 550 hours/month cho free dynos
   - Cân nhắc upgrade nếu cần production 24/7

3. **File Storage**:

   - Heroku filesystem là ephemeral (mất khi restart)
   - Nên dùng Supabase Storage hoặc AWS S3 cho file uploads

4. **Environment Variables**:

   - LUÔN dùng Heroku Config Vars cho sensitive data
   - Không hardcode trong code
   - Update frontend NEXT_PUBLIC_API_URL sau khi có backend URL

5. **Deployment Workflow**:
   - Commit code → Push to GitHub → Deploy to Heroku
   - Test trên local trước khi deploy
   - Kiểm tra logs sau mỗi deployment

---

## ✅ Pre-deployment Checklist

### Trước mỗi lần deploy:

- [ ] Code đã được test trên local
- [ ] Tất cả tests pass
- [ ] Không có hardcoded secrets
- [ ] Git working directory clean (hoặc committed)
- [ ] Backend build thành công local: `mvn clean package`
- [ ] Frontend build thành công local: `npm run build`

### Sau mỗi lần deploy:

- [ ] Check logs không có critical errors
- [ ] Test health endpoints
- [ ] Test main user flows
- [ ] Monitor trong 10-15 phút để catch runtime errors

---

**Chúc bạn deploy thành công! 🎉**

Nếu gặp vấn đề, tham khảo [HEROKU_DEPLOYMENT_GUIDE.md](./HEROKU_DEPLOYMENT_GUIDE.md) để có hướng dẫn chi tiết hơn.
