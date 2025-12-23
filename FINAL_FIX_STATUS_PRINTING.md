# Final Fix: Status "Printing" Không Hiện - Spring AOP Proxy Issue

## Root Cause

**Spring AOP Proxy Issue**: Khi gọi `@Transactional(propagation = REQUIRES_NEW)` method từ cùng class, Spring AOP proxy KHÔNG được kích hoạt, nên transaction mới KHÔNG được tạo!

### Giải Thích Chi Tiết

```java
@Service
public class PrintQueueServiceImpl {

    @Transactional // Transaction A (30s)
    public boolean sendJobToPrinter(Integer jobId) {
        // ...
        this.updateJobStatusAndCommit(job, "Printing", null); // ❌ Gọi trực tiếp!
        // Transaction A vẫn đang chạy, chưa commit
        Thread.sleep(30000); // Mock printing
        // Transaction A commit ở đây (sau 30s)
    }

    @Transactional(propagation = REQUIRES_NEW) // ❌ KHÔNG hoạt động!
    private void updateJobStatusAndCommit(...) {
        printJobRepository.saveAndFlush(job);
        // Không tạo transaction mới vì gọi từ cùng class!
    }
}
```

**Vấn đề**:

- `this.updateJobStatusAndCommit()` gọi trực tiếp method, KHÔNG qua Spring proxy
- Annotation `@Transactional(propagation = REQUIRES_NEW)` bị bỏ qua
- Status "Printing" chỉ được commit sau khi Transaction A kết thúc (sau 30s)
- Frontend không thấy status "Printing" vì nó chỉ tồn tại trong memory, chưa vào DB

## Giải Pháp

Tạo service riêng `PrintJobStatusService` để xử lý update status:

### 1. Tạo PrintJobStatusService

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class PrintJobStatusService {

    private final PrintJobRepository printJobRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateStatusAndCommit(PrintJob job, String status, String notes) {
        job.setJobStatus(status);

        if ("Printing".equals(status)) {
            job.setStartedAt(LocalDateTime.now());
        } else if ("Completed".equals(status) || "Failed".equals(status)) {
            if (job.getStartedAt() == null) {
                job.setStartedAt(LocalDateTime.now());
            }
            job.setCompletedAt(LocalDateTime.now());
        }

        if (notes != null) {
            job.setNotes(notes);
        }

        printJobRepository.saveAndFlush(job);
        log.info("Job {} status updated to {} and committed to database", job.getJobId(), status);

        // Verify (for debugging)
        PrintJob verified = printJobRepository.findById(job.getJobId()).orElse(null);
        if (verified != null) {
            log.debug("VERIFY: Job {} status in DB = {}", job.getJobId(), verified.getJobStatus());
        }
    }
}
```

### 2. Inject Vào PrintQueueServiceImpl

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class PrintQueueServiceImpl implements IPrintQueueService {

    private final PrintJobRepository printJobRepository;
    private final PrinterRepository printerRepository;
    private final PrintJobStatusService statusService; // ✅ Inject service mới

    @Transactional
    public boolean sendJobToPrinter(Integer jobId) {
        // ...

        // ✅ Gọi qua service khác → Qua Spring proxy → REQUIRES_NEW hoạt động!
        statusService.updateStatusAndCommit(job, "Printing", null);

        // Transaction mới đã commit ở đây!
        // Status "Printing" đã vào DB!

        Thread.sleep(30000); // Mock printing
        // ...
    }
}
```

## Cách Hoạt Động

### Timeline Mới

```
T0: sendJobToPrinter() bắt đầu
    → Transaction A bắt đầu

T0.1: statusService.updateStatusAndCommit() được gọi
    → Spring proxy intercept
    → Transaction B bắt đầu (REQUIRES_NEW)
    → Update job.status = "Printing"
    → saveAndFlush()
    → Transaction B commit ✅
    → Status "Printing" ĐÃ VÀO DB!

T0.2: Thread.sleep(30000) bắt đầu
    → Transaction A vẫn đang chạy
    → Nhưng status "Printing" đã ở trong DB rồi!

T5: Frontend auto-refresh
    → Query DB
    → Thấy status = "Printing" ✅

T30: Mock printing hoàn tất
    → Update job.status = "Completed"
    → Transaction A commit
    → Status "Completed" vào DB

T35: Frontend auto-refresh
    → Query DB
    → Thấy status = "Completed" ✅
```

## Frontend Auto-Refresh Fix

Cũng fix luôn frontend để dùng `useRef` tránh re-create interval:

```typescript
const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  // Clear interval cũ
  if (refreshIntervalRef.current) {
    clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = null;
  }

  const hasActiveJobs = jobs.some(
    (job) => job.jobStatus === "Pending" || job.jobStatus === "Printing"
  );

  if (!hasActiveJobs) {
    console.log("No active jobs, auto-refresh stopped");
    return;
  }

  console.log("Active jobs detected, starting auto-refresh every 5 seconds");

  refreshIntervalRef.current = setInterval(() => {
    console.log("Auto-refreshing print history...");
    loadPrintHistory();
  }, 5000);

  return () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };
}, [jobs]);
```

## Files Đã Sửa

### Backend

1. **NEW**: `backend/src/main/java/com/example/app/service/PrintJobStatusService.java`

   - Service mới để xử lý update status
   - Method `updateStatusAndCommit()` với `@Transactional(propagation = REQUIRES_NEW)`

2. **UPDATED**: `backend/src/main/java/com/example/app/service/impl/PrintQueueServiceImpl.java`
   - Inject `PrintJobStatusService`
   - Đổi `updateJobStatusAndCommit()` thành `statusService.updateStatusAndCommit()`
   - Xóa method `updateJobStatusAndCommit()` cũ (không cần nữa)

### Frontend

3. **UPDATED**: `frontend/src/app/student/print-history/page.tsx`
   - Import `useRef`
   - Thêm `refreshIntervalRef` để track interval
   - Fix `useEffect` để tránh re-create interval không cần thiết
   - Thêm console logs để debug

## Test

### Bước 1: Restart Backend

```bash
cd backend
mvn clean compile spring-boot:run
```

### Bước 2: Gửi Job

1. Đăng nhập Student
2. Upload document
3. Gửi lệnh in

### Bước 3: Quan Sát Backend Logs

```
Job 23 status updated to Printing and committed to database
VERIFY: Job 23 status in DB = Printing
========== MOCK PRINTING MODE ==========
Job 23 will complete after 30 seconds
```

### Bước 4: Quan Sát Frontend Console

```
Active jobs detected, starting auto-refresh every 5 seconds
Auto-refreshing print history...
Auto-refreshing print history...
Auto-refreshing print history...
```

### Bước 5: Quan Sát UI

- **T0-5s**: "Đang chờ" (Pending)
- **T5-10s**: "Đang in" (Printing) ✅ ← Giờ sẽ thấy!
- **T10-15s**: "Đang in" (Printing)
- **T15-20s**: "Đang in" (Printing)
- **T20-25s**: "Đang in" (Printing)
- **T25-30s**: "Đang in" (Printing)
- **T30-35s**: "Thành công" (Completed) ✅

### Bước 6: Kiểm Tra DB (Optional)

Trong khi job đang in (5-30s), query DB:

```sql
SELECT job_id, job_status, started_at, completed_at
FROM print_jobs
WHERE job_id = 23;
```

**Kết quả mong đợi**:

```
job_id | job_status | started_at          | completed_at
-------|------------|---------------------|-------------
23     | Printing   | 2025-12-23 16:22:29 | NULL
```

## Tại Sao Fix Này Hoạt Động?

### Spring AOP Proxy

Spring sử dụng proxy để intercept method calls và apply transaction management:

```
Client → Spring Proxy → Target Object
         ↑
         Transaction management happens here
```

**Khi gọi từ cùng class**:

```
this.method() → Target Object (KHÔNG qua proxy!)
```

**Khi gọi từ class khác**:

```
otherService.method() → Spring Proxy → Target Object (✅ Qua proxy!)
```

### REQUIRES_NEW

`@Transactional(propagation = REQUIRES_NEW)` yêu cầu Spring:

1. Suspend transaction hiện tại (Transaction A)
2. Tạo transaction mới (Transaction B)
3. Commit Transaction B ngay khi method kết thúc
4. Resume Transaction A

Nhưng điều này CHỈ hoạt động khi gọi qua Spring proxy!

## Tóm Tắt

✅ **Root cause**: Spring AOP proxy issue - gọi `@Transactional(REQUIRES_NEW)` từ cùng class không hoạt động  
✅ **Solution**: Tách ra service riêng `PrintJobStatusService`  
✅ **Result**: Status "Printing" được commit ngay vào DB, frontend thấy real-time  
✅ **Bonus**: Frontend auto-refresh mỗi 5s, không cần F5 thủ công

Giờ hệ thống hoạt động đúng như mong đợi: Pending → Printing → Completed!
