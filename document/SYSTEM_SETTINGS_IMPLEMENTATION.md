# Triển khai Cài đặt Hệ thống cho SPSO

## Tổng quan

Đã triển khai đầy đủ module **Cài đặt Hệ thống** cho SPSO với các tính năng:

✅ **Cấu hình chung**:

- Số trang A4/A3 cấp phát mặc định mỗi học kỳ
- Kích thước file tối đa (MB)
- Số trang tối đa mỗi lần in
- Giá trang A4/A3 (VND)
- Định dạng file cho phép
- Tùy chọn in màu, in 2 mặt
- Tự động cấp trang đầu học kỳ
- Chế độ bảo trì hệ thống

✅ **Quản lý học kỳ**:

- Tạo học kỳ mới với đầy đủ thông tin
- Cập nhật thông tin học kỳ
- Đặt học kỳ hiện tại
- Xóa học kỳ (soft delete)
- Cấu hình số trang cấp phát cho từng học kỳ
- Ngày cấp trang tự động

✅ **Loại file cho phép**:

- Xem danh sách file types
- Hiển thị MIME type và kích thước tối đa

## Files đã tạo

### Backend

#### 1. Database Migration

```
backend/src/main/resources/db/migration/V4__add_semesters_table.sql
```

- Tạo bảng Semesters
- Insert default system configs
- Insert sample semesters

#### 2. Entities

```
backend/src/main/java/com/example/app/entity/Semester.java
backend/src/main/java/com/example/app/entity/SystemConfig.java (đã có)
```

#### 3. Repositories

```
backend/src/main/java/com/example/app/repository/SemesterRepository.java
backend/src/main/java/com/example/app/repository/SystemConfigRepository.java
```

#### 4. DTOs

```
backend/src/main/java/com/example/app/dto/SystemSettingsResponseDTO.java
backend/src/main/java/com/example/app/dto/SystemConfigDTO.java
backend/src/main/java/com/example/app/dto/SemesterDTO.java
backend/src/main/java/com/example/app/dto/AllowedFileTypeDTO.java
backend/src/main/java/com/example/app/dto/CreateSemesterRequestDTO.java
backend/src/main/java/com/example/app/dto/UpdateSemesterRequestDTO.java
backend/src/main/java/com/example/app/dto/UpdateSystemConfigRequestDTO.java
```

#### 5. Service

```
backend/src/main/java/com/example/app/service/interfaces/ISystemSettingsService.java
backend/src/main/java/com/example/app/service/impl/SystemSettingsServiceImpl.java
```

#### 6. Controller

```
backend/src/main/java/com/example/app/controller/SystemSettingsController.java
```

### Frontend

#### 1. Service

```
frontend/src/services/systemSettingsService.ts
```

#### 2. UI Page

```
frontend/src/app/spso/settings/page.tsx
```

- Tab "Cấu hình chung"
- Tab "Quản lý học kỳ"
- Tab "Loại file cho phép"
- Modal tạo/sửa học kỳ

### Documentation

```
document/SYSTEM_SETTINGS_GUIDE.md
document/SYSTEM_SETTINGS_IMPLEMENTATION.md (file này)
```

## Cấu trúc Database

### Bảng Semesters

| Column             | Type         | Description            |
| ------------------ | ------------ | ---------------------- |
| SemesterID         | SERIAL       | Primary key            |
| SemesterCode       | VARCHAR(20)  | Mã học kỳ (unique)     |
| SemesterName       | VARCHAR(100) | Tên học kỳ             |
| AcademicYear       | VARCHAR(20)  | Năm học                |
| StartDate          | DATE         | Ngày bắt đầu           |
| EndDate            | DATE         | Ngày kết thúc          |
| DefaultA4Pages     | INT          | Số trang A4 cấp phát   |
| DefaultA3Pages     | INT          | Số trang A3 cấp phát   |
| PageAllocationDate | DATE         | Ngày cấp trang tự động |
| IsActive           | BOOLEAN      | Trạng thái active      |
| IsCurrent          | BOOLEAN      | Học kỳ hiện tại        |
| CreatedAt          | TIMESTAMP    | Ngày tạo               |
| CreatedBy          | VARCHAR(20)  | Người tạo              |
| UpdatedAt          | TIMESTAMP    | Ngày cập nhật          |
| UpdatedBy          | VARCHAR(20)  | Người cập nhật         |

### System Configs đã thêm

| ConfigKey                     | ConfigValue      | DataType | Description                |
| ----------------------------- | ---------------- | -------- | -------------------------- |
| default_a4_pages_per_semester | 100              | Integer  | Số trang A4 mặc định       |
| default_a3_pages_per_semester | 0                | Integer  | Số trang A3 mặc định       |
| max_file_size_mb              | 50               | Integer  | Kích thước file tối đa     |
| max_pages_per_job             | 100              | Integer  | Số trang tối đa mỗi lần in |
| page_allocation_day           | 1                | Integer  | Ngày cấp trang trong tháng |
| allowed_file_extensions       | pdf,doc,docx,... | String   | Định dạng file cho phép    |
| enable_color_printing         | false            | Boolean  | Cho phép in màu            |
| enable_duplex_printing        | true             | Boolean  | Cho phép in 2 mặt          |
| a4_price_per_page             | 500              | Decimal  | Giá trang A4               |
| a3_price_per_page             | 1000             | Decimal  | Giá trang A3               |
| system_maintenance_mode       | false            | Boolean  | Chế độ bảo trì             |
| auto_allocate_pages           | true             | Boolean  | Tự động cấp trang          |

