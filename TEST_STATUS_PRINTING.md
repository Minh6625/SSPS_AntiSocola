# Test: Kiểm Tra Status "Printing" Có Được Commit Vào DB Không

## Vấn Đề Hiện Tại

Backend log hiển thị:

```
Job 23 status updated to Printing and committed to database
```

Nhưng frontend không thấy status "Printing", chỉ thấy "Pending" → "Completed".

## Nguyên Nhân Có Thể

### 1. Spring AOP Proxy Issue

Khi gọi `updateJobStatusAndCommit()` từ cùng class, Spring AOP proxy KHÔNG được kích hoạt, nên `@Transactional(propagation = REQUIRES_NEW)` KHÔNG hoạt động!

**Giải thích**:

```java
@Service
public class PrintQueueServiceImpl {

    @Transactional // Transaction A
    public boolean sendJobToPrinter(Integer jobId) {
        // ...
        updateJobStatusAndCommit(job, "Printing", null); // ❌ Gọi trực tiếp, KHÔNG qua proxy!
        // ...
    }

    @Transactional(propagation = REQUIRES_NEW) // Transaction B - KHÔNG hoạt động!
    private void updateJobStatusAndCommit(...) {
        printJobRepository.saveAndFlush(job);
    }
}
```

Khi gọi `this.updateJobStatusAndCommit()`, nó gọi trực tiếp method, KHÔNG qua Spring proxy, nên annotation `@Transactional(propagation = REQUIRES_NEW)` bị bỏ qua!

### 2. Frontend Cache

Frontend có thể đang cache response từ API.

## Giải Pháp

### Option 1: Tách Ra Service Riêng (Recommended)

Tạo `PrintJobStatusService` riêng:

```java
@Service
public class PrintJobStatusService {

    private final PrintJobRepository printJobRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateStatusAndCommit(PrintJob job, String status, String notes) {
        job.setJobStatus(status);
        job.setStartedAt(LocalDateTime.now());
        if (notes != null) {
            job.setNotes(notes);
        }
        printJobRepository.saveAndFlush(job);
        log.info("Job {} status updated to {} and committed", job.getJobId(), status);
    }
}
```

Sau đó inject vào `PrintQueueServiceImpl`:

```java
@Service
public class PrintQueueServiceImpl {

    private final PrintJobStatusService statusService; // Inject

    @Transactional
    public boolean sendJobToPrinter(Integer jobId) {
        // ...
        statusService.updateStatusAndCommit(job, "Printing", null); // ✅ Qua proxy!
        // ...
    }
}
```

### Option 2: Self-Injection

Inject chính class vào chính nó:

```java
@Service
public class PrintQueueServiceImpl {

    @Autowired
    @Lazy
    private PrintQueueServiceImpl self; // Self-injection

    @Transactional
    public boolean sendJobToPrinter(Integer jobId) {
        // ...
        self.updateJobStatusAndCommit(job, "Printing", null); // ✅ Qua proxy!
        // ...
    }

    @Transactional(propagation = REQUIRES_NEW)
    public void updateJobStatusAndCommit(...) { // Phải public!
        // ...
    }
}
```

### Option 3: ApplicationContext

```java
@Service
public class PrintQueueServiceImpl implements ApplicationContextAware {

    private ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext context) {
        this.applicationContext = context;
    }

    @Transactional
    public boolean sendJobToPrinter(Integer jobId) {
        // ...
        PrintQueueServiceImpl proxy = applicationContext.getBean(PrintQueueServiceImpl.class);
        proxy.updateJobStatusAndCommit(job, "Printing", null); // ✅ Qua proxy!
        // ...
    }
}
```

## Test Để Xác Nhận

### Test 1: Kiểm Tra DB Trực Tiếp

Trong khi job đang "in" (30s), query DB:

```sql
SELECT job_id, job_status, started_at
FROM print_jobs
WHERE job_id = 23;
```

**Kết quả mong đợi**:

- Nếu fix đúng: `job_status = 'Printing'`, `started_at = NOW()`
- Nếu chưa fix: `job_status = 'Pending'`, `started_at = NULL`

### Test 2: Thêm Log Sau Save

```java
@Transactional(propagation = REQUIRES_NEW)
private void updateJobStatusAndCommit(...) {
    printJobRepository.saveAndFlush(job);
    log.info("Job {} status updated to {} and committed", job.getJobId(), status);

    // Verify ngay lập tức
    PrintJob verified = printJobRepository.findById(job.getJobId()).orElse(null);
    log.info("VERIFY: Job {} status in DB = {}", job.getJobId(), verified.getJobStatus());
}
```

**Kết quả mong đợi**:

- Nếu fix đúng: `VERIFY: Job 23 status in DB = Printing`
- Nếu chưa fix: `VERIFY: Job 23 status in DB = Pending`

### Test 3: Frontend Console

Xem response từ API:

```javascript
console.log("Jobs from API:", jobs);
jobs.forEach((job) => {
  console.log(`Job ${job.jobId}: ${job.jobStatus}`);
});
```

## Khuyến Nghị

**Dùng Option 1** (tách service riêng) vì:

- ✅ Clean code, dễ maintain
- ✅ Tách concerns rõ ràng
- ✅ Dễ test
- ✅ Không có "magic" (self-injection)

## Next Steps

1. Implement Option 1 (tạo `PrintJobStatusService`)
2. Test bằng SQL query trong khi job đang in
3. Verify frontend nhận đúng status từ API
4. Nếu vẫn không work, check frontend cache
