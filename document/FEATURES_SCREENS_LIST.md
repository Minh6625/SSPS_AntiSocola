# DANH SÁCH GIAO DIỆN & CHỨC NĂNG HỆ THỐNG HCMSIU_SSPS

---

## TỔNG QUAN DỰ ÁN

**Dự án:** HCMSIU_SSPS - Student Smart Printing Service

**Tổng giao diện:** 15 màn hình

**Tổng chức năng:** 31 chức năng (bổ sung Notifications & SSO)

**Ưu tiên:** P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Low)

**PHÂN LOẠI THEO VAI TRÒ:**

- **STUDENT:** 6 màn hình | 13 chức năng
- **SPSO:** 6 màn hình | 10 chức năng
- **COMMON:** 3 màn hình | 8 chức năng

---

## NHÓM 1: AUTHENTICATION (COMMON)

**Priority:** P0 - Critical  
**Lý do:** Không có auth thì không dùng được hệ thống

---

### MÀN 1: LOGIN PAGE

**Role:** Common (Student & SPSO)  
**Priority:** P0 (Critical)  
**Route:** /login

**UI COMPONENTS:**

- Logo HCMIU
- Form login:
  - Input: Email
  - Input: Password (có show/hide icon)
  - Checkbox: "Ghi nhớ đăng nhập"
  - Button: "Đăng nhập"
- Link: "Quên mật khẩu?"
- Footer: "Chưa có tài khoản? Đăng ký"

**CHỨC NĂNG:**

**[F01] Đăng nhập (P0)**

- Input: email, password
- Validate: email format, password không để trống
- Call API: POST /api/auth/login (hoặc redirect SSO: HCMSIU_SSO, nhận back code/token)
- On success:
  - Lưu token
  - Redirect theo role:
    - Student → /student/dashboard
    - SPSO → /spso/dashboard
- On error: Hiển thị error message
- Loading state: Disable button + spinner

**BACKEND API:**

- **POST /api/auth/login (P0)** (hoặc SSO callback)
  - Input: { email, password }
  - Output: { token, user: { userId, email, fullName, userType } }

---

### MÀN 2: REGISTER PAGE

**Role:** Common (Student only - SPSO được tạo sẵn)  
**Priority:** P1 (High)  
**Route:** /register

**UI COMPONENTS:**

- Form đăng ký:
  - Input: Email (@hcmiu.edu.vn)
  - Input: Mã số sinh viên
  - Input: Họ và tên
  - Input: Password (có strength indicator)
  - Input: Confirm Password
  - Checkbox: "Tôi đồng ý với điều khoản sử dụng"
  - Button: "Đăng ký"
- Footer: "Đã có tài khoản? Đăng nhập"

**CHỨC NĂNG:**

**[F02] Đăng ký tài khoản sinh viên (P1)**

- Validate: Email phải @hcmiu.edu.vn
- Validate: Password match, strength (min 8 chars, có số + chữ)
- Call API: POST /api/auth/register
- On success: Redirect → /login với success message

**BACKEND API:**

- **POST /api/auth/register (P1)**

---

### MÀN 3: FORGOT PASSWORD PAGE

**Role:** Common  
**Priority:** P3 (Low)  
**Route:** /forgot-password

**UI COMPONENTS:**

- Form:
  - Input: Email
  - Button: "Gửi link reset mật khẩu"
- Thông báo: "Chúng tôi sẽ gửi link reset về email của bạn"

**CHỨC NĂNG:**

**[F03] Quên mật khẩu (P3)**

- Send reset password email
- Call API: POST /api/auth/forgot-password

**BACKEND API:**

- **POST /api/auth/forgot-password (P3)**

---

## NHÓM 2: IN TÀI LIỆU (STUDENT - CORE FLOW)

**Priority:** P0 - Critical  
**Lý do:** Đây là chức năng chính của hệ thống

---

### MÀN 4: UPLOAD DOCUMENT PAGE

