# Mock Printing Mode - Giả Lập In Ấn

## Tổng Quan

Mock Printing Mode cho phép test hệ thống **KHÔNG CẦN MÁY IN THẬT**. Mỗi job sẽ tự động "in thành công" sau một khoảng thời gian cố định.

## Cấu Hình

### File: `application.properties`

```properties
# Bật Print Queue
print.queue.enabled=true

# Scan mỗi 5 giây (để test nhanh)
print.queue.scan-interval-seconds=5

# BẬT MOCK MODE
print.queue.mock-mode=true

# Mỗi job "in" trong 30 giây
print.queue.mock-print-duration-seconds=30
```

## Cách Hoạt Động

### Timeline Ví Dụ

```
T0: User A gửi Job 1 (50 tờ)
    → Job 1: Pending
    → Reserved: 50 tờ

T5: PrintQueue scan
    → Job 1: Pending → Printing
    → Bắt đầu "in" (mock)
    → Log: "Job 1 will complete after 30 seconds"

T35: Job 1 "in xong" (sau 30s)
    → Job 1: Printing → Completed
    → Release 50 tờ reserve
    → Deduct 50 tờ actual
    → Log: "Job 1 mock printing completed successfully!"

T40: PrintQueue scan
    → Tìm Job 2 (nếu có)
    → Job 2: Pending → Printing
    → Bắt đầu "in" Job 2...
```

## So Sánh Mock vs Real Mode

| Feature         | Mock Mode        | Real Mode   |
| --------------- | ---------------- | ----------- |
| Cần máy in thật | ❌ Không         | ✅ Có       |
| Thời gian in    | Cố định (30s)    | Tùy máy in  |
| Kết quả         | Luôn thành công  | Có thể fail |
| Dùng để         | Test/Development | Production  |

## Test Scenarios

### Scenario 1: Test Reserve Mechanism

```
1. Gửi 3 jobs (50, 40, 10 tờ) - máy in có 100 tờ
2. Tất cả jobs: Pending, Reserved = 100
3. Sau 5s: Job 1 → Printing
4. Sau 35s: Job 1 → Completed, Reserved = 50
5. Sau 40s: Job 2 → Printing
6. Sau 70s: Job 2 → Completed, Reserved = 10
7. Sau 75s: Job 3 → Printing
8. Sau 105s: Job 3 → Completed, Reserved = 0
```

### Scenario 2: Test SPSO Refill

```
1. Gửi 2 jobs
2. Job 1 đang Printing (đang "in")
3. SPSO cố refill → ❌ Bị chặn
4. Đợi Job 1 hoàn tất (30s)
5. Job 2 đang Printing
6. SPSO cố refill → ❌ Vẫn bị chặn
7. Đợi Job 2 hoàn tất
8. SPSO refill → ✅ Thành công
```

### Scenario 3: Test Cancel Job

```
1. Gửi Job A (50 tờ) → Pending, Reserved = 50
2. Gửi Job B (40 tờ) → Pending, Reserved = 90
3. Sau 5s: Job A → Printing (đang "in")
4. User B cancel Job B
   → Job B: Cancelled
   → Reserved = 50 (đã release 40)
5. User C gửi Job C (40 tờ) → ✅ Thành công (available = 50)
6. Sau 35s: Job A hoàn tất
7. Sau 40s: Job C → Printing
```

## Logs Mẫu

### Khi Bật Mock Mode

```
2024-12-23 15:00:00 - Scanning for pending print jobs...
2024-12-23 15:00:00 - Found 1 pending print jobs. Processing...
2024-12-23 15:00:00 - Job 1: Pending → Printing
2024-12-23 15:00:00 - ========== MOCK PRINTING MODE ==========
2024-12-23 15:00:00 - Job 1 will complete after 30 seconds
2024-12-23 15:00:30 - Job 1 mock printing completed successfully!
2024-12-23 15:00:30 - Job 1 completed successfully on printer 1
2024-12-23 15:00:30 - Deducted 50 sheets of A4. Remaining: 50
2024-12-23 15:00:30 - Released 50 sheets of A4 and toner for 50 pages from reserves
```

### Khi Tắt Mock Mode (Real)

```
2024-12-23 15:00:00 - Scanning for pending print jobs...
2024-12-23 15:00:00 - Found 1 pending print jobs. Processing...
2024-12-23 15:00:00 - Job 1: Pending → Printing
2024-12-23 15:00:00 - Cannot connect to printer at 192.168.1.101
2024-12-23 15:00:00 - Job 1 failed, will retry (1/3)
```

## Cách Test

### Bước 1: Cấu Hình

Đảm bảo `application.properties` có:

```properties
print.queue.enabled=true
print.queue.scan-interval-seconds=5
print.queue.mock-mode=true
print.queue.mock-print-duration-seconds=30
```

### Bước 2: Restart Backend

