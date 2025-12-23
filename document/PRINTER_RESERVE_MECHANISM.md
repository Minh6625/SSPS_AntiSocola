# Printer Reserve Mechanism - Race Condition Prevention

## Overview

Hệ thống in ấn đã được nâng cấp với **Reserve Mechanism** để ngăn chặn race condition khi nhiều sinh viên cùng gửi lệnh in cho một máy in.

## Problem: Race Condition

### Scenario Vấn Đề (Trước khi có Reserve)

```
T0: Máy in có 100 tờ giấy A4
T1: User A gửi 40 tờ → Check: 100 >= 40 ✓ → Job A: Pending (100 tờ vẫn trong DB)
T2: User B gửi 40 tờ → Check: 100 >= 40 ✓ → Job B: Pending (100 tờ vẫn trong DB)
T3: User C gửi 40 tờ → Check: 100 >= 40 ✓ → Job C: Pending (100 tờ vẫn trong DB)
T4: Job A in xong → Trừ 40 tờ → 60 tờ còn lại
T5: Job B in xong → Trừ 40 tờ → 20 tờ còn lại
T6: Job C in → Cần 40 tờ nhưng chỉ còn 20 → FAIL ❌
```

**Vấn đề**: Tất cả 3 user đều pass kiểm tra vì giấy chỉ bị trừ SAU KHI in xong, không phải khi tạo job.

## Solution: Reserve Mechanism

### Concept

Thêm các field **Reserved** để "đặt trước" tài nguyên cho các job pending:

- **Remaining**: Tổng tài nguyên còn lại trong máy in
- **Reserved**: Tài nguyên đã được đặt trước cho các job pending
- **Available**: Tài nguyên khả dụng = Remaining - Reserved

### Database Schema

```sql
-- Printers table
A4PaperRemaining INT DEFAULT 500      -- Tổng giấy A4 còn lại
A3PaperRemaining INT DEFAULT 250      -- Tổng giấy A3 còn lại
A4PaperReserved INT DEFAULT 0         -- Giấy A4 đã reserve
A3PaperReserved INT DEFAULT 0         -- Giấy A3 đã reserve

TonerBlackRemaining INT DEFAULT 100   -- % mực đen còn lại
TonerBlackReserved INT DEFAULT 0      -- % mực đen đã reserve
-- Tương tự cho Cyan, Magenta, Yellow
```

### Workflow

#### 1. Khi Sinh Viên Gửi Lệnh In

```java
// Step 1: Check AVAILABLE resources (remaining - reserved)
int available = printer.getA4PaperAvailable(); // = remaining - reserved
if (available < sheetsNeeded) {
    throw new BusinessException("Không đủ giấy");
}

// Step 2: Create print job
PrintJob job = new PrintJob();
// ... set job properties ...
printJobRepository.save(job);

// Step 3: RESERVE resources immediately
printer.reservePaper("A4", sheetsNeeded);
printer.reserveToner(pagesNeeded, "BlackWhite");
printerRepository.save(printer);
```

**Kết quả**: Tài nguyên được "khóa" ngay lập tức cho job này.

#### 2. Khi In Xong Thành Công

```java
// Step 1: Release reserves
printer.releasePaperReserve("A4", sheetsUsed);
printer.releaseTonerReserve(pagesUsed, "BlackWhite");

// Step 2: Deduct actual resources
printer.setA4PaperRemaining(remaining - sheetsUsed);
printer.setTonerBlackRemaining(toner - tonerUsed);

// Step 3: Update status
printer.updateStatusBasedOnSupplies();
printerRepository.save(printer);
```

**Kết quả**: Reserve được giải phóng, tài nguyên thực tế bị trừ.

#### 3. Khi Hủy Job

```java
// Only release reserves, don't deduct resources
printer.releasePaperReserve("A4", sheetsToRelease);
printer.releaseTonerReserve(pagesToRelease, "BlackWhite");
printerRepository.save(printer);
```

**Kết quả**: Reserve được giải phóng, tài nguyên thực tế KHÔNG bị trừ (vì chưa in).

#### 4. Khi Job Thất Bại

```java
// Release reserves on final failure
if (retryCount >= maxRetries) {
    printer.releasePaperReserve("A4", sheetsUsed);
    printer.releaseTonerReserve(pagesUsed, "BlackWhite");
    printerRepository.save(printer);
}
```

**Kết quả**: Reserve được giải phóng sau khi thử hết số lần retry.

#### 5. Khi Nạp Giấy/Mực

