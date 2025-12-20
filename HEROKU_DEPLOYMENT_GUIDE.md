# 🚀 Hướng dẫn Deploy SSPS lên Heroku

## 📋 Tổng quan

Bạn có 2 Heroku apps:

- **spss-be**: Backend (Spring Boot/Java)
- **spss-fe**: Frontend (Next.js)

## 🔧 Yêu cầu chuẩn bị

### 1. Cài đặt Heroku CLI

```bash
# Download và cài đặt từ: https://devcenter.heroku.com/articles/heroku-cli
# Kiểm tra cài đặt
heroku --version
```

### 2. Đăng nhập Heroku

```bash
heroku login
```

### 3. Kết nối Git với Heroku apps

```bash
# Từ thư mục gốc dự án
cd c:\Dev\SSPS_AntiSocola

# Thêm remote cho backend
heroku git:remote -a spss-be -r heroku-backend

# Thêm remote cho frontend
heroku git:remote -a spss-fe -r heroku-frontend

# Kiểm tra remotes
git remote -v
```

---

## 🎯 PHẦN 1: Deploy Backend (spss-be)

### Bước 1: Tạo Procfile cho Backend

Tạo file `backend/Procfile`:

```
web: java -Dserver.port=$PORT $JAVA_OPTS -jar target/*.jar
```

### Bước 2: Tạo system.properties cho Backend

Tạo file `backend/system.properties`:

```
java.runtime.version=17
maven.version=3.9.5
```

### Bước 3: Cấu hình biến môi trường Backend

```bash
# Cấu hình Heroku để build từ subfolder backend
heroku config:set PROJECT_PATH=backend -a spss-be

# Cấu hình database (sử dụng database SQL Server hiện tại)
heroku config:set DATABASE_URL="jdbc:sqlserver://26.188.69.156:1433;databaseName=HCMSIU_SSPS;encrypt=true;trustServerCertificate=true" -a spss-be
heroku config:set DB_USERNAME="user_khach" -a spss-be
heroku config:set DB_PASSWORD="123456" -a spss-be

# Cấu hình JWT
heroku config:set JWT_SECRET="hcmiu-ssps-secret-key-for-jwt-token-generation-2024-minimum-256-bits" -a spss-be
heroku config:set JWT_ACCESS_EXPIRATION="900000" -a spss-be
heroku config:set JWT_REFRESH_EXPIRATION="604800000" -a spss-be

# Cấu hình Email (Gmail)
heroku config:set MAIL_HOST="smtp.gmail.com" -a spss-be
heroku config:set MAIL_PORT="587" -a spss-be
heroku config:set MAIL_USERNAME="your-email@gmail.com" -a spss-be
heroku config:set MAIL_PASSWORD="your-app-password" -a spss-be
heroku config:set MAIL_FROM_ADDRESS="no-reply@ssps.hcmiu.edu.vn" -a spss-be
heroku config:set MAIL_FROM_NAME="HCMIU SSPS System" -a spss-be

# Cấu hình OTP
heroku config:set OTP_LENGTH="6" -a spss-be
heroku config:set OTP_EXPIRATION_MINUTES="10" -a spss-be
heroku config:set OTP_MAX_ATTEMPTS="5" -a spss-be
heroku config:set OTP_RESEND_COOLDOWN_SECONDS="60" -a spss-be

# Cấu hình File Upload
heroku config:set FILE_UPLOAD_DIR="uploads" -a spss-be
heroku config:set MAX_FILE_SIZE="50MB" -a spss-be
```

### Bước 4: Cập nhật application.properties để dùng biến môi trường

File `backend/src/main/resources/application.properties` cần được cập nhật để đọc từ biến môi trường Heroku.

### Bước 5: Thêm heroku-maven-plugin vào pom.xml (nếu cần)

Đảm bảo `backend/pom.xml` có cấu hình build đúng:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

### Bước 6: Deploy Backend

#### Option A: Deploy từ Git subtree (Khuyến nghị)

```bash
# Từ thư mục gốc
git subtree push --prefix backend heroku-backend main

# Hoặc nếu có lỗi, force push:
git push heroku-backend `git subtree split --prefix backend main`:main --force
```

#### Option B: Sử dụng Heroku CLI với buildpack

```bash
# Cài buildpack cho monorepo
heroku buildpacks:clear -a spss-be
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a spss-be
heroku buildpacks:add heroku/java -a spss-be

# Deploy
git push heroku-backend main
```

### Bước 7: Kiểm tra logs Backend

```bash
heroku logs --tail -a spss-be
```

### Bước 8: Mở Backend App

```bash
heroku open -a spss-be
# URL: https://spss-be-*.herokuapp.com
```

---

## 🎨 PHẦN 2: Deploy Frontend (spss-fe)

### Bước 1: Tạo Procfile cho Frontend

Tạo file `frontend/Procfile`:

```
web: npm start
```

### Bước 2: Cập nhật package.json scripts

Đảm bảo `frontend/package.json` có:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint"
  }
}
```

### Bước 3: Cấu hình biến môi trường Frontend

```bash
# Cấu hình Heroku để build từ subfolder frontend
heroku config:set PROJECT_PATH=frontend -a spss-fe

# Cấu hình API URL (URL của backend)
heroku config:set NEXT_PUBLIC_API_URL="https://spss-be-*.herokuapp.com" -a spss-fe

