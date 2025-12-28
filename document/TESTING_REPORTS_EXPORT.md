# HƯỚNG DẪN TEST CHỨC NĂNG BÁO CÁO & XUẤT FILE

## 🎯 MỤC TIÊU

Test toàn bộ chức năng trang Báo cáo SPSO, bao gồm:

- Xem báo cáo tháng/năm
- Xuất PDF
- Xuất Excel
- Auto-load khi thay đổi dropdown

---

## 🚀 CHUẨN BỊ

### 1. Khởi động Backend

```bash
cd backend
mvn spring-boot:run
```

**Kiểm tra:** Backend chạy ở `http://localhost:8080`

### 2. Khởi động Frontend

```bash
cd frontend
npm run dev
```

**Kiểm tra:** Frontend chạy ở `http://localhost:3000`

### 3. Đăng nhập

- Mở trình duyệt: `http://localhost:3000/login`
- Đăng nhập với tài khoản SPSO
- Vào trang Báo cáo: `http://localhost:3000/spso/reports`

---

## ✅ TEST CASES

### TC1: Xem báo cáo tháng

**Mục đích:** Kiểm tra load báo cáo tháng với dữ liệu thật

**Các bước:**

1. Vào trang `/spso/reports`
2. Chọn loại "Tháng" (icon lịch)
3. Chọn năm: 2024
4. Chọn tháng: 12

**Kết quả mong đợi:**

- ✅ Báo cáo tự động load (không cần bấm nút)
- ✅ Hiển thị 4 cards thống kê:
  - Tổng lệnh in
  - Tổng trang in
  - Doanh thu
  - Sinh viên hoạt động
- ✅ Hiển thị phân bổ A4/A3 với progress bar
- ✅ Hiển thị Top 5 sinh viên (nếu có dữ liệu)
- ✅ Hiển thị Top 3 máy in (nếu có dữ liệu)
- ✅ Hiển thị biểu đồ theo ngày (31 ngày)
- ✅ Hiển thị phần "Phân tích & Đề xuất"
- ✅ Nút "Xuất PDF" và "Xuất Excel" hiển thị

**Nếu không có dữ liệu:**

- Thử chọn tháng khác (11, 10, 9...)
- Hoặc kiểm tra database có dữ liệu PrintLog không

---

### TC2: Xem báo cáo năm

**Mục đích:** Kiểm tra load báo cáo năm với dữ liệu thật

**Các bước:**

1. Vào trang `/spso/reports`
2. Chọn loại "Năm" (icon biểu đồ)
3. Chọn năm: 2024

**Kết quả mong đợi:**

- ✅ Báo cáo tự động load
- ✅ Hiển thị 4 cards thống kê
- ✅ Hiển thị banner "Tháng hoạt động nhiều nhất" (gradient màu tím)
- ✅ Hiển thị phân bổ A4/A3
- ✅ Hiển thị biểu đồ theo tháng (12 tháng)
- ✅ Hiển thị Top 5 sinh viên
- ✅ Hiển thị Top 3 máy in
- ✅ Nút "Xuất PDF" và "Xuất Excel" hiển thị

---

### TC3: Auto-load khi thay đổi dropdown

**Mục đích:** Kiểm tra báo cáo tự động load khi thay đổi filter

**Các bước:**

1. Đang ở báo cáo tháng 12/2024
2. Thay đổi tháng thành 11
3. Quan sát

**Kết quả mong đợi:**

- ✅ Hiển thị loading spinner
- ✅ Báo cáo tự động load dữ liệu tháng 11
- ✅ Không cần bấm nút "Tạo báo cáo"
- ✅ Dữ liệu cập nhật đúng

**Thử thêm:**

- Thay đổi năm
- Chuyển từ Tháng sang Năm
- Chuyển từ Năm sang Tháng

---

### TC4: Xuất PDF - Báo cáo tháng

**Mục đích:** Kiểm tra xuất PDF báo cáo tháng

**Các bước:**

1. Xem báo cáo tháng 12/2024
2. Click nút "Xuất PDF" (màu đỏ)
3. Đợi download