**Role:** Student  
**Priority:** P0 (Critical)  
**Route:** /student/documents/upload

**UI COMPONENTS:**

- Header: "Tải tài liệu lên"
- Upload area:
  - Drag & drop zone (có icon cloud)
  - Hoặc button "Chọn file từ máy tính"
  - Hiển thị: Cho phép: PDF, DOCX, PPTX | Tối đa: 50MB
- File list (sau khi upload):
  - Table: Tên file | Loại | Kích thước | Ngày tải | Hành động
  - Actions: Xem | In | Xóa
- Pagination (nếu nhiều files)

**CHỨC NĂNG:**

**[F04] Upload tài liệu (P0)**

- Validate: File type (pdf, docx, pptx)
- Validate: File size (max 50MB)
- Upload progress bar
- Call API: POST /api/documents/upload (multipart/form-data)
- On success: Add file vào list

**[F05] Xem danh sách tài liệu đã upload (P0)**

- Call API: GET /api/documents
- Display files trong table
- Filter: Loại file, Ngày tải

**[F06] Xóa tài liệu (P1)**

- Confirmation dialog
- Call API: DELETE /api/documents/:id

**BACKEND API:**

- **POST /api/documents/upload (P0)**
- **GET /api/documents (P0)**
- **DELETE /api/documents/:id (P1)**

---

### MÀN 5: PRINTER SELECTION PAGE

**Role:** Student  
**Priority:** P0 (Critical)  
**Route:** /student/printers

**UI COMPONENTS:**

- Header: "Chọn máy in"
- Filters:
  - Dropdown: Cơ sở (Dĩ An / Thành phố)
  - Dropdown: Tòa nhà
  - Toggle: Chỉ hiện máy in khả dụng
  - Search: Tìm theo tên máy in
- Printer cards (grid layout):
  - Card:
    - Icon máy in
    - Tên: "Máy in H6-101"
    - Vị trí: "Dĩ An - H6 - P101"
    - Trạng thái: Badge (Khả dụng / Đang bận / Bảo trì)
    - Khổ giấy: A4, A3
    - Button: "Chọn máy in này"
- Empty state: "Không có máy in nào khả dụng"

**CHỨC NĂNG:**

**[F07] Xem danh sách máy in (P0)**

- Call API: GET /api/printers?status=Active
- Display printers theo location
- Filter by campus, building, status

**[F08] Chọn máy in để in tài liệu (P0)**

- Click "Chọn" → Lưu printerId → Next step

**BACKEND API:**

- **GET /api/printers (P0)**

---

### MÀN 6: PRINT CONFIGURATION PAGE

**Role:** Student  
**Priority:** P0 (Critical)  
**Route:** /student/print/configure

**UI COMPONENTS:**

- Wizard steps: (1) Chọn tài liệu ✓ → (2) Chọn máy in ✓ → (3) Cấu hình ← → (4) Xác nhận
- Form cấu hình:
  - Tài liệu: Display selected document name (readonly)
  - Máy in: Display selected printer name (readonly, có button "Đổi máy in")
  - Khổ giấy: Radio buttons (A4 / A3)
  - Trang cần in:
    - Radio: "Tất cả trang"
    - Radio: "Tùy chọn" → Input text (e.g., "1-5,10,15-20")
  - In 2 mặt: Toggle switch (Bật / Tắt)
  - Số bản copy: Number input (min: 1, max: 10)
  - Màu sắc: Radio (Đen trắng / Màu) - Optional (P2)
- Preview panel (bên phải):
  - Tổng số trang: 10 trang
  - Trang A4 tương đương: 10 trang (nếu A3 thì x2, 2 mặt thì x0.5)
  - Số dư hiện tại: 50 trang A4
  - Số dư sau khi in: 40 trang A4
  - Cảnh báo: (nếu không đủ) "Số dư không đủ. Vui lòng mua thêm trang."
- Buttons:
  - "Quay lại"
  - "Xác nhận in" (disabled nếu không đủ số dư)

**CHỨC NĂNG:**

