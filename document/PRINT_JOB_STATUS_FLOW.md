# Print Job Status Flow - Luồng Trạng Thái Lệnh In

## Các Trạng Thái

Hệ thống có 5 trạng thái cho PrintJob:

1. **Pending** - Chờ in (đang trong hàng đợi)
2. **Printing** - Đang in (đang được xử lý bởi máy in)
3. **Completed** - Đã in xong thành công
4. **Failed** - In thất bại
5. **Cancelled** - Đã hủy bởi sinh viên

---

## Luồng Chuyển Trạng Thái

### **1. Sinh Viên Gửi Lệnh In**

```
User click "In" → submitPrintJob()

Kiểm tra:
✓ Document có tồn tại?
✓ Printer có Active?
✓ Printer có đủ giấy/mực (available)?
✓ Student có đủ số dư trang?

Nếu pass tất cả:
→ Tạo PrintJob với status = "Pending"
→ Reserve giấy/mực ngay lập tức
→ Trừ số dư trang của sinh viên
→ Trả về success

Nếu fail:
→ Throw exception
→ Không tạo job
```

**Kết quả**: Job ở trạng thái **Pending**

---

### **2. PrintQueue Xử Lý Job** (Tự động mỗi 30 giây)

```
PrintQueueServiceImpl.processPendingJobs()
→ Scan tất cả jobs có status = "Pending"
→ Với mỗi job: sendJobToPrinter(jobId)
```

#### **2.1. Bắt Đầu In**

```java
// Kiểm tra job status
if (job.getJobStatus() != "Pending") {
    return false; // Bỏ qua
}

// Kiểm tra printer
if (printer.getStatus() != "Active") {
    updateJobStatus(job, "Failed", "Máy in không sẵn sàng");
    return false;
}

// Chuyển sang Printing
updateJobStatus(job, "Printing", null);
job.setStartedAt(LocalDateTime.now());
```

**Kết quả**: Job chuyển từ **Pending** → **Printing**

#### **2.2. Gửi Đến Máy In**

```java
boolean success = sendToPrinterViaNetwork(job, printer);
```

**Trong khi in**:

- Job status = **Printing**
- Reserves vẫn được giữ
- Sinh viên thấy job đang in trên UI

---

### **3. In Thành Công**

```java
if (success) {
    // Cập nhật status
    updateJobStatus(job, "Completed", null);
    job.setCompletedAt(LocalDateTime.now());

    // Release reserves
    printer.releasePaperReserve(paperSize, sheets);
    printer.releaseTonerReserve(pages, colorMode);

    // Deduct actual resources
    printer.setA4PaperRemaining(remaining - sheets);
    printer.setTonerBlackRemaining(toner - tonerUsed);

    // Update printer status
    printer.updateStatusBasedOnSupplies();

    return true;
}
```

**Kết quả**: Job chuyển từ **Printing** → **Completed**

---

### **4. In Thất Bại**

#### **4.1. Thất Bại Lần Đầu (Retry)**

```java
if (!success) {
    int currentRetry = extractRetryCount(job.getNotes());

    if (currentRetry < maxRetryAttempts) {
        // Chuyển về Pending để retry
        updateJobStatus(job, "Pending", "Retry: " + (currentRetry + 1));
        // Giữ nguyên reserves
        return false;
    }
}
```

**Kết quả**: Job chuyển từ **Printing** → **Pending** (retry)

#### **4.2. Thất Bại Sau Max Retries**

```java
if (currentRetry >= maxRetryAttempts) {
    // Chuyển sang Failed
    updateJobStatus(job, "Failed", "Đã thử " + maxRetryAttempts + " lần nhưng thất bại");

    // Release reserves (không deduct resources)
    printer.releasePaperReserve(paperSize, sheets);
    printer.releaseTonerReserve(pages, colorMode);

    return false;
}
```

**Kết quả**: Job chuyển từ **Printing** → **Failed**

---

### **5. Sinh Viên Hủy Job**

```java
// Chỉ cho phép hủy job Pending
if (job.getJobStatus() != "Pending") {
    throw new BusinessException("Chỉ có thể hủy lệnh in đang chờ");
}

// Chuyển sang Cancelled
job.setJobStatus("Cancelled");

// Release reserves
printer.releasePaperReserve(paperSize, sheets);
printer.releaseTonerReserve(pages, colorMode);

// Hoàn trả số dư trang
pageBalance.setA4Balance(balance + a4Equivalent);
```

**Kết quả**: Job chuyển từ **Pending** → **Cancelled**

---

## Sơ Đồ Luồng

