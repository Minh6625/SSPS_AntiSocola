# Cấp Phát Trang A4 Tự Động - Tóm Tắt

## Logic Hoạt Động

**Số trang cấp phát:** Lấy từ **SystemConfig** (`default_a4_pages_per_semester`)  
**Ngày cấp phát:** Lấy từ **Semesters** (`StartDate`)  
**Cách tính:** **CỘNG DỒN** (không reset)

## Cấu Hình

### 1. Số Trang (SystemConfig)

Vào **Cài đặt hệ thống** → **Cấu hình chung**:

- Tìm: "Số trang A4 mặc định mỗi học kỳ"
- Nhập: 100 (hoặc số khác)
- Lưu

### 2. Học Kỳ (Semesters)

Vào **Cài đặt hệ thống** → **Quản lý học kỳ**:

- Tạo học kỳ mới
- Điền **Ngày bắt đầu** (VD: 2025-01-15)
- Hệ thống tự động cấp phát lúc 00:05 ngày đó

## Ví Dụ

```
SystemConfig: default_a4_pages_per_semester = 100
Semester: StartDate = 2025-01-15

Sinh viên A: 50 trang (trước)
→ 00:05 ngày 15/01/2025: Cấp phát 100 trang
→ Sinh viên A: 150 trang (sau) ← CỘNG DỒN
```

## Test

```sql
-- Kiểm tra config
SELECT * FROM "SystemConfig" WHERE "ConfigKey" = 'default_a4_pages_per_semester';

-- Kiểm tra học kỳ sẽ cấp phát hôm nay
SELECT * FROM "Semesters" WHERE "StartDate" = CURRENT_DATE;

-- Kiểm tra transaction đã cấp phát
SELECT * FROM "PageTransactions"
WHERE "TransactionType" = 'Allocate'
ORDER BY "CreatedAt" DESC LIMIT 10;
```

## Manual Trigger (SPSO)

```http
POST /api/spso/page-allocation/allocate-current-semester
Authorization: Bearer <SPSO_TOKEN>
```

## Tối Ưu

- ✅ Batch processing (100 sinh viên/lần)
- ✅ Bulk save (giảm 100x DB calls)
- ✅ Idempotent (không duplicate nếu chạy lại)
- ✅ Error handling (1 batch fail không ảnh hưởng batch khác)

## Sinh Viên Tạo Sau Cấp Phát

**Vấn đề:** Sinh viên tạo sau ngày cấp phát cũng cần nhận số trang mặc định

**Giải pháp:** Tự động tạo PageBalance khi tạo tài khoản

### Kịch Bản 1: Sinh viên tự đăng ký

- File: `RegistrationService.verifyRegistrationOtp()`
- Đọc số trang từ SystemConfig
- Tạo PageBalance khi verify OTP thành công

### Kịch Bản 2: SPSO tạo thủ công

- File: `UserServiceImpl.createUser()`
- Đọc số trang từ SystemConfig
- Tạo PageBalance nếu UserType = "Student"
- Tạo PageTransaction để audit trail

**Status:** ✅ Đã hoàn thành cả 2 kịch bản