**[F09] Cấu hình thông số in (P0)**

- Select paper size, pages, sides, copies
- Real-time calculate: Total pages, A4 equivalent
- Check page balance
- If insufficient → Show warning + link to purchase page

**[F10] Gửi lệnh in (P0)**

- Call API: POST /api/print-jobs
- Input: { documentId, printerId, paperSize, pageRange, sides, copies }
- On success: Redirect → Print History với success notification
- On error: Show error message

**BACKEND API:**

- **POST /api/print-jobs (P0)**
  - Validate: Page balance sufficient
  - Deduct pages from balance
  - Create print job record

---

### MÀN 7: PRINT HISTORY PAGE (STUDENT)

**Role:** Student  
**Priority:** P0 (Critical)  
**Route:** /student/print-history

**UI COMPONENTS:**

- Header: "Lịch sử in"
- Filters:
  - Date range picker: Từ ngày - Đến ngày
  - Dropdown: Trạng thái (Tất cả / Hoàn thành / Đang xử lý / Thất bại)
  - Search: Tìm theo tên file
- Table:
  - Columns: Ngày giờ | Tên tài liệu | Máy in | Số trang | Trạng thái | Hành động
  - Status badges:
    - Hoàn thành (green)
    - Đang xử lý (yellow)
    - Thất bại (red)
  - Actions: Xem chi tiết | In lại
- Pagination
- Export button: "Xuất Excel" (P2)

**CHỨC NĂNG:**

**[F11] Xem lịch sử in của bản thân (P0)**

- Call API: GET /api/print-jobs/history
- Filter by date, status
- Display jobs trong table

**[F12] Xem chi tiết lệnh in (P1)**

- Click row → Open modal
- Show: Document, Printer, Config (paper size, pages, sides, copies), Status, Submitted time, Completed time

**BACKEND API:**

- **GET /api/print-jobs/history (P0)**
- **GET /api/print-jobs/:id (P1)**

---

## NHÓM 3: QUẢN LÝ TRANG IN (STUDENT)

**Priority:** P0 - Critical  
**Lý do:** Cần thiết để sử dụng hệ thống in

---

### MÀN 8: PAGE BALANCE PAGE

**Role:** Student  
**Priority:** P0 (Critical)  
**Route:** /student/page-balance

**UI COMPONENTS:**

- Header: "Số dư trang in"
- Balance cards (3 cards):
  - Card 1:
    - Icon: A4
    - "Số trang A4": 50 trang
    - Progress bar (50/100)
  - Card 2:
    - Icon: A3
    - "Số trang A3": 10 trang
    - Progress bar (10/20)
  - Card 3:
    - Icon: Total
    - "Tổng A4 tương đương": 70 trang
- Purchase section:
  - Header: "Mua thêm trang in"
  - Form:
    - Input: Số trang A4 muốn mua
    - Display: Giá: 500 VND/trang → Tổng: X VND
    - Button: "Thanh toán qua SIUPay"
- Transaction history section:
  - Header: "Lịch sử giao dịch"
  - Table: Ngày | Loại | Số trang | Số dư sau | Ghi chú
  - Types: Cấp phát | Mua thêm | Khấu trừ (in)
  - Pagination

**CHỨC NĂNG:**

**[F13] Xem số dư trang in (P0)**

- Call API: GET /api/users/me/page-balance
- Display A4, A3 balance

**[F14] Mua thêm trang in (P0)**

- Input: Số trang cần mua
- Calculate: Total price
- Mock payment: Confirmation dialog
- Call API: POST /api/page-balance/purchase
- On success: Update balance + show success message

**[F15] Xem lịch sử giao dịch trang in (P1)**

- Call API: GET /api/page-balance/transactions
- Display transactions trong table

**BACKEND API:**

- **GET /api/users/me/page-balance (P0)**
- **POST /api/page-balance/purchase (P0)**
- **GET /api/page-balance/transactions (P1)**

---

## NHÓM 4: DASHBOARD (STUDENT)

