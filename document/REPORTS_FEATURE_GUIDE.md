# HƯỚNG DẪN TÍNH NĂNG BÁO CÁO SPSO

## 📋 TỔNG QUAN

Tính năng Báo cáo cho phép SPSO xem thống kê và phân tích hoạt động in ấn theo tháng hoặc năm, bao gồm:

- Thống kê tổng quan (lệnh in, trang in, doanh thu, sinh viên hoạt động)
- Phân bổ theo khổ giấy (A4/A3)
- Top 5 sinh viên in nhiều nhất
- Top 3 máy in bận nhất
- Biểu đồ thống kê theo thời gian

---

## 🎯 CHỨC NĂNG

### 1. Báo cáo theo tháng

- Xem thống kê chi tiết cho một tháng cụ thể
- Biểu đồ thống kê theo ngày trong tháng
- Top performers (sinh viên và máy in)
- Phân bổ khổ giấy

### 2. Báo cáo theo năm

- Xem thống kê tổng hợp cho cả năm
- Biểu đồ thống kê theo 12 tháng
- Tháng hoạt động nhiều nhất
- Doanh thu trung bình mỗi sinh viên
- Top performers cả năm

---

## 🔧 CÀI ĐẶT

### Backend

#### 1. Controller

**File:** `backend/src/main/java/com/example/app/controller/ReportController.java`

Endpoints:

- `GET /api/reports/monthly?year={year}&month={month}` - Lấy báo cáo tháng
- `GET /api/reports/yearly?year={year}` - Lấy báo cáo năm
- `POST /api/reports/monthly/generate?year={year}&month={month}` - Tạo báo cáo tháng mới

#### 2. Service

**File:** `backend/src/main/java/com/example/app/service/ReportService.java`

Chức năng:

- `getMonthlyReport(year, month)` - Tính toán báo cáo tháng
- `getYearlyReport(year)` - Tính toán báo cáo năm
- `generateAndSaveMonthlyReport(year, month)` - Tạo và lưu báo cáo

#### 3. DTOs

**Files:**

- `backend/src/main/java/com/example/app/dto/MonthlyReportDTO.java`
- `backend/src/main/java/com/example/app/dto/YearlyReportDTO.java`

Cấu trúc dữ liệu:

```java
MonthlyReportDTO {
  year, month, monthName
  totalStudentsActive, totalPrintJobs, successfulJobs, failedJobs
  totalPagesPrinted, totalA4Equivalent, totalPagesPurchased, totalRevenue
  paperSizeDistribution { a4Count, a3Count, a4Percentage, a3Percentage }
  topStudents[] { studentId, studentName, studentEmail, totalPages, totalJobs }
  topPrinters[] { printerId, printerName, location, totalJobs, totalPages }
  dailyStats[] { day, jobs, pages, revenue }
}

YearlyReportDTO {
  year
  totalStudentsActive, totalPrintJobs, successfulJobs, failedJobs
  totalPagesPrinted, totalA4Equivalent, totalPagesPurchased, totalRevenue
  averageRevenuePerStudent
  mostActiveMonth, mostActiveMonthName, mostActiveMonthJobs
  paperSizeDistribution { a4Count, a3Count, a4Percentage, a3Percentage }
  topStudents[] { studentId, studentName, studentEmail, totalPages, totalJobs }
  topPrinters[] { printerId, printerName, location, totalJobs, totalPages }
  monthlyStats[] { month, monthName, jobs, pages, revenue }
}
```

#### 4. Repository Updates

**Files:**

- `backend/src/main/java/com/example/app/repository/PrintLogRepository.java`

  - Added: `findByPrintTimeBetween(startDate, endDate)` - Lấy logs trong khoảng thời gian

- `backend/src/main/java/com/example/app/repository/PageTransactionRepository.java`
  - Added: `findByCreatedAtBetween(startDate, endDate)` - Lấy transactions trong khoảng thời gian

### Frontend

#### 1. Service

**File:** `frontend/src/services/reportService.ts`

API calls:

```typescript
reportService.getMonthlyReport(year, month): Promise<MonthlyReportDTO>
reportService.getYearlyReport(year): Promise<YearlyReportDTO>
reportService.generateMonthlyReport(year, month): Promise<MonthlyReportDTO>
```

#### 2. Page Component

**File:** `frontend/src/app/spso/reports/page.tsx`

Features:

- Toggle giữa báo cáo tháng và năm
- Selector cho năm và tháng
- Hiển thị thống kê tổng quan (cards)
- Biểu đồ phân bổ khổ giấy (progress bars)
- Top performers (ranked lists)
- Biểu đồ thống kê theo thời gian (bar charts)

#### 3. Navigation

**File:** `frontend/src/components/SPSOLayout.tsx`

Menu item đã được thêm:

```typescript
{ name: 'Báo cáo', icon: <ReportIcon />, href: '/spso/reports' }
```

---

## 📊 CÁCH SỬ DỤNG

