# Environment Files Setup Guide

## Backend (.env)

Tạo file `backend/.env` với nội dung:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_NAME=ten_database_cua_ban
DB_USERNAME=sa
DB_PASSWORD=mat_khau_cua_ban

# Server Configuration
SERVER_PORT=8080

# Application Configuration
APP_NAME=layered-architecture-backend
```

## Frontend (.env.local)

File `frontend/.env.local` đã được tạo sẵn:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Hướng dẫn sử dụng

### 1. Cấu hình Backend Database

Mở file `backend/.env` và thay đổi:

- `DB_NAME`: Tên database SQL Server của bạn
- `DB_USERNAME`: Username SQL Server (thường là `sa`)
- `DB_PASSWORD`: Password SQL Server

### 2. Chạy Backend

```powershell
cd backend
mvn spring-boot:run
```

Backend sẽ chạy tại: http://localhost:8080

### 3. Chạy Frontend

Mở terminal mới:

```powershell
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## Lưu ý

- File `.env` và `.env.local` chứa thông tin nhạy cảm, **KHÔNG nên commit lên Git**
- File `.env.example` và `.env.local.example` là mẫu, có thể commit lên Git
- Đảm bảo SQL Server đang chạy trước khi start Backend
