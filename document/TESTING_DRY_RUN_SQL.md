# Testing Guide: Dry Run với SQL (Không Cần Máy In Thật)

## Chuẩn Bị

### 1. Tắt Print Queue (Không Cần Auto-Processing)

File `application.properties`:

```properties
print.queue.enabled=false  # Tắt để test thủ công
```

Restart backend.

### 2. Reset Database

```sql
-- Reset máy in
UPDATE printers
SET a4paperremaining = 100,
    a4paperreserved = 0,
    a3paperreserved = 0,
    tonerblackremaining = 100,
    tonerblackreserved = 0,
    status = 'Active'
WHERE printerid = 1;

-- Xóa jobs cũ (optional)
DELETE FROM printjobs WHERE printerid = 1;
```

---

## Test Case 1: Reserve Mechanism - Ngăn Race Condition

### Bước 1: Kiểm Tra Trạng Thái Ban Đầu

```sql
SELECT printerid, printername,
       a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected Output**:

```
printerid | printername      | a4paperremaining | a4paperreserved | available
----------|------------------|------------------|-----------------|----------
1         | Máy in H6-101... | 100              | 0               | 100
```

### Bước 2: User A Gửi Lệnh In 50 Tờ

**Qua UI**:

1. Đăng nhập Student (ví dụ: 2252001)
2. Upload document
3. Gửi lệnh in: Printer ID=1, 50 copies, A4, single-sided

**Kiểm tra kết quả**:

```sql
-- Xem job vừa tạo
SELECT jobid, studentid, printerid, jobstatus,
       totalsheetsused, numcopies,
       (totalsheetsused * numcopies) as total_sheets
FROM printjobs
WHERE printerid = 1
ORDER BY jobid DESC
LIMIT 1;
```

**Expected**:

```
jobid | studentid | printerid | jobstatus | totalsheetsused | numcopies | total_sheets
------|-----------|-----------|-----------|-----------------|-----------|-------------
1     | 2252001   | 1         | Pending   | 1               | 50        | 50
```

```sql
-- Xem reserves
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
a4paperremaining | a4paperreserved | available
-----------------|-----------------|----------
100              | 50              | 50
```

✅ **PASS**: Job được tạo, 50 tờ được reserve ngay lập tức!

### Bước 3: User B Gửi Lệnh In 40 Tờ

**Qua UI**: Đăng nhập Student khác, gửi 40 copies

**Kiểm tra**:

```sql
SELECT jobid, studentid, jobstatus,
       (totalsheetsused * numcopies) as sheets
FROM printjobs
WHERE printerid = 1
ORDER BY jobid DESC
LIMIT 2;
```

**Expected**:

```
jobid | studentid | jobstatus | sheets
------|-----------|-----------|-------
2     | 2252002   | Pending   | 40
1     | 2252001   | Pending   | 50
```

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
a4paperremaining | a4paperreserved | available
-----------------|-----------------|----------
100              | 90              | 10
```

✅ **PASS**: Job B được tạo, reserves tăng lên 90!

### Bước 4: User C Gửi 10 Tờ (Thành Công)

**Qua UI**: Gửi 10 copies

**Expected**:

```
available = 10 - 10 = 0
```

✅ **PASS**: Job C được tạo vì còn đủ 10 tờ available!

### Bước 5: User D Gửi 5 Tờ (Bị Reject)

**Qua UI**: Gửi 5 copies

**Expected**: ❌ Error message: "Máy in không đủ giấy A4. Cần 5 tờ, còn 0 tờ khả dụng"

✅ **PASS**: Race condition đã được ngăn chặn!

---

## Test Case 2: Giả Lập Print Queue Xử Lý Jobs

### Bước 1: Xem Tất Cả Jobs Pending

```sql
SELECT jobid, studentid, jobstatus,
       (totalsheetsused * numcopies) as sheets,
       submittedat
FROM printjobs
WHERE printerid = 1
  AND jobstatus = 'Pending'
ORDER BY jobid;
```

**Expected**:

```
jobid | studentid | jobstatus | sheets | submittedat
------|-----------|-----------|--------|------------
1     | 2252001   | Pending   | 50     | 2024-12-23 14:00:00
2     | 2252002   | Pending   | 40     | 2024-12-23 14:01:00
3     | 2252003   | Pending   | 10     | 2024-12-23 14:02:00
```

### Bước 2: Giả Lập Job 1 Bắt Đầu In

```sql
-- Chuyển sang Printing
UPDATE printjobs
SET jobstatus = 'Printing',
    startedat = NOW()
WHERE jobid = 1;
```

**Kiểm tra**:

```sql
SELECT jobid, jobstatus, startedat
FROM printjobs
WHERE printerid = 1
ORDER BY jobid;
```

**Expected**:

```
jobid | jobstatus | startedat
------|-----------|----------
1     | Printing  | 2024-12-23 14:05:00
2     | Pending   | NULL
3     | Pending   | NULL
```

✅ **PASS**: Job 1 đang in, Job 2 và 3 vẫn chờ!

### Bước 3: Giả Lập Job 1 In Xong

```sql
-- Chuyển sang Completed
UPDATE printjobs
SET jobstatus = 'Completed',
    completedat = NOW()
WHERE jobid = 1;

-- Release reserves và deduct actual paper
UPDATE printers
SET a4paperreserved = a4paperreserved - 50,  -- Release reserve
    a4paperremaining = a4paperremaining - 50  -- Deduct actual
WHERE printerid = 1;
```

**Kiểm tra**:

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
a4paperremaining | a4paperreserved | available
-----------------|-----------------|----------
50               | 40              | 10
```

✅ **PASS**:

- Remaining giảm 50 (đã in thật)
- Reserved giảm 50 (đã release)
- Available = 50 - 40 = 10

### Bước 4: Giả Lập Job 2 Bắt Đầu In

```sql
UPDATE printjobs
SET jobstatus = 'Printing',
    startedat = NOW()
WHERE jobid = 2;
```

### Bước 5: Giả Lập Job 2 In Xong

```sql
UPDATE printjobs
SET jobstatus = 'Completed',
    completedat = NOW()
WHERE jobid = 2;

UPDATE printers
SET a4paperreserved = a4paperreserved - 40,
    a4paperremaining = a4paperremaining - 40
WHERE printerid = 1;
```

**Kiểm tra**:

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
a4paperremaining | a4paperreserved | available
-----------------|-----------------|----------
10               | 10              | 0
```

✅ **PASS**: Còn đúng 10 tờ cho Job 3!

### Bước 6: Giả Lập Job 3 In Xong

```sql
UPDATE printjobs
SET jobstatus = 'Printing',
    startedat = NOW()
WHERE jobid = 3;

-- In xong
UPDATE printjobs
SET jobstatus = 'Completed',
    completedat = NOW()
WHERE jobid = 3;

UPDATE printers
SET a4paperreserved = a4paperreserved - 10,
    a4paperremaining = a4paperremaining - 10
WHERE printerid = 1;
```

**Kiểm tra cuối cùng**:

```sql
-- Xem tất cả jobs
SELECT jobid, studentid, jobstatus,
       (totalsheetsused * numcopies) as sheets
FROM printjobs
WHERE printerid = 1
ORDER BY jobid;
```

**Expected**:

```
jobid | studentid | jobstatus | sheets
------|-----------|-----------|-------
1     | 2252001   | Completed | 50
2     | 2252002   | Completed | 40
3     | 2252003   | Completed | 10
```

```sql
-- Xem máy in
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
a4paperremaining | a4paperreserved | available
-----------------|-----------------|----------
0                | 0               | 0
```

✅ **PASS**: Tất cả jobs hoàn tất, giấy hết đúng!

---

## Test Case 3: Cancel Job - Release Reserves

### Bước 1: Reset và Tạo Jobs Mới

```sql
-- Reset
UPDATE printers
SET a4paperremaining = 100,
    a4paperreserved = 0
WHERE printerid = 1;

DELETE FROM printjobs WHERE printerid = 1;
```

**Qua UI**: Tạo 3 jobs (50, 40, 10 tờ) như trước