**Priority:** P1 - High  
**Lý do:** Cải thiện UX, nhưng không critical

---

### MÀN 9: STUDENT DASHBOARD

**Role:** Student  
**Priority:** P1 (High)  
**Route:** /student/dashboard

**UI COMPONENTS:**

- Header: "Xin chào, [Tên sinh viên]"
- Widget cards (4 cards):
  - Card 1: Số dư trang (với progress bar + button "Mua thêm")
  - Card 2: Lệnh in gần đây (5 jobs gần nhất)
  - Card 3: Quick actions (buttons: Upload | In tài liệu | Lịch sử)
  - Card 4: Thông báo (nếu có)
- Chart section:
  - Line chart: Số trang in theo tháng (6 tháng gần đây)

**CHỨC NĂNG:**

**[F16] Dashboard tổng quan (P1)**

- Call APIs: Balance, Recent jobs
- Display widgets + chart
- Quick navigation to main features

**BACKEND API:**

- **GET /api/users/me/page-balance (P0)**
- **GET /api/print-jobs/recent?limit=5 (P1)**

---

## NHÓM 5: QUẢN LÝ MÁY IN (SPSO)

**Priority:** P0 - Critical  
**Lý do:** SPSO cần quản lý máy in để sinh viên sử dụng

---

### MÀN 10: PRINTER MANAGEMENT PAGE (SPSO)

**Role:** SPSO  
**Priority:** P0 (Critical)  
**Route:** /spso/printers

**UI COMPONENTS:**

- Header: "Quản lý máy in" + Button: "+ Thêm máy in"
- Filters:
  - Dropdown: Cơ sở
  - Dropdown: Trạng thái (Tất cả / Khả dụng / Bảo trì / Tắt)
  - Search: Tìm theo tên
- Table:
  - Columns: ID | Tên máy in | Vị trí | Trạng thái | Khổ giấy | Hành động
  - Status với badges
  - Actions:
    - Switch (Bật/Tắt máy in)
    - Button: Sửa
    - Button: Xóa
- Pagination

**CHỨC NĂNG:**

**[F17] Xem danh sách máy in (P0)**

- Call API: GET /api/printers
- Display all printers

**[F18] Thêm máy in mới (P0)**

- Click "+ Thêm" → Open modal
- Form: Tên, Hãng, Model, Cơ sở, Tòa, Phòng, Khổ giấy (multi-select)
- Call API: POST /api/printers

**[F19] Sửa thông tin máy in (P0)**

- Click "Sửa" → Open modal (pre-filled)
- Call API: PUT /api/printers/:id

**[F20] Xóa máy in (P1)**

- Confirmation dialog: "Bạn có chắc muốn xóa máy in này?"
- Call API: DELETE /api/printers/:id

**[F21] Bật/Tắt máy in (P0)**

- Toggle switch
- Call API: PATCH /api/printers/:id/toggle
- Update status: Active ↔ Inactive

**BACKEND API:**

- **GET /api/printers (P0)**
- **POST /api/printers (P0)**
- **PUT /api/printers/:id (P0)**
- **DELETE /api/printers/:id (P1)**
- **PATCH /api/printers/:id/toggle (P0)**

---

## NHÓM 6: LỊCH SỬ IN (SPSO)

**Priority:** P0 - Critical  
**Lý do:** SPSO cần giám sát hoạt động in

---

### MÀN 11: PRINT LOGS PAGE (SPSO)

**Role:** SPSO  
**Priority:** P0 (Critical)  
**Route:** /spso/print-logs

**UI COMPONENTS:**

- Header: "Lịch sử in hệ thống"
- Filters:
  - Date range picker
  - Search: Tìm sinh viên (theo tên/email/MSSV)
  - Dropdown: Máy in
  - Dropdown: Trạng thái
- Button: "Xuất Excel"
- Table:
  - Columns: Ngày giờ | Sinh viên | MSSV | Tài liệu | Máy in | Số trang | Trạng thái
  - Click row → Show detail modal