### Truy cập trang Báo cáo

1. Đăng nhập với tài khoản SPSO
2. Click vào menu "Báo cáo" ở sidebar
3. Trang báo cáo sẽ hiển thị

### Xem báo cáo tháng

1. Chọn loại "📅 Tháng"
2. Chọn năm từ dropdown
3. Chọn tháng từ dropdown
4. Báo cáo sẽ tự động load
5. Xem các thống kê:
   - Tổng lệnh in, trang in, doanh thu, sinh viên hoạt động
   - Phân bổ A4/A3
   - Top 5 sinh viên
   - Top 3 máy in
   - Biểu đồ theo ngày

### Xem báo cáo năm

1. Chọn loại "📊 Năm"
2. Chọn năm từ dropdown
3. Báo cáo sẽ tự động load
4. Xem các thống kê:
   - Tổng quan cả năm
   - Tháng hoạt động nhiều nhất
   - Phân bổ A4/A3
   - Biểu đồ theo 12 tháng
   - Top 5 sinh viên
   - Top 3 máy in

### Xuất báo cáo ✨ NEW

#### Xuất PDF

1. Sau khi báo cáo hiển thị, click nút "Xuất PDF" (màu đỏ)
2. File PDF sẽ tự động download
3. Mở file để xem báo cáo đầy đủ với format chuyên nghiệp

**Nội dung PDF:**

- Header với logo và thông tin hệ thống
- Thống kê tổng quan (cards)
- Bảng phân bổ khổ giấy
- Bảng top 5 sinh viên
- Bảng top 3 máy in
- Footer với thông tin bản quyền

#### Xuất Excel

1. Sau khi báo cáo hiển thị, click nút "Xuất Excel" (màu xanh)
2. File Excel sẽ tự động download
3. Mở file bằng Excel/Google Sheets để xem và phân tích

**Nội dung Excel:**

Báo cáo tháng (4 sheets):

- Sheet 1: Tổng quan (thống kê chính)
- Sheet 2: Top sinh viên (bảng chi tiết)
- Sheet 3: Top máy in (bảng chi tiết)
- Sheet 4: Thống kê theo ngày (31 ngày)

Báo cáo năm (4 sheets):

- Sheet 1: Tổng quan (thống kê chính + tháng hoạt động nhiều nhất)
- Sheet 2: Top sinh viên (bảng chi tiết)
- Sheet 3: Top máy in (bảng chi tiết)
- Sheet 4: Thống kê theo tháng (12 tháng)

---

## 🎨 GIAO DIỆN

### Màu sắc

- **Indigo/Purple gradient**: Header và primary actions
- **Green**: Doanh thu và thành công
- **Blue**: Máy in và thông tin
- **Yellow**: Top performers
- **Purple**: Biểu đồ

### Components

- **Stats Cards**: Hiển thị số liệu tổng quan với icon và màu sắc phân biệt
- **Progress Bars**: Phân bổ khổ giấy A4/A3
- **Ranked Lists**: Top students và printers với medals (🥇🥈🥉)
- **Bar Charts**: Thống kê theo thời gian với tooltips
- **Gradient Banner**: Tháng hoạt động nhiều nhất (yearly report)

---

## 🔍 LOGIC TÍNH TOÁN

### Báo cáo tháng

1. Lấy tất cả PrintLogs trong tháng
2. Tính tổng lệnh in (total, success, failed)
3. Tính tổng trang in và A4 equivalent
4. Đếm số sinh viên unique
5. Lấy PageTransactions để tính doanh thu
6. Group by studentId → Top 5 students
7. Group by printerId → Top 3 printers
8. Group by day → Daily stats (31 ngày)
9. Tính phân bổ A4/A3

### Báo cáo năm

1. Lấy tất cả PrintLogs trong năm
2. Tính tổng lệnh in, trang in, sinh viên
3. Lấy PageTransactions để tính doanh thu
4. Tính doanh thu trung bình/sinh viên
5. Group by month → Monthly stats (12 tháng)
6. Tìm tháng có nhiều lệnh in nhất
7. Group by studentId → Top 5 students
8. Group by printerId → Top 3 printers
9. Tính phân bổ A4/A3

---

## 🚀 API ENDPOINTS

### GET /api/reports/monthly

**Query Parameters:**

- `year` (required): Năm (e.g., 2024)
- `month` (required): Tháng (1-12)

**Response:** `MonthlyReportDTO`

**Example:**

```bash
GET /api/reports/monthly?year=2024&month=11
```

### GET /api/reports/yearly

**Query Parameters:**

- `year` (required): Năm (e.g., 2024)

**Response:** `YearlyReportDTO`

**Example:**

```bash
GET /api/reports/yearly?year=2024
```

### POST /api/reports/monthly/generate

**Query Parameters:**

- `year` (required): Năm
- `month` (required): Tháng

**Response:** `MonthlyReportDTO`

