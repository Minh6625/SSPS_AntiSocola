# HCMSIU_SSPS - Hệ thống quản lý in ấn thông minh

## 📂 NỘI DUNG CÁC FILE

### 1. `database_schema.sql`

Script SQL đầy đủ để tạo database cho hệ thống HCMSIU_SSPS. File này bao gồm:

✅ **27 bảng dữ liệu** được phân loại theo chức năng:

- Quản lý người dùng (3 bảng)
- Quản lý trang in (3 bảng)
- Quản lý máy in (2 bảng)
- Quản lý tài liệu & in ấn (3 bảng)
- Log & Báo cáo (3 bảng)
- Cấu hình hệ thống (4 bảng)
- Thông báo & Hỗ trợ (2 bảng)

✅ **4 Views** để truy vấn dữ liệu thuận tiện:

- v_student_page_info: Thông tin sinh viên và số dư trang
- v_student_print_history: Lịch sử in của sinh viên
- v_printer_statistics: Thống kê máy in
- v_student_usage_report: Báo cáo sử dụng theo sinh viên

✅ **2 Stored Procedures**:

- check_page_balance(): Kiểm tra số dư trang trước khi in
- generate_monthly_report(): Tạo báo cáo tháng tự động

✅ **2 Triggers tự động**:

- after_print_job_completed: Tự động trừ trang và ghi log sau khi in
- after_page_purchase: Tự động cộng trang sau khi mua

✅ **Dữ liệu mẫu**: Cấu hình mặc định, loại file, bảng giá, học kỳ

### 2. `database_documentation.md`

Tài liệu hướng dẫn chi tiết về database, bao gồm:

- Tổng quan hệ thống
- Sơ đồ quan hệ (ERD mô tả bằng text)
- Chi tiết từng bảng với ví dụ cụ thể
- Hướng dẫn sử dụng các View và Stored Procedure
- Quy tắc nghiệp vụ quan trọng
- Workflow đầy đủ cho sinh viên và SPSO
- Các truy vấn thống kê hữu ích
- Hướng dẫn tối ưu hóa và xử lý lỗi

---

## 🎯 ĐẶC ĐIỂM NỔI BẬT CỦA DATABASE

### 1. Thiết kế chuẩn hóa (Normalized)

- Tuân thủ chuẩn 3NF
- Tránh dư thừa dữ liệu
- Dễ dàng bảo trì và mở rộng

### 2. Tự động hóa cao

- Trigger tự động trừ/cộng trang
- Trigger tự động ghi log
- Stored procedure tạo báo cáo tự động
- Generated column tính toán quy đổi A3→A4

### 3. Hỗ trợ đầy đủ yêu cầu

✅ Quản lý người dùng (sinh viên, SPSO)
✅ Quản lý số dư trang (A4, A3) với quy đổi tự động
✅ Quản lý máy in (thêm, bật/tắt, bảo trì)
✅ Xử lý lệnh in với cấu hình chi tiết
✅ Lịch sử in đầy đủ (log mọi hoạt động)
✅ Báo cáo tự động theo tháng/năm
✅ Thanh toán mua trang (SIUPay, bank transfer, e-wallet)
✅ Cấp trang miễn phí mỗi học kỳ
✅ Cấu hình hệ thống linh hoạt (số trang mặc định, loại file, bảng giá)
✅ Thông báo và hỗ trợ người dùng
✅ Log hoạt động hệ thống

### 4. Tối ưu hiệu suất

- 15+ indexes được tạo sẵn cho các truy vấn thường xuyên
- Views để giảm độ phức tạp truy vấn
- Partition-ready cho bảng lớn (print_history_log)

### 5. Bảo mật

- Phân quyền rõ ràng (sinh viên chỉ xem được dữ liệu của mình)
- Log đầy đủ mọi hoạt động
- Hỗ trợ soft delete (is_deleted flag)

### 6. Quốc tế hóa

- Sử dụng UTF-8 (utf8mb4) hỗ trợ tiếng Việt
- NVARCHAR cho các cột văn bản tiếng Việt
- Comment đầy đủ bằng tiếng Việt

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Tạo database

```bash
# MySQL/MariaDB
mysql -u root -p < database_schema.sql

# Hoặc import trong MySQL Workbench
```

### Bước 2: Kiểm tra

```sql
USE hcmsiu_ssps;
SHOW TABLES;  -- Sẽ thấy 27 bảng
SELECT * FROM system_configuration;  -- Xem cấu hình mặc định
```

### Bước 3: Tạo dữ liệu mẫu (nếu cần)

Xem file `database_documentation.md` phần "Hướng dẫn sử dụng" để có ví dụ INSERT data.

---

## 📊 TỔNG KẾT

**Database này hoàn toàn đủ để phục vụ cho:**

1. ✅ Task 1: Requirement Elicitation (đáp ứng đủ 5+ yêu cầu chức năng cho mỗi stakeholder)
2. ✅ Task 2: System Modelling (có đầy đủ entity cho Class Diagram)
3. ✅ Task 3: Architecture Design (có phân tầng rõ ràng: Data Layer)
4. ✅ Task 4-5: Implementation (có thể code CRUD operations ngay)

**Các module chính được hỗ trợ:**

- Module In tài liệu ✅
- Module Quản lý trang in ✅
- Module Quản lý máy in ✅
- Module Báo cáo ✅
- Module Cấu hình hệ thống ✅
- Module Thanh toán ✅

**Có thể truy vấn dễ dàng:**

- Lịch sử in của sinh viên ✅
- Lịch sử in theo máy in ✅
- Lịch sử in theo thời gian ✅
- Báo cáo tháng/năm ✅
- Thống kê sử dụng ✅

---

## 📞 GHI CHÚ

### Đối với Backend Developer:

- File SQL có thể chạy trực tiếp trên MySQL 5.7+ hoặc MariaDB 10.3+
- Có thể dùng ORM (Sequelize, TypeORM, Entity Framework) để mapping
- Tất cả Foreign Keys đã được setup với ON DELETE và ON UPDATE phù hợp

### Đối với Frontend Developer:

- Xem phần Views trong documentation để biết cách lấy dữ liệu
- Không cần JOIN phức tạp, chỉ cần query Views
- API endpoints có thể map trực tiếp với các Views

### Đối với Tester:

- Có đầy đủ sample data để test
- Có stored procedures để test nghiệp vụ
- Có log đầy đủ để trace bugs

---

**© 2025 - Database thiết kế bởi GitHub Copilot**
**Phục vụ cho đồ án HCMSIU_SSPS - Student Smart Printing Service**
