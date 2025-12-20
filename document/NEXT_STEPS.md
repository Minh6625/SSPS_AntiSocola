# 📋 CÁC BƯỚC TIẾP THEO - DEPLOYMENT TO HEROKU

## ✅ Đã hoàn thành (Tự động)

Tôi đã tạo và cấu hình các file sau cho bạn:

### 📄 Tài liệu

- [x] `HEROKU_DEPLOYMENT_GUIDE.md` - Hướng dẫn deployment đầy đủ
- [x] `DEPLOYMENT_CHECKLIST.md` - Checklist chi tiết từng bước
- [x] `GMAIL_SETUP_GUIDE.md` - Hướng dẫn setup Gmail App Password
- [x] `QUICK_DEPLOY.md` - Hướng dẫn nhanh 5 phút

### 🔧 Config Files

- [x] `backend/Procfile` - Heroku process file cho backend
- [x] `backend/system.properties` - Java version config
- [x] `frontend/Procfile` - Heroku process file cho frontend

### 🚀 Deployment Scripts

- [x] `deploy-backend.ps1` - Script deploy backend
- [x] `deploy-frontend.ps1` - Script deploy frontend
- [x] `deploy-all.ps1` - Script deploy cả 2

### ⚙️ Code Updates

- [x] `backend/src/main/resources/application.properties` - Đã cập nhật để đọc từ env vars
- [x] `frontend/next.config.js` - Đã cập nhật NEXT_PUBLIC_API_URL
- [x] `frontend/package.json` - Đã cập nhật start script với $PORT

---

## 🎯 CÁC BƯỚC BẠN CẦN LÀM

### Bước 1: Commit changes (BẮT BUỘC)

```powershell
git add .
git commit -m "feat: Setup Heroku deployment configuration"
git push origin feat/deploy
```

### Bước 2: Login Heroku (NẾU CHƯA)

```powershell
heroku login
# Browser sẽ mở, login vào tài khoản Heroku của bạn
```

### Bước 3: Setup Git Remotes (LẦN ĐẦU)

```powershell
# Thêm remote cho backend
heroku git:remote -a spss-be -r heroku-backend

# Thêm remote cho frontend
heroku git:remote -a spss-fe -r heroku-frontend

# Verify
git remote -v
```

### Bước 4: Setup Gmail App Password (QUAN TRỌNG!)

📧 **ĐỌC FILE `GMAIL_SETUP_GUIDE.md` ĐỂ BIẾT CHI TIẾT**

Tóm tắt:

1. Enable 2-Factor Authentication trên Gmail
2. Tạo App Password tại https://myaccount.google.com/apppasswords
3. Copy 16-digit password
4. Set vào Heroku:

```powershell
heroku config:set MAIL_USERNAME="your-email@gmail.com" -a spss-be
heroku config:set MAIL_PASSWORD="xxxx xxxx xxxx xxxx" -a spss-be
```

### Bước 5: Set Environment Variables cho Backend

```powershell
# Database (đã đúng trong code, chỉ cần confirm)
heroku config:set DATABASE_URL="jdbc:sqlserver://26.188.69.156:1433;databaseName=HCMSIU_SSPS;encrypt=true;trustServerCertificate=true" -a spss-be
heroku config:set DB_USERNAME="user_khach" -a spss-be
heroku config:set DB_PASSWORD="123456" -a spss-be

# JWT
heroku config:set JWT_SECRET="hcmiu-ssps-secret-key-for-jwt-token-generation-2024-minimum-256-bits" -a spss-be

# Email (đã set ở Bước 4)
# MAIL_USERNAME và MAIL_PASSWORD

# Other configs (optional, có defaults)
heroku config:set OTP_LENGTH="6" -a spss-be
heroku config:set OTP_EXPIRATION_MINUTES="10" -a spss-be
```

### Bước 6: Deploy Backend

```powershell
# Sử dụng script (khuyến nghị)
.\deploy-backend.ps1

# Hoặc manual
git subtree push --prefix backend heroku-backend main
```

**Chờ 3-5 phút để build xong. Xem logs:**

```powershell
heroku logs --tail -a spss-be
```

**Sau khi deploy xong, lấy URL backend:**

```powershell
heroku open -a spss-be
# Hoặc check: https://dashboard.heroku.com/apps/spss-be
```

