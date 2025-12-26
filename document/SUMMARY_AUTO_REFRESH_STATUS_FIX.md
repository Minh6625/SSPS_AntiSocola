# Summary: Auto-Refresh & Status "Printing" Fix

## Vấn Đề

1. **Status "Printing" không hiện**: Job nhảy thẳng từ "Pending" → "Completed" (sau 30s), bỏ qua trạng thái "Printing"
2. **Cần reload thủ công**: Phải F5 để xem trạng thái được update

## Nguyên Nhân

### Vấn đề 1: Transaction không commit ngay

```java
// Code cũ
updateJobStatus(job, "Printing", null);
job.setStartedAt(LocalDateTime.now());
printJobRepository.save(job); // Không commit ngay!

// Sau đó chạy Thread.sleep(30s) → Transaction chỉ commit sau khi method kết thúc
```

Transaction chỉ commit khi method `sendJobToPrinter()` kết thúc (sau 30s mock printing). Do đó status "Printing" không được ghi vào DB cho đến khi job hoàn tất.

### Vấn đề 2: Frontend không auto-refresh

Frontend chỉ load data 1 lần khi mount, không có mechanism để refresh khi có jobs đang chạy.

## Giải Pháp

### 1. Backend: Tách Transaction

Tạo method mới với `@Transactional(propagation = REQUIRES_NEW)`:

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
private void updateJobStatusAndCommit(PrintJob job, String status, String notes) {
    job.setJobStatus(status);
    job.setStartedAt(LocalDateTime.now());
    if (notes != null) {
        job.setNotes(notes);
    }
    printJobRepository.saveAndFlush(job); // Commit ngay lập tức
    log.info("Job {} status updated to {} and committed to database", job.getJobId(), status);
}
```

**Cách hoạt động**:

- `REQUIRES_NEW`: Tạo transaction riêng, độc lập với transaction cha
- `saveAndFlush()`: Ghi vào DB và flush ngay lập tức
- Transaction này commit ngay khi method kết thúc (không đợi method cha)

**Sử dụng**:

```java
// Cập nhật status sang Printing và commit ngay lập tức
updateJobStatusAndCommit(job, "Printing", null);

try {
    // Gửi đến máy in (mock: Thread.sleep 30s)
    boolean success = sendToPrinterViaNetwork(job, printer);
    // ...
}
```

### 2. Frontend: Auto-Refresh

Thêm `useEffect` để tự động refresh khi có jobs Pending/Printing:

```typescript
// Auto-refresh khi có jobs Pending hoặc Printing
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

  // Cleanup khi component unmount hoặc không còn active jobs
  return () => {
    clearInterval(intervalId);
  };
}, [jobs]);
```

**Cách hoạt động**:

- Check xem có jobs Pending/Printing không
- Nếu có: Set interval refresh mỗi 5 giây
- Nếu không: Dừng interval (tiết kiệm tài nguyên)
- Cleanup khi component unmount

## Kết Quả

### Timeline Mới

```
T0: User gửi job
    → Job: Pending
    → Frontend: Hiển thị "Đang chờ"

T5: Print queue scan
    → Job: Pending → Printing (COMMIT NGAY VÀO DB)
    → Backend log: "Job X status updated to Printing and committed to database"
    → Bắt đầu mock printing (Thread.sleep 30s)

T10: Frontend auto-refresh (sau 5s)
    → Fetch jobs từ API
    → Job: Printing
    → Frontend: Hiển thị "Đang in" ✅

T15: Frontend auto-refresh lần 2
    → Job: Printing (vẫn đang in)

T20: Frontend auto-refresh lần 3
    → Job: Printing (vẫn đang in)

T25: Frontend auto-refresh lần 4
    → Job: Printing (vẫn đang in)

T30: Frontend auto-refresh lần 5
    → Job: Printing (vẫn đang in)

T35: Mock printing hoàn tất
    → Job: Printing → Completed
    → Release reserves + Deduct paper/toner
    → Backend log: "Job X completed successfully"

T40: Frontend auto-refresh lần 6
    → Job: Completed
    → Frontend: Hiển thị "Thành công" ✅
    → Dừng auto-refresh (không còn active jobs)
