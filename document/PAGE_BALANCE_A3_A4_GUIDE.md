# HƯỚNG DẪN: Hệ thống số dư trang A3 & A4

## Tổng quan

Hệ thống quản lý số dư trang theo phương án **"Chỉ bán trang A4 (quy đổi)"**:

- ✅ Người dùng **mua trang A4**
- ✅ Hệ thống lưu **tổng A4 equivalent**
- ✅ Khi in:
  - **In A4** → trừ 1 trang
  - **In A3** → trừ 2 trang (A3 = 2×A4)

## Cách hoạt động

### 1. Mua trang

```
Người dùng mua: 100 trang A4
→ Database lưu: A4Balance = 100
```

### 2. In A4

```
In 10 trang A4 (1 mặt, 1 bản)
→ Tính toán:
  - totalPages = 10
  - sheets = 10 (1 mặt)
  - a4Equivalent = 10 × 1 (A4) × 1 (copy) = 10
→ Trừ: 100 - 10 = 90 trang còn lại
```

### 3. In A3

```
In 10 trang A3 (1 mặt, 1 bản)
→ Tính toán:
  - totalPages = 10
  - sheets = 10 (1 mặt)
  - a4Equivalent = 10 × 2 (A3) × 1 (copy) = 20
→ Trừ: 90 - 20 = 70 trang còn lại
```

### 4. In 2 mặt (Duplex)

```
In 20 trang A4 (2 mặt, 1 bản)
→ Tính toán:
  - totalPages = 20
  - sheets = 10 (2 mặt → chia 2)
  - a4Equivalent = 10 × 1 (A4) × 1 (copy) = 10
→ Trừ: 70 - 10 = 60 trang còn lại
```

### 5. In nhiều bản (Copies)

```
In 5 trang A3 (1 mặt, 3 bản)
→ Tính toán:
  - totalPages = 5
  - sheets = 5 (1 mặt)
  - a4Equivalent = 5 × 2 (A3) × 3 (copies) = 30
→ Trừ: 60 - 30 = 30 trang còn lại
```

## Công thức tính toán

### Bước 1: Tính số trang cần in

```java
int totalPagesToPrint = calculateTotalPages(documentPages, pageRange);
```

- Nếu `pageRange = "all"` → in tất cả
- Nếu `pageRange = "1-5,10"` → in trang 1-5 và trang 10

### Bước 2: Tính số tờ giấy

```java
int totalSheetsUsed = calculateSheetsUsed(totalPagesToPrint, duplex);
```

- Nếu `duplex = true` (2 mặt) → `sheets = ceil(pages / 2)`
- Nếu `duplex = false` (1 mặt) → `sheets = pages`

### Bước 3: Tính A4 equivalent

```java
int a4EquivalentPages = calculateA4Equivalent(sheets, paperSize, copies);
```

```
a4Equivalent = sheets × paperSizeMultiplier × copies

Trong đó:
- paperSizeMultiplier:
  - A4 → 1
  - A3 → 2
```

## Ví dụ thực tế

### Ví dụ 1: In báo cáo 50 trang A4

```
Cấu hình:
- Document: 50 trang
- Paper: A4
- Duplex: Có (2 mặt)
- Copies: 1 bản

Tính toán:
- totalPages = 50
- sheets = 25 (2 mặt)
- a4Equivalent = 25 × 1 × 1 = 25

Kết quả: Trừ 25 trang A4
```

### Ví dụ 2: In poster 5 trang A3

```
Cấu hình:
- Document: 5 trang
- Paper: A3
- Duplex: Không (1 mặt)
- Copies: 10 bản

Tính toán:
- totalPages = 5
- sheets = 5 (1 mặt)
- a4Equivalent = 5 × 2 × 10 = 100

Kết quả: Trừ 100 trang A4
```

### Ví dụ 3: In luận văn 100 trang A4

```
Cấu hình:
- Document: 100 trang
- Paper: A4
- Page range: "1-10,50-60" (21 trang)
- Duplex: Có (2 mặt)
- Copies: 3 bản

Tính toán:
- totalPages = 21 (chỉ in trang chọn)
- sheets = 11 (2 mặt, làm tròn lên)
- a4Equivalent = 11 × 1 × 3 = 33

Kết quả: Trừ 33 trang A4
```