```bash
cd backend
mvn spring-boot:run
```

Xem logs, phải thấy:

```
Print queue processing is enabled
```

### Bước 3: Gửi Jobs

1. Đăng nhập Student
2. Upload document
3. Gửi lệnh in
4. Quan sát logs backend

### Bước 4: Quan Sát

**Trong 5 giây đầu**:

- Job: Pending
- Reserves: Đã tăng

**Sau 5 giây**:

- Job: Printing
- Logs: "Job X will complete after 30 seconds"

**Sau 35 giây**:

- Job: Completed
- Reserves: Đã giảm
- Remaining: Đã trừ
- Logs: "Job X mock printing completed successfully!"

### Bước 5: Kiểm Tra Database

```sql
-- Xem job status
SELECT jobid, jobstatus, startedat, completedat
FROM printjobs
WHERE printerid = 1
ORDER BY jobid DESC;

-- Xem reserves
SELECT a4paperremaining, a4paperreserved,
       (a4paperremaining - a4paperreserved) as available
FROM printers
WHERE printerid = 1;
```

## Tuỳ Chỉnh Thời Gian In

### In Nhanh (10 giây)

```properties
print.queue.mock-print-duration-seconds=10
```

### In Chậm (60 giây)

```properties
print.queue.mock-print-duration-seconds=60
```

### In Tức Thì (0 giây) - Không khuyến nghị

```properties
print.queue.mock-print-duration-seconds=0
```

⚠️ **Lưu ý**: Nếu set = 0, jobs sẽ hoàn tất ngay lập tức, khó quan sát trạng thái "Printing".

## Tắt Mock Mode (Chuyển Sang Real)

```properties
print.queue.mock-mode=false
```

Restart backend. Giờ hệ thống sẽ cố kết nối máy in thật qua IP.

## Troubleshooting

### Jobs Không Chuyển Sang Printing

**Nguyên nhân**: Print queue chưa bật

**Giải pháp**:

```properties
print.queue.enabled=true
```

### Jobs Chuyển Sang Failed Ngay

**Nguyên nhân**: Mock mode chưa bật

**Giải pháp**:

```properties
print.queue.mock-mode=true
```

### Jobs "In" Quá Lâu

**Nguyên nhân**: Duration set quá cao

**Giải pháp**:

```properties
print.queue.mock-print-duration-seconds=10  # Giảm xuống 10s
```

## Production Setup

Khi deploy production với máy in thật:

```properties
print.queue.enabled=true
print.queue.scan-interval-seconds=30  # Tăng lên 30s
print.queue.mock-mode=false           # TẮT mock mode
print.queue.max-retry-attempts=3
print.queue.connection-timeout-seconds=10
```

## Summary

- ✅ Mock mode giúp test KHÔNG CẦN máy in thật
- ✅ Mỗi job tự động "in thành công" sau X giây (mặc định 30s)
- ✅ Dễ dàng test reserve mechanism, cancel, refill
- ✅ Quan sát được toàn bộ luồng: Pending → Printing → Completed
- ✅ Logs rõ ràng, dễ debug
- ✅ **Frontend tự động refresh mỗi 5s** khi có jobs Pending/Printing
- ✅ **Status "Printing" commit ngay vào DB** (dùng REQUIRES_NEW transaction)

## Transaction Fix (Quan Trọng!)

**Vấn đề cũ**: Status "Printing" không hiện vì transaction chỉ commit sau khi method kết thúc (sau 30s).

**Giải pháp**: Dùng `@Transactional(propagation = REQUIRES_NEW)` để tạo transaction riêng:

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
private void updateJobStatusAndCommit(PrintJob job, String status, String notes) {
    job.setJobStatus(status);
    job.setStartedAt(LocalDateTime.now());
    printJobRepository.saveAndFlush(job); // Commit ngay
    log.info("Job {} status updated to {} and committed to database", job.getJobId(), status);
}
```

Giờ status "Printing" được commit ngay vào DB, frontend có thể thấy ngay lập tức!

## Frontend Auto-Refresh

Frontend tự động refresh mỗi 5 giây khi có jobs **Pending** hoặc **Printing**:

```typescript
useEffect(() => {
  const hasActiveJobs = jobs.some(
    (job) => job.jobStatus === "Pending" || job.jobStatus === "Printing"
  );

  if (!hasActiveJobs) {
    return; // Không cần refresh nếu không có job đang chạy
  }

  // Refresh mỗi 5 giây
  const intervalId = setInterval(() => {
    console.log("Auto-refreshing print history...");
    loadPrintHistory();
  }, 5000);

  return () => clearInterval(intervalId);
}, [jobs]);
```

**Lợi ích**:

- ✅ Không cần F5 thủ công
- ✅ Tự động dừng refresh khi tất cả jobs đã Completed/Failed/Cancelled
- ✅ Console log: "Auto-refreshing print history..."