**Kết quả mong đợi:**

- ✅ File download tự động
- ✅ Tên file: `BaoCaoThang_12_2024.pdf`
- ✅ Mở file PDF thành công
- ✅ PDF có nội dung:
  - Header: "BÁO CÁO HOẠT ĐỘNG IN ẤN"
  - Subtitle: "Tháng 12 / 2024"
  - Thông tin hệ thống
  - Ngày tạo
  - Section "TỔNG QUAN" với 4 stats
  - Section "PHÂN BỔ THEO KHỔ GIẤY" với bảng
  - Section "TOP 5 SINH VIÊN IN NHIỀU NHẤT" với bảng
  - Section "TOP 3 MÁY IN BẬN NHẤT" với bảng
  - Footer với copyright
- ✅ Font chữ hiển thị đúng (không bị lỗi tiếng Việt)
- ✅ Bảng có màu sắc đẹp

**Nếu lỗi:**

- Kiểm tra console browser
- Kiểm tra backend logs
- Kiểm tra network tab (status 200?)

---

### TC5: Xuất Excel - Báo cáo tháng

**Mục đích:** Kiểm tra xuất Excel báo cáo tháng

**Các bước:**

1. Xem báo cáo tháng 12/2024
2. Click nút "Xuất Excel" (màu xanh)
3. Đợi download

**Kết quả mong đợi:**

- ✅ File download tự động
- ✅ Tên file: `BaoCaoThang_12_2024.xlsx`
- ✅ Mở file Excel thành công
- ✅ Excel có 4 sheets:

  **Sheet 1: "Tổng quan"**

  - Tiêu đề: "BÁO CÁO THÁNG 12/2024"
  - Các dòng thống kê (key-value)
  - Phân bổ khổ giấy

  **Sheet 2: "Top sinh viên"**

  - Header: #, Tên sinh viên, Email, Số trang, Số lệnh
  - 5 dòng dữ liệu (nếu có)

  **Sheet 3: "Top máy in"**

  - Header: #, Tên máy in, Vị trí, Số lệnh, Số trang
  - 3 dòng dữ liệu (nếu có)

  **Sheet 4: "Thống kê theo ngày"**

  - Header: Ngày, Số lệnh, Số trang
  - 31 dòng dữ liệu

- ✅ Columns tự động resize
- ✅ Header có màu xanh đậm, chữ trắng
- ✅ Dữ liệu format đẹp

---

### TC6: Xuất PDF - Báo cáo năm

**Mục đích:** Kiểm tra xuất PDF báo cáo năm

**Các bước:**

1. Xem báo cáo năm 2024
2. Click nút "Xuất PDF"
3. Đợi download

**Kết quả mong đợi:**

- ✅ File download: `BaoCaoNam_2024.pdf`
- ✅ PDF có nội dung:
  - Header: "BÁO CÁO HOẠT ĐỘNG IN ẤN NĂM 2024"
  - Tổng quan
  - Section "THÁNG HOẠT ĐỘNG NHIỀU NHẤT" (highlighted)
  - Phân bổ khổ giấy
  - Top 5 sinh viên
  - Top 3 máy in
  - Footer

---

### TC7: Xuất Excel - Báo cáo năm

**Mục đích:** Kiểm tra xuất Excel báo cáo năm

**Các bước:**

1. Xem báo cáo năm 2024
2. Click nút "Xuất Excel"
3. Đợi download

**Kết quả mong đợi:**

- ✅ File download: `BaoCaoNam_2024.xlsx`
- ✅ Excel có 4 sheets:
  - Sheet 1: Tổng quan (có tháng hoạt động nhiều nhất)
  - Sheet 2: Top sinh viên
  - Sheet 3: Top máy in
  - Sheet 4: Thống kê theo tháng (12 tháng)

---

### TC8: Test với dữ liệu rỗng

**Mục đích:** Kiểm tra xử lý khi không có dữ liệu

**Các bước:**

1. Chọn tháng/năm không có dữ liệu (ví dụ: tháng 1/2020)
2. Quan sát

**Kết quả mong đợi:**