## Database Schema

### Bảng PageBalance

```sql
CREATE TABLE PageBalance (
    StudentID VARCHAR(20) PRIMARY KEY,
    A4Balance INT NOT NULL DEFAULT 0,  -- Tổng A4 equivalent
    LastUpdated TIMESTAMP NOT NULL
);
```

**Lưu ý:** Chỉ có 1 cột `A4Balance` lưu tổng A4 equivalent, không tách riêng A3.

### Bảng PrintJob

```sql
CREATE TABLE PrintJobs (
    JobID INT PRIMARY KEY,
    StudentID VARCHAR(20),
    DocumentID INT,
    PrinterID INT,
    PaperSize VARCHAR(10),        -- 'A4' hoặc 'A3'
    TotalPagesToPrint INT,        -- Số trang thực tế in
    TotalSheetsUsed INT,          -- Số tờ giấy dùng
    A4EquivalentPages INT,        -- Số trang A4 tương đương (đã quy đổi)
    ...
);
```

## API Endpoints

### 1. Lấy số dư

```http
GET /api/page-balance
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "pagesA4": 100,
    "pagesA3": 0,
    "totalA4Equivalent": 100,
    "lastUpdated": "2024-12-23T12:00:00"
  }
}
```

**Giải thích:**

- `pagesA4`: Số dư A4 equivalent
- `pagesA3`: Luôn = 0 (không tách riêng)
- `totalA4Equivalent`: Tổng A4 equivalent (= pagesA4)

### 2. Gửi lệnh in

```http
POST /api/print-jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": 123,
  "printerId": 5,
  "paperSize": "A3",
  "pageRange": "all",
  "duplex": true,
  "copies": 2
}
```

Response:

```json
{
  "success": true,
  "data": {
    "jobId": 456,
    "totalPagesToPrint": 10,
    "totalSheetsUsed": 5,
    "a4EquivalentPages": 20,
    "jobStatus": "Pending"
  }
}
```

**Giải thích:**

- `totalPagesToPrint`: 10 trang (từ document)
- `totalSheetsUsed`: 5 tờ (2 mặt)
- `a4EquivalentPages`: 20 trang A4 (5 × 2 × 2)

## Frontend Display

### Hiển thị số dư

```tsx
// Hiển thị cho người dùng
<div>
  <p>Số dư: {balance.totalA4Equivalent} trang A4</p>
  <p className="text-sm text-gray-500">
    (Có thể in {balance.totalA4Equivalent} trang A4 hoặc{" "}
    {Math.floor(balance.totalA4Equivalent / 2)} trang A3)
  </p>
</div>
```

### Tính toán trước khi in

```tsx
function calculateCost(
  pages: number,
  paperSize: "A4" | "A3",
  duplex: boolean,
  copies: number
) {
  const sheets = duplex ? Math.ceil(pages / 2) : pages;
  const multiplier = paperSize === "A3" ? 2 : 1;
  const a4Equivalent = sheets * multiplier * copies;

  return {
    sheets,
    a4Equivalent,
    canAfford: balance >= a4Equivalent,
  };
}
```

## Troubleshooting

### Lỗi: "Số dư không đủ"

**Nguyên nhân:** `a4EquivalentPages > currentBalance`

**Giải pháp:**

1. Kiểm tra số dư hiện tại
2. Giảm số copies
3. Chọn A4 thay vì A3
4. Bật duplex (2 mặt)
5. Mua thêm trang

### Số dư bị âm

**Nguyên nhân:** Lỗi logic hoặc race condition

**Giải pháp:**

- Backend có transaction để đảm bảo atomic
- Kiểm tra balance trước khi trừ
- Log đầy đủ để trace

## Best Practices

1. **Luôn validate balance trước khi in**
2. **Sử dụng transaction** để đảm bảo consistency
3. **Log đầy đủ** mọi thao tác trừ/cộng trang
4. **Hiển thị rõ ràng** cho người dùng biết sẽ trừ bao nhiêu trang
5. **Cho phép preview** trước khi gửi lệnh in

---

**Cập nhật:** 2024-12-23  
**Tác giả:** HCMIU SSPS Development Team
