# Demo: Chức năng Nạp Giấy và Mực

## Tổng quan

Tài liệu này mô tả chi tiết các bước và giao diện để SPSO nạp giấy/mực cho máy in.

## 🎯 Vị trí chức năng

### Trang: Quản lý Máy in (SPSO)

**URL**: `/spso/printers`

## 📋 Các thành phần giao diện

### 1. Bảng danh sách máy in

#### Cột "Giấy A4"

```
┌─────────────────────────────┐
│ 450/500 ⚠️                  │
│ ████████████░░░░ (90%)      │
└─────────────────────────────┘
```

- **Số liệu**: `{a4PaperRemaining}/{a4PaperCapacity}` tờ
- **Progress bar**:
  - Xanh (blue-500): Đủ giấy (> 50 tờ)
  - Đỏ (red-500): Sắp hết (≤ 50 tờ)
- **Icon cảnh báo** ⚠️: Hiển thị khi ≤ 50 tờ

#### Cột "Mực đen"

```
┌─────────────────────────────┐
│ 85% ⚠️                      │
│ ████████████████░░ (85%)    │
└─────────────────────────────┘
```

- **Số liệu**: `{tonerBlackRemaining}%`
- **Progress bar**:
  - Xám (gray-700): Đủ mực (> 20%)
  - Đỏ (red-500): Sắp hết (≤ 20%)
- **Icon cảnh báo** ⚠️: Hiển thị khi ≤ 20%

#### Cột "Trạng thái"

```
┌─────────────────────────────┐
│ 🟢 Đang hoạt động           │
│ 🔴 Hết giấy                 │
│ 🟠 Hết mực                  │
│ 🔴 Hết giấy và mực          │
└─────────────────────────────┘
```

### 2. Menu thao tác (3 chấm dọc)

Click vào nút **"⋮"** ở cột "Thao tác":

```
┌─────────────────────────────┐
│ 👁️  Xem chi tiết            │
│ ✏️  Chỉnh sửa               │
│ 🔄 Bật/Tắt                  │
│ ➕ Nạp giấy/mực            │  ← Chức năng mới
│ 🗑️  Xóa                     │
└─────────────────────────────┘
```

### 3. Modal "Nạp giấy và mực"

#### Header

```
┌─────────────────────────────────────────────────────┐
│ Nạp giấy và mực                                  ✕  │
│ HP LaserJet Pro M404dn                              │
└─────────────────────────────────────────────────────┘
```

#### Trạng thái hiện tại

```
┌─────────────────────────────────────────────────────┐
│ Trạng thái hiện tại                                 │
│                                                     │
│ Giấy A4: 50/500 tờ      Giấy A3: 100/250 tờ       │
│ Mực đen: 15%            Mực xanh: 80%              │
│ Mực đỏ: 75%             Mực vàng: 85%              │
└─────────────────────────────────────────────────────┘
```

#### Chọn mục cần nạp

```
┌─────────────────────────────────────────────────────┐
│ Chọn mục cần nạp                                    │
│ ⚠️ Lưu ý: Khi nạp, giấy và mực sẽ được reset về    │
│ đầy (100%)                                          │
│                                                     │
│ ☑️ Giấy A4                                          │
│    Hiện có: 50 → Sau nạp: 500 tờ                   │
│                                                     │
│ ☐ Giấy A3                                           │
│    Hiện có: 100 → Sau nạp: 250 tờ                  │
│                                                     │
│ ☑️ Mực đen                                          │
│    Hiện có: 15% → Sau nạp: 100%                    │
│                                                     │
│ ☐ Mực xanh (Cyan)                                   │
│    Hiện có: 80% → Sau nạp: 100%                    │
│                                                     │
│ ☐ Mực đỏ (Magenta)                                  │
│    Hiện có: 75% → Sau nạp: 100%                    │
│                                                     │
│ ☐ Mực vàng (Yellow)                                 │
│    Hiện có: 85% → Sau nạp: 100%                    │
└─────────────────────────────────────────────────────┘
```

#### Action buttons

```
┌─────────────────────────────────────────────────────┐
│                              [Hủy] [✓ Xác nhận nạp] │
└─────────────────────────────────────────────────────┘
```

## 🔄 Flow hoạt động

### Scenario 1: Máy in hết giấy A4

#### Bước 1: Xác định máy in cần nạp

```
Bảng danh sách:
┌──────────────────────────────────────────────────────┐
│ Tên máy in         │ Trạng thái  │ Giấy A4  │ Mực đen│
├──────────────────────────────────────────────────────┤
│ HP LaserJet M404dn │ 🔴 Hết giấy │ 0/500 ⚠️ │ 85%    │
└──────────────────────────────────────────────────────┘
```

