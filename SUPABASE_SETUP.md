# Hướng dẫn cấu hình Supabase Storage

## 1. Tạo Project Supabase

1. Truy cập [https://supabase.com](https://supabase.com)
2. Đăng ký/Đăng nhập tài khoản
3. Tạo project mới
4. Chờ project khởi tạo xong

## 2. Tạo Storage Bucket

1. Vào **Storage** trong sidebar
2. Click **New bucket**
3. Điền thông tin:
   - **Name**: `documents` (hoặc tên bạn muốn)
   - **Public bucket**: ✅ Chọn để có thể truy cập file công khai
   - **File size limit**: 50MB (hoặc tùy chọn)
4. Click **Create bucket**

## 3. Lấy thông tin kết nối

1. Vào **Settings** > **API**
2. Copy các thông tin sau:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (API Key công khai)

## 4. Cấu hình Backend

Thêm các dòng sau vào file `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET_NAME=documents
```

**Thay thế:**

- `SUPABASE_URL`: URL project của bạn
- `SUPABASE_KEY`: anon/public key của bạn
- `SUPABASE_BUCKET_NAME`: Tên bucket vừa tạo (mặc định: `documents`)

## 5. Nội dung file .env đầy đủ

File `backend/.env` sau khi thêm Supabase:

```env
# Database Configuration
DB_HOST=26.188.69.156
DB_PORT=1433
DB_NAME=HCMSIU_SSPS
DB_USERNAME=user_khach
DB_PASSWORD=123456

# Server Configuration
SERVER_PORT=8080

# Application Configuration
APP_NAME=layered-architecture-backend

# JWT Configuration
JWT_SECRET=hcmiu-ssps-secret-key-for-jwt-token-generation-2024-minimum-256-bits
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Email Configuration (OTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tranvanminhk16@siu.edu.vn
MAIL_PASSWORD=ouygotxdgdxsilvy
MAIL_FROM_ADDRESS=tranvanminhk16@siu.edu.vn
MAIL_FROM_NAME=HCMIU SSPS System

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRATION_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET_NAME=documents
```

## 6. Cấu hình Bucket Policy (Nếu cần)

Nếu muốn kiểm soát quyền truy cập chi tiết hơn:

1. Vào **Storage** > Click vào bucket `documents`
2. Click tab **Policies**
3. Tạo policy cho:
   - **INSERT**: Cho phép upload file
   - **SELECT**: Cho phép đọc file
   - **DELETE**: Cho phép xóa file

Ví dụ policy cho phép tất cả:

```sql
-- Policy: Allow public upload
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow public download
CREATE POLICY "Allow public download"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Policy: Allow public delete
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'documents');
```

## 7. Test Upload

1. Khởi động lại backend:

   ```powershell
   cd backend
   mvn spring-boot:run
   ```

2. Upload file qua API:

   - Endpoint: `POST /api/documents/upload`
   - Header: `Authorization: Bearer <token>`
   - Body: `multipart/form-data` với field `file`

3. Kiểm tra file đã upload:
   - Vào **Storage** > bucket `documents`
   - Xem danh sách file đã upload

## 8. Lưu ý

- ✅ File sẽ được lưu trên Supabase Storage thay vì local
- ✅ URL file có dạng: `https://xxxxx.supabase.co/storage/v1/object/public/documents/abc-123.pdf`
- ✅ File có thể truy cập công khai (nếu bucket là public)
- ⚠️ **Không commit** file `.env` lên Git
- ⚠️ Giới hạn dung lượng free tier: 1GB storage (có thể upgrade)

## 9. Troubleshooting

### Lỗi "Invalid API Key"

- Kiểm tra lại `SUPABASE_KEY` trong file `.env`
- Đảm bảo sử dụng **anon/public key**, không phải service_role key

### Lỗi "Bucket not found"

- Kiểm tra tên bucket trong `SUPABASE_BUCKET_NAME`
- Đảm bảo bucket đã được tạo trong Supabase dashboard

### Lỗi "Upload failed"

- Kiểm tra kết nối internet
- Kiểm tra policy của bucket (phải cho phép INSERT)
- Kiểm tra file size limit của bucket

### Không thể download file

- Kiểm tra bucket có phải public không
- Kiểm tra policy SELECT đã được tạo chưa

## 10. Chuyển đổi từ Local sang Supabase

Các thay đổi đã thực hiện:

1. ✅ Thêm `SupabaseStorageService` thay thế `FileStorageService`
2. ✅ Cập nhật `DocumentService` để upload lên Supabase
3. ✅ Lưu URL Supabase trong database thay vì đường dẫn local
4. ✅ Download file từ Supabase thay vì đọc từ disk
5. ✅ Detect page count từ byte array thay vì file path

**Không cần thay đổi gì ở Frontend** - API endpoints vẫn giữ nguyên!
