# HƯỚNG DẪN NHANH: Cấu hình ConvertAPI

## Bước 1: Đăng ký ConvertAPI (2 phút)

1. Truy cập: https://www.convertapi.com/
2. Click **"Sign Up"** (góc trên bên phải)
3. Đăng ký bằng:
   - Email + Password, hoặc
   - Google Account (nhanh hơn)
4. Xác nhận email (nếu dùng email)

## Bước 2: Lấy Secret Key (1 phút)

1. Sau khi đăng nhập, truy cập: https://www.convertapi.com/a
2. Trong dashboard, tìm phần **"Secret"**
3. Copy Secret Key (dạng: `secret_xxxxxxxxxx`)

## Bước 3: Cấu hình Backend (1 phút)

1. Mở file `backend/.env`
2. Tìm dòng:
   ```
   CONVERTAPI_SECRET=secret_your_api_key_here
   ```
3. Thay `secret_your_api_key_here` bằng Secret Key vừa copy
4. Lưu file

## Bước 4: Khởi động Backend

```bash
cd backend
mvn spring-boot:run
```

## Bước 5: Test (1 phút)

1. Đăng nhập vào hệ thống với tài khoản Student
2. Upload một file DOCX
3. Kiểm tra log backend:
   ```
   Converting DOCX to PDF using ConvertAPI...
   DOCX pages detected (via PDF conversion): 5 pages
   ```
4. Kiểm tra số trang trong danh sách tài liệu

## Xong! 🎉

Hệ thống đã sẵn sàng đếm chính xác số trang file DOCX.

## Lưu ý

- **Free Plan:** 250 conversions/month
- **Nếu hết quota:** Hệ thống tự động fallback về phương pháp ước tính
- **Monitor usage:** https://www.convertapi.com/a/usage

## Troubleshooting

### Lỗi: "ConvertAPI failed: Unauthorized"

**Nguyên nhân:** Secret Key không đúng

**Giải pháp:**

1. Kiểm tra lại Secret Key trong file `.env`
2. Đảm bảo không có khoảng trắng thừa
3. Restart backend: `Ctrl+C` → `mvn spring-boot:run`

### Lỗi: "ConvertAPI failed: Quota exceeded"

**Nguyên nhân:** Đã hết 250 conversions miễn phí

**Giải pháp:**

- Chờ đến tháng sau (quota reset tự động)
- Hoặc nâng cấp lên Paid Plan
- Hệ thống vẫn hoạt động (dùng phương pháp ước tính)

## Tài liệu chi tiết

Xem thêm: [CONVERTAPI_SETUP_GUIDE.md](./CONVERTAPI_SETUP_GUIDE.md)

---

**Tổng thời gian:** ~5 phút
