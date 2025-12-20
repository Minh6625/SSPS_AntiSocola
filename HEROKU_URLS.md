# 🔗 URLs và Endpoints sau khi Deploy

## 📱 Heroku Apps URLs

### Backend (spss-be)

- **Dashboard**: https://dashboard.heroku.com/apps/spss-be
- **App URL**: `https://spss-be-[unique-id].herokuapp.com`
- **Health Check**: `https://spss-be-[unique-id].herokuapp.com/actuator/health`
- **Swagger UI**: `https://spss-be-[unique-id].herokuapp.com/swagger-ui.html`
- **API Docs**: `https://spss-be-[unique-id].herokuapp.com/api-docs`

### Frontend (spss-fe)

- **Dashboard**: https://dashboard.heroku.com/apps/spss-fe
- **App URL**: `https://spss-fe-[unique-id].herokuapp.com`
- **Home Page**: `https://spss-fe-[unique-id].herokuapp.com`
- **Login**: `https://spss-fe-[unique-id].herokuapp.com/login`
- **SPSO Login**: `https://spss-fe-[unique-id].herokuapp.com/spso-login`

---

## 🔧 Lấy URLs sau khi deploy

```powershell
# Backend URL
heroku info -a spss-be | Select-String "Web URL"

# Frontend URL
heroku info -a spss-fe | Select-String "Web URL"

# Hoặc mở trực tiếp trong browser
heroku open -a spss-be
heroku open -a spss-fe
```

---

## 🛠️ Backend API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/send-otp` - Gửi OTP
- `POST /api/auth/verify-otp` - Xác thực OTP
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

### Users

- `GET /api/users/profile` - Lấy profile user
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users` - List users (SPSO only)

### Page Balance

- `GET /api/page-balance` - Xem số dư trang
- `POST /api/page-balance/purchase` - Mua thêm trang
- `GET /api/page-balance/history` - Lịch sử mua trang

### Printers

- `GET /api/printers` - Danh sách máy in
- `GET /api/printers/{id}` - Chi tiết máy in
- `POST /api/printers` - Thêm máy in (SPSO only)
- `PUT /api/printers/{id}` - Cập nhật máy in (SPSO only)
- `DELETE /api/printers/{id}` - Xóa máy in (SPSO only)
- `PUT /api/printers/{id}/status` - Bật/tắt máy in (SPSO only)

### Print Jobs

- `POST /api/print-jobs` - Tạo lệnh in
- `GET /api/print-jobs` - Lịch sử in
- `GET /api/print-jobs/{id}` - Chi tiết lệnh in
- `PUT /api/print-jobs/{id}/status` - Cập nhật trạng thái in

### Documents

- `POST /api/documents/upload` - Upload tài liệu
- `GET /api/documents` - Danh sách tài liệu
- `GET /api/documents/{id}` - Tải tài liệu
- `DELETE /api/documents/{id}` - Xóa tài liệu

### Reports (SPSO only)

- `GET /api/reports/print-logs` - Báo cáo log in ấn
- `GET /api/reports/usage` - Báo cáo sử dụng
- `GET /api/reports/revenue` - Báo cáo doanh thu

### Configuration (SPSO only)

- `GET /api/config/page-pricing` - Giá trang
- `PUT /api/config/page-pricing` - Cập nhật giá
- `GET /api/config/file-types` - Loại file cho phép
- `PUT /api/config/file-types` - Cập nhật loại file

---

## 🧪 Test Endpoints

### Test Backend Health

```powershell
# PowerShell
Invoke-WebRequest -Uri "https://spss-be-[unique-id].herokuapp.com/actuator/health"

# Hoặc dùng curl
curl https://spss-be-[unique-id].herokuapp.com/actuator/health
```

### Test Login API

```powershell
# PowerShell
$body = @{
    email = "test@hcmiu.edu.vn"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://spss-be-[unique-id].herokuapp.com/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test Swagger UI

Mở browser và truy cập:

```
https://spss-be-[unique-id].herokuapp.com/swagger-ui.html
```

---

## 📊 Frontend Routes

### Public Routes

- `/` - Home page
- `/login` - Student login
- `/spso-login` - SPSO login
- `/register` - Đăng ký
- `/forgot-password` - Quên mật khẩu
- `/verify-otp` - Xác thực OTP

### Student Routes (Requires Auth)

- `/student` - Dashboard
- `/student/profile` - Profile
- `/student/print` - Trang in tài liệu
- `/student/print-document` - Upload và in
- `/student/print-history` - Lịch sử in
- `/student/printers` - Xem máy in
- `/student/page-balance` - Quản lý số dư trang

### SPSO Routes (Requires SPSO Auth)

- `/spso/dashboard` - Dashboard SPSO
- `/spso/profile` - Profile SPSO
- `/spso/printers` - Quản lý máy in
- `/spso/students` - Quản lý sinh viên
- `/spso/print-logs` - Xem log in ấn

---

## 🔍 Monitoring URLs

### Heroku Dashboard

- Backend: https://dashboard.heroku.com/apps/spss-be
- Frontend: https://dashboard.heroku.com/apps/spss-fe

### Logs

```powershell
# Backend logs
heroku logs --tail -a spss-be

# Frontend logs
heroku logs --tail -a spss-fe

# View last 1000 lines
heroku logs -n 1000 -a spss-be
```

### Metrics (if available)

- https://dashboard.heroku.com/apps/spss-be/metrics
- https://dashboard.heroku.com/apps/spss-fe/metrics

### Resources

- https://dashboard.heroku.com/apps/spss-be/resources
- https://dashboard.heroku.com/apps/spss-fe/resources

### Settings

- https://dashboard.heroku.com/apps/spss-be/settings
- https://dashboard.heroku.com/apps/spss-fe/settings

---

## 🔐 Environment Variables Management

```powershell
# View all config vars
heroku config -a spss-be
heroku config -a spss-fe

# Get specific var
heroku config:get MAIL_USERNAME -a spss-be

# Set var
heroku config:set KEY="VALUE" -a spss-be

# Unset var
heroku config:unset KEY -a spss-be
```

---

## 📝 Lưu URLs sau khi deploy

Sau khi deploy thành công, **LƯU LẠI** các URLs sau:

```
===========================================
HEROKU DEPLOYMENT URLS
===========================================

Backend URL: https://spss-be-[unique-id].herokuapp.com
Frontend URL: https://spss-fe-[unique-id].herokuapp.com

Backend Health: https://spss-be-[unique-id].herokuapp.com/actuator/health
Swagger UI: https://spss-be-[unique-id].herokuapp.com/swagger-ui.html

Student Login: https://spss-fe-[unique-id].herokuapp.com/login
SPSO Login: https://spss-fe-[unique-id].herokuapp.com/spso-login

===========================================
```

**Ghi chú**: Replace `[unique-id]` với ID thực tế từ Heroku sau khi deploy.

---

## 🎯 Quick Access Commands

```powershell
# Open backend in browser
heroku open -a spss-be

# Open frontend in browser
heroku open -a spss-fe

# View backend logs
heroku logs --tail -a spss-be

# View frontend logs
heroku logs --tail -a spss-fe

# Restart apps
heroku restart -a spss-be
heroku restart -a spss-fe
```

---

**Sau khi deploy xong, save file này với URLs thực tế để dễ tham khảo!**