## API Endpoints

### System Settings

```
GET    /api/spso/settings
GET    /api/spso/settings/config/{configKey}
PUT    /api/spso/settings/config
PUT    /api/spso/settings/configs
```

### Semesters

```
GET    /api/spso/settings/semesters
GET    /api/spso/settings/semesters/current
POST   /api/spso/settings/semesters
PUT    /api/spso/settings/semesters
PUT    /api/spso/settings/semesters/{id}/set-current
DELETE /api/spso/settings/semesters/{id}
```

## Hướng dẫn chạy

### 1. Chạy Migration

Migration sẽ tự động chạy khi khởi động backend (Flyway):

```bash
cd backend
mvn spring-boot:run
```

### 2. Kiểm tra Database

```sql
-- Kiểm tra bảng Semesters
SELECT * FROM Semesters;

-- Kiểm tra SystemConfig
SELECT * FROM SystemConfig WHERE ConfigKey LIKE '%page%';
```

### 3. Test API

```bash
# Lấy tất cả settings
curl http://localhost:8080/api/spso/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Truy cập Frontend

```
http://localhost:3000/spso/settings
```

## Tính năng chính

### 1. Cấu hình chung

SPSO có thể cập nhật:

- Số trang cấp phát mặc định (A4, A3)
- Giới hạn file (size, số trang)
- Giá trang (A4, A3)
- Định dạng file cho phép
- Các tùy chọn in (màu, 2 mặt)
- Tự động cấp trang
- Chế độ bảo trì

### 2. Quản lý học kỳ

SPSO có thể:

- Xem danh sách tất cả học kỳ
- Tạo học kỳ mới
- Cập nhật thông tin học kỳ
- Đặt học kỳ hiện tại
- Xóa học kỳ (không thể xóa học kỳ hiện tại)

### 3. Loại file cho phép

SPSO có thể:

- Xem danh sách file types
- Xem MIME type và kích thước tối đa

## Validation Rules

### Semester

- Mã học kỳ: Bắt buộc, unique, không thể thay đổi sau khi tạo
- Tên học kỳ: Bắt buộc
- Năm học: Bắt buộc
- Ngày bắt đầu: Bắt buộc
- Ngày kết thúc: Bắt buộc, phải sau ngày bắt đầu
- Số trang A4: Bắt buộc, >= 0
- Số trang A3: Bắt buộc, >= 0
- Chỉ có 1 học kỳ IsCurrent = true
- Không thể xóa học kỳ hiện tại

### SystemConfig

- ConfigKey: Bắt buộc, unique
- ConfigValue: Bắt buộc
- DataType: String, Integer, Decimal, Boolean, JSON

## Security

- Tất cả endpoints yêu cầu role SPSO: `@PreAuthorize("hasRole('SPSO')")`
- Tracking: Lưu UpdatedBy, CreatedBy cho audit trail

## Next Steps

1. ✅ Tạo migration và entities
2. ✅ Tạo repositories và services
3. ✅ Tạo controllers và APIs
4. ✅ Tạo frontend UI
5. ⏳ Test end-to-end
6. ⏳ Tích hợp với tính năng tự động cấp trang
7. ⏳ Tích hợp với payment system (giá trang)
8. ⏳ Thêm audit log cho các thay đổi cấu hình

## Tích hợp tương lai

### 1. Tự động cấp trang

Khi bắt đầu học kỳ mới (hoặc vào PageAllocationDate):

- Lấy DefaultA4Pages, DefaultA3Pages từ Semester hiện tại
- Cấp trang cho tất cả sinh viên active
- Ghi log vào PageTransactions

### 2. Payment Integration

Khi sinh viên mua trang:

- Lấy giá từ SystemConfig (a4_price_per_page, a3_price_per_page)
- Tính tổng tiền
- Tạo payment transaction

### 3. File Upload Validation

Khi sinh viên upload file:

- Kiểm tra extension trong allowed_file_extensions
- Kiểm tra size <= max_file_size_mb
- Reject nếu không hợp lệ

### 4. Print Job Validation

Khi tạo print job:

- Kiểm tra số trang <= max_pages_per_job
- Kiểm tra enable_color_printing nếu chọn in màu
- Kiểm tra enable_duplex_printing nếu chọn in 2 mặt

## Troubleshooting

### Migration không chạy

```bash
# Kiểm tra Flyway schema history
SELECT * FROM flyway_schema_history;

# Nếu cần chạy lại migration
mvn flyway:clean flyway:migrate
```

### API trả về 403 Forbidden

- Kiểm tra JWT token
- Kiểm tra role SPSO trong token
- Kiểm tra @PreAuthorize annotation

### Frontend không load được settings

- Kiểm tra CORS configuration
- Kiểm tra API endpoint
- Kiểm tra console log

---

**Status**: ✅ Hoàn thành  
**Date**: December 26, 2024  
**Version**: 1.0
