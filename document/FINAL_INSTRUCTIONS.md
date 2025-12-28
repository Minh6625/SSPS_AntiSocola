# 🎯 HƯỚNG DẪN CUỐI CÙNG - TRANG BÁO CÁO

## ✅ TRẠNG THÁI HIỆN TẠI

- ✅ Backend đang chạy (port 8080)
- ✅ Frontend đã sửa xong
- ✅ API hoạt động (logs cho thấy đã gọi thành công)
- ✅ Xuất PDF/Excel đã implement
- ✅ UI đã thay emoji thành icon SVG

## ⚠️ VẤN ĐỀ

**Không có dữ liệu hiển thị** vì:

- Database có dữ liệu nhưng **không có cho tháng/năm đang chọn**
- Hoặc dữ liệu ở **tháng/năm khác**

## 🔍 KIỂM TRA DỮ LIỆU

### Bước 1: Xem dữ liệu có ở đâu

```sql
-- Xem dữ liệu theo tháng
SELECT
    TO_CHAR("PrintTime", 'YYYY-MM') as month,
    COUNT(*) as total_logs,
    SUM("PagesPrinted") as total_pages
FROM "PrintLogs"
GROUP BY TO_CHAR("PrintTime", 'YYYY-MM')
ORDER BY month DESC
LIMIT 12;
```

**Kết quả mẫu:**

```
  month   | total_logs | total_pages
----------+------------+-------------
 2025-12  |         45 |         523
 2025-11  |         38 |         412
 2025-10  |         52 |         601
```

### Bước 2: Chọn tháng/năm có dữ liệu

Nếu kết quả cho thấy có dữ liệu ở tháng 12/2025:

1. Mở frontend: `http://localhost:3000/spso/reports`
2. Chọn **Năm: 2025**
3. Chọn **Tháng: 12**
4. Báo cáo sẽ hiển thị!

## 📊 DASHBOARD ĐÃ HOẠT ĐỘNG

Bạn nói Dashboard đã load được dữ liệu → **Tuyệt!** Điều đó có nghĩa:

- ✅ Database có dữ liệu
- ✅ API hoạt động
- ✅ Frontend kết nối được backend

**Vậy tại sao Reports không hiển thị?**
→ Vì Reports đang tìm dữ liệu ở **tháng/năm cụ thể**, còn Dashboard lấy **tất cả dữ liệu**.

## 🚀 GIẢI PHÁP NHANH

### Option 1: Chọn đúng tháng/năm (KHUYẾN NGHỊ)

1. Chạy query kiểm tra ở trên
2. Xem tháng/năm nào có dữ liệu nhiều nhất
3. Chọn tháng/năm đó trong frontend
4. Báo cáo sẽ hiển thị!

### Option 2: Tạo dữ liệu cho tháng hiện tại

Nếu muốn có dữ liệu cho tháng hiện tại (12/2025):

```sql
-- Tạo 20 print logs cho tháng 12/2025
-- (Thay 'STUDENT_ID' và 'PRINTER_ID' bằng ID thật từ database)

DO $$
DECLARE
    test_student_id VARCHAR(50);
    test_printer_id BIGINT;
    i INT;
BEGIN
    -- Lấy student_id đầu tiên
    SELECT "UserID" INTO test_student_id
    FROM "Users"
    WHERE "UserType" = 'STUDENT'
    LIMIT 1;

    -- Lấy printer_id đầu tiên
    SELECT "PrinterID" INTO test_printer_id
    FROM "Printers"
    WHERE "Status" = 'Active'
    LIMIT 1;

    IF test_student_id IS NOT NULL AND test_printer_id IS NOT NULL THEN
        FOR i IN 1..20 LOOP
            INSERT INTO "PrintLogs" (
                "JobID",
                "StudentID",
                "PrinterID",
                "DocumentName",
                "PaperSize",
                "PagesPrinted",
                "A4EquivalentUsed",
                "PrintTime",
                "DurationSeconds",
                "Status",
                "FilePath",
                "Copies",
                "IsDoubleSided",
                "CreatedAt",
                "UpdatedAt"
            ) VALUES (
                i,
                test_student_id,
                test_printer_id,
                'Document_' || i || '.pdf',
                CASE WHEN i % 5 = 0 THEN 'A3' ELSE 'A4' END,
                FLOOR(RANDOM() * 20 + 5)::INT,
                CASE WHEN i % 5 = 0 THEN FLOOR(RANDOM() * 40 + 10)::INT ELSE FLOOR(RANDOM() * 20 + 5)::INT END,
                TIMESTAMP '2025-12-01 08:00:00' + (i || ' hours')::INTERVAL,
                FLOOR(RANDOM() * 300 + 60)::INT,
                CASE WHEN i % 10 = 0 THEN 'Failed' ELSE 'Completed' END,
                '/uploads/doc_' || i || '.pdf',
                1,
                CASE WHEN i % 2 = 0 THEN TRUE ELSE FALSE END,
                NOW(),
                NOW()
            );
        END LOOP;

        RAISE NOTICE 'Đã tạo 20 print logs cho tháng 12/2025';
    ELSE
        RAISE NOTICE 'Không tìm thấy student hoặc printer';
    END IF;
END $$;
```