#### Bước 2: Mở modal nạp

- Click **"⋮"** → **"Nạp giấy/mực"**

#### Bước 3: Chọn mục cần nạp

- Tick ☑️ **"Giấy A4"**
- Xem preview: `Hiện có: 0 → Sau nạp: 500 tờ`

#### Bước 4: Xác nhận

- Click **"Xác nhận nạp"**
- Thông báo: ✅ "Nạp giấy/mực thành công!"

#### Bước 5: Kết quả

```
Bảng danh sách (sau nạp):
┌──────────────────────────────────────────────────────┐
│ Tên máy in         │ Trạng thái        │ Giấy A4  │   │
├──────────────────────────────────────────────────────┤
│ HP LaserJet M404dn │ 🟢 Đang hoạt động │ 500/500  │   │
└──────────────────────────────────────────────────────┘
```

### Scenario 2: Máy in hết mực đen

#### Bước 1: Xác định máy in

```
┌──────────────────────────────────────────────────────┐
│ Tên máy in         │ Trạng thái │ Giấy A4  │ Mực đen │
├──────────────────────────────────────────────────────┤
│ Canon iR-ADV C5535 │ 🟠 Hết mực │ 450/500  │ 3% ⚠️   │
└──────────────────────────────────────────────────────┘
```

#### Bước 2-4: Tương tự Scenario 1

- Tick ☑️ **"Mực đen"**
- Click **"Xác nhận nạp"**

#### Bước 5: Kết quả

```
┌──────────────────────────────────────────────────────┐
│ Tên máy in         │ Trạng thái        │ Mực đen    │
├──────────────────────────────────────────────────────┤
│ Canon iR-ADV C5535 │ 🟢 Đang hoạt động │ 100%       │
└──────────────────────────────────────────────────────┘
```

### Scenario 3: Nạp đầy tất cả (bảo trì định kỳ)

#### Bước 3: Chọn tất cả

```
☑️ Giấy A4
☑️ Giấy A3
☑️ Mực đen
☑️ Mực xanh (Cyan)
☑️ Mực đỏ (Magenta)
☑️ Mực vàng (Yellow)
```

#### Kết quả: Tất cả reset về đầy

## 🎨 Màu sắc và trạng thái

### Trạng thái máy in

| Trạng thái      | Badge Color                     | Icon |
| --------------- | ------------------------------- | ---- |
| Đang hoạt động  | `bg-green-100 text-green-800`   | 🟢   |
| Không hoạt động | `bg-gray-100 text-gray-800`     | ⚫   |
| Bảo trì         | `bg-yellow-100 text-yellow-800` | 🟡   |
| Lỗi             | `bg-red-100 text-red-800`       | 🔴   |
| Hết giấy        | `bg-orange-100 text-orange-800` | 🟠   |
| Hết mực         | `bg-orange-100 text-orange-800` | 🟠   |
| Hết giấy và mực | `bg-red-100 text-red-800`       | 🔴   |

### Progress bar

| Loại    | Điều kiện | Màu           |
| ------- | --------- | ------------- |
| Giấy A4 | > 50 tờ   | `bg-blue-500` |
| Giấy A4 | ≤ 50 tờ   | `bg-red-500`  |
| Mực đen | > 20%     | `bg-gray-700` |
| Mực đen | ≤ 20%     | `bg-red-500`  |

## 🔍 Filter máy in cần nạp

### Dropdown "Trạng thái"

```
┌─────────────────────────────┐
│ Trạng thái: [Tất cả ▼]      │
│                             │
│ ○ Tất cả                    │
│ ○ Đang hoạt động            │
│ ○ Không hoạt động           │
│ ○ Bảo trì                   │
│ ○ Lỗi                       │
│ ○ Hết giấy          ← Mới   │
│ ○ Hết mực           ← Mới   │
│ ○ Hết giấy và mực   ← Mới   │
└─────────────────────────────┘
```

### Kết quả filter

Chọn **"Hết giấy"** → Chỉ hiển thị máy in có trạng thái "OutOfPaper"

## 📱 Responsive Design

### Desktop (> 1024px)

- Bảng đầy đủ 10 cột
- Modal rộng `max-w-2xl`

### Tablet (768px - 1024px)

- Bảng scroll ngang
- Modal rộng `max-w-xl`

### Mobile (< 768px)

- Bảng scroll ngang
- Modal full width với padding

