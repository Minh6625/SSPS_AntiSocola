# Hướng dẫn Quản lý Giấy và Mực cho Máy In

## Tổng quan

Hệ thống đã được cập nhật để quản lý giấy và mực cho máy in. Khi máy in hết giấy hoặc hết mực, trạng thái sẽ tự động cập nhật và sinh viên không thể chọn máy in đó. SPSO có thể xem danh sách máy in cần nạp và thực hiện nạp giấy/mực.

## Trạng thái máy in

### Các trạng thái mới

- **OutOfPaper**: Máy in hết giấy (A4 hoặc A3 hoặc cả hai)
- **OutOfToner**: Máy in hết mực (mực đen <= 5%)
- **OutOfBoth**: Máy in hết cả giấy và mực

### Các trạng thái cũ

- **Active**: Sẵn sàng
- **Inactive**: Không hoạt động
- **Maintenance**: Đang bảo trì
- **Error**: Lỗi

## Thông tin giấy

### Dung lượng khay giấy (mặc định)

- **A4**: 500 tờ
- **A3**: 250 tờ

### Theo dõi giấy

- `a4PaperRemaining`: Số tờ A4 còn lại
- `a3PaperRemaining`: Số tờ A3 còn lại
- `a4PaperCapacity`: Dung lượng khay A4
- `a3PaperCapacity`: Dung lượng khay A3

### Logic trừ giấy

Khi in xong, hệ thống tự động trừ giấy:

- In A4: Trừ số tờ A4 đã in
- In A3: Trừ số tờ A3 đã in
- Duplex (2 mặt): Số tờ = ceil(số trang / 2)

## Thông tin mực

### Theo dõi mực (%)

- `tonerBlackRemaining`: Mực đen (0-100%)
- `tonerCyanRemaining`: Mực xanh (0-100%)
- `tonerMagentaRemaining`: Mực đỏ (0-100%)
- `tonerYellowRemaining`: Mực vàng (0-100%)
- `tonerLastReplaced`: Lần thay mực cuối

### Logic trừ mực

Ước tính: **1 trang = 0.01% mực** (1000 trang = 10% mực)

- **In đen trắng**: Chỉ trừ mực đen
- **In màu**: Trừ cả 4 màu (đen, xanh, đỏ, vàng)

### Ngưỡng cảnh báo

- Mực đen <= 5%: Máy in chuyển sang trạng thái "OutOfToner"

## API Endpoints

### 1. Lấy danh sách máy in

```
GET /api/printers
```

**Lọc tự động**: Mặc định chỉ trả về máy in khả dụng (không bao gồm OutOfPaper, OutOfToner, OutOfBoth)

**Query parameters**:

- `status`: Lọc theo trạng thái cụ thể (nếu muốn xem máy in hết giấy/mực)

**Response**:

```json
{
  "success": true,
  "message": "Lấy danh sách máy in thành công",
  "data": {
    "content": [
      {
        "printerId": 1,
        "printerName": "HP LaserJet Pro M404dn",
        "status": "Active",
        "statusMessage": "Sẵn sàng",
        "a4PaperRemaining": 450,
        "a3PaperRemaining": 200,
        "a4PaperCapacity": 500,
        "a3PaperCapacity": 250,
        "tonerBlackRemaining": 85,
        "tonerCyanRemaining": 90,
        "tonerMagentaRemaining": 88,
        "tonerYellowRemaining": 92,
        "tonerLastReplaced": "2024-01-15T10:30:00"
      }
    ]
  }
}
```

### 2. Lấy thông tin giấy/mực của máy in

```
GET /api/printers/{id}/supplies
```

**Response**:

```json
{
  "success": true,
  "message": "Lấy thông tin giấy/mực thành công",
  "data": {
    "a4PaperRemaining": 450,
    "a3PaperRemaining": 200,
    "a4PaperCapacity": 500,
    "a3PaperCapacity": 250,
    "tonerBlackRemaining": 85,
    "tonerCyanRemaining": 90,
    "tonerMagentaRemaining": 88,
    "tonerYellowRemaining": 92,
    "tonerLastReplaced": "2024-01-15T10:30:00"
  }
}
```

### 3. Nạp giấy/mực (SPSO only)

```
POST /api/printers/{id}/refill
Authorization: Bearer <token>
```

**Request body**:

```json
{
  "a4PaperToAdd": 500,
  "a3PaperToAdd": 250,
  "tonerBlackToAdd": 100,
  "tonerCyanToAdd": 100,
  "tonerMagentaToAdd": 100,
  "tonerYellowToAdd": 100
}
```

**Validation**:

- Giấy: >= 0
- Mực: 0-100%
- Không vượt quá dung lượng khay giấy
- Mực không vượt quá 100%

**Response**:

```json
{
  "success": true,
  "message": "Nạp giấy/mực thành công",
  "data": {
    "printerId": 1,
    "status": "Active",
    "statusMessage": "Sẵn sàng",
    "a4PaperRemaining": 500,
    "a3PaperRemaining": 250,
    "tonerBlackRemaining": 100
  }
}
```

## Logic kiểm tra trước khi in

### 1. Kiểm tra trạng thái máy in

```java
if (!"Active".equals(printer.getStatus())) {
    throw new BusinessException("Máy in không khả dụng");
}
```

### 2. Kiểm tra giấy

```java
if (!printer.hasEnoughPaper(paperSize, sheets * copies)) {
    throw new BusinessException("Máy in không đủ giấy");
}
```

### 3. Kiểm tra mực

```java
if (!printer.hasEnoughToner()) {
    throw new BusinessException("Máy in sắp hết mực");
}
```

## Tự động cập nhật trạng thái

Sau khi in xong hoặc nạp giấy/mực, hệ thống tự động cập nhật trạng thái:

```java
printer.updateStatusBasedOnSupplies();
```

**Logic**:

1. Nếu hết giấy (A4 và A3 <= 0) và hết mực (đen <= 5%) → `OutOfBoth`
2. Nếu hết giấy → `OutOfPaper`
3. Nếu hết mực → `OutOfToner`
4. Nếu đủ giấy và mực → `Active`

## Thông báo lỗi cho người dùng

### Khi chọn máy in

- "Máy in đã hết giấy"
- "Máy in đã hết mực"
- "Máy in đã hết giấy và mực"

### Khi gửi lệnh in

- "Máy in không đủ giấy A4. Cần 100 tờ, còn 50 tờ"
- "Máy in sắp hết mực, vui lòng chọn máy in khác"

## Frontend Implementation

### 1. Hiển thị trạng thái máy in

```tsx
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <Badge color="green">Sẵn sàng</Badge>;
    case "OutOfPaper":
      return <Badge color="red">Hết giấy</Badge>;
    case "OutOfToner":
      return <Badge color="orange">Hết mực</Badge>;
    case "OutOfBoth":
      return <Badge color="red">Hết giấy và mực</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
```

### 2. Hiển thị progress bar giấy/mực

```tsx
<div>
  <label>Giấy A4: {printer.a4PaperRemaining}/{printer.a4PaperCapacity}</label>
  <ProgressBar
    value={printer.a4PaperRemaining}
    max={printer.a4PaperCapacity}
  />
</div>

<div>
  <label>Mực đen: {printer.tonerBlackRemaining}%</label>
  <ProgressBar
    value={printer.tonerBlackRemaining}
    max={100}
    color={printer.tonerBlackRemaining <= 20 ? 'red' : 'blue'}
  />
</div>
```

### 3. Disable nút chọn máy in

```tsx
<Button
  disabled={printer.status !== "Active"}
  onClick={() => selectPrinter(printer.printerId)}
>
  {printer.status === "Active" ? "Chọn máy in" : printer.statusMessage}
</Button>
```

### 4. Dashboard SPSO - Danh sách máy in cần nạp

```tsx
// Lọc máy in hết giấy/mực
const printersNeedRefill = printers.filter((p) =>
  ["OutOfPaper", "OutOfToner", "OutOfBoth"].includes(p.status)
);

// Hiển thị cảnh báo
{
  printersNeedRefill.length > 0 && (
    <Alert color="warning">
      Có {printersNeedRefill.length} máy in cần nạp giấy/mực
    </Alert>
  );
}
```

### 5. Form nạp giấy/mực

```tsx
const handleRefill = async (printerId: number) => {
  const data = {
    a4PaperToAdd: 500,
    a3PaperToAdd: 250,
    tonerBlackToAdd: 100,
  };

  await fetch(`/api/printers/${printerId}/refill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};
```

## Database Migration

File migration đã được tạo: `V2__add_printer_supplies.sql`

```sql
ALTER TABLE Printers ADD COLUMN A4PaperRemaining INT DEFAULT 500;
ALTER TABLE Printers ADD COLUMN A3PaperRemaining INT DEFAULT 250;
ALTER TABLE Printers ADD COLUMN A4PaperCapacity INT DEFAULT 500;
ALTER TABLE Printers ADD COLUMN A3PaperCapacity INT DEFAULT 250;
ALTER TABLE Printers ADD COLUMN TonerBlackRemaining INT DEFAULT 100;
ALTER TABLE Printers ADD COLUMN TonerCyanRemaining INT DEFAULT 100;
ALTER TABLE Printers ADD COLUMN TonerMagentaRemaining INT DEFAULT 100;
ALTER TABLE Printers ADD COLUMN TonerYellowRemaining INT DEFAULT 100;
ALTER TABLE Printers ADD COLUMN TonerLastReplaced DATETIME;
```

## Testing

### Test case 1: In khi đủ giấy và mực

```
Input:
- Printer: A4=500, A3=250, Toner=100%
- Job: 10 trang A4, duplex, 1 copy

Expected:
- Job created successfully
- A4PaperRemaining = 495 (trừ 5 tờ)
- TonerBlackRemaining = 99.9% (trừ 0.1%)
```

### Test case 2: In khi hết giấy

```
Input:
- Printer: A4=0, A3=250, Toner=100%
- Job: 10 trang A4

Expected:
- Error: "Máy in không đủ giấy A4. Cần 10 tờ, còn 0 tờ"
- Status = "OutOfPaper"
```

### Test case 3: Nạp giấy

```
Input:
- Printer: A4=0, Status=OutOfPaper
- Refill: a4PaperToAdd=500

Expected:
- A4PaperRemaining = 500
- Status = "Active"
```

## Lưu ý

1. **Dung lượng khay giấy**: Có thể khác nhau tùy model máy in, cần cấu hình khi thêm máy in mới
2. **Ước tính mực**: Công thức 1 trang = 0.01% là ước tính, thực tế phụ thuộc vào nội dung in
3. **Ngưỡng cảnh báo**: Có thể điều chỉnh ngưỡng 5% trong code nếu cần
4. **Mực màu**: Chỉ trừ khi in màu, in đen trắng chỉ trừ mực đen
5. **Tự động cập nhật**: Trạng thái tự động cập nhật sau mỗi lần in hoặc nạp

## Tài liệu liên quan

- [PAGE_BALANCE_A3_A4_GUIDE.md](./PAGE_BALANCE_A3_A4_GUIDE.md) - Hướng dẫn tính toán số dư trang
- [PRINTER_CONNECTION_GUIDE.md](./PRINTER_CONNECTION_GUIDE.md) - Hướng dẫn kết nối máy in
