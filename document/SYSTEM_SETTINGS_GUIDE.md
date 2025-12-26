# Hướng dẫn Cài đặt Hệ thống cho SPSO

## Tổng quan

Module Cài đặt Hệ thống cho phép SPSO quản lý các cấu hình quan trọng của hệ thống in ấn, bao gồm:

1. **Cấu hình chung**: Số trang cấp phát, giá trang, kích thước file, định dạng file
2. **Quản lý học kỳ**: Tạo, sửa, xóa học kỳ và cấu hình cấp trang tự động
3. **Loại file cho phép**: Xem danh sách các định dạng file được phép upload

## 1. Cấu hình chung

### 1.1. Số trang cấp phát mặc định

- **Số trang A4 mặc định mỗi học kỳ**: Số trang A4 sinh viên nhận được đầu mỗi học kỳ
- **Số trang A3 mặc định mỗi học kỳ**: Số trang A3 sinh viên nhận được đầu mỗi học kỳ

**Ví dụ**: Đặt 100 trang A4 và 0 trang A3 cho mỗi học kỳ

### 1.2. Giới hạn file

- **Kích thước file tối đa (MB)**: Giới hạn dung lượng file upload (mặc định: 50MB)
- **Số trang tối đa mỗi lần in**: Giới hạn số trang có thể in trong một lệnh (mặc định: 100)

### 1.3. Giá trang in

- **Giá mỗi trang A4 (VND)**: Giá bán cho sinh viên khi mua thêm trang A4
- **Giá mỗi trang A3 (VND)**: Giá bán cho sinh viên khi mua thêm trang A3

**Lưu ý**: Giá này áp dụng khi sinh viên mua thêm trang qua hệ thống thanh toán

### 1.4. Định dạng file cho phép

Danh sách các phần mở rộng file được phép upload, phân cách bằng dấu phẩy

**Mặc định**: `pdf,doc,docx,ppt,pptx,xls,xlsx,txt`

### 1.5. Tùy chọn in

- **Cho phép in màu**: Bật/tắt chức năng in màu
- **Cho phép in 2 mặt**: Bật/tắt chức năng in 2 mặt
- **Tự động cấp trang đầu học kỳ**: Tự động cấp trang cho sinh viên khi bắt đầu học kỳ mới
- **Chế độ bảo trì hệ thống**: Tạm khóa hệ thống để bảo trì

## 2. Quản lý học kỳ

### 2.1. Tạo học kỳ mới

**Các trường bắt buộc**:

- Mã học kỳ (VD: HK1-2024, HK2-2024, HK3-2024)
- Tên học kỳ (VD: Học kỳ 1 năm 2024-2025)
- Năm học (VD: 2024-2025)
- Ngày bắt đầu
- Ngày kết thúc
- Số trang A4 cấp phát
- Số trang A3 cấp phát

**Các trường tùy chọn**:

- Ngày cấp trang tự động
- Đặt làm học kỳ hiện tại

### 2.2. Cập nhật học kỳ

Có thể cập nhật tất cả thông tin của học kỳ, trừ mã học kỳ

### 2.3. Đặt học kỳ hiện tại

Chỉ có 1 học kỳ được đánh dấu là "hiện tại" tại một thời điểm

### 2.4. Xóa học kỳ

- Không thể xóa học kỳ hiện tại
- Xóa là soft delete (đánh dấu IsActive = false)

## 3. Database Schema

### 3.1. Bảng Semesters

```sql
CREATE TABLE Semesters (
    SemesterID SERIAL PRIMARY KEY,
    SemesterCode VARCHAR(20) NOT NULL UNIQUE,
    SemesterName VARCHAR(100) NOT NULL,
    AcademicYear VARCHAR(20) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    DefaultA4Pages INT NOT NULL DEFAULT 100,
    DefaultA3Pages INT NOT NULL DEFAULT 0,
    PageAllocationDate DATE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    IsCurrent BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy VARCHAR(20),
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy VARCHAR(20)
);
```

### 3.2. Bảng SystemConfig

```sql
CREATE TABLE SystemConfig (
    ConfigKey VARCHAR(100) PRIMARY KEY,
    ConfigValue TEXT NOT NULL,
    Description VARCHAR(500),
    DataType VARCHAR(20) NOT NULL,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy VARCHAR(20)
);
```

## 4. API Endpoints

### 4.1. System Settings APIs

```
GET    /api/spso/settings                          - Lấy tất cả cấu hình
GET    /api/spso/settings/config/{configKey}       - Lấy một config
PUT    /api/spso/settings/config                   - Cập nhật một config
PUT    /api/spso/settings/configs                  - Cập nhật nhiều configs
```

### 4.2. Semester APIs