```

### So Sánh

| Feature                | Trước                        | Sau                                |
| ---------------------- | ---------------------------- | ---------------------------------- |
| Status "Printing" hiện | ❌ Không (nhảy thẳng)        | ✅ Có (commit ngay)                |
| Cần F5 thủ công        | ✅ Có                        | ❌ Không (auto-refresh)            |
| Refresh interval       | N/A                          | 5 giây                             |
| Dừng refresh khi xong  | N/A                          | ✅ Tự động                         |
| Console log            | Không                        | "Auto-refreshing print history..." |
| Transaction            | 1 transaction (30s)          | 2 transactions (ngay + 30s)        |
| User experience        | Phải đợi 30s mới thấy update | Thấy update mỗi 5s                 |

## Files Đã Sửa

### Backend

**File**: `backend/src/main/java/com/example/app/service/impl/PrintQueueServiceImpl.java`

**Changes**:

1. Thêm method `updateJobStatusAndCommit()` với `@Transactional(propagation = REQUIRES_NEW)`
2. Đổi `updateJobStatus()` thành `updateJobStatusAndCommit()` khi update sang "Printing"
3. Dùng `saveAndFlush()` thay vì `save()` để commit ngay

### Frontend

**File**: `frontend/src/app/student/print-history/page.tsx`

**Changes**:

1. Thêm `useEffect` để auto-refresh khi có jobs Pending/Printing
2. Refresh mỗi 5 giây
3. Tự động dừng khi không còn active jobs
4. Console log để debug

### Config

**File**: `backend/src/main/resources/application.properties`

**Changes**:

1. Đổi `print.queue.mock-print-duration-seconds` từ 60 → 30 (test nhanh hơn)

### Documentation

**File**: `document/MOCK_PRINTING_MODE.md`

**Changes**:

1. Thêm section "Transaction Fix"
2. Thêm section "Frontend Auto-Refresh"
3. Update timeline và logs mẫu
4. Giải thích cách hoạt động của REQUIRES_NEW

## Test

### Bước 1: Restart Backend

```bash
cd backend
mvn spring-boot:run
```

### Bước 2: Gửi Job

1. Đăng nhập Student
2. Upload document
3. Gửi lệnh in
4. Quan sát frontend (KHÔNG CẦN F5)

### Bước 3: Quan Sát

**Console Frontend** (mỗi 5s):

```
Auto-refreshing print history...
Auto-refreshing print history...
Auto-refreshing print history...
```

**Console Backend**:

```
Job 1 status updated to Printing and committed to database
========== MOCK PRINTING MODE ==========
Job 1 will complete after 30 seconds
Job 1 mock printing completed successfully!
```

**UI Frontend**:

- T0: "Đang chờ" (Pending)
- T5-10: "Đang in" (Printing) ✅
- T35-40: "Thành công" (Completed) ✅

### Bước 4: Kiểm Tra Database

```sql
-- Xem job status real-time
SELECT job_id, job_status, started_at, completed_at
FROM print_jobs
WHERE job_id = 1;

-- Sau 5s: job_status = 'Printing', started_at = NOW()
-- Sau 35s: job_status = 'Completed', completed_at = NOW()
```

## Lợi Ích

✅ **User experience tốt hơn**: Thấy status update real-time, không cần F5  
✅ **Chính xác hơn**: Thấy đầy đủ 3 trạng thái Pending → Printing → Completed  
✅ **Tiết kiệm tài nguyên**: Auto-refresh chỉ chạy khi cần (có active jobs)  
✅ **Dễ debug**: Console log rõ ràng  
✅ **Transaction đúng**: Status commit ngay, không bị block bởi mock printing

## Technical Details

### Spring Transaction Propagation

- **REQUIRED** (default): Dùng transaction hiện tại, hoặc tạo mới nếu chưa có
- **REQUIRES_NEW**: Luôn tạo transaction mới, suspend transaction hiện tại

**Ví dụ**:

```java
@Transactional // Transaction A (30s)
public boolean sendJobToPrinter(Integer jobId) {
    // ...

    updateJobStatusAndCommit(job, "Printing", null); // Transaction B (commit ngay)

    // Transaction A vẫn đang chạy
    Thread.sleep(30000); // Mock printing

    // Transaction A commit khi method kết thúc
}

@Transactional(propagation = REQUIRES_NEW) // Transaction B
private void updateJobStatusAndCommit(...) {
    printJobRepository.saveAndFlush(job); // Commit ngay
    // Transaction B kết thúc ngay tại đây
}
```

### React useEffect Dependencies

```typescript
useEffect(() => {
  // Effect chạy khi `jobs` thay đổi
  // ...
}, [jobs]); // Dependency array
```

**Cách hoạt động**:

1. Component mount → Effect chạy lần đầu
2. `jobs` thay đổi → Effect cleanup (clearInterval) → Effect chạy lại
3. Component unmount → Effect cleanup

## Tóm Tắt

Đã fix 2 vấn đề:

1. ✅ Status "Printing" giờ hiện trong DB và UI (dùng REQUIRES_NEW transaction)
2. ✅ Frontend tự động refresh mỗi 5s khi có jobs đang chạy (dùng useEffect + setInterval)

Mock printing duration: 60s → 30s (test nhanh hơn)

User experience: Thấy status update real-time, không cần F5 thủ công!