## ⚠️ Validation và Error Handling

### Validation 1: Chưa chọn mục nào

```
User: Click "Xác nhận nạp" mà chưa tick checkbox nào
System: Alert "Vui lòng chọn ít nhất 1 mục cần nạp"
```

### Validation 2: API error

```
User: Click "Xác nhận nạp"
API: Trả về error 500
System: Alert "Nạp giấy/mực thất bại: [error message]"
```

### Success case

```
User: Click "Xác nhận nạp" với ít nhất 1 mục được chọn
API: Trả về 200 OK
System:
  1. Alert "Nạp giấy/mực thành công!"
  2. Đóng modal
  3. Refresh bảng danh sách
  4. Hiển thị trạng thái mới
```

## 🔐 Phân quyền

### SPSO (Student Printing Service Officer)

✅ Có quyền:

- Xem danh sách máy in
- Xem chi tiết giấy/mực
- Nạp giấy/mực
- Chỉnh sửa máy in
- Xóa máy in

### Student

❌ Không có quyền:

- Không thấy nút "Nạp giấy/mực"
- Không thể truy cập endpoint `/api/printers/{id}/refill`

## 🧪 Test Cases

### Test 1: Hiển thị progress bar đúng

```
Input: a4PaperRemaining = 250, a4PaperCapacity = 500
Expected: Progress bar 50%, màu xanh
```

### Test 2: Icon cảnh báo xuất hiện

```
Input: a4PaperRemaining = 30
Expected: Icon ⚠️ màu đỏ xuất hiện
```

### Test 3: Modal hiển thị đúng trạng thái

```
Input: Printer có a4PaperRemaining = 50, tonerBlackRemaining = 15
Expected:
  - "Giấy A4: 50/500 tờ"
  - "Mực đen: 15%"
```

### Test 4: Nạp giấy thành công

```
Input:
  - Printer có a4PaperRemaining = 0, status = "OutOfPaper"
  - User tick "Giấy A4" và click "Xác nhận nạp"
Expected:
  - API call: POST /api/printers/{id}/refill với body { a4PaperToAdd: 1 }
  - Response: 200 OK
  - Alert: "Nạp giấy/mực thành công!"
  - Bảng refresh: a4PaperRemaining = 500, status = "Active"
```

### Test 5: Validation chưa chọn mục

```
Input: User click "Xác nhận nạp" mà chưa tick checkbox nào
Expected: Alert "Vui lòng chọn ít nhất 1 mục cần nạp"
```

## 📊 API Request/Response

### Request

```http
POST /api/printers/1/refill
Authorization: Bearer <SPSO_TOKEN>
Content-Type: application/json

{
  "a4PaperToAdd": 1,
  "a3PaperToAdd": 0,
  "tonerBlackToAdd": 1,
  "tonerCyanToAdd": 0,
  "tonerMagentaToAdd": 0,
  "tonerYellowToAdd": 0
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Nạp giấy/mực thành công",
  "data": {
    "printerId": 1,
    "printerName": "HP LaserJet Pro M404dn",
    "status": "Active",
    "statusMessage": "Sẵn sàng",
    "a4PaperRemaining": 500,
    "a3PaperRemaining": 250,
    "tonerBlackRemaining": 100,
    "tonerCyanRemaining": 100,
    "tonerMagentaRemaining": 100,
    "tonerYellowRemaining": 100
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Không tìm thấy máy in",
  "data": null
}
```

## 🎯 Tóm tắt

✅ **Đã implement đầy đủ**:

1. Hiển thị giấy/mực trong bảng với progress bar
2. Icon cảnh báo khi sắp hết
3. Menu "Nạp giấy/mực" trong dropdown thao tác
4. Modal nạp với checkbox chọn mục
5. Preview "Hiện có → Sau nạp"
6. Validation và error handling
7. Auto refresh sau khi nạp thành công
8. Filter trạng thái mới (OutOfPaper, OutOfToner, OutOfBoth)

✅ **Hoạt động đúng logic**:

- 1 lần nạp = Reset về đầy (không phải nạp thêm)
- Tự động cập nhật trạng thái sau khi nạp
- Chỉ SPSO mới có quyền nạp

## 📚 Tài liệu liên quan

- [PRINTER_REFILL_USER_GUIDE.md](./PRINTER_REFILL_USER_GUIDE.md) - Hướng dẫn chi tiết cho SPSO
- [PRINTER_SUPPLIES_MANAGEMENT.md](./PRINTER_SUPPLIES_MANAGEMENT.md) - Tài liệu kỹ thuật