```java
// Reset reserves when refilling
printer.setA4PaperRemaining(capacity);
printer.setA4PaperReserved(0); // Reset reserves
printer.setTonerBlackRemaining(100);
printer.setTonerBlackReserved(0); // Reset reserves
```

**Kết quả**: Reserves được reset về 0 khi nạp đầy.

## Example: Race Condition Prevented

### Với Reserve Mechanism

```
T0: Máy in có 100 tờ giấy A4, 0 reserved
T1: User A gửi 40 tờ
    → Check: available = 100 - 0 = 100 >= 40 ✓
    → Job A: Pending
    → Reserve 40 tờ → remaining=100, reserved=40, available=60

T2: User B gửi 40 tờ
    → Check: available = 100 - 40 = 60 >= 40 ✓
    → Job B: Pending
    → Reserve 40 tờ → remaining=100, reserved=80, available=20

T3: User C gửi 40 tờ
    → Check: available = 100 - 80 = 20 >= 40 ✗
    → REJECT: "Không đủ giấy. Cần 40 tờ, còn 20 tờ khả dụng" ❌

T4: Job A in xong
    → Release 40 tờ reserve → reserved=40
    → Deduct 40 tờ → remaining=60, reserved=40, available=20

T5: Job B in xong
    → Release 40 tờ reserve → reserved=0
    → Deduct 40 tờ → remaining=20, reserved=0, available=20

✅ Không có job nào bị fail vì hết giấy!
```

## Benefits

1. **Ngăn chặn race condition**: Tài nguyên được khóa ngay khi tạo job
2. **Công bằng**: First-come-first-served, ai gửi trước được reserve trước
3. **Chính xác**: Không có job nào bị fail vì overbooking
4. **Transparent**: Sinh viên thấy ngay nếu máy in không đủ tài nguyên
5. **Rollback dễ dàng**: Hủy job chỉ cần release reserve, không cần hoàn trả tài nguyên

## Implementation Files

### Backend

- `backend/src/main/java/com/example/app/entity/Printer.java`

  - Added: `a4PaperReserved`, `a3PaperReserved`, `tonerBlackReserved`, etc.
  - Methods: `getA4PaperAvailable()`, `reservePaper()`, `releasePaperReserve()`, etc.

- `backend/src/main/java/com/example/app/service/impl/PrintJobServiceImpl.java`

  - Updated: `submitPrintJob()` - Check available & reserve resources
  - Updated: `cancelPrintJob()` - Release reserves

- `backend/src/main/java/com/example/app/service/impl/PrintQueueServiceImpl.java`

  - Updated: `sendJobToPrinter()` - Release reserves & deduct resources on completion
  - Updated: Error handling - Release reserves on failure

- `backend/src/main/java/com/example/app/service/impl/PrinterServiceImpl.java`
  - Updated: `refillSupplies()` - Reset reserves to 0

### Database

- `backend/src/main/resources/db/migration/V3__add_printer_reserved_fields.sql`

  - Migration to add reserved fields

- `script/database/database_schema_postgres.sql`

  - Updated schema with reserved fields

- `script/database/database_seed_data_postgres.sql`
  - Updated seed data with reserved=0

## Testing Scenarios

### Test 1: Concurrent Submissions

```
1. Máy in có 100 tờ A4
2. 3 users cùng gửi 40 tờ trong cùng 1 giây
3. Expected: 2 jobs được chấp nhận, 1 job bị reject
```

### Test 2: Cancel Job

```
1. User A gửi 50 tờ → Reserved 50
2. User A hủy job → Released 50
3. User B gửi 50 tờ → Should succeed
```

### Test 3: Job Failure

```
1. User A gửi 50 tờ → Reserved 50
2. Job fails after 3 retries → Released 50
3. User B gửi 50 tờ → Should succeed
```

### Test 4: Refill

```
1. Máy in có 20 tờ, reserved 10 tờ
2. SPSO nạp giấy → remaining=500, reserved=0
3. User gửi 500 tờ → Should succeed
```

## Notes

- Reserve mechanism chỉ áp dụng cho **Pending jobs**
- Khi job chuyển sang **Printing**, **Completed**, hoặc **Failed**, reserves được giải phóng
- Reserves được reset về 0 khi nạp giấy/mực
- Available resources = Remaining - Reserved (luôn >= 0)

## Related Documents

- [PRINTER_SUPPLIES_MANAGEMENT.md](./PRINTER_SUPPLIES_MANAGEMENT.md) - Quản lý giấy và mực
- [PRINTER_REFILL_USER_GUIDE.md](./PRINTER_REFILL_USER_GUIDE.md) - Hướng dẫn nạp giấy/mực
