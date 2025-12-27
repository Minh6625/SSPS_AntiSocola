# Hướng Dẫn Chế Độ Bảo Trì Hệ Thống

## Tổng Quan

Chế độ bảo trì cho phép SPSO tạm thời chặn tất cả sinh viên truy cập hệ thống khi cần bảo trì hoặc nâng cấp. SPSO và Admin vẫn có thể truy cập bình thường.

## Cách Bật/Tắt Chế Độ Bảo Trì

### Từ Giao Diện SPSO

1. Đăng nhập với tài khoản SPSO
2. Vào **Cài Đặt Hệ Thống** (`/spso/settings`)
3. Tìm mục **"Chế độ bảo trì hệ thống"**
4. Tick checkbox để bật, bỏ tick để tắt
5. Click **"Lưu Cấu Hình"**

### Từ Database (Khẩn cấp)

Nếu cần bật/tắt trực tiếp từ database:

```sql
-- Bật chế độ bảo trì
UPDATE "SystemConfig"
SET "ConfigValue" = 'true'
WHERE "ConfigKey" = 'system_maintenance_mode';

-- Tắt chế độ bảo trì
UPDATE "SystemConfig"
SET "ConfigValue" = 'false'
WHERE "ConfigKey" = 'system_maintenance_mode';
```

## Cách Hoạt Động

### Backend (Java Spring Boot)

**MaintenanceInterceptor** (`backend/src/main/java/com/example/app/interceptor/MaintenanceInterceptor.java`):

- Chặn tất cả request từ Student khi `system_maintenance_mode = true`
- Trả về HTTP 503 (Service Unavailable) với message JSON
- SPSO và Admin vẫn có thể truy cập (bypass interceptor)

**WebConfig** (`backend/src/main/java/com/example/app/config/WebConfig.java`):

- Đăng ký interceptor cho tất cả `/api/**`
- Exclude các endpoint: `/api/auth/**`, `/api/spso/**`, `/api/admin/**`

### Frontend (Next.js + React)

**MaintenanceCheck Component** (`frontend/src/components/MaintenanceCheck.tsx`):

- Interceptor axios bắt lỗi 503
- Hiển thị modal thông báo bảo trì
- Nút "Đăng Xuất" để student thoát khỏi hệ thống

**StudentLayout** (`frontend/src/components/StudentLayout.tsx`):

- Tích hợp `<MaintenanceCheck />` component
- Tự động hiển thị modal khi nhận response 503

## Kịch Bản Sử Dụng

### 1. Bảo Trì Định Kỳ

```
1. SPSO thông báo trước cho sinh viên về thời gian bảo trì
2. Đến giờ bảo trì, SPSO bật chế độ bảo trì
3. Sinh viên đang online sẽ thấy modal bảo trì ngay lập tức
4. Sinh viên mới login sẽ bị chặn tại các API endpoint
5. SPSO thực hiện bảo trì (update database, deploy code, etc.)
6. Sau khi xong, SPSO tắt chế độ bảo trì
7. Sinh viên có thể sử dụng lại bình thường
```

### 2. Khẩn Cấp (Emergency)

```
1. Phát hiện lỗi nghiêm trọng trong hệ thống
2. SPSO bật chế độ bảo trì ngay lập tức
3. Tất cả sinh viên bị chặn
4. SPSO fix lỗi
5. Test kỹ trước khi tắt chế độ bảo trì
6. Tắt chế độ bảo trì khi đã ổn định
```

## Kiểm Tra Tính Năng

### Test Case 1: Bật Chế Độ Bảo Trì

1. Login với tài khoản Student
2. Sử dụng hệ thống bình thường
3. SPSO bật chế độ bảo trì
4. Student thực hiện bất kỳ action nào (upload, print, etc.)
5. **Kết quả mong đợi**: Modal bảo trì hiển thị, không thể thực hiện action

### Test Case 2: SPSO Vẫn Truy Cập Được

1. SPSO bật chế độ bảo trì
2. Login với tài khoản SPSO
3. Thực hiện các thao tác quản lý
4. **Kết quả mong đợi**: SPSO vẫn sử dụng được tất cả tính năng

### Test Case 3: Tắt Chế Độ Bảo Trì

1. SPSO tắt chế độ bảo trì
2. Student login lại
3. Thực hiện các action
4. **Kết quả mong đợi**: Hệ thống hoạt động bình thường

## Lưu Ý Quan Trọng

⚠️ **Cảnh báo**:

- Chỉ bật chế độ bảo trì khi thực sự cần thiết
- Thông báo trước cho sinh viên về thời gian bảo trì
- Kiểm tra kỹ trước khi tắt chế độ bảo trì
- SPSO nên test trên môi trường staging trước

✅ **Best Practices**:

- Bảo trì vào giờ ít người dùng (đêm khuya, cuối tuần)
- Có kế hoạch rollback nếu có vấn đề
- Monitor logs trong quá trình bảo trì
- Thông báo khi hoàn thành bảo trì

## Troubleshooting

### Vấn đề: Student vẫn truy cập được khi bật maintenance mode

**Nguyên nhân**:

- Cache browser
- Token JWT cũ chưa expire
- Interceptor chưa được load

**Giải pháp**:

1. Clear cache browser
2. Hard refresh (Ctrl + Shift + R)
3. Logout và login lại
4. Kiểm tra database: `SELECT * FROM "SystemConfig" WHERE "ConfigKey" = 'system_maintenance_mode'`

### Vấn đề: SPSO cũng bị chặn

**Nguyên nhân**:

- Interceptor config sai
- Role không đúng

**Giải pháp**:

1. Kiểm tra `WebConfig.java` - excludePathPatterns phải có `/api/spso/**`
2. Kiểm tra JWT token có role `ROLE_SPSO` không
3. Tắt maintenance mode từ database nếu cần

## Code Reference

### Backend Files

- `backend/src/main/java/com/example/app/interceptor/MaintenanceInterceptor.java`
- `backend/src/main/java/com/example/app/config/WebConfig.java`

### Frontend Files

- `frontend/src/components/MaintenanceCheck.tsx`
- `frontend/src/components/StudentLayout.tsx`
- `frontend/src/app/spso/settings/page.tsx`

### Database

- Table: `SystemConfig`
- Key: `system_maintenance_mode`
- Value: `"true"` hoặc `"false"`
