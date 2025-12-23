# CHANGELOG - Đếm Chính Xác Số Trang DOCX

## Ngày: 2024-12-23

## Tóm tắt

Cập nhật hệ thống để đếm **chính xác** số trang file DOCX bằng cách sử dụng **ConvertAPI** để convert DOCX → PDF, sau đó dùng **Apache PDFBox** để đếm số trang thực tế.

## Vấn đề trước đây

- File DOCX được đếm số trang bằng cách **ước tính** dựa trên số đoạn văn (~30 paragraphs = 1 page)
- Kết quả **không chính xác**, có thể sai lệch 30-50%
- Ảnh hưởng đến tính toán số trang in và khấu trừ số dư

## Giải pháp

1. **Upload mới:** Khi upload file DOCX, hệ thống sẽ:

   - Gửi file bytes đến ConvertAPI
   - Convert DOCX → PDF
   - Đếm số trang PDF bằng PDFBox
   - Lưu số trang chính xác vào database

2. **Fallback:** Nếu ConvertAPI fail (hết quota, network error):

   - Tự động fallback về phương pháp ước tính cũ
   - Log warning để admin biết
   - Hệ thống vẫn hoạt động bình thường

3. **Recount:** API `/api/documents/recount-pages` để cập nhật lại số trang cho tài liệu cũ

## Files thay đổi

### Backend

#### Thêm mới:

- `backend/src/main/java/com/example/app/service/ConvertApiService.java`

#### Cập nhật:

- `backend/src/main/java/com/example/app/service/DocumentService.java`
- `backend/src/main/resources/application.properties`
- `backend/.env`
- `backend/.env.example`

### Tài liệu:

- `document/CONVERTAPI_SETUP_GUIDE.md` (mới)
- `document/DOCUMENT_PAGE_COUNT_UPDATE.md` (mới)
- `document/CHANGELOG_PAGE_COUNT.md` (file này)

### Frontend

- **Không có thay đổi** (logic đếm trang nằm hoàn toàn ở backend)

## Cách sử dụng

### 1. Cấu hình ConvertAPI

```bash
# 1. Đăng ký tài khoản: https://www.convertapi.com/
# 2. Lấy Secret Key: https://www.convertapi.com/a
# 3. Cập nhật backend/.env:
CONVERTAPI_SECRET=secret_xxxxxxxxxx
```

### 2. Khởi động Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 3. Test

```bash
# Upload file DOCX
curl -X POST http://localhost:8080/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.docx"

# Recount pages cho tài liệu cũ
curl -X POST http://localhost:8080/api/documents/recount-pages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Giới hạn

- **ConvertAPI Free Plan:** 250 conversions/month
- **Timeout:** 60 seconds (file lớn có thể timeout)
- **Nên giới hạn:** Upload DOCX ≤ 10MB

## Kết quả

### Trước (ước tính):

- File 8 trang → Detect 5 trang (sai -3)
- File 15 trang → Detect 10 trang (sai -5)

### Sau (ConvertAPI):

- File 8 trang → Detect 8 trang ✅
- File 15 trang → Detect 15 trang ✅

## Breaking Changes

**Không có** - Backward compatible hoàn toàn.

## Migration

Để cập nhật lại số trang cho tài liệu DOCX cũ:

```bash
# Gọi API recount-pages cho từng student
POST /api/documents/recount-pages
Authorization: Bearer <student_token>
```

Hoặc chạy script SQL:

```sql
-- Xem các tài liệu DOCX có số trang nghi ngờ (< 1 hoặc quá nhỏ)
SELECT DocumentID, OriginalFileName, TotalPages
FROM Documents
WHERE FileExtension = 'docx'
  AND IsDeleted = 0
  AND TotalPages < 2;
```

## Tài liệu tham khảo

- [CONVERTAPI_SETUP_GUIDE.md](./CONVERTAPI_SETUP_GUIDE.md) - Hướng dẫn cấu hình
- [DOCUMENT_PAGE_COUNT_UPDATE.md](./DOCUMENT_PAGE_COUNT_UPDATE.md) - Chi tiết kỹ thuật

---

**Tác giả:** HCMIU SSPS Development Team