### Bước 2: Kiểm Tra Trước Khi Cancel

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
remaining=100, reserved=100, available=0
```

### Bước 3: Cancel Job 2 (40 Tờ)

**Qua UI**:

1. Đăng nhập Student B (owner của Job 2)
2. Vào "Lịch sử in"
3. Click "Hủy" trên Job 2

**Hoặc giả lập bằng SQL**:

```sql
-- Chuyển sang Cancelled
UPDATE printjobs
SET jobstatus = 'Cancelled'
WHERE jobid = 2;

-- Release reserves (KHÔNG trừ remaining vì chưa in)
UPDATE printers
SET a4paperreserved = a4paperreserved - 40
WHERE printerid = 1;
```

**Kiểm tra**:

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
a4paperremaining | a4paperreserved | available
-----------------|-----------------|----------
100              | 60              | 40
```

✅ **PASS**:

- Remaining KHÔNG đổi (100) - vì chưa in
- Reserved giảm 40 - đã release
- Available tăng lên 40 - có thể dùng cho jobs khác!

### Bước 4: User D Gửi 40 Tờ (Giờ Thành Công)

**Qua UI**: Gửi 40 copies

**Expected**: ✅ Thành công vì available=40!

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
remaining=100, reserved=100, available=0
```

✅ **PASS**: Cancel job đã giải phóng reserves cho user khác!

---

## Test Case 4: SPSO Refill - Chặn Khi Có Jobs Active

### Bước 1: Kiểm Tra Số Jobs Active

```sql
SELECT COUNT(*) as active_jobs
FROM printjobs
WHERE printerid = 1
  AND jobstatus IN ('Pending', 'Printing');
```

**Expected**: `active_jobs = 3` (hoặc bất kỳ số nào > 0)

### Bước 2: SPSO Cố Refill

**Qua UI**:

1. Đăng nhập SPSO
2. Vào "Quản lý máy in"
3. Click "Nạp giấy/mực" trên Printer ID=1
4. Chọn "Giấy A4"
5. Click "Xác nhận nạp"

**Expected**: ❌ Alert:

```
"Không thể nạp giấy/mực vì máy in đang có 3 lệnh in đang xử lý.
Vui lòng đợi tất cả lệnh in hoàn tất rồi thử lại."
```

✅ **PASS**: SPSO bị chặn!

### Bước 3: Giả Lập Tất Cả Jobs Hoàn Tất

```sql
-- Chuyển tất cả jobs sang Completed
UPDATE printjobs
SET jobstatus = 'Completed',
    completedat = NOW()
WHERE printerid = 1
  AND jobstatus IN ('Pending', 'Printing');

-- Giả lập đã trừ hết giấy và release hết reserves
UPDATE printers
SET a4paperremaining = 0,
    a4paperreserved = 0
WHERE printerid = 1;
```

**Kiểm tra**:

```sql
SELECT COUNT(*) as active_jobs
FROM printjobs
WHERE printerid = 1
  AND jobstatus IN ('Pending', 'Printing');
```

**Expected**: `active_jobs = 0`

### Bước 4: SPSO Refill Lại (Giờ Thành Công)

**Qua UI**: Click "Nạp giấy/mực" lại

**Expected**: ✅ Alert: "Nạp giấy/mực thành công!"

**Kiểm tra**:

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
a4paperremaining | a4paperreserved | available
-----------------|-----------------|----------
500              | 0               | 500
```

✅ **PASS**: Refill thành công khi không có jobs active!

---

## Test Case 5: Job Retry (Giả Lập)

### Bước 1: Tạo Job Mới

**Qua UI**: Gửi 1 job bất kỳ

### Bước 2: Giả Lập Job Fail Lần 1

```sql
-- Chuyển sang Printing
UPDATE printjobs
SET jobstatus = 'Printing',
    startedat = NOW()
WHERE jobid = 1;

-- Giả lập fail, chuyển về Pending với retry note
UPDATE printjobs
SET jobstatus = 'Pending',
    notes = 'Retry: 1'
WHERE jobid = 1;
```

**Kiểm tra**:

```sql
SELECT jobid, jobstatus, notes
FROM printjobs
WHERE jobid = 1;
```