### Bước 7: Set API URL cho Frontend

```powershell
# Thay URL bên dưới bằng URL backend thực tế từ Bước 6
heroku config:set NEXT_PUBLIC_API_URL="https://spss-be-xxxxx.herokuapp.com/api" -a spss-fe
```

### Bước 8: Deploy Frontend

```powershell
# Sử dụng script (khuyến nghị)
.\deploy-frontend.ps1

# Hoặc manual
git subtree push --prefix frontend heroku-frontend main
```

**Xem logs:**

```powershell
heroku logs --tail -a spss-fe
```

### Bước 9: Test Deployment ✅

```powershell
# Mở backend
heroku open -a spss-be

# Mở frontend
heroku open -a spss-fe

# Test backend health
# Truy cập: https://spss-be-xxxxx.herokuapp.com/actuator/health

# Test frontend
# Truy cập: https://spss-fe-xxxxx.herokuapp.com
```

---

## 🎯 DEPLOY THƯỜNG XUYÊN (SAU LẦN ĐẦU)

Sau khi setup xong, mỗi lần code mới chỉ cần:

```powershell
# 1. Commit changes
git add .
git commit -m "Update: your changes"

# 2. Deploy (chọn 1 trong 3)
.\deploy-all.ps1          # Deploy cả 2
.\deploy-backend.ps1      # Deploy backend only
.\deploy-frontend.ps1     # Deploy frontend only
```

---

## 📊 USEFUL COMMANDS

```powershell
# Xem logs realtime
heroku logs --tail -a spss-be
heroku logs --tail -a spss-fe

# Restart apps
heroku restart -a spss-be
heroku restart -a spss-fe

# Xem config variables
heroku config -a spss-be
heroku config -a spss-fe

# Xem thông tin app
heroku info -a spss-be
heroku info -a spss-fe

# Open in browser
heroku open -a spss-be
heroku open -a spss-fe
```

---

## ❗ LƯU Ý QUAN TRỌNG

### 1. Database Connection

- SQL Server (26.188.69.156) phải running và accessible
- Firewall phải allow Heroku IPs
- Nếu database không accessible từ internet → cần setup VPN hoặc migrate

### 2. Email Configuration

- BẮT BUỘC phải setup Gmail App Password mới gửi được OTP
- Đọc `GMAIL_SETUP_GUIDE.md` để biết chi tiết

### 3. Environment Variables

- KHÔNG commit passwords/secrets vào Git
- LUÔN dùng Heroku Config Vars
- Backend đã được config để đọc từ env vars

### 4. Heroku Free Tier

- Apps sleep sau 30 phút không hoạt động
- 550 hours/month cho free dynos
- First request sau khi sleep sẽ mất 10-30 giây để wake up

### 5. File Uploads

- Heroku filesystem là ephemeral (mất khi restart/redeploy)
- Nên dùng Supabase Storage hoặc AWS S3 cho production
- Config Supabase đã có trong application.properties

---

## 🆘 CẦN HELP?

1. **Build failed**: Đọc logs với `heroku logs --tail -a spss-be`
2. **Database error**: Check connection từ local trước
3. **CORS error**: Verify NEXT_PUBLIC_API_URL trong frontend
4. **Email error**: Verify Gmail App Password đã đúng
5. **Other issues**: Xem `DEPLOYMENT_CHECKLIST.md` phần Troubleshooting

---

## ✅ CHECKLIST NHANH

- [ ] Đã commit tất cả changes
- [ ] Đã login Heroku: `heroku login`
- [ ] Đã add remotes: `heroku git:remote -a spss-be -r heroku-backend`
- [ ] Đã setup Gmail App Password
- [ ] Đã set environment variables cho backend
- [ ] Đã deploy backend thành công
- [ ] Đã lấy URL backend
- [ ] Đã set NEXT_PUBLIC_API_URL cho frontend
- [ ] Đã deploy frontend thành công
- [ ] Đã test cả 2 apps hoạt động

---

## 🚀 START HERE!

**Bắt đầu với Bước 1 phía trên và làm tuần tự từng bước.**

**Đọc `QUICK_DEPLOY.md` để có hướng dẫn ngắn gọn hơn.**

**Good luck! 🎉**