# Cấu hình Node version
heroku config:set NODE_VERSION="20.x" -a spss-fe
```

### Bước 4: Tạo file .env.production trong frontend

Tạo `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
```

### Bước 5: Cập nhật next.config.js

File `frontend/next.config.js` cần cấu hình output standalone:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Tối ưu cho production
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
```

### Bước 6: Deploy Frontend

#### Option A: Deploy từ Git subtree (Khuyến nghị)

```bash
# Từ thư mục gốc
git subtree push --prefix frontend heroku-frontend main

# Hoặc force push:
git push heroku-frontend `git subtree split --prefix frontend main`:main --force
```

#### Option B: Sử dụng Heroku CLI với buildpack

```bash
# Cài buildpack cho monorepo
heroku buildpacks:clear -a spss-fe
heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack -a spss-fe
heroku buildpacks:add heroku/nodejs -a spss-fe

# Deploy
git push heroku-frontend main
```

### Bước 7: Kiểm tra logs Frontend

```bash
heroku logs --tail -a spss-fe
```

### Bước 8: Mở Frontend App

```bash
heroku open -a spss-fe
# URL: https://spss-fe-*.herokuapp.com
```

---

## 🔄 Quy trình Deploy thường xuyên

### Deploy Backend

```bash
# Commit changes
git add backend/
git commit -m "Update backend"

# Push to GitHub
git push origin feat/deploy

# Deploy to Heroku
git subtree push --prefix backend heroku-backend main
```

### Deploy Frontend

```bash
# Commit changes
git add frontend/
git commit -m "Update frontend"

# Push to GitHub
git push origin feat/deploy

# Deploy to Heroku
git subtree push --prefix frontend heroku-frontend main
```

### Deploy cả 2 cùng lúc

```bash
# Commit all changes
git add .
git commit -m "Update both backend and frontend"

# Push to GitHub
git push origin feat/deploy

# Deploy backend
git subtree push --prefix backend heroku-backend main

# Deploy frontend
git subtree push --prefix frontend heroku-frontend main
```

---

## 🛠️ Troubleshooting

### Lỗi: subtree không hoạt động

```bash
# Sử dụng cách này thay thế
git push heroku-backend `git subtree split --prefix backend HEAD`:main --force
git push heroku-frontend `git subtree split --prefix frontend HEAD`:main --force
```

### Lỗi: Build failed

```bash
# Xem logs chi tiết
heroku logs --tail -a spss-be
heroku logs --tail -a spss-fe

# Restart app
heroku restart -a spss-be
heroku restart -a spss-fe
```

### Lỗi: Database connection

```bash
# Kiểm tra config
heroku config -a spss-be

# Test database từ local
# Đảm bảo SQL Server cho phép kết nối từ Heroku IPs
```

### Lỗi: CORS

Cập nhật Backend để cho phép Frontend domain:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("https://spss-fe-*.herokuapp.com")
                    .allowedMethods("*");
            }
        };
    }
}
```

---

## 📊 Monitoring & Maintenance

### Xem logs realtime

```bash
heroku logs --tail -a spss-be
heroku logs --tail -a spss-fe
```

### Kiểm tra trạng thái

```bash
heroku ps -a spss-be
heroku ps -a spss-fe
```

### Restart apps

```bash
heroku restart -a spss-be
heroku restart -a spss-fe
```

### Scale dynos (nếu cần)

```bash
# Scale up
heroku ps:scale web=2 -a spss-be

# Scale down
heroku ps:scale web=1 -a spss-be
```

---

## 🎯 Checklist trước khi Deploy

### Backend

- [x] Tạo Procfile
- [x] Tạo system.properties
- [x] Cấu hình biến môi trường
- [x] Cập nhật application.properties
- [x] Test build local: `mvn clean package`
- [x] Kiểm tra database connection

### Frontend

- [x] Tạo Procfile
- [x] Cập nhật package.json start script
- [x] Cấu hình biến môi trường
- [x] Cập nhật next.config.js
- [x] Test build local: `npm run build`
- [x] Test start local: `npm start`

### Sau khi Deploy

- [x] Kiểm tra Backend health: `https://spss-be-*.herokuapp.com/actuator/health`
- [x] Kiểm tra Frontend load: `https://spss-fe-*.herokuapp.com`
- [x] Test API calls từ Frontend
- [x] Kiểm tra logs cho errors
- [x] Test các chức năng chính

---

## 📞 Lưu ý quan trọng

1. **Database External**: Bạn đang dùng SQL Server external (26.188.69.156). Đảm bảo:

   - Firewall cho phép Heroku IPs kết nối
   - Database server luôn running
   - Credentials đúng

2. **Email**: Cần setup Gmail App Password để gửi OTP

3. **File Uploads**: Heroku filesystem là ephemeral. Nên dùng:

   - AWS S3
   - Cloudinary
   - Azure Blob Storage

4. **Environment Variables**: Không commit sensitive data vào Git, luôn dùng Heroku Config Vars

5. **Free Dyno**: Heroku free tier có giới hạn:
   - Sleep sau 30 phút không hoạt động
   - 550 hours/month
   - Cân nhắc upgrade nếu cần production

---

## 🚀 Quick Start Commands

```bash
# Setup
heroku login
heroku git:remote -a spss-be -r heroku-backend
heroku git:remote -a spss-fe -r heroku-frontend

# Deploy Backend
git subtree push --prefix backend heroku-backend main

# Deploy Frontend
git subtree push --prefix frontend heroku-frontend main

# Monitor
heroku logs --tail -a spss-be
heroku logs --tail -a spss-fe
```

---

**Good luck với deployment! 🎉**