**Expected**:

```
jobid | jobstatus | notes
------|-----------|-------
1     | Pending   | Retry: 1
```

✅ **PASS**: Job quay về Pending để retry!

### Bước 3: Giả Lập Retry Lần 2 và 3

Lặp lại với `notes = 'Retry: 2'` và `notes = 'Retry: 3'`

### Bước 4: Giả Lập Fail Lần Cuối

```sql
-- Sau retry lần 3, chuyển sang Failed
UPDATE printjobs
SET jobstatus = 'Failed',
    notes = 'Đã thử 3 lần nhưng thất bại'
WHERE jobid = 1;

-- Release reserves (vì không in được)
UPDATE printers
SET a4paperreserved = a4paperreserved - 50  -- Giả sử job này 50 tờ
WHERE printerid = 1;
```

**Kiểm tra**:

```sql
SELECT jobid, jobstatus, notes
FROM printjobs
WHERE jobid = 1;
```

**Expected**:

```
jobid | jobstatus | notes
------|-----------|-------
1     | Failed    | Đã thử 3 lần nhưng thất bại
```

```sql
SELECT a4paperreserved
FROM printers
WHERE printerid = 1;
```

**Expected**: Reserved đã giảm (đã release)

✅ **PASS**: Job failed và reserves được giải phóng!

---

## Tổng Kết Test Results

### Checklist

- [ ] **Test 1**: Reserve mechanism ngăn race condition ✅
- [ ] **Test 2**: Jobs xử lý tuần tự (Pending → Printing → Completed) ✅
- [ ] **Test 3**: Cancel job release reserves đúng ✅
- [ ] **Test 4**: SPSO bị chặn refill khi có jobs active ✅
- [ ] **Test 5**: Job retry và fail đúng ✅

### Kết Luận

Nếu tất cả tests PASS:

- ✅ Reserve mechanism hoạt động đúng
- ✅ Không có race condition
- ✅ Reserves được quản lý chính xác
- ✅ SPSO refill logic đúng

---

## Script SQL Tổng Hợp (Copy & Paste)

```sql
-- ============================================
-- RESET DATABASE
-- ============================================
UPDATE printers
SET a4paperremaining = 100,
    a4paperreserved = 0,
    a3paperreserved = 0,
    tonerblackremaining = 100,
    tonerblackreserved = 0,
    status = 'Active'
WHERE printerid = 1;

DELETE FROM printjobs WHERE printerid = 1;

-- ============================================
-- KIỂM TRA TRẠNG THÁI
-- ============================================
SELECT printerid, printername,
       a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;

-- ============================================
-- XEM TẤT CẢ JOBS
-- ============================================
SELECT jobid, studentid, jobstatus,
       totalsheetsused, numcopies,
       (totalsheetsused * numcopies) as total_sheets,
       submittedat, startedat, completedat
FROM printjobs
WHERE printerid = 1
ORDER BY jobid;

-- ============================================
-- GIẢI LẬP JOB HOÀN TẤT
-- ============================================
-- Job bắt đầu in
UPDATE printjobs
SET jobstatus = 'Printing',
    startedat = NOW()
WHERE jobid = ?;

-- Job in xong
UPDATE printjobs
SET jobstatus = 'Completed',
    completedat = NOW()
WHERE jobid = ?;

-- Release reserves và deduct paper
UPDATE printers
SET a4paperreserved = a4paperreserved - ?,  -- sheets
    a4paperremaining = a4paperremaining - ?  -- sheets
WHERE printerid = 1;

-- ============================================
-- GIẢI LẬP CANCEL JOB
-- ============================================
UPDATE printjobs
SET jobstatus = 'Cancelled'
WHERE jobid = ?;

UPDATE printers
SET a4paperreserved = a4paperreserved - ?  -- sheets
WHERE printerid = 1;

-- ============================================
-- KIỂM TRA JOBS ACTIVE
-- ============================================
SELECT COUNT(*) as active_jobs
FROM printjobs
WHERE printerid = 1
  AND jobstatus IN ('Pending', 'Printing');
```