- ✅ Không bị crash
- ✅ Hiển thị thống kê với giá trị 0
- ✅ Top lists rỗng (không hiển thị hoặc hiển thị "Không có dữ liệu")
- ✅ Biểu đồ hiển thị nhưng không có cột
- ✅ Vẫn có thể xuất PDF/Excel (với dữ liệu 0)

---

### TC9: Test responsive

**Mục đích:** Kiểm tra giao diện trên các kích thước màn hình

**Các bước:**

1. Mở DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Thử các kích thước:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1920px

**Kết quả mong đợi:**

- ✅ Cards xếp theo cột trên mobile
- ✅ Biểu đồ scroll được trên mobile
- ✅ Nút xuất file không bị che
- ✅ Dropdown không bị tràn

---

### TC10: Test error handling

**Mục đích:** Kiểm tra xử lý lỗi

**Các bước:**

1. Tắt backend
2. Thử load báo cáo
3. Quan sát

**Kết quả mong đợi:**

- ✅ Hiển thị error message: "Không thể tải báo cáo. Vui lòng thử lại."
- ✅ Không bị crash
- ✅ Có thể thử lại sau khi bật backend

**Thử thêm:**

- Tắt backend rồi click "Xuất PDF"
- Kết quả: Alert "Không thể xuất PDF. Vui lòng thử lại."

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Không thể tải báo cáo"

**Nguyên nhân có thể:**

- Backend chưa chạy
- Database không có dữ liệu
- Lỗi kết nối database

**Cách fix:**

1. Kiểm tra backend logs
2. Kiểm tra database connection
3. Thêm dữ liệu test vào database

### Lỗi: PDF không download

**Nguyên nhân có thể:**

- Browser chặn popup
- CORS issue
- Backend error

**Cách fix:**

1. Cho phép popup trong browser
2. Kiểm tra browser console
3. Kiểm tra backend logs
4. Kiểm tra Network tab (status code?)

### Lỗi: Excel file bị corrupt

**Nguyên nhân có thể:**

- Content-Type header sai
- Byte array không đầy đủ

**Cách fix:**

1. Kiểm tra backend logs
2. Verify Content-Type header
3. Kiểm tra file size > 0

### Lỗi: Tiếng Việt bị lỗi trong PDF

**Nguyên nhân:**

- Font không hỗ trợ tiếng Việt

**Cách fix:**

- iText7 mặc định hỗ trợ Unicode
- Nếu vẫn lỗi, cần config font riêng

---

## 📊 CHECKLIST HOÀN THÀNH

### Backend

- [x] Compile thành công
- [ ] Backend chạy không lỗi
- [ ] API `/api/reports/monthly` hoạt động
- [ ] API `/api/reports/yearly` hoạt động
- [ ] API `/api/reports/monthly/export/pdf` hoạt động
- [ ] API `/api/reports/monthly/export/excel` hoạt động
- [ ] API `/api/reports/yearly/export/pdf` hoạt động
- [ ] API `/api/reports/yearly/export/excel` hoạt động

### Frontend

- [x] Compile thành công
- [ ] Trang load không lỗi
- [ ] Auto-load báo cáo hoạt động
- [ ] Hiển thị dữ liệu đúng
- [ ] Biểu đồ hiển thị đẹp
- [ ] Xuất PDF hoạt động
- [ ] Xuất Excel hoạt động
- [ ] Responsive tốt
- [ ] Error handling tốt

### UI/UX

- [x] Thay emoji thành icon SVG
- [ ] Màu sắc đẹp, dễ nhìn
- [ ] Loading state rõ ràng
- [ ] Error message rõ ràng
- [ ] Smooth transitions

---

## 🎉 KẾT LUẬN

Sau khi test xong tất cả các test cases trên, bạn có thể:

1. **Nếu tất cả pass:** Tính năng hoàn thành, sẵn sàng deploy! 🚀
2. **Nếu có lỗi:** Ghi lại lỗi, check logs, fix và test lại
3. **Nếu cần cải thiện:** Note lại và làm trong sprint sau

---

**Chúc bạn test thành công!** 🎊
