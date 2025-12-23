# HƯỚNG DẪN CẤU HÌNH CONVERTAPI

## Tổng quan

ConvertAPI được sử dụng để convert file DOCX sang PDF nhằm đếm chính xác số trang tài liệu. Thay vì ước tính số trang dựa trên số đoạn văn (không chính xác), hệ thống sẽ convert DOCX sang PDF và đếm số trang thực tế.

## Bước 1: Đăng ký tài khoản ConvertAPI

1. Truy cập: https://www.convertapi.com/
2. Click "Sign Up" hoặc "Get Started Free"
3. Đăng ký bằng email hoặc Google account
4. Xác nhận email (nếu cần)

## Bước 2: Lấy API Secret Key

1. Sau khi đăng nhập, truy cập: https://www.convertapi.com/a
2. Trong dashboard, tìm phần **"Secret"** hoặc **"API Credentials"**
3. Copy **Secret Key** (dạng: `secret_xxxxxxxxxx`)

## Bước 3: Cấu hình trong Backend

### 3.1. Cập nhật file `.env`

Mở file `backend/.env` và thêm/cập nhật:

```properties
# ========================
# CONVERTAPI CONFIGURATION
# ========================
CONVERTAPI_SECRET=secret_xxxxxxxxxx
```

**Lưu ý:** Thay `secret_xxxxxxxxxx` bằng Secret Key thực tế của bạn.

### 3.2. Kiểm tra file `application.properties`

File `backend/src/main/resources/application.properties` đã được cấu hình sẵn:

```properties
convertapi.secret=${CONVERTAPI_SECRET:secret_your_api_key_here}
```

## Bước 4: Kiểm tra hoạt động

### 4.1. Khởi động Backend

```bash
cd backend
mvn spring-boot:run
```

### 4.2. Upload file DOCX

1. Đăng nhập vào hệ thống với tài khoản Student
2. Upload một file DOCX
3. Kiểm tra log backend:

```
Converting DOCX to PDF using ConvertAPI...
DOCX pages detected (via PDF conversion): 5 pages
```

### 4.3. Kiểm tra số trang trong database

```sql
SELECT DocumentID, OriginalFileName, TotalPages, FileExtension
FROM Documents
WHERE FileExtension = 'docx'
ORDER BY UploadDate DESC;
```

## Giới hạn Free Plan

ConvertAPI Free Plan có giới hạn:

- **250 conversions/month** (miễn phí)
- Sau đó: **$0.01 - $0.05 per conversion** (tùy loại file)

**Lưu ý:** Nếu hết quota, hệ thống sẽ tự động fallback về phương pháp ước tính cũ (dựa trên số đoạn văn).

## Cách hoạt động

### Upload DOCX

```
1. User upload file DOCX
   ↓
2. Backend nhận file bytes
   ↓
3. ConvertApiService.convertDocxToPdf(bytes)
   ↓
4. Gửi request đến ConvertAPI: POST /convert/docx/to/pdf
   ↓
5. ConvertAPI trả về URL của file PDF
   ↓
6. Download PDF từ URL
   ↓
7. Đếm số trang PDF bằng PDFBox
   ↓
8. Lưu totalPages vào database
```

### Fallback (nếu ConvertAPI fail)

```
1. ConvertAPI fail (hết quota, network error, etc.)
   ↓
2. Log warning: "ConvertAPI failed, falling back to paragraph estimation"
   ↓
3. Đếm số đoạn văn trong DOCX
   ↓
4. Ước tính: ~30 paragraphs = 1 page
   ↓
5. Lưu totalPages (ước tính) vào database
```

## Troubleshooting

### Lỗi: "ConvertAPI failed: Unauthorized"

**Nguyên nhân:** API Secret Key không đúng hoặc chưa được cấu hình.

**Giải pháp:**

1. Kiểm tra lại Secret Key trong file `.env`
2. Đảm bảo không có khoảng trắng thừa
3. Restart backend

### Lỗi: "ConvertAPI failed: Quota exceeded"

**Nguyên nhân:** Đã hết 250 conversions miễn phí trong tháng.

**Giải pháp:**

1. Chờ đến tháng sau (quota reset)
2. Hoặc nâng cấp lên Paid Plan
3. Hệ thống sẽ tự động fallback về phương pháp ước tính

### Lỗi: "Failed to download PDF"

**Nguyên nhân:** Network error hoặc URL hết hạn.

**Giải pháp:**

1. Kiểm tra kết nối internet
2. Thử upload lại file
3. Kiểm tra log backend để xem chi tiết lỗi

## Monitoring

### Kiểm tra số lượng conversions đã dùng

1. Truy cập: https://www.convertapi.com/a/usage
2. Xem **"Conversions Used"** trong tháng hiện tại

### Log Backend

Backend sẽ log mỗi lần convert:

```
INFO  - Converting DOCX to PDF using ConvertAPI...
INFO  - Convert DOCX sang PDF thành công, PDF size: 123456 bytes
INFO  - DOCX pages detected (via PDF conversion): 5 pages
```

Nếu fallback:

```
WARN  - ConvertAPI failed, falling back to paragraph estimation: Quota exceeded
INFO  - DOCX pages estimated (fallback): 3 pages (~85 paragraphs)
```

## Best Practices

1. **Giới hạn upload:** Chỉ cho phép upload file DOCX ≤ 10MB để tránh timeout
2. **Cache:** Nếu user upload lại cùng file, có thể cache kết quả (optional)
3. **Async processing:** Với file lớn, nên xử lý async để không block request
4. **Monitor quota:** Theo dõi số lượng conversions để tránh hết quota đột ngột

## Tài liệu tham khảo

- ConvertAPI Documentation: https://www.convertapi.com/doc
- DOCX to PDF API: https://www.convertapi.com/docx-to-pdf
- Pricing: https://www.convertapi.com/prices

---

**Cập nhật:** 2024-12-23
**Tác giả:** HCMIU SSPS Development Team
