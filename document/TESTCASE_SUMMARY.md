# TỔNG HỢP TESTCASE - HCMSIU_SSPS

## THỐNG KÊ TỔNG QUAN

| Vai trò     | Số chức năng | Số testcase | File                |
| ----------- | ------------ | ----------- | ------------------- |
| **STUDENT** | 5            | 195         | TESTCASE_STUDENT.md |
| **SPSO**    | 4            | 152         | TESTCASE_SPSO.md    |
| **TỔNG**    | **9**        | **347**     | -                   |

---

## CHI TIẾT TESTCASE THEO CHỨC NĂNG

### STUDENT (195 testcases)

| STT | Chức năng                 | Số testcase | ID Range    | Mức độ |
| --- | ------------------------- | ----------- | ----------- | ------ |
| 1   | Chọn máy in               | 15          | TC01-TC15   | P0     |
| 2   | Cấu hình in & Gửi lệnh in | 23          | TC16-TC38   | P0     |
| 3   | Lịch sử in                | 20          | TC39-TC58   | P0     |
| 4   | Upload & Quản lý tài liệu | 28          | TC153-TC180 | P0     |
| 5   | Số dư trang in            | 15          | TC181-TC195 | P0     |

**Tổng:** 195 testcases

---

### SPSO (152 testcases)

| STT | Chức năng                         | Số testcase | ID Range    | Mức độ |
| --- | --------------------------------- | ----------- | ----------- | ------ |
| 1   | Quản lý máy in                    | 27          | TC59-TC85   | P0     |
| 2   | Vị trí máy in                     | 21          | TC86-TC106  | P0     |
| 3   | Cài đặt cấu hình & Quản lý học kỳ | 26          | TC107-TC132 | P0-P1  |
| 4   | Báo cáo                           | 20          | TC133-TC152 | P1     |

**Tổng:** 152 testcases

---

## PHÂN LOẠI THEO MỨC ĐỘ ƯU TIÊN

| Mức độ            | Mô tả                           | Số lượng | Tỷ lệ    | Target Pass Rate |
| ----------------- | ------------------------------- | -------- | -------- | ---------------- |
| **P0 - Critical** | Chức năng core, không thể thiếu | ~210     | 60%      | ≥ 95%            |
| **P1 - High**     | Chức năng quan trọng            | ~90      | 26%      | ≥ 90%            |
| **P2 - Medium**   | Chức năng nâng cao              | ~35      | 10%      | ≥ 85%            |
| **P3 - Low**      | Chức năng phụ                   | ~12      | 4%       | ≥ 80%            |
| **TỔNG**          |                                 | **347**  | **100%** | **≥ 90%**        |

---

## DANH SÁCH TESTCASE CHI TIẾT

### STUDENT

#### 1. Chọn máy in (TC01-TC15)

- TC01: Xem danh sách máy in khả dụng
- TC02-TC03: Lọc theo cơ sở
- TC04-TC05: Lọc theo tòa nhà và phòng
- TC06-TC07: Lọc theo hãng và model
- TC08: Tìm kiếm theo tên
- TC09-TC10: Toggle hiển thị máy khả dụng
- TC11-TC12: Chọn máy in (khả dụng/không khả dụng)
- TC13: Phân trang
- TC14: Không có tài liệu
- TC15: Kết hợp nhiều filter

#### 2. Cấu hình in & Gửi lệnh in (TC16-TC38)

- TC16-TC17: Hiển thị thông tin tài liệu và máy in
- TC18-TC19: Chọn khổ giấy A4/A3
- TC20-TC23: In tất cả trang / trang tùy chọn
- TC24-TC25: Bật/tắt in 2 mặt
- TC26-TC29: Số bản copy
- TC30-TC31: Chọn in màu/đen trắng
- TC32-TC33: Tính toán số dư
- TC34-TC35: Gửi lệnh in (thành công/thất bại)
- TC36-TC37: Đổi máy in / Quay lại
- TC38: In nhiều tài liệu

#### 3. Lịch sử in (TC39-TC58)

- TC39-TC40: Xem lịch sử và thống kê
- TC41-TC47: Lọc theo ngày, máy in, trạng thái, tên tài liệu
- TC48: Xem chi tiết job
- TC49-TC52: Hủy job (các trường hợp)
- TC53-TC54: Auto-refresh
- TC55-TC58: Hiển thị trạng thái, dropdown menu, empty state

#### 4. Upload & Quản lý tài liệu (TC153-TC180)

- TC153-TC158: Upload file (các loại file, kích thước)
- TC159-TC160: Upload nhiều file, drag & drop
- TC161: Xem danh sách tài liệu
- TC162-TC168: Tìm kiếm, lọc, sắp xếp
- TC169-TC171: Chọn tài liệu
- TC172-TC175: Tải về, in tài liệu
- TC176-TC179: Xóa tài liệu
- TC180: Empty state

#### 5. Số dư trang in (TC181-TC195)

- TC181-TC183: Xem số dư A4, A3, tổng
- TC184-TC188: Mua thêm trang
- TC189-TC194: Xem lịch sử giao dịch, lọc
- TC195: Empty state

---

### SPSO

#### 1. Quản lý máy in (TC59-TC85)

