# Hướng dẫn Update Database với Semesters

## Tổng quan

Đã cập nhật database schema và seed data để thêm:

- **Bảng Semesters**: Quản lý học kỳ
- **SystemConfig mới**: Các cấu hình cho SPSO Settings

## Files đã cập nhật

### 1. Schema File

✅ `script/database/database_schema_postgres.sql`

- Thêm bảng **Semesters** (Bảng 28)
- Các trường: SemesterID, SemesterCode, SemesterName, AcademicYear, StartDate, EndDate, DefaultA4Pages, DefaultA3Pages, PageAllocationDate, IsActive, IsCurrent

### 2. Seed Data File

✅ `script/database/database_seed_data_postgres.sql`

- Cập nhật SystemConfig với các key mới (snake_case):
  - `default_a4_pages_per_semester`
  - `default_a3_pages_per_semester`
  - `max_file_size_mb`
  - `max_pages_per_job`
  - `page_allocation_day`
  - `allowed_file_extensions`
  - `enable_color_printing`
  - `enable_duplex_printing`
  - `a4_price_per_page`
  - `a3_price_per_page`
  - `system_maintenance_mode`
  - `auto_allocate_pages`
- Thêm 3 học kỳ mẫu:
  - HK1-2024 (Học kỳ 1 năm 2024-2025)
  - HK2-2024 (Học kỳ 2 năm 2024-2025) - **Current**
  - HK3-2024 (Học kỳ hè năm 2024-2025)

## Cách Update Database

### Option 1: Drop và Recreate (Khuyến nghị cho development)

```bash
# 1. Drop database
psql -U postgres -f script/database/drop_database_postgres.sql

# 2. Create schema
psql -U postgres -f script/database/database_schema_postgres.sql

# 3. Seed data
psql -U postgres -f script/database/database_seed_data_postgres.sql
```

### Option 2: Migration Only (Nếu muốn giữ dữ liệu hiện tại)

```sql
-- Chạy trong pgAdmin hoặc psql

-- 1. Tạo bảng Semesters
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
    UpdatedBy VARCHAR(20),

    CONSTRAINT CK_Semester_Dates CHECK (EndDate > StartDate),
    CONSTRAINT CK_Semester_Pages CHECK (DefaultA4Pages >= 0 AND DefaultA3Pages >= 0),

    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

CREATE INDEX IX_Semester_Code ON Semesters(SemesterCode);
CREATE INDEX IX_Semester_Active ON Semesters(IsActive, IsCurrent);
CREATE INDEX IX_Semester_Dates ON Semesters(StartDate, EndDate);

-- 2. Insert SystemConfig mới
INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description, DataType, UpdatedBy)
VALUES
('default_a4_pages_per_semester', '100', 'Số trang A4 mặc định cấp phát mỗi học kỳ', 'Integer', 'ADMIN_TEST'),
('default_a3_pages_per_semester', '0', 'Số trang A3 mặc định cấp phát mỗi học kỳ', 'Integer', 'ADMIN_TEST'),
('max_file_size_mb', '50', 'Kích thước file tối đa cho phép upload (MB)', 'Integer', 'ADMIN_TEST'),
('max_pages_per_job', '100', 'Số trang tối đa cho phép in mỗi lần', 'Integer', 'ADMIN_TEST'),
('page_allocation_day', '1', 'Ngày trong tháng tự động cấp trang (1-31)', 'Integer', 'ADMIN_TEST'),
('allowed_file_extensions', 'pdf,doc,docx,ppt,pptx,xls,xlsx,txt', 'Các định dạng file được phép upload', 'String', 'ADMIN_TEST'),
('enable_color_printing', 'false', 'Cho phép in màu', 'Boolean', 'ADMIN_TEST'),
('enable_duplex_printing', 'true', 'Cho phép in 2 mặt', 'Boolean', 'ADMIN_TEST'),
('a4_price_per_page', '500', 'Giá mỗi trang A4 (VND)', 'Decimal', 'ADMIN_TEST'),
('a3_price_per_page', '1000', 'Giá mỗi trang A3 (VND)', 'Decimal', 'ADMIN_TEST'),
('system_maintenance_mode', 'false', 'Chế độ bảo trì hệ thống', 'Boolean', 'ADMIN_TEST'),
('auto_allocate_pages', 'true', 'Tự động cấp trang đầu học kỳ', 'Boolean', 'ADMIN_TEST')
ON CONFLICT (ConfigKey) DO NOTHING;

-- 3. Insert Semesters mẫu
INSERT INTO Semesters (SemesterCode, SemesterName, AcademicYear, StartDate, EndDate, DefaultA4Pages, DefaultA3Pages, PageAllocationDate, IsActive, IsCurrent, CreatedAt, CreatedBy)
VALUES
('HK1-2024', 'Học kỳ 1 năm 2024-2025', '2024-2025', '2024-09-01', '2024-12-31', 100, 0, '2024-09-01', TRUE, FALSE, CURRENT_TIMESTAMP, 'ADMIN_TEST'),
('HK2-2024', 'Học kỳ 2 năm 2024-2025', '2024-2025', '2025-01-01', '2025-05-31', 100, 0, '2025-01-01', TRUE, TRUE, CURRENT_TIMESTAMP, 'ADMIN_TEST'),
('HK3-2024', 'Học kỳ hè năm 2024-2025', '2024-2025', '2025-06-01', '2025-08-31', 50, 0, '2025-06-01', TRUE, FALSE, CURRENT_TIMESTAMP, 'ADMIN_TEST')
ON CONFLICT (SemesterCode) DO NOTHING;
```

## Kiểm tra sau khi update

```sql
-- Kiểm tra bảng Semesters
SELECT * FROM Semesters ORDER BY StartDate;

-- Kiểm tra SystemConfig mới
SELECT * FROM SystemConfig WHERE ConfigKey LIKE '%page%' OR ConfigKey LIKE '%file%';

-- Kiểm tra học kỳ hiện tại
SELECT * FROM Semesters WHERE IsCurrent = TRUE;

-- Đếm tổng số bảng
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Kết quả mong đợi: 28 bảng
```

## Lưu ý quan trọng

1. **Backup trước khi update**: Luôn backup database trước khi chạy migration
2. **Kiểm tra Foreign Keys**: Đảm bảo Users table có dữ liệu trước khi insert Semesters
3. **IsCurrent**: Chỉ có 1 học kỳ có IsCurrent = TRUE
4. **ConfigKey naming**: Sử dụng snake_case (vd: `default_a4_pages_per_semester`)

## Troubleshooting

### Lỗi: Foreign key constraint fails

```sql
-- Kiểm tra user ADMIN_TEST có tồn tại không
SELECT * FROM Users WHERE UserID = 'ADMIN_TEST';

-- Nếu không có, tạo user trước
INSERT INTO Users (UserID, Email, PasswordHash, FullName, UserType, Status)
VALUES ('ADMIN_TEST', 'admin.test@edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde',
        'Admin Test', 'Admin', 'Active');
```

### Lỗi: Duplicate key value violates unique constraint

```sql
-- Xóa dữ liệu cũ nếu cần
DELETE FROM Semesters WHERE SemesterCode IN ('HK1-2024', 'HK2-2024', 'HK3-2024');
DELETE FROM SystemConfig WHERE ConfigKey LIKE 'default_%' OR ConfigKey LIKE 'max_%';
```

---

**Date**: December 26, 2024  
**Version**: 1.0