- Pagination

**CHỨC NĂNG:**

**[F22] Xem lịch sử in của tất cả sinh viên (P0)**

- Call API: GET /api/print-logs
- Filter by student, printer, date
- Display all print jobs

**[F23] Xem chi tiết lệnh in (P1)**

- Click row → Modal
- Show full job details + student info + printer info

**BACKEND API:**

- **GET /api/print-logs (P0)**
  - Query params: ?studentId=X&printerId=Y&startDate=Z&endDate=W

---

## NHÓM 7: BÁO CÁO & THỐNG KÊ (SPSO)

**Priority:** P1 - High  
**Lý do:** Quan trọng cho quản lý, nhưng không critical như in ấn

---

### MÀN 12: SPSO DASHBOARD

**Role:** SPSO  
**Priority:** P1 (High)  
**Route:** /spso/dashboard

**UI COMPONENTS:**

- Header: "Dashboard SPSO"
- Metric cards (4 cards):
  - Card 1: Tổng lệnh in (tháng này)
  - Card 2: Tổng số trang (tháng này)
  - Card 3: Doanh thu (tháng này)
  - Card 4: Máy in hoạt động
- Charts:
  - Bar chart: Số trang in theo ngày (30 ngày gần đây)
  - Pie chart: Phân bổ theo khổ giấy (A4 vs A3)
  - Bar chart: Top 5 sinh viên in nhiều nhất
  - Bar chart: Top 3 máy in bận nhất

**CHỨC NĂNG:**

**[F24] Dashboard tổng quan SPSO (P1)**

- Call API: GET /api/reports/dashboard
- Display metrics + charts

**BACKEND API:**

- **GET /api/reports/dashboard (P1)**

---

### MÀN 13: REPORTS PAGE (SPSO)

**Role:** SPSO  
**Priority:** P1 (High)  
**Route:** /spso/reports

**UI COMPONENTS:**

- Header: "Báo cáo"
- Month/Year selector:
  - Dropdown: Tháng (1-12)
  - Dropdown: Năm (2024, 2025, ...)
  - Button: "Tạo báo cáo"
- Report display:
  - Section 1: Thống kê chung
    - Tổng lệnh in
    - Tổng trang in
    - Doanh thu
  - Section 2: Top students (table)
  - Section 3: Top printers (table)
  - Section 4: Phân bổ theo khổ giấy (chart)
- Button: "Tải PDF" / "Tải Excel"

**CHỨC NĂNG:**

**[F25] Tạo báo cáo theo tháng/năm (P1)**

- Select month/year
- Call API: GET /api/reports/monthly?month=2024-11
- Display report data
- Export to PDF/Excel (P2)

**BACKEND API:**

- **GET /api/reports/monthly?month=YYYY-MM (P1)**
- **GET /api/reports/yearly?year=YYYY (P1)**

---

## NHÓM 8: CẤU HÌNH HỆ THỐNG (SPSO)

**Priority:** P2 - Medium  
**Lý do:** Quan trọng nhưng có thể config 1 lần rồi ít thay đổi

---

### MÀN 14: SYSTEM SETTINGS PAGE (SPSO)

**Role:** SPSO  
**Priority:** P2 (Medium)  
**Route:** /spso/settings

**UI COMPONENTS:**

- Header: "Cấu hình hệ thống"
- Form (sections):
  - Section 1: Cấp phát trang
    - Input: Số trang A4 mặc định mỗi kỳ (default: 50)
    - Input: Số trang A3 mặc định mỗi kỳ (default: 10)
    - Date picker: Ngày cấp phát (default: 1st day of semester)
  - Section 2: Tệp tin
    - Multi-select: Loại file cho phép (pdf, docx, pptx, xlsx)
    - Input: Kích thước tối đa (MB) (default: 50)
  - Section 3: Thanh toán
    - Input: Giá 1 trang A4 (VND) (default: 500)
    - Input: Giá 1 trang A3 (VND) (default: 1000)
