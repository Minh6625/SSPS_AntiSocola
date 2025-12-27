# Test Cấp Phát Trang A4 - Hướng Dẫn

## Mục Đích

Test 3 kịch bản cấp phát trang A4 cho sinh viên:

1. ✅ Scheduled allocation (tự động vào 00:05 ngày bắt đầu học kỳ)
2. ✅ Self-registration (sinh viên tự đăng ký)
3. ✅ SPSO manual creation (SPSO tạo tài khoản thủ công)

## Chuẩn Bị

### 1. Cấu hình số trang mặc định

```sql
-- Kiểm tra config hiện tại
SELECT * FROM systemconfig WHERE configkey = 'default_a4_pages_per_semester';

-- Nếu chưa có, tạo mới
INSERT INTO systemconfig (configkey, configvalue, description)
VALUES ('default_a4_pages_per_semester', '100', 'Số trang A4 mặc định mỗi học kỳ');

-- Hoặc update
UPDATE systemconfig
SET configvalue = '100'
WHERE configkey = 'default_a4_pages_per_semester';
```

### 2. Tạo học kỳ test

```sql
-- Tạo học kỳ bắt đầu hôm nay (để test scheduled allocation)
INSERT INTO semesters (semestercode, semestername, startdate, enddate, iscurrent)
VALUES ('TEST2025', 'Test Semester 2025', CURRENT_DATE, CURRENT_DATE + INTERVAL '120 days', false);
```

## Test Case 1: Scheduled Allocation

**Mục tiêu:** Test scheduler tự động cấp phát lúc 00:05

### Cách 1: Đợi đến 00:05 (Production)

1. Tạo học kỳ với StartDate = ngày mai
2. Đợi đến 00:05 ngày mai
3. Kiểm tra log:

```
========== PAGE ALLOCATION SCHEDULER START ==========
Checking for semesters starting on: 2025-12-27
Processing semester: Test Semester 2025 (TEST2025)
Allocating 100 A4 pages for semester: TEST2025 (from SystemConfig)
Found 50 students to allocate pages
Page allocation completed: 50 success, 0 errors out of 50 students
========== PAGE ALLOCATION SCHEDULER END ==========
```

### Cách 2: Manual Trigger (Test ngay)

**API Endpoint:**

```http
POST http://localhost:8080/api/spso/page-allocation/allocate-current-semester
Authorization: Bearer <SPSO_TOKEN>
```

**Lưu ý:** Phải set học kỳ là "current" trước:

```sql
UPDATE semesters SET iscurrent = true WHERE semestercode = 'TEST2025';
```

**Expected Response:**

```json
{
  "message": "Cấp phát trang thành công cho học kỳ TEST2025",
  "semesterCode": "TEST2025",
  "semesterName": "Test Semester 2025",
  "studentsProcessed": 50,
  "pagesAllocated": 100
}
```

### Verify Results

```sql
-- Kiểm tra PageBalance đã tăng
SELECT pb.studentid, pb.a4balance, u.fullname
FROM pagebalances pb
JOIN users u ON pb.studentid = u.userid
WHERE u.usertype = 'Student'
ORDER BY pb.lastupdated DESC
LIMIT 10;

-- Kiểm tra PageTransaction
SELECT studentid, transactiontype, a4pages, balanceaftera4, semester, notes, createdat
FROM pagetransactions
WHERE transactiontype = 'Allocate' AND semester = 'TEST2025'
ORDER BY createdat DESC
LIMIT 10;

-- Kiểm tra idempotent (không duplicate)
SELECT semester, COUNT(*) as allocation_count
FROM pagetransactions
WHERE transactiontype = 'Allocate'
GROUP BY semester;
```

## Test Case 2: Self-Registration

**Mục tiêu:** Test sinh viên tự đăng ký nhận trang

### Steps:

1. Đăng ký tài khoản mới qua UI:

   - Email: `test.student@siu.edu.vn`
   - Password: `Test1234`
   - Full Name: `Test Student`
   - Phone: `0901234567`

2. Verify OTP từ email

3. Kiểm tra PageBalance:

```sql
SELECT pb.studentid, pb.a4balance, u.fullname, u.email, u.createdat
FROM pagebalances pb
JOIN users u ON pb.studentid = u.userid
WHERE u.email = 'test.student@siu.edu.vn';
```

**Expected:**

- `a4balance` = 100 (từ SystemConfig)
- `studentid` = STU24xxxxxxxx (auto-generated)