- TC59: Xem danh sách máy in
- TC60-TC67: Lọc theo cơ sở, tòa, phòng, hãng, model, trạng thái, ngày bảo trì
- TC68-TC73: Thêm/sửa máy in
- TC74-TC77: Xóa, bật/tắt máy in
- TC78-TC82: Chọn máy in, bulk actions
- TC83: Refill giấy/mực
- TC84-TC85: Phân trang, dropdown menu

#### 2. Vị trí máy in (TC86-TC106)

- TC86-TC88: Xem tab Cơ sở, Tòa nhà, Phòng
- TC89-TC93: Thêm/sửa/xóa cơ sở
- TC94-TC99: Thêm/sửa/xóa tòa nhà
- TC100-TC106: Thêm/sửa/xóa phòng

#### 3. Cài đặt cấu hình & Quản lý học kỳ (TC107-TC132)

- TC107-TC117: Cấu hình chung (số trang, giá, file, bảo trì)
- TC118: Hiển thị học kỳ hiện tại
- TC119-TC128: Thêm học kỳ (validation)
- TC129-TC132: Sửa/xóa học kỳ, hiển thị trạng thái

#### 4. Báo cáo (TC133-TC152)

- TC133-TC137: Xem báo cáo tháng/năm, chuyển đổi
- TC138-TC144: Hiển thị tổng quan, phân bổ, top students/printers, thống kê
- TC145-TC148: Xuất PDF/Excel
- TC149-TC152: Empty state, loading, error

---

## QUY TRÌNH TEST

### 1. Chuẩn bị môi trường

**Backend:**

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Database:**

- Chạy script khởi tạo database
- Import dữ liệu test (users, printers, documents, etc.)

### 2. Thứ tự thực hiện test

**Phase 1: Smoke Test (P0 - Critical)**

- Chạy tất cả testcase P0 (~210 testcases)
- Target: 100% Pass
- Thời gian: ~4-6 giờ

**Phase 2: Regression Test (P1 - High)**

- Chạy tất cả testcase P1 (~90 testcases)
- Target: ≥ 90% Pass
- Thời gian: ~2-3 giờ

**Phase 3: Full Test (P2 + P3)**

- Chạy tất cả testcase còn lại (~47 testcases)
- Target: ≥ 85% Pass
- Thời gian: ~1-2 giờ

**Tổng thời gian:** ~7-11 giờ cho 1 round test đầy đủ

### 3. Bug Report Template

```markdown
**Bug ID:** BUG-XXX
**Testcase ID:** TCXXX
**Severity:** Critical / High / Medium / Low
**Priority:** P0 / P1 / P2 / P3

**Environment:**

- Browser: Chrome 120
- OS: Windows 11
- Backend: localhost:8080
- Frontend: localhost:3000

**Steps to Reproduce:**

1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[Kết quả mong đợi]

**Actual Result:**
[Kết quả thực tế]

**Screenshots:**
[Attach screenshots]

**Logs:**
[Attach console logs / server logs]
```

### 4. Test Report Template

```markdown
# TEST REPORT - [Date]

## Summary

- Total Testcases: 347
- Executed: XXX
- Passed: XXX
- Failed: XXX
- Blocked: XXX
- Pass Rate: XX%

## By Priority

| Priority | Total | Passed | Failed | Pass Rate |
| -------- | ----- | ------ | ------ | --------- |
| P0       | 210   | XXX    | XXX    | XX%       |
| P1       | 90    | XXX    | XXX    | XX%       |
| P2       | 35    | XXX    | XXX    | XX%       |
| P3       | 12    | XXX    | XXX    | XX%       |

## By Feature

| Feature               | Total | Passed | Failed | Pass Rate |
| --------------------- | ----- | ------ | ------ | --------- |
| Student - Chọn máy in | 15    | XXX    | XXX    | XX%       |
| Student - Cấu hình in | 23    | XXX    | XXX    | XX%       |
| ...                   | ...   | ...    | ...    | ...       |

## Critical Bugs

1. [BUG-001] - Description
2. [BUG-002] - Description

## Recommendations

- [Recommendation 1]
- [Recommendation 2]
```

---

## CHECKLIST TRƯỚC KHI RELEASE

### Must-Have (P0)

- [ ] Tất cả testcase P0 Pass (≥ 95%)
- [ ] Không có Critical bugs
- [ ] Database migration scripts tested
- [ ] API endpoints documented
- [ ] Authentication & Authorization working
- [ ] File upload/download working
- [ ] Print job flow working end-to-end
- [ ] Page balance calculation correct

### Should-Have (P1)

- [ ] Tất cả testcase P1 Pass (≥ 90%)
- [ ] Không có High priority bugs
- [ ] Reports generating correctly
- [ ] Filters & search working
- [ ] Pagination working
- [ ] Error handling proper

### Nice-to-Have (P2-P3)

- [ ] Testcase P2-P3 Pass (≥ 85%)
- [ ] UI/UX polished
- [ ] Loading states smooth
- [ ] Empty states informative
- [ ] Responsive design working

---

## CONTACT & SUPPORT

**Test Lead:** [Name]
**Email:** [email]
**Slack:** [channel]

**Bug Tracking:** [Jira/Trello URL]
**Test Management:** [TestRail/Zephyr URL]
**CI/CD:** [Jenkins/GitHub Actions URL]