- Button: "Lưu cấu hình"

**CHỨC NĂNG:**

**[F26] Cấu hình hệ thống (P2)**

- Call API: GET /api/system-config (load current config)
- Update form
- Call API: PUT /api/system-config (save)
- Show success message

**BACKEND API:**

- **GET /api/system-config (P2)**
- **PUT /api/system-config (P2)**

---

## NHÓM 9: NOTIFICATION & PROFILE (COMMON)

**Priority:** P3 - Low  
**Lý do:** Nice-to-have, cải thiện UX

---

### Notifications

**[F27] Xem danh sách thông báo (P3)**

- Call API: GET /api/notifications
- Hiển thị danh sách, paginate
- Lọc: chưa đọc/đã đọc

**[F28] Đánh dấu thông báo đã đọc (P3)**

- Call API: PATCH /api/notifications/:id/read
- Hỗ trợ đánh dấu tất cả: POST /api/notifications/mark-all-read

**BACKEND API:**

- **GET /api/notifications (P3)**
- **PATCH /api/notifications/:id/read (P3)**
- **POST /api/notifications/mark-all-read (P3)**

---

### MÀN 15: USER PROFILE PAGE

**Role:** Common (Student & SPSO)  
**Priority:** P3 (Low)  
**Route:** /profile

**UI COMPONENTS:**

- Header: "Thông tin cá nhân"
- Form:
  - Avatar (upload - optional)
  - Email (readonly)
  - Họ và tên
  - MSSV (Student only, readonly)
  - Khoa (Student only)
  - Số điện thoại
  - Button: "Cập nhật"
- Section: Đổi mật khẩu
  - Input: Mật khẩu hiện tại
  - Input: Mật khẩu mới
  - Input: Xác nhận mật khẩu mới
  - Button: "Đổi mật khẩu"

**CHỨC NĂNG:**

**[F29] Xem thông tin cá nhân (P3)**

- Call API: GET /api/users/me

**[F30] Cập nhật thông tin cá nhân (P3)**

- Call API: PUT /api/users/me

**[F31] Đổi mật khẩu (P3)**

- Call API: POST /api/auth/change-password

**BACKEND API:**

- **GET /api/users/me (P3)**
- **PUT /api/users/me (P3)**
- **POST /api/auth/change-password (P3)**

---

## TỔNG KẾT

### THỐNG KÊ THEO PRIORITY

| Priority    | Số màn hình | Số chức năng | Tỷ lệ              |
| ----------- | ----------- | ------------ | ------------------ |
| P0 Critical | 9           | 15           | 48% - MUST HAVE    |
| P1 High     | 4           | 8            | 26% - SHOULD HAVE  |
| P2 Medium   | 1           | 3            | 10% - NICE TO HAVE |
| P3 Low      | 1           | 5            | 16% - CAN SKIP     |
| **TOTAL**   | **15**      | **31**       | **100%**           |

### THỐNG KÊ THEO ROLE

| Role      | Số màn hình | Số chức năng |
| --------- | ----------- | ------------ |
| Student   | 6           | 13           |
| SPSO      | 6           | 10           |
| Common    | 3           | 8            |
| **TOTAL** | **15**      | **31**       |

### THỐNG KÊ THEO NHÓM CHỨC NĂNG

| Nhóm                          | Priority | Màn hình | Chức năng | Ghi chú    |
| ----------------------------- | -------- | -------- | --------- | ---------- |
| 1. Authentication             | P0       | 3        | 3         | Must-have  |
| 2. In tài liệu (Student)      | P0       | 4        | 9         | Core flow  |
| 3. Quản lý trang in (Student) | P0       | 1        | 3         | Core flow  |
| 4. Dashboard (Student)        | P1       | 1        | 1         | UX improve |
| 5. Quản lý máy in (SPSO)      | P0       | 1        | 5         | Core flow  |
| 6. Lịch sử in (SPSO)          | P0       | 1        | 2         | Core flow  |
| 7. Báo cáo (SPSO)             | P1       | 2        | 2         | Important  |
| 8. Cấu hình (SPSO)            | P2       | 1        | 1         | Config 1x  |
| 9. Profile & Notifications    | P3       | 1        | 5         | Nice-have  |

