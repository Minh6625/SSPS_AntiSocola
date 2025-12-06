# HCMSIU_SSPS - Database Documentation

## Hệ thống quản lý in ấn thông minh cho sinh viên

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Sơ đồ quan hệ (ERD)](#sơ-đồ-quan-hệ-erd)
3. [Chi tiết các bảng](#chi-tiết-các-bảng)
4. [Các View và Stored Procedure](#các-view-và-stored-procedure)
5. [Quy tắc nghiệp vụ](#quy-tắc-nghiệp-vụ)
6. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)

---

## 🎯 TỔNG QUAN HỆ THỐNG

### Mục đích

Database được thiết kế để hỗ trợ hệ thống HCMSIU_SSPS - một ứng dụng web và mobile cho phép sinh viên in tài liệu tại các máy in trong khuôn viên trường đại học.

### Các tác nhân chính

- **Sinh viên (Student)**: In tài liệu, xem lịch sử, mua thêm trang
- **Nhân viên SPSO (Officer)**: Quản lý máy in, cấu hình hệ thống, xem báo cáo

### Tính năng chính

1. ✅ Quản lý người dùng và phân quyền
2. ✅ Quản lý số dư trang in (A4, A3) với quy đổi tự động
3. ✅ Quản lý máy in (thêm, bật/tắt, bảo trì)
4. ✅ Xử lý lệnh in với cấu hình chi tiết
5. ✅ Lịch sử in đầy đủ và báo cáo tự động
6. ✅ Thanh toán mua thêm trang qua cổng SIUPay
7. ✅ Thông báo và hỗ trợ người dùng

---

## 📊 SƠ ĐỒ QUAN HỆ (ERD)

### Các nhóm bảng chính:

```
┌─────────────────────────────────────────────────────────────┐
│  PHÂN LOẠI CÁC BẢNG THEO CHỨC NĂNG                          │
└─────────────────────────────────────────────────────────────┘

📁 NHÓM 1: QUẢN LÝ NGƯỜI DÙNG
   ├── users (Thông tin cơ bản người dùng)
   ├── students (Chi tiết sinh viên)
   └── spso_officers (Chi tiết nhân viên SPSO)

📁 NHÓM 2: QUẢN LÝ TRANG IN
   ├── page_balance (Số dư trang hiện tại)
   ├── page_allocation_history (Lịch sử cấp trang miễn phí)
   └── page_purchase_history (Lịch sử mua trang)

📁 NHÓM 3: QUẢN LÝ MÁY IN
   ├── printers (Thông tin máy in)
   └── printer_maintenance_log (Lịch sử bảo trì)

📁 NHÓM 4: QUẢN LÝ TÀI LIỆU & IN ẤN
   ├── documents (Tài liệu tải lên)
   ├── print_jobs (Lệnh in - hàng đợi)
   └── print_history_log (Lịch sử in chi tiết)

📁 NHÓM 5: LOG & BÁO CÁO
   ├── system_activity_log (Log hoạt động hệ thống)
   ├── monthly_reports (Báo cáo tháng)
   └── yearly_reports (Báo cáo năm)

📁 NHÓM 6: CẤU HÌNH
   ├── system_configuration (Cấu hình hệ thống)
   ├── allowed_file_types (Loại file được phép)
   ├── semester_configuration (Cấu hình học kỳ)
   └── page_pricing (Bảng giá)

📁 NHÓM 7: HỖ TRỢ
   ├── notifications (Thông báo)
   └── support_tickets (Phiếu hỗ trợ)
```

---

## 📝 CHI TIẾT CÁC BẢNG

### 1️⃣ BẢNG: `users`

**Mục đích**: Lưu thông tin cơ bản của tất cả người dùng (sinh viên và SPSO)

| Cột       | Kiểu dữ liệu  | Mô tả                     | Ràng buộc        |
| --------- | ------------- | ------------------------- | ---------------- |
| user_id   | VARCHAR(20)   | Mã người dùng (MSSV/MSNV) | PRIMARY KEY      |
| email     | VARCHAR(100)  | Email đăng nhập           | UNIQUE, NOT NULL |
| full_name | NVARCHAR(100) | Họ và tên                 | NOT NULL         |
| user_type | ENUM          | student/spso              | NOT NULL         |
| status    | ENUM          | active/inactive/suspended | DEFAULT 'active' |

**Quan hệ**:

- Có quan hệ 1-1 với `students` hoặc `spso_officers`
- Là khóa ngoại trong nhiều bảng khác

---

### 2️⃣ BẢNG: `page_balance`

**Mục đích**: Quản lý số dư trang in của sinh viên

| Cột                 | Kiểu dữ liệu | Mô tả               | Đặc biệt         |
| ------------------- | ------------ | ------------------- | ---------------- |
| balance_id          | INT          | ID tự động tăng     | PRIMARY KEY      |
| student_id          | VARCHAR(20)  | MSSV                | FOREIGN KEY      |
| a4_balance          | INT          | Số trang A4 còn lại | NOT NULL         |
| a3_balance          | INT          | Số trang A3 còn lại | NOT NULL         |
| total_a4_equivalent | INT          | Tổng quy đổi A4     | GENERATED COLUMN |

**Công thức tính**:

```sql
total_a4_equivalent = a4_balance + (a3_balance * 2)
```

**Quy tắc**:

- 1 trang A3 = 2 trang A4
- Tự động cập nhật khi in hoặc mua trang
- Mỗi sinh viên chỉ có 1 record

---

### 3️⃣ BẢNG: `printers`

**Mục đích**: Lưu trữ thông tin máy in trong hệ thống

| Cột quan trọng        | Kiểu dữ liệu | Mô tả                             |
| --------------------- | ------------ | --------------------------------- |
| printer_id            | VARCHAR(20)  | Mã máy in (VD: PR-CS-01)          |
| campus                | NVARCHAR(50) | Cơ sở (Dĩ An, Linh Trung)         |
| building              | NVARCHAR(50) | Tòa nhà                           |
| room_number           | NVARCHAR(20) | Số phòng                          |
| status                | ENUM         | active/inactive/maintenance/error |
| is_available          | BOOLEAN      | Sẵn sàng sử dụng                  |
| paper_sizes_supported | VARCHAR(100) | VD: "A4,A3"                       |
| color_printing        | BOOLEAN      | Hỗ trợ in màu                     |
| duplex_printing       | BOOLEAN      | Hỗ trợ in 2 mặt                   |
| total_pages_printed   | INT          | Tổng số trang đã in               |

**Chức năng**:

- SPSO có thể thêm/sửa/xóa máy in
- SPSO có thể bật/tắt (enable/disable) máy in
- Tự động cập nhật `total_pages_printed` khi có job hoàn thành

---

### 4️⃣ BẢNG: `print_jobs`

**Mục đích**: Hàng đợi in - Lưu tất cả lệnh in với cấu hình chi tiết

| Nhóm cột             | Các cột quan trọng                                               |
| -------------------- | ---------------------------------------------------------------- |
| **Thông tin cơ bản** | job_id, student_id, document_id, printer_id                      |
| **Cấu hình in**      | paper_size, pages_to_print, color_mode, single_sided, num_copies |
| **Tính toán**        | total_pages_to_print, total_sheets_used, a4_equivalent_pages     |
| **Trạng thái**       | job_status (pending/queued/printing/completed/failed/cancelled)  |
| **Thời gian**        | submitted_at, started_at, completed_at                           |

**Workflow trạng thái**:

```
pending → queued → printing → completed/failed/cancelled
```

**Ví dụ tính toán**:

- In trang 1-10 của file, khổ A3, 2 mặt, 3 bản copy
- `total_pages_to_print` = 10 trang
- `total_sheets_used` = 5 tờ (in 2 mặt) × 3 bản = 15 tờ
- `a4_equivalent_pages` = 10 × 2 (A3→A4) × 3 bản = 60 trang A4

---

### 5️⃣ BẢNG: `print_history_log`

**Mục đích**: Lưu lịch sử in chi tiết để báo cáo và truy vết

| Cột                | Mô tả                    |
| ------------------ | ------------------------ |
| log_id             | ID log tự động           |
| job_id             | Tham chiếu lệnh in       |
| student_id         | Sinh viên thực hiện      |
| printer_id         | Máy in sử dụng           |
| document_name      | Tên tài liệu             |
| pages_printed      | Số trang đã in           |
| a4_equivalent_used | Số trang A4 quy đổi      |
| print_start_time   | Thời gian bắt đầu        |
| print_end_time     | Thời gian kết thúc       |
| status             | success/failed/cancelled |

**Tự động ghi log**: Khi `print_jobs.job_status` chuyển sang `completed`

---

### 6️⃣ BẢNG: `monthly_reports` & `yearly_reports`

**Mục đích**: Báo cáo tự động theo tháng/năm

#### monthly_reports

- total_students_active
- total_print_jobs
- total_successful_jobs
- total_pages_printed
- total_revenue (doanh thu từ mua trang)
- most_used_printer_id
- top_user_student_id

**Tạo tự động**: Sử dụng stored procedure `generate_monthly_report()`

---

### 7️⃣ BẢNG: `system_configuration`

**Mục đích**: Lưu các cấu hình hệ thống có thể thay đổi

| config_key                    | config_value | Mô tả                      |
| ----------------------------- | ------------ | -------------------------- |
| default_a4_pages_per_semester | 100          | Số trang mặc định mỗi kỳ   |
| max_file_size_mb              | 50           | Kích thước file tối đa     |
| max_pages_per_job             | 100          | Số trang tối đa mỗi lần in |
| page_allocation_day           | 1            | Ngày cấp trang trong tháng |

**SPSO có thể thay đổi**: Tất cả các cấu hình này qua giao diện

---

## 🔧 CÁC VIEW VÀ STORED PROCEDURE

### Views (Truy vấn thuận tiện)

#### 1. `v_student_page_info`

Xem thông tin sinh viên và số dư trang

```sql
SELECT * FROM v_student_page_info WHERE student_id = 'S2123456';
```

#### 2. `v_student_print_history`

Xem lịch sử in của sinh viên

```sql
SELECT * FROM v_student_print_history
WHERE student_id = 'S2123456'
ORDER BY print_start_time DESC
LIMIT 20;
```

#### 3. `v_printer_statistics`

Thống kê hoạt động của máy in

```sql
SELECT * FROM v_printer_statistics
WHERE building = 'H6';
```

#### 4. `v_student_usage_report`

Báo cáo sử dụng theo sinh viên

```sql
SELECT * FROM v_student_usage_report
WHERE faculty = 'Computer Science';
```

---

### Stored Procedures

#### 1. `check_page_balance()`

Kiểm tra số dư trang trước khi in

```sql
CALL check_page_balance('S2123456', 'A3', 10, @has_enough, @current_balance);
SELECT @has_enough, @current_balance;
```

#### 2. `generate_monthly_report()`

Tạo báo cáo tháng tự động

```sql
CALL generate_monthly_report(12, 2025, 'SPSO001');
```

---

### Triggers (Tự động hóa)

#### 1. `after_print_job_completed`

**Kích hoạt**: Khi lệnh in hoàn thành
**Hành động**:

- Trừ số trang trong `page_balance`
- Tạo log trong `print_history_log`
- Cập nhật `total_pages_printed` của máy in

#### 2. `after_page_purchase`

**Kích hoạt**: Khi mua trang thành công
**Hành động**:

- Cộng số trang vào `page_balance`

---

## 📐 QUY TẮC NGHIỆP VỤ

### 1. Quy đổi trang giấy

```
1 trang A3 = 2 trang A4
1 trang A5 = 0.5 trang A4
```

### 2. Kiểm tra số dư trước khi in

```
IF (số_trang_cần_in_quy_đổi_A4 > số_dư_A4_tương_đương) THEN
    Không cho phép in
    Hiển thị thông báo: "Số dư không đủ. Vui lòng mua thêm trang."
END IF
```

### 3. Cấp trang miễn phí mỗi học kỳ

- Số trang: Theo `semester_configuration.default_a4_pages`
- Ngày cấp: Theo `semester_configuration.page_allocation_date`
- Tự động cấp vào đầu học kỳ

### 4. Thanh toán mua trang

- Phương thức: SIUPay, bank transfer, e-wallet
- Giá: Theo bảng `page_pricing`
- Trạng thái: pending → completed/failed
- Chỉ cộng trang khi `payment_status = 'completed'`

### 5. Trạng thái máy in

- **active**: Hoạt động bình thường
- **inactive**: Đã tắt, không thể in
- **maintenance**: Đang bảo trì
- **error**: Lỗi, cần sửa chữa

### 6. Loại file được phép in

- Mặc định: PDF, DOCX, DOC, PPTX, XLSX, TXT
- SPSO có thể thay đổi trong bảng `allowed_file_types`

---

## 🚀 HƯỚNG DẪN SỬ DỤNG

### A. Thiết lập ban đầu

#### Bước 1: Tạo database

```bash
mysql -u root -p < database_schema.sql
```

#### Bước 2: Tạo user SPSO đầu tiên

```sql
-- Thêm user
INSERT INTO users (user_id, email, full_name, user_type, status)
VALUES ('SPSO001', 'spso001@hcmiu.edu.vn', N'Nguyễn Văn A', 'spso', 'active');

-- Thêm thông tin SPSO
INSERT INTO spso_officers (officer_id, user_id, department, position, hire_date, permission_level)
VALUES ('SPSO001', 'SPSO001', N'Phòng In Ấn', N'Trưởng Phòng', '2024-01-01', 5);
```

#### Bước 3: Thêm máy in

```sql
INSERT INTO printers (
    printer_id, printer_name, brand, model,
    campus, building, room_number,
    status, is_available,
    paper_sizes_supported, color_printing, duplex_printing,
    created_by
)
VALUES (
    'PR-CS-01', N'Máy in CS Building 01', 'HP', 'LaserJet Pro MFP M428fdw',
    N'Dĩ An', 'H6', '101',
    'active', TRUE,
    'A4,A3', FALSE, TRUE,
    'SPSO001'
);
```

---

### B. Workflow sinh viên in tài liệu

#### Bước 1: Đăng nhập

```sql
-- Kiểm tra thông tin đăng nhập
SELECT * FROM users WHERE email = 'student@student.hcmiu.edu.vn' AND status = 'active';
```

#### Bước 2: Kiểm tra số dư trang

```sql
SELECT * FROM v_student_page_info WHERE student_id = 'S2123456';
```

#### Bước 3: Tải file lên

```sql
INSERT INTO documents (
    student_id, original_filename, stored_filename, file_path,
    file_extension, file_size_kb, total_pages
)
VALUES (
    'S2123456', N'Bài tập lớn.pdf', 'doc_20250101_123456.pdf', '/uploads/2025/01/doc_20250101_123456.pdf',
    'pdf', 1024.5, 15
);
```

#### Bước 4: Tạo lệnh in

```sql
INSERT INTO print_jobs (
    student_id, document_id, printer_id,
    paper_size, pages_to_print, color_mode, single_sided, num_copies,
    total_pages_to_print, total_sheets_used, a4_equivalent_pages,
    job_status
)
VALUES (
    'S2123456', 1, 'PR-CS-01',
    'A4', '1-15', 'black_and_white', FALSE, 1,
    15, 8, 15,
    'pending'
);
```

#### Bước 5: Kiểm tra số dư trước khi in

```sql
CALL check_page_balance('S2123456', 'A4', 15, @has_enough, @current_balance);
```

#### Bước 6: Xử lý in (tự động bởi hệ thống)

```sql
-- Cập nhật trạng thái
UPDATE print_jobs SET
    job_status = 'printing',
    started_at = NOW()
WHERE job_id = 1;

-- Hoàn thành
UPDATE print_jobs SET
    job_status = 'completed',
    completed_at = NOW()
WHERE job_id = 1;
-- Trigger tự động trừ trang và tạo log
```

---

### C. Workflow SPSO quản lý

#### 1. Xem tất cả lệnh in

```sql
SELECT
    pj.job_id,
    u.full_name as student_name,
    d.original_filename,
    pr.printer_name,
    pj.paper_size,
    pj.total_pages_to_print,
    pj.job_status,
    pj.submitted_at
FROM print_jobs pj
JOIN students s ON pj.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
JOIN documents d ON pj.document_id = d.document_id
JOIN printers pr ON pj.printer_id = pr.printer_id
ORDER BY pj.submitted_at DESC
LIMIT 50;
```

#### 2. Xem lịch sử in theo sinh viên

```sql
SELECT * FROM v_student_print_history
WHERE student_id = 'S2123456'
AND print_start_time BETWEEN '2025-01-01' AND '2025-01-31';
```

#### 3. Xem lịch sử in theo máy in

```sql
SELECT * FROM print_history_log
WHERE printer_id = 'PR-CS-01'
AND print_start_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY print_start_time DESC;
```

#### 4. Thay đổi cấu hình hệ thống

```sql
-- Thay đổi số trang mặc định
UPDATE system_configuration
SET config_value = '150', updated_by = 'SPSO001'
WHERE config_key = 'default_a4_pages_per_semester';

-- Thêm loại file mới được phép
INSERT INTO allowed_file_types (file_extension, file_type_name, max_file_size_mb, is_allowed, updated_by)
VALUES ('rtf', 'Rich Text Format', 10, TRUE, 'SPSO001');
```

#### 5. Tạo báo cáo tháng

```sql
CALL generate_monthly_report(12, 2024, 'SPSO001');

-- Xem báo cáo
SELECT * FROM monthly_reports WHERE report_month = 12 AND report_year = 2024;
```

#### 6. Bảo trì máy in

```sql
-- Đặt máy in vào chế độ bảo trì
UPDATE printers SET
    status = 'maintenance',
    is_available = FALSE,
    updated_by = 'SPSO001'
WHERE printer_id = 'PR-CS-01';

-- Ghi log bảo trì
INSERT INTO printer_maintenance_log (
    printer_id, maintenance_date, maintenance_type,
    description, technician_name, cost, performed_by
)
VALUES (
    'PR-CS-01', CURDATE(), 'routine',
    N'Thay mực, vệ sinh đầu in', N'Nguyễn Văn B', 500000, 'SPSO001'
);

-- Kích hoạt lại máy in
UPDATE printers SET
    status = 'active',
    is_available = TRUE,
    last_maintenance_date = CURDATE(),
    next_maintenance_date = DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
WHERE printer_id = 'PR-CS-01';
```

---

### D. Các truy vấn thống kê hữu ích

#### 1. Top 10 sinh viên in nhiều nhất tháng này

```sql
SELECT
    s.student_id,
    u.full_name,
    COUNT(pj.job_id) as total_jobs,
    SUM(pj.a4_equivalent_pages) as total_pages
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN print_jobs pj ON s.student_id = pj.student_id
WHERE pj.job_status = 'completed'
AND MONTH(pj.completed_at) = MONTH(CURDATE())
AND YEAR(pj.completed_at) = YEAR(CURDATE())
GROUP BY s.student_id
ORDER BY total_pages DESC
LIMIT 10;
```

#### 2. Máy in nào đang bận nhất

```sql
SELECT * FROM v_printer_statistics
WHERE status = 'active'
ORDER BY total_jobs DESC;
```

#### 3. Doanh thu mua trang theo tháng

```sql
SELECT
    DATE_FORMAT(purchase_date, '%Y-%m') as month,
    COUNT(*) as total_transactions,
    SUM(a4_pages_purchased + a3_pages_purchased * 2) as total_pages_sold,
    SUM(total_amount) as total_revenue
FROM page_purchase_history
WHERE payment_status = 'completed'
GROUP BY DATE_FORMAT(purchase_date, '%Y-%m')
ORDER BY month DESC;
```

#### 4. Tỷ lệ thành công của các lệnh in

```sql
SELECT
    job_status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM print_jobs), 2) as percentage
FROM print_jobs
GROUP BY job_status;
```

---

## 🔒 BẢO MẬT VÀ QUYỀN TRUY CẬP

### Phân quyền đề xuất

#### 1. User sinh viên (student_role)

```sql
-- Chỉ xem được dữ liệu của chính mình
GRANT SELECT ON v_student_page_info TO student_role WHERE student_id = CURRENT_USER();
GRANT SELECT ON v_student_print_history TO student_role WHERE student_id = CURRENT_USER();
GRANT INSERT ON documents TO student_role;
GRANT INSERT ON print_jobs TO student_role;
GRANT INSERT ON page_purchase_history TO student_role;
```

#### 2. User SPSO (spso_role)

```sql
-- Xem tất cả dữ liệu
GRANT SELECT ON hcmsiu_ssps.* TO spso_role;
-- Quản lý máy in
GRANT INSERT, UPDATE, DELETE ON printers TO spso_role;
-- Quản lý cấu hình
GRANT INSERT, UPDATE, DELETE ON system_configuration TO spso_role;
-- Xem và tạo báo cáo
GRANT EXECUTE ON PROCEDURE generate_monthly_report TO spso_role;
```

---

## 📈 TỐI ƯU HÓA HIỆU SUẤT

### Indexes đã tạo

```sql
-- Tìm kiếm sinh viên
INDEX idx_email ON users(email)
INDEX idx_student_id ON students(student_id)

-- Tìm kiếm máy in
INDEX idx_campus_building ON printers(campus, building)
INDEX idx_is_available ON printers(is_available)

-- Truy vấn lịch sử in
INDEX idx_print_history_date_range ON print_history_log(print_start_time, print_end_time)
INDEX idx_print_jobs_student_status ON print_jobs(student_id, job_status)

-- Báo cáo và thống kê
INDEX idx_report_date ON monthly_reports(report_year, report_month)
```

### Các gợi ý tối ưu

1. **Partition tables**: Có thể partition `print_history_log` theo tháng
2. **Archive old data**: Lưu trữ dữ liệu cũ hơn 2 năm vào bảng archive
3. **Cache queries**: Cache các truy vấn thống kê thường xuyên
4. **Read replicas**: Sử dụng read replica cho các truy vấn báo cáo

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### 1. Lỗi: "Số dư không đủ"

```sql
-- Kiểm tra số dư
SELECT * FROM page_balance WHERE student_id = 'S2123456';

-- Xem lịch sử sử dụng
SELECT SUM(a4_equivalent_used) as total_used
FROM print_history_log
WHERE student_id = 'S2123456';
```

### 2. Lỗi: "Máy in không khả dụng"

```sql
-- Kiểm tra trạng thái máy in
SELECT printer_id, printer_name, status, is_available
FROM printers
WHERE printer_id = 'PR-CS-01';

-- Xem lịch sử bảo trì
SELECT * FROM printer_maintenance_log
WHERE printer_id = 'PR-CS-01'
ORDER BY maintenance_date DESC;
```

### 3. Lỗi: "File không được hỗ trợ"

```sql
-- Kiểm tra loại file được phép
SELECT * FROM allowed_file_types WHERE is_allowed = TRUE;
```

---

## 🔐 XÁC THỰC & BẢO MẬT (OTP/2FA)

Các thành phần mới để hỗ trợ khôi phục mật khẩu qua email OTP, xác thực 2 lớp khi đăng nhập/đăng ký, và ghi nhớ thiết bị tin cậy:

- **Bảng `EmailOtpCodes`**: Lưu OTP theo `UserID`, `Purpose` (`PasswordReset`, `Login2FA`, `EmailVerification`, `Register2FA`), thời hạn và số lần thử.
- **Bảng `TrustedDevices`**: Lưu thiết bị tin cậy theo `UserID` + `DeviceId` với hạn dùng (`ExpiresAt`).
- **Cấu hình `SystemConfig`**: `TwoFactor.Enabled`, `TwoFactor.TrustDays`, `OTP.EmailExpirationMinutes`, `OTP.MaxAttempts`.
- **Cột mới trên `Users`**: `EmailVerifiedAt`, `IsTwoFactorEnabled`.

### Quy trình mẫu (SQL Server)

1. Phát hành OTP: dùng cho reset mật khẩu, 2FA đăng nhập/đăng ký

```sql
DECLARE @Code NVARCHAR(10), @Exp DATETIME2;
EXEC sp_IssueEmailOtp
    @UserID = 'ITITIU21001',
    @Purpose = 'PasswordReset',
    @RequestedByIp = '203.0.113.5',
    @DeviceId = NULL,
    @OtpCode = @Code OUTPUT,
    @ExpiresAt = @Exp OUTPUT;
SELECT @Code AS OtpCode, @Exp AS ExpiresAt; -- gửi @Code qua email
```

2. Xác thực OTP: kiểm tra và tiêu thụ

```sql
DECLARE @OK BIT, @Err NVARCHAR(200);
EXEC sp_ConsumeEmailOtp
    @UserID = 'ITITIU21001',
    @Purpose = 'PasswordReset',
    @Code = '123456',
    @Success = @OK OUTPUT,
    @Error = @Err OUTPUT;
SELECT @OK AS Success, @Err AS ErrorMessage;
```

3. Đăng ký thiết bị tin cậy (bỏ qua 2FA trong X ngày)

```sql
DECLARE @Exp DATETIME2;
EXEC sp_RegisterTrustedDevice
    @UserID = 'ITITIU21001',
    @DeviceId = 'device-fp-hash-abc123',
    @DeviceName = N'Laptop cá nhân',
    @UserAgent = 'Chrome/120 Windows',
    @IpAddress = '203.0.113.5',
    @TrustDays = NULL, -- dùng giá trị mặc định trong SystemConfig
    @ExpiresAt = @Exp OUTPUT;
SELECT @Exp AS TrustedUntil;
```

### Gợi ý tích hợp ứng dụng

- Khi đăng ký: phát hành OTP với `Purpose = 'EmailVerification'`, xác nhận xong thì set `Users.EmailVerifiedAt`.
- Khi đăng nhập: nếu `IsTwoFactorEnabled = 1` và thiết bị chưa tin cậy hoặc hết hạn, phát hành OTP `Purpose = 'Login2FA'` và yêu cầu người dùng nhập.
- "Ghi nhớ đăng nhập": sau khi qua 2FA, gọi `sp_RegisterTrustedDevice` để tạo bản ghi thiết bị tin cậy.
- Reset mật khẩu: phát hành OTP `Purpose = 'PasswordReset'`; chỉ cho phép đặt mật khẩu mới khi `sp_ConsumeEmailOtp` trả về `Success = 1`.

---

## 📞 HỖ TRỢ

Nếu có thắc mắc về database, vui lòng liên hệ:

- **Email**: support@hcmiu.edu.vn
- **Hotline**: 1900-xxxx

---

## 📜 LỊCH SỬ PHIÊN BẢN

| Version | Ngày       | Thay đổi                                               |
| ------- | ---------- | ------------------------------------------------------ |
| 1.0     | 2025-12-03 | Phiên bản đầu tiên - Đầy đủ các chức năng cơ bản       |
| 2.0     | 2025-12-03 | Thêm OTP qua email, 2FA, thiết bị tin cậy (SQL Server) |

---

**© 2025 HCMIU - International University - Vietnam National University HCMC**
