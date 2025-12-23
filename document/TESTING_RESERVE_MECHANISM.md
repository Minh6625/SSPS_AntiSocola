# Testing Guide: Reserve Mechanism & Print Queue

## Chuẩn Bị

### 1. Cấu Hình Backend

File `application.properties` đã được set:

```properties
print.queue.enabled=true
print.queue.scan-interval-seconds=5  # Scan mỗi 5 giây (thay vì 30s)
```

### 2. Restart Backend

```bash
cd backend
mvn spring-boot:run
```

Xem logs, phải thấy:

```
Print queue processing is enabled
Scanning for pending print jobs...
```

### 3. Chuẩn Bị Database

Chọn 1 máy in để test (ví dụ: PrinterID = 1):

```sql
-- Reset máy in về trạng thái sạch
UPDATE printers
SET a4paperremaining = 100,
    a4paperreserved = 0,
    tonerblackremaining = 100,
    tonerblackreserved = 0,
    status = 'Active'
WHERE printerid = 1;

-- Xóa các jobs cũ (optional)
DELETE FROM printjobs WHERE printerid = 1;
```

---

## Test Case 1: Reserve Mechanism - Ngăn Chặn Race Condition

### Mục Tiêu

Kiểm tra hệ thống có ngăn được nhiều user cùng gửi lệnh in không.

### Các Bước

#### Bước 1: Kiểm Tra Trạng Thái Ban Đầu

```sql
SELECT printerid, printername,
       a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
printerid | printername | a4paperremaining | a4paperreserved | available
----------|-------------|------------------|-----------------|----------
1         | Máy in...   | 100              | 0               | 100
```

#### Bước 2: User A Gửi Lệnh In 50 Tờ

1. Đăng nhập với **Student A** (ví dụ: 2252001)
2. Upload 1 document
3. Gửi lệnh in:

   - Printer: Máy in ID=1
   - Paper: A4
   - Copies: 50
   - Duplex: No (để dễ tính)

4. Kiểm tra database:

```sql
-- Xem job vừa tạo
SELECT jobid, studentid, jobstatus, totalsheetsused, numcopies
FROM printjobs
WHERE printerid = 1
ORDER BY jobid DESC
LIMIT 1;

-- Xem reserves
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
Job: jobid=1, status=Pending, sheets=50
Printer: remaining=100, reserved=50, available=50
```

#### Bước 3: User B Gửi Lệnh In 40 Tờ (Ngay Sau Đó)

1. Đăng nhập với **Student B** (ví dụ: 2252002)
2. Upload 1 document
3. Gửi lệnh in:

   - Printer: Máy in ID=1
   - Paper: A4
   - Copies: 40
   - Duplex: No

4. Kiểm tra database:

```sql
SELECT jobid, studentid, jobstatus, totalsheetsused
FROM printjobs
WHERE printerid = 1
ORDER BY jobid DESC
LIMIT 2;

SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
Jobs:
  jobid=1, student=2252001, status=Pending, sheets=50
  jobid=2, student=2252002, status=Pending, sheets=40

Printer: remaining=100, reserved=90, available=10
```

#### Bước 4: User C Cố Gửi 20 Tờ (Sẽ Thành Công)

1. Đăng nhập với **Student C** (ví dụ: 2252003)
2. Gửi lệnh in 20 tờ

**Expected**: ✅ Thành công (vì available=10 < 20... wait, 10 < 20 nên sẽ FAIL!)

Sửa lại: Gửi **10 tờ**

**Expected**: ✅ Thành công

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
Printer: remaining=100, reserved=100, available=0
```

#### Bước 5: User D Cố Gửi 5 Tờ (Sẽ Bị Reject)

1. Đăng nhập với **Student D**
2. Gửi lệnh in 5 tờ

**Expected**: ❌ Lỗi: "Máy in không đủ giấy A4. Cần 5 tờ, còn 0 tờ khả dụng"

---

## Test Case 2: Print Queue - Xử Lý Jobs Tuần Tự

### Mục Tiêu

Kiểm tra PrintQueue xử lý jobs theo thứ tự và cập nhật trạng thái đúng.

### Các Bước

#### Bước 1: Quan Sát Backend Logs

Mở terminal backend, xem logs:

```
T+0s: Scanning for pending print jobs...
T+0s: Found 3 pending print jobs. Processing...
T+0s: Job 1 is not in Pending status. Current status: Pending
      (Lần đầu scan, job vẫn Pending)
```

#### Bước 2: Sau 5 Giây - Job 1 Bắt Đầu In

```
T+5s: Scanning for pending print jobs...
T+5s: Found 3 pending print jobs. Processing...
T+5s: Job 1: Pending → Printing
T+5s: Sending job 1 to printer...
```

Kiểm tra database:

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
1     | Printing  | 2024-12-23 14:30:00
2     | Pending   | NULL
3     | Pending   | NULL
```

#### Bước 3: Giả Lập Job 1 In Xong

Vì không có máy in thật, ta giả lập bằng SQL:

```sql
-- Giả lập job 1 in xong
UPDATE printjobs
SET jobstatus = 'Completed',
    completedat = NOW()
WHERE jobid = 1;

-- Giả lập trừ giấy và release reserves
UPDATE printers
SET a4paperremaining = a4paperremaining - 50,  -- Trừ 50 tờ
    a4paperreserved = a4paperreserved - 50     -- Release 50 tờ reserve
WHERE printerid = 1;
```

