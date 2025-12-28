# HƯỚNG DẪN NHANH TẠO DỮ LIỆU TEST CHO BÁO CÁO

## 🎯 MỤC TIÊU

Tạo dữ liệu test để kiểm tra trang Báo cáo hoạt động đúng.

---

## 📋 CÁCH 1: Sử dụng SQL Script (NHANH NHẤT)

### Bước 1: Kết nối database

```bash
# PostgreSQL
psql -U postgres -d your_database_name

# Hoặc dùng pgAdmin, DBeaver, etc.
```

### Bước 2: Chạy script

```sql
-- Kiểm tra dữ liệu hiện có
SELECT
    DATE_TRUNC('month', print_time) as month,
    COUNT(*) as total_logs
FROM print_logs
WHERE print_time >= '2024-12-01' AND print_time < '2025-01-01'
GROUP BY DATE_TRUNC('month', print_time);
```

**Nếu kết quả = 0 hoặc rỗng**, chạy script tạo dữ liệu:

```sql
-- File: backend/test_data_reports.sql
-- Copy toàn bộ nội dung file và chạy trong database
```

### Bước 3: Verify

```sql
-- Kiểm tra lại
SELECT COUNT(*) FROM print_logs WHERE print_time >= '2024-12-01';
SELECT COUNT(*) FROM page_transactions WHERE created_at >= '2024-12-01';
```

**Kết quả mong đợi:**

- print_logs: ~50 records
- page_transactions: ~10 records

---

## 📋 CÁCH 2: Sử dụng API (Nếu có endpoint seed)

```bash
# Nếu có endpoint seed data
curl -X POST http://localhost:8080/api/admin/seed-test-data
```

---

## 📋 CÁCH 3: Tạo thủ công qua UI

### 1. Tạo Print Logs

1. Đăng nhập với tài khoản Student
2. Upload tài liệu
3. Chọn máy in
4. In tài liệu (lặp lại 10-20 lần)

### 2. Tạo Page Transactions

1. Vào trang "Mua trang in"
2. Mua thêm trang (lặp lại 5-10 lần)

**Nhược điểm:** Mất thời gian, dữ liệu sẽ ở tháng hiện tại

---

## 🔍 KIỂM TRA DỮ LIỆU

### Query kiểm tra nhanh

```sql
-- 1. Tổng quan
SELECT
    'Print Logs' as table_name,
    COUNT(*) as total,
    MIN(print_time) as earliest,
    MAX(print_time) as latest
FROM print_logs
UNION ALL
SELECT
    'Page Transactions',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
FROM page_transactions;

-- 2. Theo tháng
SELECT
    TO_CHAR(print_time, 'YYYY-MM') as month,
    COUNT(*) as print_jobs,
    SUM(pages_printed) as total_pages,
    COUNT(DISTINCT student_id) as unique_students
FROM print_logs
GROUP BY TO_CHAR(print_time, 'YYYY-MM')
ORDER BY month DESC
LIMIT 12;

-- 3. Top students
SELECT
    u.full_name,
    u.email,
    COUNT(*) as total_jobs,
    SUM(pl.pages_printed) as total_pages
FROM print_logs pl
JOIN users u ON pl.student_id = u.user_id
WHERE pl.print_time >= '2024-12-01'
GROUP BY u.full_name, u.email
ORDER BY total_pages DESC
LIMIT 5;

-- 4. Top printers
SELECT
    p.printer_name,
    r.room_name as location,
    COUNT(*) as total_jobs,
    SUM(pl.pages_printed) as total_pages
FROM print_logs pl
JOIN printers p ON pl.printer_id = p.printer_id
LEFT JOIN rooms r ON p.room_id = r.room_id
WHERE pl.print_time >= '2024-12-01'
GROUP BY p.printer_name, r.room_name
ORDER BY total_jobs DESC
LIMIT 3;
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Năm mặc định

Frontend hiện đang mặc định chọn **năm 2024, tháng 12**.

Nếu muốn đổi sang năm hiện tại, sửa file:

```typescript
// frontend/src/app/spso/reports/page.tsx
const [selectedYear, setSelectedYear] = useState(2024); // Đổi thành 2025
const [selectedMonth, setSelectedMonth] = useState(12); // Đổi tháng nếu cần
```

### 2. Dữ liệu tối thiểu

Để báo cáo hiển thị đẹp, cần:

- **Tối thiểu:** 10 print logs
- **Khuyến nghị:** 50+ print logs
- **Lý tưởng:** 100+ print logs với nhiều students và printers khác nhau

### 3. Phân bổ dữ liệu

Để biểu đồ đẹp:

- Print logs nên phân bổ đều trong tháng (không tập trung 1 ngày)
- Có cả A4 và A3 (tỷ lệ 80:20)
- Có cả Success và Failed status (tỷ lệ 90:10)

---

## 🐛 TROUBLESHOOTING

### Vấn đề: "Không có dữ liệu"

**Nguyên nhân:**

- Database rỗng
- Chọn sai tháng/năm
- Dữ liệu ở tháng khác

**Giải pháp:**

1. Kiểm tra database có dữ liệu không
2. Kiểm tra tháng/năm đang chọn
3. Chạy query kiểm tra ở trên

### Vấn đề: "Top lists rỗng"

**Nguyên nhân:**

- Không có student_id hoặc printer_id
- Relationships không đúng

**Giải pháp:**

1. Kiểm tra foreign keys
2. Kiểm tra JOIN queries
3. Verify users và printers tables có dữ liệu

### Vấn đề: "Biểu đồ không hiển thị"

**Nguyên nhân:**

- Tất cả giá trị = 0
- maxJobs = 0

**Giải pháp:**

1. Kiểm tra có print logs với status Success/Completed không
2. Kiểm tra pages_printed > 0

---

## ✅ CHECKLIST

Sau khi tạo dữ liệu test, kiểm tra:

- [ ] Database có >= 10 print logs cho tháng 12/2024
- [ ] Database có >= 5 page transactions cho tháng 12/2024
- [ ] Print logs có nhiều student_id khác nhau
- [ ] Print logs có nhiều printer_id khác nhau
- [ ] Print logs có cả A4 và A3
- [ ] Print logs có cả Success và Failed
- [ ] Page transactions có status Completed
- [ ] Frontend chọn đúng năm 2024, tháng 12
- [ ] Backend chạy không lỗi
- [ ] Frontend chạy không lỗi

---

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi setup xong, trang Báo cáo sẽ hiển thị:

### Báo cáo tháng 12/2024

- ✅ Tổng lệnh in: ~50
- ✅ Tổng trang in: ~500-1000
- ✅ Doanh thu: ~250,000 - 500,000 VND
- ✅ Sinh viên hoạt động: 1-5
- ✅ Phân bổ A4/A3: ~80% / ~20%
- ✅ Top 5 sinh viên (có dữ liệu)
- ✅ Top 3 máy in (có dữ liệu)
- ✅ Biểu đồ theo ngày (có cột)

### Xuất file

- ✅ PDF download thành công
- ✅ Excel download thành công
- ✅ File mở được, có dữ liệu

---

**Chúc bạn setup thành công!** 🚀