```
                    ┌─────────────┐
                    │   Submit    │
                    │  Print Job  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   PENDING   │◄─────┐
                    │  (Chờ in)   │      │
                    └──────┬──────┘      │
                           │             │
                    PrintQueue scan      │ Retry
                           │             │ (< max)
                           ▼             │
                    ┌─────────────┐      │
                    │  PRINTING   │──────┘
                    │  (Đang in)  │
                    └──────┬──────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
                ▼          ▼          ▼
         ┌──────────┐ ┌─────────┐ ┌────────┐
         │COMPLETED │ │ FAILED  │ │CANCELLED│
         │(Thành công)│(Thất bại)│(Đã hủy) │
         └──────────┘ └─────────┘ └────────┘
                                      ▲
                                      │
                                  User cancel
                                  (chỉ khi Pending)
```

---

## Timeline Ví Dụ

### **Scenario: 2 Users Cùng In**

```
T0: Máy in có 100 tờ giấy

T1: User A gửi 50 tờ
    → Job A: Pending
    → Reserved = 50, Available = 50

T2: User B gửi 40 tờ
    → Job B: Pending
    → Reserved = 90, Available = 10

T3: PrintQueue scan (sau 30s)
    → Tìm Job A (Pending)
    → Job A: Pending → Printing
    → Gửi đến máy in

T4: Máy in đang in Job A
    → Job A: Printing (sinh viên thấy "Đang in")
    → Job B: Pending (sinh viên thấy "Chờ in")

T5: Job A in xong (sau 2 phút)
    → Job A: Printing → Completed
    → Release 50 tờ reserve
    → Deduct 50 tờ actual
    → Remaining = 50, Reserved = 40, Available = 10

T6: PrintQueue scan (sau 30s)
    → Tìm Job B (Pending)
    → Job B: Pending → Printing
    → Gửi đến máy in

T7: Job B in xong
    → Job B: Printing → Completed
    → Remaining = 10, Reserved = 0
```

---

## Các Trường Hợp Đặc Biệt

### **1. SPSO Nạp Giấy Khi Có Jobs Active**

```
Máy in có:
- Job A: Printing (đang in)
- Job B: Pending (chờ in)

SPSO cố nạp giấy:
→ Backend check: countByPrinterIdAndJobStatusIn(printerId, ["Pending", "Printing"])
→ Count = 2 > 0
→ Throw exception: "Không thể nạp giấy/mực khi máy in đang có 2 lệnh in đang chờ hoặc đang in"
→ SPSO phải đợi jobs hoàn tất
```

### **2. User Hủy Job Đang Printing**

```
User cố hủy Job đang Printing:
→ Backend check: if (job.getJobStatus() != "Pending")
→ Throw exception: "Chỉ có thể hủy lệnh in đang chờ"
→ User không thể hủy
```

### **3. Job Retry Sau Khi Fail**

```
T1: Job A: Pending → Printing
T2: In thất bại lần 1
    → Job A: Printing → Pending (Retry: 1)
    → Giữ nguyên reserves

T3: PrintQueue scan lại (sau 30s)
    → Job A: Pending → Printing (lần 2)

T4: In thất bại lần 2
    → Job A: Printing → Pending (Retry: 2)

T5: PrintQueue scan lại
    → Job A: Pending → Printing (lần 3)

T6: In thất bại lần 3 (max retries = 3)
    → Job A: Printing → Failed
    → Release reserves
```

---

## UI Display

### **Cho Sinh Viên**

| Status    | Hiển thị     | Màu sắc | Actions |
| --------- | ------------ | ------- | ------- |
| Pending   | "Chờ in"     | Yellow  | Hủy     |
| Printing  | "Đang in"    | Blue    | -       |
| Completed | "Đã in xong" | Green   | -       |
| Failed    | "Thất bại"   | Red     | -       |
| Cancelled | "Đã hủy"     | Gray    | -       |

### **Cho SPSO**

SPSO thấy tất cả jobs của tất cả sinh viên với các trạng thái trên.

---

## Configuration

```properties
# application.properties

# Bật/tắt print queue
print.queue.enabled=true

# Thời gian scan (milliseconds)
print.queue.scan-interval-seconds=30

# Số lần retry tối đa
print.queue.max-retry-attempts=3

# Timeout kết nối máy in (seconds)
print.queue.connection-timeout-seconds=10
```

---

## Related Documents

- [PRINTER_RESERVE_MECHANISM.md](./PRINTER_RESERVE_MECHANISM.md) - Reserve mechanism
- [PRINTER_SUPPLIES_MANAGEMENT.md](./PRINTER_SUPPLIES_MANAGEMENT.md) - Quản lý giấy và mực