Kiểm tra:

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
remaining=50, reserved=40, available=10
```

#### Bước 4: Sau 5 Giây - Job 2 Bắt Đầu In

```
T+10s: Scanning for pending print jobs...
T+10s: Found 2 pending print jobs. Processing...
T+10s: Job 2: Pending → Printing
```

Kiểm tra:

```sql
SELECT jobid, jobstatus
FROM printjobs
WHERE printerid = 1
ORDER BY jobid;
```

**Expected**:

```
jobid | jobstatus
------|----------
1     | Completed
2     | Printing
3     | Pending
```

#### Bước 5: Giả Lập Job 2 In Xong

```sql
UPDATE printjobs
SET jobstatus = 'Completed',
    completedat = NOW()
WHERE jobid = 2;

UPDATE printers
SET a4paperremaining = a4paperremaining - 40,
    a4paperreserved = a4paperreserved - 40
WHERE printerid = 1;
```

**Expected**:

```
remaining=10, reserved=10, available=0
```

#### Bước 6: Job 3 Bắt Đầu In

Sau 5 giây nữa, Job 3 (10 tờ) sẽ bắt đầu in.

---

## Test Case 3: Cancel Job - Release Reserves

### Mục Tiêu

Kiểm tra khi cancel job, reserves được giải phóng đúng.

### Các Bước

#### Bước 1: Tạo Job Mới

User E gửi lệnh in 20 tờ (giả sử máy in còn 10 tờ, reserved=10)

**Expected**: ❌ Bị reject vì available=0

#### Bước 2: Cancel Job 3

1. Đăng nhập với Student C (owner của Job 3)
2. Vào trang "Lịch sử in"
3. Click "Hủy" trên Job 3 (đang Pending)

Hoặc dùng SQL:

```sql
-- Giả lập cancel
UPDATE printjobs
SET jobstatus = 'Cancelled'
WHERE jobid = 3;

-- Release reserves
UPDATE printers
SET a4paperreserved = a4paperreserved - 10
WHERE printerid = 1;
```

Kiểm tra:

```sql
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
remaining=10, reserved=0, available=10
```

#### Bước 3: User E Gửi Lại

Giờ User E gửi lại 10 tờ → ✅ Thành công!

---

## Test Case 4: SPSO Refill - Chặn Khi Có Jobs Active

### Mục Tiêu

Kiểm tra SPSO không thể refill khi có jobs đang chạy.

### Các Bước

#### Bước 1: Tạo 2 Jobs Pending

User A và User B gửi lệnh in.

```sql
SELECT COUNT(*)
FROM printjobs
WHERE printerid = 1
  AND jobstatus IN ('Pending', 'Printing');
```

**Expected**: Count = 2

#### Bước 2: SPSO Cố Refill

1. Đăng nhập SPSO
2. Vào trang quản lý máy in
3. Click "Nạp giấy/mực" trên máy in ID=1
4. Chọn "Giấy A4"
5. Click "Xác nhận nạp"

**Expected**: ❌ Alert: "Không thể nạp giấy/mực vì máy in đang có 2 lệnh in đang xử lý. Vui lòng đợi tất cả lệnh in hoàn tất rồi thử lại."

#### Bước 3: Đợi Jobs Hoàn Tất

Đợi hoặc giả lập jobs hoàn tất:

```sql
UPDATE printjobs
SET jobstatus = 'Completed'
WHERE printerid = 1
  AND jobstatus IN ('Pending', 'Printing');
```

#### Bước 4: SPSO Refill Lại

Giờ refill sẽ thành công!

```sql
SELECT a4paperremaining, a4paperreserved
FROM printers
WHERE printerid = 1;
```

**Expected**:

```
remaining=500, reserved=0
```

---

## Test Case 5: Job Retry Sau Khi Fail

### Mục Tiêu

Kiểm tra job tự động retry khi in thất bại.

### Các Bước

#### Bước 1: Giả Lập Job Fail

```sql
-- Giả lập job đang printing
UPDATE printjobs
SET jobstatus = 'Printing',
    startedat = NOW()
WHERE jobid = 1;

-- Sau đó giả lập fail (chuyển về Pending với retry note)
UPDATE printjobs
SET jobstatus = 'Pending',
    notes = 'Retry: 1'
WHERE jobid = 1;
```

#### Bước 2: Quan Sát Logs

Sau 5 giây, PrintQueue sẽ retry:

```
T+5s: Job 1: Pending → Printing (retry 1/3)
```

#### Bước 3: Giả Lập Fail Lần 2 và 3

Lặp lại bước 1 với `notes = 'Retry: 2'` và `notes = 'Retry: 3'`

#### Bước 4: Fail Lần Cuối

Sau retry lần 3, job sẽ chuyển sang Failed:

```sql
SELECT jobid, jobstatus, notes
FROM printjobs
WHERE jobid = 1;
```

**Expected**:

```
jobid | jobstatus | notes
------|-----------|------
1     | Failed    | Đã thử 3 lần nhưng thất bại
```

Và reserves được release:

```sql
SELECT a4paperreserved
FROM printers
WHERE printerid = 1;
```

**Expected**: Reserved giảm đi (đã release)

---

## Checklist Tổng Hợp

- [ ] Reserve mechanism ngăn chặn race condition
- [ ] Jobs được xử lý tuần tự (Pending → Printing → Completed)
- [ ] Reserves được release khi job hoàn tất
- [ ] Reserves được release khi cancel job
- [ ] SPSO không thể refill khi có jobs active
- [ ] SPSO có thể refill khi không có jobs active
- [ ] Job tự động retry khi fail (tối đa 3 lần)
- [ ] Job chuyển sang Failed sau max retries
- [ ] Reserves được release khi job failed

---

## Sau Khi Test Xong

Nhớ set lại config về production:

```properties
print.queue.enabled=true
print.queue.scan-interval-seconds=30  # Về lại 30s
```

Restart backend!