---

## ĐỀ XUẤT THỨ TỰ THỰC HIỆN (2 SPRINTS)

### SPRINT 1 (Week 1-2): MVP CORE FEATURES

**Mục tiêu:** Hoàn thành core flow để sinh viên có thể in tài liệu

**MÀN HÌNH (9 màn):**

1. Login Page (P0)
2. Register Page (P1)
3. Upload Document Page (P0)
4. Printer Selection Page (P0)
5. Print Configuration Page (P0)
6. Print History Page - Student (P0)
7. Page Balance Page (P0)
8. Printer Management Page - SPSO (P0)
9. Print Logs Page - SPSO (P0)

**CHỨC NĂNG (20):**

- Authentication: F01, F02 (2 chức năng)
- In tài liệu: F04, F05, F06, F07, F08, F09, F10, F11, F12 (9 chức năng)
- Quản lý trang: F13, F14, F15 (3 chức năng)
- Quản lý máy in: F17, F18, F19, F21 (4 chức năng)
- Lịch sử: F22, F23 (2 chức năng)

**DELIVERABLE:** Hệ thống in cơ bản hoạt động end-to-end

### SPRINT 2 (Week 3-4): DASHBOARD, REPORTS & POLISH

**Mục tiêu:** Hoàn thiện dashboard, báo cáo, và UX

**MÀN HÌNH (6 màn):**

10. Student Dashboard (P1)
11. SPSO Dashboard (P1)
12. Reports Page - SPSO (P1)
13. System Settings Page - SPSO (P2)
14. User Profile Page (P3)
15. Forgot Password Page (P3)

**CHỨC NĂNG (9):**

- Dashboard: F16, F24 (2 chức năng)
- Báo cáo: F25 (1 chức năng)
- Quản lý máy in: F20 (1 chức năng - Xóa máy in)
- Cấu hình: F26 (1 chức năng)
- Profile: F27, F28, F29 (3 chức năng)
- Auth: F03 (1 chức năng)

**DELIVERABLE:** Hệ thống hoàn chỉnh với dashboard & reports

---

## DANH SÁCH API CẦN THIẾT (31 APIs)

### P0 - CRITICAL APIs (Must-have for Sprint 1) - 17 APIs

**AUTHENTICATION (3):**

1. POST /api/auth/login - Login
2. POST /api/auth/register - Register student
3. GET /api/auth/me - Get current user

**DOCUMENTS (3):**

4. POST /api/documents/upload - Upload file
5. GET /api/documents - List user's documents
6. DELETE /api/documents/:id - Delete document

**PRINTERS (4):**

7. GET /api/printers - List printers
8. POST /api/printers - Add printer (SPSO)
9. PUT /api/printers/:id - Update printer (SPSO)
10. PATCH /api/printers/:id/toggle - Enable/Disable printer (SPSO)

**PRINT JOBS (3):**

11. POST /api/print-jobs - Submit print job
12. GET /api/print-jobs/history - Student's print history
13. GET /api/print-jobs/:id - Print job details

**PAGE BALANCE (3):**

14. GET /api/users/me/page-balance - Get balance
15. POST /api/page-balance/purchase - Purchase pages
16. GET /api/page-balance/transactions - Transaction history

**PRINT LOGS - SPSO (1):**

17. GET /api/print-logs - All print logs (with filters)

### P1 - HIGH PRIORITY APIs (Sprint 2) - 4 APIs

**REPORTS (3):**

18. GET /api/reports/dashboard - Dashboard stats
19. GET /api/reports/monthly?month=... - Monthly report
20. GET /api/reports/yearly?year=... - Yearly report

**PRINT JOBS (1):**