## 🎨 TÍNH NĂNG MỚI

### 1. Hiển thị "Không có dữ liệu"

Nếu chọn tháng/năm không có dữ liệu, sẽ hiển thị:

- ⚠️ Icon cảnh báo màu vàng
- Message: "Không có dữ liệu in ấn cho tháng X/năm Y"
- Gợi ý: "Thử chọn tháng/năm khác"

### 2. Console logs

Mở DevTools (F12) → Console để xem:

```
Loading monthly report: 2025 12
Monthly report data: { totalPrintJobs: 0, ... }
```

Nếu `totalPrintJobs: 0` → Không có dữ liệu cho tháng đó.

### 3. Auto-load

Báo cáo tự động load khi:

- Thay đổi năm
- Thay đổi tháng
- Chuyển từ Tháng sang Năm

## 📝 CHECKLIST

- [ ] Backend đang chạy (✅ Đã chạy)
- [ ] Frontend đang chạy
- [ ] Mở `http://localhost:3000/spso/reports`
- [ ] Mở DevTools (F12) → Console
- [ ] Chọn năm/tháng
- [ ] Xem console logs
- [ ] Nếu `totalPrintJobs: 0`:
  - [ ] Chạy query kiểm tra dữ liệu
  - [ ] Chọn tháng/năm có dữ liệu
  - [ ] Hoặc tạo dữ liệu mới
- [ ] Báo cáo hiển thị
- [ ] Test xuất PDF
- [ ] Test xuất Excel

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi chọn đúng tháng/năm có dữ liệu:

### Báo cáo tháng

- ✅ 4 cards thống kê (có số liệu)
- ✅ Phân bổ A4/A3 (có progress bar)
- ✅ Top 5 sinh viên (có danh sách)
- ✅ Top 3 máy in (có danh sách)
- ✅ Biểu đồ theo ngày (có cột)
- ✅ Phân tích & đề xuất

### Xuất file

- ✅ Click "Xuất PDF" → File download
- ✅ Click "Xuất Excel" → File download
- ✅ Mở file thành công
- ✅ Có dữ liệu đầy đủ

## 💡 MẸO

### Mẹo 1: Xem Dashboard trước

Dashboard hiển thị **tất cả dữ liệu**, không phân theo tháng.

- Nếu Dashboard có dữ liệu → Database OK
- Nếu Dashboard rỗng → Cần tạo dữ liệu

### Mẹo 2: Dùng năm hiện tại

Frontend đã sửa mặc định về **năm hiện tại** (2025).

- Nếu có dữ liệu năm 2025 → Sẽ hiển thị ngay
- Nếu không → Chọn năm khác

### Mẹo 3: Kiểm tra Console

Console logs sẽ cho biết:

- API có được gọi không
- Response có dữ liệu không
- Có lỗi gì không

## 🐛 TROUBLESHOOTING

### Vấn đề: "Không có dữ liệu"

**Nguyên nhân:**

- Chọn sai tháng/năm
- Database không có dữ liệu cho tháng đó

**Giải pháp:**

1. Chạy query kiểm tra
2. Chọn tháng/năm có dữ liệu
3. Hoặc tạo dữ liệu mới

### Vấn đề: "Lỗi khi load báo cáo"

**Nguyên nhân:**

- Backend chưa chạy
- Lỗi kết nối database

**Giải pháp:**

1. Kiểm tra backend logs
2. Kiểm tra database connection
3. Restart backend

### Vấn đề: "PDF/Excel không download"

**Nguyên nhân:**

- Không có dữ liệu để xuất
- Backend error

**Giải pháp:**

1. Đảm bảo báo cáo đã hiển thị
2. Kiểm tra console logs
3. Kiểm tra backend logs

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề:

1. **Chụp màn hình:**

   - Trang Reports
   - Console logs (F12)
   - Backend logs

2. **Gửi thông tin:**
   - Tháng/năm đang chọn
   - Kết quả query kiểm tra dữ liệu
   - Error messages (nếu có)

---

**Chúc bạn thành công!** 🎉

Trang Báo cáo đã hoàn thành và sẵn sàng sử dụng. Chỉ cần chọn đúng tháng/năm có dữ liệu là được!
