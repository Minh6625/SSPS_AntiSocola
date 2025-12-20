# 🚀 Quick Deploy Guide - SSPS Heroku

## Tóm tắt nhanh cho deployment

Bạn có 2 Heroku apps:

- **spss-be**: Backend (Spring Boot/Java 17)
- **spss-fe**: Frontend (Next.js 14)

---

## ⚡ Quick Start (5 phút)

### 1. Setup một lần (First time only)

```powershell
# Login Heroku
heroku login

# Add remotes
cd c:\Dev\SSPS_AntiSocola
heroku git:remote -a spss-be -r heroku-backend
heroku git:remote -a spss-fe -r heroku-frontend

# Setup Email (Xem GMAIL_SETUP_GUIDE.md để lấy App Password)
heroku config:set MAIL_USERNAME="your-email@gmail.com" -a spss-be
heroku config:set MAIL_PASSWORD="your-app-password" -a spss-be
```

### 2. Deploy lần đầu

```powershell
# Backend
.\deploy-backend.ps1

# Lấy URL backend sau khi deploy xong (vd: https://spss-be-xxxxx.herokuapp.com)

# Set API URL cho Frontend
heroku config:set NEXT_PUBLIC_API_URL="https://spss-be-xxxxx.herokuapp.com/api" -a spss-fe

# Frontend
.\deploy-frontend.ps1
```

### 3. Deploy thường xuyên

```powershell
# Deploy cả 2
.\deploy-all.ps1

# Hoặc riêng lẻ
.\deploy-backend.ps1
.\deploy-frontend.ps1
```

---

## 📚 Tài liệu chi tiết

- **[HEROKU_DEPLOYMENT_GUIDE.md](./HEROKU_DEPLOYMENT_GUIDE.md)** - Hướng dẫn deployment đầy đủ
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist từng bước
- **[GMAIL_SETUP_GUIDE.md](./GMAIL_SETUP_GUIDE.md)** - Setup Gmail để gửi OTP

---

## 🎯 URLs sau khi deploy

- Backend: `https://spss-be-xxxxx.herokuapp.com`
- Frontend: `https://spss-fe-xxxxx.herokuapp.com`
- Backend Health: `https://spss-be-xxxxx.herokuapp.com/actuator/health`
- Swagger UI: `https://spss-be-xxxxx.herokuapp.com/swagger-ui.html`

---

## 🐛 Gặp lỗi?

```powershell
# Xem logs
heroku logs --tail -a spss-be
heroku logs --tail -a spss-fe

# Restart app
heroku restart -a spss-be
heroku restart -a spss-fe

# Xem config
heroku config -a spss-be
```

Xem [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) phần Troubleshooting để biết thêm chi tiết.

---

**Chúc deploy thành công! 🎉**