21. GET /api/print-jobs/recent?limit=5 - Recent jobs

### P2 - MEDIUM PRIORITY APIs (Sprint 2, if time) - 3 APIs

**SYSTEM CONFIG (2):**

22. GET /api/system-config - Get config
23. PUT /api/system-config - Update config

**PRINTERS (1):**

24. DELETE /api/printers/:id - Delete printer

### P3 - LOW PRIORITY APIs (Post-MVP) - 4 APIs

**PROFILE (3):**

25. GET /api/users/me - Get profile
26. PUT /api/users/me - Update profile
27. POST /api/auth/change-password - Change password

**AUTH (1):**

28. POST /api/auth/forgot-password - Forgot password

**NOTIFICATIONS (3):**

29. GET /api/notifications - List notifications
30. PATCH /api/notifications/:id/read - Mark single as read
31. POST /api/notifications/mark-all-read - Mark all as read

---

## UI/UX DESIGN GUIDELINES

### DESIGN SYSTEM

**COLORS:**

- Primary: #1890ff (Blue - HCMIU theme)
- Success: #52c41a (Green)
- Warning: #faad14 (Yellow/Orange)
- Error: #f5222d (Red)
- Neutral: #f0f2f5 (Background), #ffffff (White), #000000 (Text)

**TYPOGRAPHY:**

- Font: Inter / Roboto / San Francisco
- Heading 1: 32px, Bold
- Heading 2: 24px, Semi-bold
- Body: 14px, Regular
- Small: 12px, Regular

**COMPONENTS (use UI library like Ant Design / Material-UI):**

- Button (Primary, Secondary, Danger)
- Input (Text, Number, Select, Date Picker)
- Table (với pagination, sorting, filtering)
- Modal / Dialog
- Badge (Status indicators)
- Card
- Form
- Progress Bar
- Toast / Notification

**LAYOUT:**

- Sidebar navigation (collapsible)
- Top header (với user menu, notification bell)
- Content area (responsive)
- Footer (optional)

---

## GHI CHÚ QUAN TRỌNG

**CÓ THỂ BỎ QUA (P3) - Nếu thiếu thời gian:**

- Forgot Password (dùng manual reset)
- User Profile page (fix thông tin trong database)
- Change Password

**CÓ THỂ ĐƠN GIẢN HÓA (P2):**

- System Settings → Hard-code config trong code
- Delete Printer → Chỉ cho disable, không cho delete
- Export reports to PDF/Excel → Chỉ hiển thị trên web

**KHÔNG THỂ BỎ (P0) - Must-have:**

- Authentication (Login, Register)
- Upload Document
- Select Printer & Configure Print
- Submit Print Job
- Print History
- Page Balance & Purchase
- Printer Management (Add, Edit, Enable/Disable)
- Print Logs (SPSO)

---

## TECH STACK RECOMMENDATION

**FRONTEND:**

- **Next.js 14+** (App Router)
- React 18+
- TypeScript
- Ant Design (UI library)
- Axios / Fetch API (API calls)
- Zustand / Redux Toolkit (state management)
- Chart.js / Recharts (charts)
- TailwindCSS (styling)

**BACKEND:**

- **Java 17+**
- **Spring Boot 3.x** (Framework)
- Spring Web (REST API)
- Spring Data JPA (ORM)
- Spring Security + JWT (authentication)
- Hibernate (JPA implementation)
- Lombok (reduce boilerplate)
- ModelMapper / MapStruct (DTO mapping)
- Multipart File Upload support

**DATABASE:**

- **SQL Server 2019+**
- JDBC Driver: mssql-jdbc
- Connection Pool: HikariCP

**FILE STORAGE:**

- Local storage (cho dev/test)
- AWS S3 / Azure Blob Storage (cho production)

**DEPLOYMENT:**

- Frontend: Vercel / Netlify
- Backend: AWS EC2 / Azure App Service / Docker container
- Database: Azure SQL Database / AWS RDS SQL Server

---

**END OF DOCUMENT**