**Note:** Endpoint này có thể được dùng để tạo và lưu báo cáo vào database (future enhancement)

### GET /api/reports/monthly/export/pdf ✨ NEW

**Query Parameters:**

- `year` (required): Năm
- `month` (required): Tháng

**Response:** PDF file (application/pdf)

**Example:**

```bash
GET /api/reports/monthly/export/pdf?year=2024&month=11
```

**Features:**

- Tự động download file PDF
- Tên file: `BaoCaoThang_{month}_{year}.pdf`
- Bao gồm: Header, thống kê, biểu đồ, top performers, footer

### GET /api/reports/monthly/export/excel ✨ NEW

**Query Parameters:**

- `year` (required): Năm
- `month` (required): Tháng

**Response:** Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**Example:**

```bash
GET /api/reports/monthly/export/excel?year=2024&month=11
```

**Features:**

- Tự động download file Excel
- Tên file: `BaoCaoThang_{month}_{year}.xlsx`
- 4 sheets: Tổng quan, Top sinh viên, Top máy in, Thống kê theo ngày

### GET /api/reports/yearly/export/pdf ✨ NEW

**Query Parameters:**

- `year` (required): Năm

**Response:** PDF file (application/pdf)

**Example:**

```bash
GET /api/reports/yearly/export/pdf?year=2024
```

**Features:**

- Tự động download file PDF
- Tên file: `BaoCaoNam_{year}.pdf`
- Bao gồm: Header, thống kê, tháng hoạt động nhiều nhất, top performers, footer

### GET /api/reports/yearly/export/excel ✨ NEW

**Query Parameters:**

- `year` (required): Năm

**Response:** Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**Example:**

```bash
GET /api/reports/yearly/export/excel?year=2024
```

**Features:**

- Tự động download file Excel
- Tên file: `BaoCaoNam_{year}.xlsx`
- 4 sheets: Tổng quan, Top sinh viên, Top máy in, Thống kê theo tháng

---

## 📝 GHI CHÚ

### Performance

- Báo cáo được tính toán real-time từ PrintLogs và PageTransactions
- Với dữ liệu lớn, nên cache kết quả hoặc pre-generate reports
- Consider pagination cho top lists nếu cần

### Future Enhancements

1. ~~**Export PDF/Excel**: Xuất báo cáo ra file~~ ✅ **COMPLETED**
2. **Scheduled Reports**: Tự động tạo báo cáo định kỳ
3. **Email Reports**: Gửi báo cáo qua email
4. **Custom Date Range**: Chọn khoảng thời gian tùy ý
5. **More Charts**: Thêm pie charts, line charts
6. **Comparison**: So sánh giữa các tháng/năm
7. **Filters**: Lọc theo campus, building, printer type

### Security

- Chỉ SPSO và ADMIN có quyền truy cập
- Sử dụng `@PreAuthorize("hasRole('SPSO') or hasRole('ADMIN')")`

### Data Sources

- **PrintLogs**: Lịch sử in (jobs, pages, status, time)
- **PageTransactions**: Giao dịch mua trang (revenue)
- **Users**: Thông tin sinh viên
- **Printers**: Thông tin máy in

---

## 🐛 TROUBLESHOOTING

### Lỗi "Không thể tải báo cáo"

- Kiểm tra kết nối database
- Kiểm tra có dữ liệu trong tháng/năm đó không
- Xem console log để biết chi tiết lỗi

### Biểu đồ không hiển thị

- Kiểm tra có dữ liệu không (logs.length > 0)
- Kiểm tra maxJobs/maxRevenue có > 0 không
- Xem browser console để debug

### Top lists trống

- Kiểm tra có PrintLogs với status Success/Completed không
- Kiểm tra relationships (student, printer) có load được không

---

## ✅ CHECKLIST TRIỂN KHAI

- [x] Backend Controller (ReportController.java)
- [x] Backend Service (ReportService.java)
- [x] Backend Export Service (ReportExportService.java) ✨ NEW
- [x] Backend DTOs (MonthlyReportDTO, YearlyReportDTO)
- [x] Repository methods (findByPrintTimeBetween, findByCreatedAtBetween)
- [x] Frontend Service (reportService.ts)
- [x] Frontend Page (reports/page.tsx)
- [x] Navigation menu (SPSOLayout.tsx)
- [x] PDF Export endpoints ✨ NEW
- [x] Excel Export endpoints ✨ NEW
- [x] Auto-load reports on dropdown change ✨ NEW
- [x] Compile test (mvn compile)
- [ ] Integration test
- [ ] UI/UX review
- [ ] Performance test với dữ liệu lớn

---

## 📦 DEPENDENCIES

### Backend (pom.xml)

```xml
<!-- iText for PDF generation -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>

<!-- Apache POI for Excel generation (already included) -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

### Frontend

No additional dependencies needed - uses native browser APIs for file download.

---

**© 2025 - HCMSIU SSPS - Student Smart Printing Service**
