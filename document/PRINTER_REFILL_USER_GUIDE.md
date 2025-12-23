# Hướng dẫn Nạp Giấy và Mực cho SPSO

## Tổng quan

Hệ thống đã tích hợp đầy đủ chức năng nạp giấy và mực cho máy in. SPSO có thể dễ dàng quản lý và nạp giấy/mực khi máy in cần.

## Cách sử dụng

### Bước 1: Truy cập trang Quản lý Máy in

1. Đăng nhập với tài khoản SPSO
2. Vào menu **"Quản lý Máy in"**
3. Xem danh sách tất cả máy in

### Bước 2: Xác định máy in cần nạp

Trong bảng danh sách máy in, bạn có thể thấy:

- **Cột "Giấy A4"**: Hiển thị số tờ còn lại và progress bar

  - Màu xanh: Đủ giấy (> 50 tờ)
  - Màu đỏ + icon cảnh báo: Sắp hết (≤ 50 tờ)

- **Cột "Mực đen"**: Hiển thị % mực còn lại và progress bar

  - Màu xám: Đủ mực (> 20%)
  - Màu đỏ + icon cảnh báo: Sắp hết (≤ 20%)

- **Cột "Trạng thái"**:
  - 🔴 **Hết giấy**: Máy in không đủ giấy A4 hoặc A3
  - 🟠 **Hết mực**: Mực đen ≤ 5%
  - 🔴 **Hết giấy và mực**: Cả hai đều hết

### Bước 3: Mở modal nạp giấy/mực

1. Click vào nút **"⋮"** (3 chấm dọc) ở cột "Thao tác"
2. Chọn **"Nạp giấy/mực"** (icon dấu +)

### Bước 4: Chọn mục cần nạp

Modal sẽ hiển thị:

#### Trạng thái hiện tại

- Giấy A4: X/500 tờ
- Giấy A3: X/250 tờ
- Mực đen: X%
- Mực xanh/đỏ/vàng: X% (nếu máy in màu)

#### Chọn mục cần nạp

Tick vào checkbox của các mục bạn muốn nạp:

- ☑️ **Giấy A4**: Reset về 500 tờ
- ☑️ **Giấy A3**: Reset về 250 tờ
- ☑️ **Mực đen**: Reset về 100%
- ☑️ **Mực xanh**: Reset về 100% (chỉ máy in màu)
- ☑️ **Mực đỏ**: Reset về 100% (chỉ máy in màu)
- ☑️ **Mực vàng**: Reset về 100% (chỉ máy in màu)

⚠️ **Lưu ý quan trọng**:

- Khi nạp, giấy/mực sẽ được **reset về đầy (100%)**
- Không phải "nạp thêm" mà là "nạp đầy"
- Ví dụ: Giấy A4 còn 50 tờ → Sau nạp = 500 tờ (không phải 550 tờ)

### Bước 5: Xác nhận nạp

1. Click nút **"Xác nhận nạp"**
2. Hệ thống sẽ:
   - Reset giấy/mực về đầy
   - Cập nhật trạng thái máy in về **"Active"** (nếu trước đó là OutOfPaper/OutOfToner)
   - Hiển thị thông báo "Nạp giấy/mực thành công!"
3. Bảng danh sách máy in sẽ tự động refresh

## Các trường hợp sử dụng

### Trường hợp 1: Máy in hết giấy A4

**Triệu chứng**:

- Trạng thái: "Hết giấy"
- Giấy A4: 0/500 tờ (progress bar đỏ)
- Sinh viên không thể chọn máy in này

**Giải pháp**:

1. Mở modal "Nạp giấy/mực"
2. Tick ☑️ "Giấy A4"
3. Click "Xác nhận nạp"
4. Giấy A4 → 500 tờ
5. Trạng thái → "Đang hoạt động"

### Trường hợp 2: Máy in hết mực đen

**Triệu chứng**:

- Trạng thái: "Hết mực"
- Mực đen: 3% (progress bar đỏ)
- Sinh viên không thể chọn máy in này

**Giải pháp**:

1. Mở modal "Nạp giấy/mực"
2. Tick ☑️ "Mực đen"
3. Click "Xác nhận nạp"
4. Mực đen → 100%
5. Trạng thái → "Đang hoạt động"