```
GET    /api/spso/settings/semesters                - Lấy tất cả học kỳ
GET    /api/spso/settings/semesters/current        - Lấy học kỳ hiện tại
POST   /api/spso/settings/semesters                - Tạo học kỳ mới
PUT    /api/spso/settings/semesters                - Cập nhật học kỳ
PUT    /api/spso/settings/semesters/{id}/set-current - Đặt học kỳ hiện tại
DELETE /api/spso/settings/semesters/{id}           - Xóa học kỳ
```

## 5. Frontend Routes

```
/spso/settings - Trang cài đặt hệ thống
  - Tab "Cấu hình chung"
  - Tab "Quản lý học kỳ"
  - Tab "Loại file cho phép"
```

## 6. Quy trình sử dụng

### 6.1. Thiết lập ban đầu

1. Truy cập `/spso/settings`
2. Vào tab "Cấu hình chung"
3. Cập nhật các thông số:
   - Số trang mặc định: 100 A4, 0 A3
   - Kích thước file tối đa: 50 MB
   - Số trang tối đa mỗi lần in: 100
   - Giá trang: 500 VND/A4, 1000 VND/A3
   - Định dạng file: pdf,doc,docx,ppt,pptx,xls,xlsx,txt
4. Bật/tắt các tùy chọn in
5. Nhấn "Lưu cấu hình"

### 6.2. Tạo học kỳ mới

1. Vào tab "Quản lý học kỳ"
2. Nhấn "+ Thêm học kỳ"
3. Điền thông tin:
   - Mã: HK1-2025
   - Tên: Học kỳ 1 năm 2024-2025
   - Năm học: 2024-2025
   - Ngày bắt đầu: 2025-01-01
   - Ngày kết thúc: 2025-05-31
   - Trang A4: 100
   - Trang A3: 0
   - Ngày cấp trang: 2025-01-01
   - ✓ Đặt làm học kỳ hiện tại
4. Nhấn "Lưu"

### 6.3. Cập nhật học kỳ

1. Trong danh sách học kỳ, nhấn "Sửa"
2. Cập nhật thông tin cần thiết
3. Nhấn "Lưu"

### 6.4. Đổi học kỳ hiện tại

1. Trong danh sách học kỳ, tìm học kỳ muốn đặt làm hiện tại
2. Nhấn "Đặt hiện tại"
3. Xác nhận

## 7. Lưu ý quan trọng

1. **Không thể xóa học kỳ hiện tại**: Phải đặt học kỳ khác làm hiện tại trước
2. **Mã học kỳ không thể thay đổi**: Sau khi tạo, mã học kỳ không thể sửa
3. **Chỉ có 1 học kỳ hiện tại**: Khi đặt học kỳ mới làm hiện tại, học kỳ cũ sẽ tự động bỏ đánh dấu
4. **Tự động cấp trang**: Nếu bật tính năng này, hệ thống sẽ tự động cấp trang cho sinh viên vào ngày bắt đầu học kỳ
5. **Giá trang**: Thay đổi giá trang sẽ áp dụng ngay lập tức cho các giao dịch mua trang mới

## 8. Troubleshooting

### Lỗi: "Mã học kỳ đã tồn tại"

- Kiểm tra lại mã học kỳ, đảm bảo không trùng với học kỳ đã có
- Sử dụng format: HK1-YYYY, HK2-YYYY, HK3-YYYY

### Lỗi: "Ngày kết thúc phải sau ngày bắt đầu"

- Kiểm tra lại ngày bắt đầu và ngày kết thúc
- Đảm bảo EndDate > StartDate

### Lỗi: "Không thể xóa học kỳ hiện tại"

- Đặt học kỳ khác làm hiện tại trước
- Sau đó mới có thể xóa học kỳ này

## 9. Migration

Để áp dụng các thay đổi database:

```bash
# Backend sẽ tự động chạy migration khi khởi động
# File migration: backend/src/main/resources/db/migration/V4__add_semesters_table.sql
```

## 10. Testing

### Test API với curl:

```bash
# Lấy tất cả cấu hình
curl -X GET http://localhost:8080/api/spso/settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Cập nhật config
curl -X PUT http://localhost:8080/api/spso/settings/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "configKey": "default_a4_pages_per_semester",
    "configValue": "150",
    "updatedBy": "SPSO001"
  }'

# Tạo học kỳ mới
curl -X POST http://localhost:8080/api/spso/settings/semesters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "semesterCode": "HK1-2025",
    "semesterName": "Học kỳ 1 năm 2024-2025",
    "academicYear": "2024-2025",
    "startDate": "2025-01-01",
    "endDate": "2025-05-31",
    "defaultA4Pages": 100,
    "defaultA3Pages": 0,
    "isCurrent": true,
    "createdBy": "SPSO001"
  }'
```

---

**Tác giả**: Development Team  
**Ngày tạo**: December 26, 2024  
**Version**: 1.0