4. Kiểm tra log:

```
User created: STU2412345678 - test.student@siu.edu.vn
PageBalance created for new student: STU2412345678 (A4: 100 from SystemConfig)
```

## Test Case 3: SPSO Manual Creation

**Mục tiêu:** Test SPSO tạo tài khoản sinh viên thủ công

### Steps:

1. Đăng nhập SPSO

2. Vào **Quản lý người dùng** → **Tạo người dùng mới**

3. Điền thông tin:

   - User ID: `STU2499999999`
   - Email: `manual.student@siu.edu.vn`
   - Full Name: `Manual Student`
   - User Type: **Student**
   - Password: `Test1234`

4. Nhấn **Tạo**

5. Kiểm tra PageBalance:

```sql
SELECT pb.studentid, pb.a4balance, u.fullname, u.email, u.createdat
FROM pagebalances pb
JOIN users u ON pb.studentid = u.userid
WHERE u.userid = 'STU2499999999';
```

**Expected:**

- `a4balance` = 100 (từ SystemConfig)
- `studentid` = STU2499999999

6. Kiểm tra PageTransaction:

```sql
SELECT studentid, transactiontype, a4pages, balanceaftera4, notes, createdby, createdat
FROM pagetransactions
WHERE studentid = 'STU2499999999';
```

**Expected:**

- `transactiontype` = 'Allocate'
- `a4pages` = 100
- `notes` = 'Cấp phát ban đầu khi tạo tài khoản (SPSO)'
- `createdby` = 'SPSO'

7. Kiểm tra log:

```
User created by SPSO: STU2499999999 - manual.student@siu.edu.vn (Student)
PageBalance created for new student (SPSO): STU2499999999 (A4: 100 from SystemConfig)
PageTransaction created for initial allocation: STU2499999999
```

## Test Case 4: SPSO tạo SPSO/Admin (Negative Test)

**Mục tiêu:** Đảm bảo không tạo PageBalance cho SPSO/Admin

### Steps:

1. Tạo user với User Type = **SPSO**:

   - User ID: `SPSO001`
   - Email: `spso.test@siu.edu.vn`
   - User Type: **SPSO**

2. Kiểm tra PageBalance:

```sql
SELECT * FROM pagebalances WHERE studentid = 'SPSO001';
```

**Expected:** Không có record (0 rows)

3. Kiểm tra log:

```
User created by SPSO: SPSO001 - spso.test@siu.edu.vn (SPSO)
```

**Lưu ý:** Không có log "PageBalance created" vì không phải Student

## Test Case 5: Thay đổi số trang trong SystemConfig

**Mục tiêu:** Đảm bảo tất cả 3 kịch bản đọc từ SystemConfig

### Steps:

1. Thay đổi config:

```sql
UPDATE systemconfig
SET configvalue = '200'
WHERE configkey = 'default_a4_pages_per_semester';
```

2. Test lại cả 3 kịch bản (scheduled, self-registration, SPSO manual)

3. Verify tất cả đều nhận 200 trang (không phải 100)

## Cleanup

```sql
-- Xóa test data
DELETE FROM pagetransactions WHERE semester = 'TEST2025';
DELETE FROM pagebalances WHERE studentid LIKE 'STU24%';
DELETE FROM users WHERE email LIKE '%test%@siu.edu.vn';
DELETE FROM semesters WHERE semestercode = 'TEST2025';

-- Reset config
UPDATE systemconfig
SET configvalue = '100'
WHERE configkey = 'default_a4_pages_per_semester';
```

## Checklist

- [ ] Test Case 1: Scheduled Allocation (manual trigger)
- [ ] Test Case 2: Self-Registration
- [ ] Test Case 3: SPSO Manual Creation (Student)
- [ ] Test Case 4: SPSO Manual Creation (SPSO/Admin - negative)
- [ ] Test Case 5: Thay đổi SystemConfig
- [ ] Verify idempotent (không duplicate)
- [ ] Verify CỘNG DỒN (không reset)
- [ ] Verify log messages
- [ ] Verify PageTransaction audit trail

## Kết Quả Mong Đợi

✅ Tất cả sinh viên đều nhận số trang từ SystemConfig  
✅ Không có duplicate allocation  
✅ PageTransaction đầy đủ để audit  
✅ Log rõ ràng, dễ debug  
✅ SPSO/Admin không có PageBalance