### Trường hợp 3: Máy in hết cả giấy và mực

**Triệu chứng**:

- Trạng thái: "Hết giấy và mực"
- Giấy A4: 0/500 tờ
- Mực đen: 2%

**Giải pháp**:

1. Mở modal "Nạp giấy/mực"
2. Tick ☑️ "Giấy A4"
3. Tick ☑️ "Mực đen"
4. Click "Xác nhận nạp"
5. Giấy A4 → 500 tờ, Mực đen → 100%
6. Trạng thái → "Đang hoạt động"

### Trường hợp 4: Nạp đầy tất cả (bảo trì định kỳ)

**Mục đích**: Nạp đầy tất cả giấy và mực cho máy in

**Giải pháp**:

1. Mở modal "Nạp giấy/mực"
2. Tick ☑️ tất cả các mục:
   - Giấy A4
   - Giấy A3
   - Mực đen
   - Mực xanh/đỏ/vàng (nếu máy in màu)
3. Click "Xác nhận nạp"
4. Tất cả đều reset về đầy

## Lọc máy in cần nạp

Để xem danh sách máy in cần nạp:

1. Sử dụng dropdown **"Trạng thái"** trong phần Filters
2. Chọn:
   - **"Hết giấy"**: Xem máy in hết giấy
   - **"Hết mực"**: Xem máy in hết mực
   - **"Hết giấy và mực"**: Xem máy in hết cả hai

## Lưu ý quan trọng

### 1. Logic nạp giấy/mực

- **1 lần nạp = Reset về đầy**
- Không phải "nạp thêm" mà là "nạp đầy"
- Backend sẽ tự động set về capacity/100%

### 2. Tự động cập nhật trạng thái

Sau khi nạp, hệ thống tự động:

- Nếu đủ giấy và mực → Trạng thái = "Active"
- Máy in sẽ xuất hiện trong danh sách máy in khả dụng cho sinh viên

### 3. Validation

- Phải chọn ít nhất 1 mục để nạp
- Nếu không chọn gì → Hiển thị lỗi "Vui lòng chọn ít nhất 1 mục cần nạp"

### 4. Dung lượng mặc định

- **Giấy A4**: 500 tờ
- **Giấy A3**: 250 tờ
- **Mực**: 100%

## Câu hỏi thường gặp (FAQ)

### Q1: Tại sao không thấy nút "Nạp giấy/mực"?

**A**: Kiểm tra:

- Bạn đã đăng nhập với tài khoản SPSO chưa?
- Đã click vào nút "⋮" (3 chấm dọc) ở cột "Thao tác" chưa?

### Q2: Có thể nạp một phần không? (Ví dụ: nạp 100 tờ A4)

**A**: Không. Hệ thống chỉ hỗ trợ nạp đầy (reset về 100%). Đây là thiết kế để đơn giản hóa quản lý.

### Q3: Sau khi nạp, tại sao trạng thái vẫn là "Hết giấy"?

**A**: Kiểm tra:

- Bạn đã tick checkbox "Giấy A4" hoặc "Giấy A3" chưa?
- Đã click "Xác nhận nạp" chưa?
- Refresh lại trang nếu cần

### Q4: Có thể nạp giấy/mực cho nhiều máy in cùng lúc không?

**A**: Hiện tại chưa hỗ trợ. Bạn cần nạp từng máy in một.

### Q5: Làm sao biết máy in nào cần nạp gấp?

**A**: Xem cột "Giấy A4" và "Mực đen":

- Icon cảnh báo ⚠️ màu đỏ = Cần nạp gấp
- Progress bar đỏ = Sắp hết

## Tài liệu liên quan

- [PRINTER_SUPPLIES_MANAGEMENT.md](./PRINTER_SUPPLIES_MANAGEMENT.md) - Tài liệu kỹ thuật chi tiết
- [PAGE_BALANCE_A3_A4_GUIDE.md](./PAGE_BALANCE_A3_A4_GUIDE.md) - Hướng dẫn tính toán số dư trang

## Hỗ trợ

Nếu gặp vấn đề, vui lòng liên hệ:

- Email: support@example.com
- Hotline: 1900-xxxx
