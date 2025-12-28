# TESTCASE ĐẦY ĐỦ - HCMSIU SSPS

## 📋 THÔNG TIN CHUNG

**Dự án:** HCMSIU_SSPS - Student Smart Printing Service  
**Ngày tạo:** 28/12/2025  
**Phiên bản:** 1.0  
**Người tạo:** QA Team

**Tổng số testcase:** 150+ testcases  
**Phân loại:**

- Student: 80+ testcases (Đăng nhập, Tải tài liệu, Chọn máy in, In tài liệu, Lịch sử in)
- SPSO: 70+ testcases (Đăng nhập, Quản lý máy in, Quản lý vị trí, Cài đặt hệ thống, Báo cáo)

---

## 🎯 MỤC LỤC

1. [STUDENT - Đăng nhập (Xác thực 2 lớp, Ghi nhớ đăng nhập)](#1-student---đăng-nhập)
2. [STUDENT - Đăng xuất](#2-student---đăng-xuất)
3. [STUDENT - Tải tài liệu](#3-student---tải-tài-liệu)
4. [STUDENT - Danh sách tài liệu](#4-student---danh-sách-tài-liệu)
5. [STUDENT - Chọn máy in](#5-student---chọn-máy-in)
6. [STUDENT - Cấu hình in & Gửi lệnh in](#6-student---cấu-hình-in--gửi-lệnh-in)
7. [STUDENT - Lịch sử in](#7-student---lịch-sử-in)
8. [SPSO - Đăng nhập (Xác thực 2 lớp, Ghi nhớ đăng nhập)](#8-spso---đăng-nhập)
9. [SPSO - Đăng xuất](#9-spso---đăng-xuất)
10. [SPSO - Quản lý máy in](#10-spso---quản-lý-máy-in)
11. [SPSO - Quản lý vị trí máy in](#11-spso---quản-lý-vị-trí-máy-in)
12. [SPSO - Cài đặt hệ thống & Quản lý học kỳ](#12-spso---cài-đặt-hệ-thống--quản-lý-học-kỳ)
13. [SPSO - Báo cáo](#13-spso---báo-cáo)

---

## 1. STUDENT - Đăng nhập

### 1.1. Đăng nhập cơ bản

| ID   | Chức năng | Trường hợp kiểm thử                               | Dữ liệu đầu vào                                                   | Kết quả mong đợi                                                                                                | Kết quả thực tế | Pass/Fail |
| ---- | --------- | ------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC01 | Đăng nhập | Đăng nhập thành công với email và password hợp lệ | Email: `student@hcmiu.edu.vn`<br>Password: `Test@123`             | - Chuyển hướng đến `/student/dashboard`<br>- Token được lưu vào localStorage<br>- Hiển thị thông báo thành công |                 |           |
| TC02 | Đăng nhập | Đăng nhập với email không tồn tại                 | Email: `notexist@hcmiu.edu.vn`<br>Password: `Test@123`            | - Hiển thị lỗi: "Email hoặc mật khẩu không đúng"<br>- Không chuyển trang<br>- Không lưu token                   |                 |           |
| TC03 | Đăng nhập | Đăng nhập với password sai                        | Email: `student@hcmiu.edu.vn`<br>Password: `WrongPassword123`     | - Hiển thị lỗi: "Email hoặc mật khẩu không đúng"<br>- Không chuyển trang                                        |                 |           |
| TC04 | Đăng nhập | Đăng nhập với email không đúng định dạng          | Email: `invalidemail` (không có @)<br>Password: `Test@123`        | - Hiển thị lỗi: "Email không hợp lệ"<br>- Không gửi request đến server                                          |                 |           |
| TC05 | Đăng nhập | Đăng nhập với email để trống                      | Email: ``(trống)<br>Password:`Test@123`                           | - Hiển thị lỗi: "Vui lòng nhập đầy đủ thông tin"<br>- Nút đăng nhập bị disable hoặc hiển thị lỗi                |                 |           |
| TC06 | Đăng nhập | Đăng nhập với password để trống                   | Email: `student@hcmiu.edu.vn`<br>Password: `` (trống)             | - Hiển thị lỗi: "Vui lòng nhập đầy đủ thông tin"<br>- Nút đăng nhập bị disable hoặc hiển thị lỗi                |                 |           |
| TC07 | Đăng nhập | Đăng nhập với cả email và password để trống       | Email: `(trống)<br>Password:` (trống)                             | - Hiển thị lỗi: "Vui lòng nhập đầy đủ thông tin"<br>- Nút đăng nhập bị disable                                  |                 |           |
| TC08 | Đăng nhập | Đăng nhập với email có khoảng trắng đầu/cuối      | Email: `student@hcmiu.edu.vn`<br>Password: `Test@123`             | - Hệ thống tự động trim khoảng trắng<br>- Đăng nhập thành công                                                  |                 |           |
| TC09 | Đăng nhập | Đăng nhập với password có khoảng trắng            | Email: `student@hcmiu.edu.vn`<br>Password: `Test @123` (có space) | - Hiển thị lỗi: "Email hoặc mật khẩu không đúng"<br>- Không chuyển trang                                        |                 |           |
| TC10 | Đăng nhập | Đăng nhập với email viết hoa/thường khác nhau     | Email: `STUDENT@HCMIU.EDU.VN`<br>Password: `Test@123`             | - Đăng nhập thành công (email không phân biệt hoa thường)<br>- Chuyển đến dashboard                             |                 |           |

### 1.2. Xác thực 2 lớp (2FA/OTP)

| ID   | Chức năng    | Trường hợp kiểm thử                             | Dữ liệu đầu vào                                                                           | Kết quả mong đợi                                                                               | Kết quả thực tế | Pass/Fail |
| ---- | ------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC11 | Xác thực OTP | Đăng nhập lần đầu trên thiết bị mới yêu cầu OTP | Email: `student@hcmiu.edu.vn`<br>Password: `Test@123`<br>Thiết bị: Mới (chưa có deviceId) | - Hiển thị modal nhập OTP<br>- Gửi OTP về email<br>- HTTP status: 202                          |                 |           |
| TC12 | Xác thực OTP | Nhập OTP đúng                                   | OTP: `123456` (mã đúng từ email)                                                          | - Đăng nhập thành công<br>- Lưu token và deviceId<br>- Chuyển đến dashboard                    |                 |           |
| TC13 | Xác thực OTP | Nhập OTP sai                                    | OTP: `000000` (mã sai)                                                                    | - Hiển thị lỗi: "Mã OTP không đúng"<br>- Không đăng nhập<br>- Cho phép nhập lại                |                 |           |
| TC14 | Xác thực OTP | Nhập OTP để trống                               | OTP: `` (trống)                                                                           | - Hiển thị lỗi: "Vui lòng nhập mã OTP"<br>- Nút xác nhận bị disable                            |                 |           |
| TC15 | Xác thực OTP | Nhập OTP không đủ 6 số                          | OTP: `123` (chỉ 3 số)                                                                     | - Hiển thị lỗi: "Mã OTP phải có 6 số"<br>- Nút xác nhận bị disable                             |                 |           |
| TC16 | Xác thực OTP | Nhập OTP có ký tự không phải số                 | OTP: `12A456` (có chữ)                                                                    | - Hiển thị lỗi: "Mã OTP chỉ chứa số"<br>- Không cho phép nhập ký tự                            |                 |           |
| TC17 | Xác thực OTP | Hủy modal OTP                                   | Click nút "Hủy" trên modal OTP                                                            | - Đóng modal OTP<br>- Quay lại trang login<br>- Không lưu token                                |                 |           |
| TC18 | Xác thực OTP | OTP hết hạn (quá 5 phút)                        | OTP: `123456` (đã quá 5 phút kể từ khi gửi)                                               | - Hiển thị lỗi: "Mã OTP đã hết hạn"<br>- Cho phép gửi lại OTP                                  |                 |           |
| TC19 | Xác thực OTP | Gửi lại OTP                                     | Click nút "Gửi lại OTP"                                                                   | - Gửi OTP mới về email<br>- Hiển thị thông báo: "Đã gửi lại mã OTP"<br>- Reset countdown timer |                 |           |
| TC20 | Xác thực OTP | Nhập sai OTP quá 3 lần                          | Nhập sai OTP 3 lần liên tiếp                                                              | - Khóa tài khoản tạm thời (5 phút)<br>- Hiển thị: "Bạn đã nhập sai quá nhiều lần"              |                 |           |

### 1.3. Ghi nhớ đăng nhập (Remember Me)

| ID   | Chức năng         | Trường hợp kiểm thử                             | Dữ liệu đầu vào                                                                        | Kết quả mong đợi                                                                                          | Kết quả thực tế | Pass/Fail |
| ---- | ----------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC21 | Ghi nhớ đăng nhập | Đăng nhập với checkbox "Ghi nhớ tôi" được chọn  | Email: `student@hcmiu.edu.vn`<br>Password: `Test@123`<br>Remember Me: ✓ Checked        | - Lưu deviceId vào localStorage<br>- Lần đăng nhập sau không cần OTP<br>- Token có thời gian sống dài hơn |                 |           |
| TC22 | Ghi nhớ đăng nhập | Đăng nhập với checkbox "Ghi nhớ tôi" không chọn | Email: `student@hcmiu.edu.vn`<br>Password: `Test@123`<br>Remember Me: ☐ Unchecked      | - Không lưu deviceId<br>- Lần đăng nhập sau vẫn yêu cầu OTP<br>- Token có thời gian sống ngắn             |                 |           |
| TC23 | Ghi nhớ đăng nhập | Đăng nhập lần 2 trên thiết bị đã ghi nhớ        | Email: `student@hcmiu.edu.vn`<br>Password: `Test@123`<br>DeviceId: Đã lưu từ lần trước | - Không yêu cầu OTP<br>- Đăng nhập thành công trực tiếp<br>- Chuyển đến dashboard                         |                 |           |
| TC24 | Ghi nhớ đăng nhập | Xóa deviceId và đăng nhập lại                   | Xóa localStorage deviceId<br>Email: `student@hcmiu.edu.vn`<br>Password: `Test@123`     | - Yêu cầu OTP lại<br>- Hiển thị modal OTP                                                                 |                 |           |
| TC25 | Ghi nhớ đăng nhập | Đăng nhập trên trình duyệt khác (thiết bị khác) | Email: `student@hcmiu.edu.vn`<br>Password: `Test@123`<br>Browser: Chrome → Firefox     | - Yêu cầu OTP (deviceId khác)<br>- Hiển thị modal OTP                                                     |                 |           |

### 1.4. Đăng nhập bằng Google (SSO)

| ID   | Chức năng      | Trường hợp kiểm thử                                      | Dữ liệu đầu vào                                                                     | Kết quả mong đợi                                                                               | Kết quả thực tế | Pass/Fail |
| ---- | -------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC26 | Google Sign-In | Đăng nhập bằng Google thành công                         | Click nút "Continue with Google"<br>Chọn tài khoản Google: `student@hcmiu.edu.vn`   | - Đăng nhập thành công<br>- Lưu token<br>- Chuyển đến dashboard                                |                 |           |
| TC27 | Google Sign-In | Đăng nhập Google với email không phải @hcmiu.edu.vn      | Click nút "Continue with Google"<br>Chọn tài khoản: `personal@gmail.com`            | - Hiển thị lỗi: "Email phải thuộc domain @hcmiu.edu.vn"<br>- Không đăng nhập                   |                 |           |
| TC28 | Google Sign-In | Hủy đăng nhập Google                                     | Click nút "Continue with Google"<br>Click "Cancel" trên popup Google                | - Đóng popup Google<br>- Quay lại trang login<br>- Không có thay đổi                           |                 |           |
| TC29 | Google Sign-In | Google Sign-In button không hiển thị khi thiếu Client ID | GOOGLE_CLIENT_ID: `null` hoặc không set                                             | - Hiển thị nút disabled với text: "Google chưa được cấu hình"<br>- Không thể click             |                 |           |
| TC30 | Google Sign-In | Đăng nhập Google với tài khoản SPSO                      | Click nút "Continue with Google"<br>Chọn tài khoản: `spso@hcmiu.edu.vn` (role SPSO) | - Hiển thị lỗi: "Trang này chỉ dành cho sinh viên"<br>- Logout tự động<br>- Không chuyển trang |                 |           |

### 1.5. Bảo mật và Session

| ID   | Chức năng | Trường hợp kiểm thử                       | Dữ liệu đầu vào                                                | Kết quả mong đợi                                                                                          | Kết quả thực tế | Pass/Fail |
| ---- | --------- | ----------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC31 | Session   | Truy cập trang student khi chưa đăng nhập | Truy cập URL: `/student/dashboard` (chưa có token)             | - Redirect về `/login`<br>- URL có query param: `?redirect=/student/dashboard`                            |                 |           |
| TC32 | Session   | Token hết hạn khi đang sử dụng            | Token đã hết hạn (expired)<br>Thực hiện action bất kỳ          | - Hiển thị thông báo: "Phiên làm việc hết hạn"<br>- Redirect về `/login`<br>- Xóa token khỏi localStorage |                 |           |
| TC33 | Session   | Refresh token tự động                     | Access token hết hạn<br>Refresh token còn hạn                  | - Tự động gọi API refresh token<br>- Lấy access token mới<br>- Tiếp tục request ban đầu                   |                 |           |
| TC34 | Session   | Đăng nhập khi đã có session               | Đã đăng nhập (có token hợp lệ)<br>Truy cập `/login`            | - Redirect về `/student/dashboard`<br>- Không hiển thị form login                                         |                 |           |
| TC35 | Session   | Đăng nhập đồng thời trên 2 tab            | Tab 1: Đã đăng nhập<br>Tab 2: Đăng nhập lại với cùng tài khoản | - Cả 2 tab đều hoạt động bình thường<br>- Token được sync giữa các tab                                    |                 |           |

---

## 2. STUDENT - Đăng xuất

| ID   | Chức năng | Trường hợp kiểm thử                      | Dữ liệu đầu vào                                    | Kết quả mong đợi                                                                                                               | Kết quả thực tế | Pass/Fail |
| ---- | --------- | ---------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC36 | Đăng xuất | Đăng xuất thành công                     | Click nút "Đăng xuất" trên menu                    | - Xóa token khỏi localStorage<br>- Xóa tất cả thông tin user<br>- Redirect về `/login`<br>- Hiển thị thông báo: "Đã đăng xuất" |                 |           |
| TC37 | Đăng xuất | Truy cập trang student sau khi đăng xuất | Đăng xuất<br>Truy cập: `/student/dashboard`        | - Redirect về `/login`<br>- Không thể truy cập trang student                                                                   |                 |           |
| TC38 | Đăng xuất | Đăng xuất trên nhiều tab                 | Tab 1: Click đăng xuất<br>Tab 2: Đang mở dashboard | - Tab 1: Redirect về login<br>- Tab 2: Tự động logout và redirect về login (nếu có sync)                                       |                 |           |
| TC39 | Đăng xuất | Sử dụng token cũ sau khi đăng xuất       | Đăng xuất<br>Gửi API request với token cũ          | - API trả về 401 Unauthorized<br>- Hiển thị lỗi: "Phiên làm việc không hợp lệ"                                                 |                 |           |

---

## 3. STUDENT - Tải tài liệu

### 3.1. Upload tài liệu cơ bản

| ID   | Chức năng       | Trường hợp kiểm thử                    | Dữ liệu đầu vào                                              | Kết quả mong đợi                                                                                                       | Kết quả thực tế | Pass/Fail |
| ---- | --------------- | -------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC40 | Upload tài liệu | Upload file PDF hợp lệ                 | File: `document.pdf` (5MB, PDF)                              | - Upload thành công<br>- Hiển thị progress bar<br>- File xuất hiện trong danh sách<br>- Thông báo: "Upload thành công" |                 |           |
| TC41 | Upload tài liệu | Upload file DOCX hợp lệ                | File: `document.docx` (3MB, DOCX)                            | - Upload thành công<br>- File xuất hiện trong danh sách                                                                |                 |           |
| TC42 | Upload tài liệu | Upload file PPTX hợp lệ                | File: `presentation.pptx` (8MB, PPTX)                        | - Upload thành công<br>- File xuất hiện trong danh sách                                                                |                 |           |
| TC43 | Upload tài liệu | Upload file XLSX hợp lệ                | File: `spreadsheet.xlsx` (2MB, XLSX)                         | - Upload thành công<br>- File xuất hiện trong danh sách                                                                |                 |           |
| TC44 | Upload tài liệu | Upload file không được hỗ trợ          | File: `image.jpg` (1MB, JPG)                                 | - Hiển thị lỗi: "Định dạng file không hỗ trợ. Chấp nhận: PDF, DOCX, PPTX, XLSX"<br>- Không upload                      |                 |           |
| TC45 | Upload tài liệu | Upload file quá lớn (>50MB)            | File: `large.pdf` (60MB, PDF)                                | - Hiển thị lỗi: "File quá lớn (max 50MB)"<br>- Không upload                                                            |                 |           |
| TC46 | Upload tài liệu | Upload file đúng 50MB                  | File: `exact.pdf` (50MB, PDF)                                | - Upload thành công<br>- File xuất hiện trong danh sách                                                                |                 |           |
| TC47 | Upload tài liệu | Upload file rất nhỏ                    | File: `tiny.pdf` (10KB, PDF)                                 | - Upload thành công<br>- File xuất hiện trong danh sách                                                                |                 |           |
| TC48 | Upload tài liệu | Upload file có tên tiếng Việt          | File: `Tài liệu học tập.pdf` (2MB)                           | - Upload thành công<br>- Tên file hiển thị đúng tiếng Việt                                                             |                 |           |
| TC49 | Upload tài liệu | Upload file có tên chứa ký tự đặc biệt | File: `Doc@#$%.pdf` (1MB)                                    | - Upload thành công hoặc<br>- Tự động rename file loại bỏ ký tự đặc biệt                                               |                 |           |
| TC50 | Upload tài liệu | Upload file có tên rất dài             | File: `VeryLongFileNameWith100Characters...pdf` (>100 ký tự) | - Upload thành công<br>- Tên file được truncate khi hiển thị                                                           |                 |           |

### 3.2. Upload với mô tả

| ID   | Chức năng        | Trường hợp kiểm thử           | Dữ liệu đầu vào                            | Kết quả mong đợi                                             | Kết quả thực tế | Pass/Fail |
| ---- | ---------------- | ----------------------------- | ------------------------------------------ | ------------------------------------------------------------ | --------------- | --------- |
| TC51 | Upload với mô tả | Upload file với mô tả hợp lệ  | File: `doc.pdf`<br>Mô tả: `Bài tập tuần 1` | - Upload thành công<br>- Mô tả được lưu và hiển thị          |                 |           |
| TC52 | Upload với mô tả | Upload file không có mô tả    | File: `doc.pdf`<br>Mô tả: `` (trống)       | - Upload thành công<br>- Mô tả để trống                      |                 |           |
| TC53 | Upload với mô tả | Upload file với mô tả rất dài | File: `doc.pdf`<br>Mô tả: 500 ký tự        | - Upload thành công<br>- Mô tả được lưu đầy đủ hoặc truncate |                 |           |

### 3.3. Upload nhiều file

| ID   | Chức năng         | Trường hợp kiểm thử    | Dữ liệu đầu vào                                                      | Kết quả mong đợi                                                                   | Kết quả thực tế | Pass/Fail |
| ---- | ----------------- | ---------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------- | --------- |
| TC54 | Upload nhiều file | Upload 2 file cùng lúc | File 1: `doc1.pdf`<br>File 2: `doc2.pdf`                             | - Cả 2 file upload thành công<br>- Hiển thị progress cho từng file                 |                 |           |
| TC55 | Upload nhiều file | Upload 5 file cùng lúc | 5 files PDF (mỗi file 5MB)                                           | - Tất cả files upload thành công<br>- Hiển thị progress tổng thể                   |                 |           |
| TC56 | Upload nhiều file | Upload file trùng tên  | File 1: `doc.pdf` (upload lần 1)<br>File 2: `doc.pdf` (upload lần 2) | - Cả 2 file đều được lưu<br>- File 2 được rename: `doc(1).pdf` hoặc thêm timestamp |                 |           |

### 3.4. Xử lý lỗi và edge cases

| ID   | Chức năng  | Trường hợp kiểm thử                | Dữ liệu đầu vào                                        | Kết quả mong đợi                                                                 | Kết quả thực tế | Pass/Fail |
| ---- | ---------- | ---------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- | --------------- | --------- |
| TC57 | Upload lỗi | Mất kết nối internet giữa chừng    | File: `doc.pdf` (10MB)<br>Ngắt internet khi upload 50% | - Hiển thị lỗi: "Mất kết nối"<br>- Cho phép retry<br>- Không lưu file incomplete |                 |           |
| TC58 | Upload lỗi | Server trả về lỗi 500              | File: `doc.pdf`<br>Server: Lỗi 500 Internal Error      | - Hiển thị lỗi: "Lỗi server. Vui lòng thử lại"<br>- Cho phép retry               |                 |           |
| TC59 | Upload lỗi | Token hết hạn khi upload           | File: `doc.pdf`<br>Token: Expired                      | - Hiển thị lỗi: "Phiên làm việc hết hạn"<br>- Redirect về login                  |                 |           |
| TC60 | Upload lỗi | Upload file bị corrupt             | File: `corrupt.pdf` (file bị lỗi)                      | - Hiển thị lỗi: "File không hợp lệ hoặc bị hỏng"<br>- Không upload               |                 |           |
| TC61 | Upload lỗi | Hủy upload giữa chừng              | File: `doc.pdf` (10MB)<br>Click "Hủy" khi upload 30%   | - Dừng upload<br>- Không lưu file<br>- Xóa progress bar                          |                 |           |
| TC62 | Upload lỗi | Upload khi đã đạt giới hạn storage | Đã upload 100 files (giới hạn)<br>Upload file thứ 101  | - Hiển thị lỗi: "Đã đạt giới hạn số lượng file"<br>- Không upload                |                 |           |

---

## 4. STUDENT - Danh sách tài liệu

### 4.1. Xem danh sách

| ID   | Chức năng     | Trường hợp kiểm thử                    | Dữ liệu đầu vào                    | Kết quả mong đợi                                                                                                   | Kết quả thực tế | Pass/Fail |
| ---- | ------------- | -------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC63 | Xem danh sách | Xem danh sách tài liệu đã upload       | Truy cập trang documents           | - Hiển thị tất cả files đã upload<br>- Thông tin: Tên, Loại, Kích thước, Ngày tải<br>- Có pagination nếu >10 files |                 |           |
| TC64 | Xem danh sách | Danh sách trống (chưa upload file nào) | Chưa có file nào                   | - Hiển thị: "Chưa có tài liệu nào"<br>- Hiển thị nút "Upload tài liệu"                                             |                 |           |
| TC65 | Xem danh sách | Xem chi tiết một tài liệu              | Click vào một file trong danh sách | - Hiển thị modal/page chi tiết<br>- Thông tin: Tên, Loại, Kích thước, Ngày tải, Số trang, Mô tả                    |                 |           |
| TC66 | Xem danh sách | Sắp xếp theo ngày tải (mới nhất)       | Click sort: "Ngày tải ↓"           | - Files được sắp xếp từ mới đến cũ<br>- File upload gần nhất ở đầu                                                 |                 |           |
| TC67 | Xem danh sách | Sắp xếp theo ngày tải (cũ nhất)        | Click sort: "Ngày tải ↑"           | - Files được sắp xếp từ cũ đến mới<br>- File upload lâu nhất ở đầu                                                 |                 |           |
| TC68 | Xem danh sách | Sắp xếp theo tên file (A-Z)            | Click sort: "Tên file A-Z"         | - Files được sắp xếp theo alphabet<br>- A → Z                                                                      |                 |           |
| TC69 | Xem danh sách | Sắp xếp theo kích thước (lớn nhất)     | Click sort: "Kích thước ↓"         | - Files được sắp xếp từ lớn đến nhỏ                                                                                |                 |           |

### 4.2. Tìm kiếm và lọc

| ID   | Chức năng | Trường hợp kiểm thử             | Dữ liệu đầu vào          | Kết quả mong đợi                                                           | Kết quả thực tế | Pass/Fail |
| ---- | --------- | ------------------------------- | ------------------------ | -------------------------------------------------------------------------- | --------------- | --------- |
| TC70 | Tìm kiếm  | Tìm kiếm theo tên file          | Search: `bài tập`        | - Hiển thị các files có tên chứa "bài tập"<br>- Highlight từ khóa tìm kiếm |                 |           |
| TC71 | Tìm kiếm  | Tìm kiếm không có kết quả       | Search: `xyz123notfound` | - Hiển thị: "Không tìm thấy tài liệu nào"<br>- Gợi ý: "Thử từ khóa khác"   |                 |           |
| TC72 | Tìm kiếm  | Tìm kiếm với từ khóa rỗng       | Search: `` (trống)       | - Hiển thị tất cả files<br>- Không filter                                  |                 |           |
| TC73 | Lọc       | Lọc theo loại file PDF          | Filter: "PDF"            | - Chỉ hiển thị files .pdf<br>- Ẩn các loại khác                            |                 |           |
| TC74 | Lọc       | Lọc theo loại file DOCX         | Filter: "DOCX"           | - Chỉ hiển thị files .docx                                                 |                 |           |
| TC75 | Lọc       | Lọc theo loại file PPTX         | Filter: "PPTX"           | - Chỉ hiển thị files .pptx                                                 |                 |           |
| TC76 | Lọc       | Lọc theo loại file XLSX         | Filter: "XLSX"           | - Chỉ hiển thị files .xlsx                                                 |                 |           |
| TC77 | Lọc       | Lọc "Tất cả"                    | Filter: "Tất cả"         | - Hiển thị tất cả files<br>- Không filter theo loại                        |                 |           |
| TC78 | Lọc       | Lọc theo ngày tải (hôm nay)     | Filter: "Hôm nay"        | - Chỉ hiển thị files upload hôm nay                                        |                 |           |
| TC79 | Lọc       | Lọc theo ngày tải (7 ngày qua)  | Filter: "7 ngày qua"     | - Chỉ hiển thị files upload trong 7 ngày                                   |                 |           |
| TC80 | Lọc       | Lọc theo ngày tải (30 ngày qua) | Filter: "30 ngày qua"    | - Chỉ hiển thị files upload trong 30 ngày                                  |                 |           |

### 4.3. Xóa tài liệu

| ID   | Chức năng    | Trường hợp kiểm thử                            | Dữ liệu đầu vào                       | Kết quả mong đợi                                                                                       | Kết quả thực tế | Pass/Fail |
| ---- | ------------ | ---------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC81 | Xóa tài liệu | Xóa một tài liệu                               | Click "Xóa" trên file `doc.pdf`       | - Hiển thị dialog xác nhận: "Bạn có chắc muốn xóa?"<br>- Click "Xác nhận" → File bị xóa khỏi danh sách |                 |           |
| TC82 | Xóa tài liệu | Hủy xóa tài liệu                               | Click "Xóa" → Click "Hủy" trên dialog | - Đóng dialog<br>- File vẫn còn trong danh sách                                                        |                 |           |
| TC83 | Xóa tài liệu | Xóa tài liệu đang được sử dụng trong print job | Xóa file đang có print job "Pending"  | - Hiển thị cảnh báo: "File đang được sử dụng trong lệnh in"<br>- Không cho phép xóa hoặc hỏi xác nhận  |                 |           |
| TC84 | Xóa tài liệu | Xóa nhiều tài liệu cùng lúc                    | Chọn 3 files → Click "Xóa đã chọn"    | - Hiển thị dialog: "Xóa 3 tài liệu?"<br>- Click "Xác nhận" → Tất cả bị xóa                             |                 |           |

### 4.4. Tải xuống tài liệu

| ID   | Chức năng | Trường hợp kiểm thử              | Dữ liệu đầu vào                          | Kết quả mong đợi                                                                   | Kết quả thực tế | Pass/Fail |
| ---- | --------- | -------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- | --------------- | --------- |
| TC85 | Tải xuống | Tải xuống file PDF               | Click "Tải xuống" trên `doc.pdf`         | - File được download về máy<br>- Tên file giữ nguyên<br>- File mở được bình thường |                 |           |
| TC86 | Tải xuống | Tải xuống file DOCX              | Click "Tải xuống" trên `doc.docx`        | - File được download về máy<br>- Mở được bằng Word                                 |                 |           |
| TC87 | Tải xuống | Tải xuống file có tên tiếng Việt | Click "Tải xuống" trên `Tài liệu.pdf`    | - File download với tên tiếng Việt đúng<br>- Không bị lỗi encoding                 |                 |           |
| TC88 | Tải xuống | Tải xuống nhiều file cùng lúc    | Chọn 3 files → Click "Tải xuống đã chọn" | - Download file ZIP chứa 3 files<br>- Hoặc download từng file riêng lẻ             |                 |           |

### 4.5. Pagination

| ID   | Chức năng  | Trường hợp kiểm thử        | Dữ liệu đầu vào       | Kết quả mong đợi                                                             | Kết quả thực tế | Pass/Fail |
| ---- | ---------- | -------------------------- | --------------------- | ---------------------------------------------------------------------------- | --------------- | --------- |
| TC89 | Pagination | Xem trang 1 (có 25 files)  | Page: 1, Size: 10     | - Hiển thị 10 files đầu tiên<br>- Pagination: "1 [2] [3] Next"               |                 |           |
| TC90 | Pagination | Chuyển sang trang 2        | Click "Next" hoặc "2" | - Hiển thị 10 files tiếp theo (11-20)<br>- Pagination: "Prev [1] 2 [3] Next" |                 |           |
| TC91 | Pagination | Chuyển sang trang cuối     | Click "Last" hoặc "3" | - Hiển thị 5 files cuối (21-25)<br>- Pagination: "Prev [1] [2] 3"            |                 |           |
| TC92 | Pagination | Thay đổi số items per page | Chọn: "20 items/page" | - Hiển thị 20 files trên 1 trang<br>- Pagination thay đổi: "1 [2]"           |                 |           |

---

## 5. STUDENT - Chọn máy in

### 5.1. Xem danh sách máy in

| ID   | Chức năng     | Trường hợp kiểm thử        | Dữ liệu đầu vào                                  | Kết quả mong đợi                                                                                             | Kết quả thực tế | Pass/Fail |
| ---- | ------------- | -------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC93 | Xem danh sách | Xem tất cả máy in khả dụng | Truy cập trang printers                          | - Hiển thị danh sách máy in<br>- Thông tin: Tên, Vị trí, Trạng thái, Khổ giấy<br>- Chỉ hiển thị máy "Active" |                 |           |
| TC94 | Xem danh sách | Không có máy in khả dụng   | Tất cả máy in đang "Inactive" hoặc "Maintenance" | - Hiển thị: "Không có máy in nào khả dụng"<br>- Gợi ý: "Vui lòng thử lại sau"                                |                 |           |
| TC95 | Xem danh sách | Xem chi tiết một máy in    | Click vào card máy in                            | - Hiển thị modal chi tiết<br>- Thông tin: Tên, Hãng, Model, Vị trí, Khổ giấy, Màu, 2 mặt, Trạng thái         |                 |           |

### 5.2. Lọc máy in

| ID    | Chức năng | Trường hợp kiểm thử                   | Dữ liệu đầu vào                                 | Kết quả mong đợi                                                   | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | --------------- | --------- |
| TC96  | Lọc       | Lọc theo cơ sở "Dĩ An"                | Filter Campus: "Dĩ An"                          | - Chỉ hiển thị máy in ở Dĩ An<br>- Ẩn máy in ở Thành phố           |                 |           |
| TC97  | Lọc       | Lọc theo cơ sở "Thành phố"            | Filter Campus: "Thành phố"                      | - Chỉ hiển thị máy in ở Thành phố<br>- Ẩn máy in ở Dĩ An           |                 |           |
| TC98  | Lọc       | Lọc theo tòa nhà "H6"                 | Filter Campus: "Dĩ An"<br>Filter Building: "H6" | - Chỉ hiển thị máy in ở H6<br>- Ẩn máy in ở H1, H2, H3             |                 |           |
| TC99  | Lọc       | Lọc theo phòng "101"                  | Filter Building: "H6"<br>Filter Room: "101"     | - Chỉ hiển thị máy in ở phòng H6-101                               |                 |           |
| TC100 | Lọc       | Toggle "Chỉ hiện máy in khả dụng"     | Toggle: ON                                      | - Chỉ hiển thị máy "Active"<br>- Ẩn máy "Inactive", "Maintenance"  |                 |           |
| TC101 | Lọc       | Toggle "Chỉ hiện máy in khả dụng" OFF | Toggle: OFF                                     | - Hiển thị tất cả máy in<br>- Bao gồm cả "Inactive", "Maintenance" |                 |           |
| TC102 | Lọc       | Lọc theo khổ giấy A4                  | Filter: "Hỗ trợ A4"                             | - Chỉ hiển thị máy in có hỗ trợ A4                                 |                 |           |
| TC103 | Lọc       | Lọc theo khổ giấy A3                  | Filter: "Hỗ trợ A3"                             | - Chỉ hiển thị máy in có hỗ trợ A3                                 |                 |           |
| TC104 | Lọc       | Lọc máy in màu                        | Filter: "In màu"                                | - Chỉ hiển thị máy in có colorPrinting = true                      |                 |           |
| TC105 | Lọc       | Lọc máy in 2 mặt                      | Filter: "In 2 mặt"                              | - Chỉ hiển thị máy in có duplexPrinting = true                     |                 |           |

### 5.3. Tìm kiếm máy in

| ID    | Chức năng | Trường hợp kiểm thử       | Dữ liệu đầu vào       | Kết quả mong đợi                                                       | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ------------------------- | --------------------- | ---------------------------------------------------------------------- | --------------- | --------- |
| TC106 | Tìm kiếm  | Tìm theo tên máy in       | Search: `HP LaserJet` | - Hiển thị các máy in có tên chứa "HP LaserJet"<br>- Highlight từ khóa |                 |           |
| TC107 | Tìm kiếm  | Tìm theo vị trí           | Search: `H6-101`      | - Hiển thị máy in ở vị trí H6-101                                      |                 |           |
| TC108 | Tìm kiếm  | Tìm kiếm không có kết quả | Search: `notfound123` | - Hiển thị: "Không tìm thấy máy in nào"<br>- Gợi ý: "Thử từ khóa khác" |                 |           |

### 5.4. Chọn máy in

| ID    | Chức năng   | Trường hợp kiểm thử      | Dữ liệu đầu vào                                  | Kết quả mong đợi                                                                      | Kết quả thực tế | Pass/Fail |
| ----- | ----------- | ------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------- | --------------- | --------- |
| TC109 | Chọn máy in | Chọn một máy in khả dụng | Click "Chọn máy in này" trên máy "Active"        | - Lưu printerId<br>- Chuyển đến trang cấu hình in<br>- Hiển thị tên máy đã chọn       |                 |           |
| TC110 | Chọn máy in | Chọn máy in đang bảo trì | Click "Chọn" trên máy "Maintenance"              | - Hiển thị cảnh báo: "Máy in đang bảo trì"<br>- Không cho phép chọn hoặc hỏi xác nhận |                 |           |
| TC111 | Chọn máy in | Chọn máy in đang tắt     | Click "Chọn" trên máy "Inactive"                 | - Hiển thị cảnh báo: "Máy in không khả dụng"<br>- Không cho phép chọn                 |                 |           |
| TC112 | Chọn máy in | Đổi máy in đã chọn       | Đã chọn máy A<br>Click "Đổi máy in" → Chọn máy B | - printerId được cập nhật thành máy B<br>- Hiển thị tên máy B                         |                 |           |

---

## 6. STUDENT - Cấu hình in & Gửi lệnh in

### 6.1. Cấu hình in cơ bản

| ID    | Chức năng | Trường hợp kiểm thử                       | Dữ liệu đầu vào                                 | Kết quả mong đợi                                                                      | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ----------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------- | --------------- | --------- |
| TC113 | Cấu hình  | Chọn khổ giấy A4                          | Paper Size: A4                                  | - Radio button A4 được chọn<br>- Tính toán trang A4 equivalent                        |                 |           |
| TC114 | Cấu hình  | Chọn khổ giấy A3                          | Paper Size: A3                                  | - Radio button A3 được chọn<br>- Tính toán: A3 = 2x A4                                |                 |           |
| TC115 | Cấu hình  | In tất cả trang                           | Page Range: "Tất cả trang"                      | - Radio "Tất cả" được chọn<br>- Tính toán: totalPages = document.totalPages           |                 |           |
| TC116 | Cấu hình  | In trang cụ thể (1-5)                     | Page Range: "Tùy chọn"<br>Input: `1-5`          | - Tính toán: 5 trang<br>- Validate: Hợp lệ                                            |                 |           |
| TC117 | Cấu hình  | In trang rời rạc (1,3,5)                  | Page Range: "Tùy chọn"<br>Input: `1,3,5`        | - Tính toán: 3 trang<br>- Validate: Hợp lệ                                            |                 |           |
| TC118 | Cấu hình  | In trang kết hợp (1-5,10,15-20)           | Page Range: "Tùy chọn"<br>Input: `1-5,10,15-20` | - Tính toán: 5+1+6 = 12 trang<br>- Validate: Hợp lệ                                   |                 |           |
| TC119 | Cấu hình  | In trang không hợp lệ (vượt quá số trang) | Document: 10 trang<br>Input: `1-15`             | - Hiển thị lỗi: "Trang phải từ 1 đến 10"<br>- Không cho phép submit                   |                 |           |
| TC120 | Cấu hình  | In trang không hợp lệ (định dạng sai)     | Input: `abc` hoặc `1-`                          | - Hiển thị lỗi: "Định dạng không hợp lệ. VD: 1-5,10,15-20"<br>- Không cho phép submit |                 |           |
| TC121 | Cấu hình  | Bật in 2 mặt                              | Duplex: ON                                      | - Toggle được bật<br>- Tính toán: pages \* 0.5                                        |                 |           |
| TC122 | Cấu hình  | Tắt in 2 mặt                              | Duplex: OFF                                     | - Toggle được tắt<br>- Tính toán: pages \* 1                                          |                 |           |
| TC123 | Cấu hình  | Số bản copy = 1                           | Copies: 1                                       | - Input = 1<br>- Tính toán: pages \* 1                                                |                 |           |
| TC124 | Cấu hình  | Số bản copy = 5                           | Copies: 5                                       | - Input = 5<br>- Tính toán: pages \* 5                                                |                 |           |
| TC125 | Cấu hình  | Số bản copy = 10 (max)                    | Copies: 10                                      | - Input = 10<br>- Tính toán: pages \* 10                                              |                 |           |
| TC126 | Cấu hình  | Số bản copy > 10                          | Copies: 15                                      | - Hiển thị lỗi: "Số bản copy tối đa là 10"<br>- Không cho phép nhập                   |                 |           |
| TC127 | Cấu hình  | Số bản copy = 0                           | Copies: 0                                       | - Hiển thị lỗi: "Số bản copy phải >= 1"<br>- Không cho phép submit                    |                 |           |

### 6.2. Tính toán trang và số dư

| ID    | Chức năng      | Trường hợp kiểm thử                      | Dữ liệu đầu vào                            | Kết quả mong đợi                                                                                                             | Kết quả thực tế | Pass/Fail |
| ----- | -------------- | ---------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC128 | Tính toán      | Tính A4 equivalent cho A4, 1 mặt, 1 copy | Document: 10 trang<br>A4, 1-sided, 1 copy  | - A4 equivalent: 10 trang                                                                                                    |                 |           |
| TC129 | Tính toán      | Tính A4 equivalent cho A4, 2 mặt, 1 copy | Document: 10 trang<br>A4, duplex, 1 copy   | - A4 equivalent: 10 \* 0.5 = 5 trang                                                                                         |                 |           |
| TC130 | Tính toán      | Tính A4 equivalent cho A3, 1 mặt, 1 copy | Document: 10 trang<br>A3, 1-sided, 1 copy  | - A4 equivalent: 10 \* 2 = 20 trang                                                                                          |                 |           |
| TC131 | Tính toán      | Tính A4 equivalent cho A3, 2 mặt, 2 copy | Document: 10 trang<br>A3, duplex, 2 copies | - A4 equivalent: 10 _ 2 _ 0.5 \* 2 = 20 trang                                                                                |                 |           |
| TC132 | Kiểm tra số dư | Số dư đủ để in                           | Balance: 50 trang<br>Required: 20 trang    | - Hiển thị: "Số dư sau khi in: 30 trang"<br>- Nút "Xác nhận in" enabled                                                      |                 |           |
| TC133 | Kiểm tra số dư | Số dư không đủ                           | Balance: 10 trang<br>Required: 20 trang    | - Hiển thị cảnh báo: "Số dư không đủ. Vui lòng mua thêm trang"<br>- Nút "Xác nhận in" disabled<br>- Link đến trang mua trang |                 |           |
| TC134 | Kiểm tra số dư | Số dư đúng bằng số trang cần in          | Balance: 20 trang<br>Required: 20 trang    | - Hiển thị: "Số dư sau khi in: 0 trang"<br>- Nút "Xác nhận in" enabled                                                       |                 |           |

### 6.3. Gửi lệnh in

| ID    | Chức năng   | Trường hợp kiểm thử                 | Dữ liệu đầu vào                                                                              | Kết quả mong đợi                                                                                                                     | Kết quả thực tế | Pass/Fail |
| ----- | ----------- | ----------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC135 | Gửi lệnh in | Gửi lệnh in thành công              | Document: `doc.pdf`<br>Printer: `HP-H6-101`<br>A4, All pages, 1-sided, 1 copy<br>Balance: Đủ | - API POST /print-jobs thành công<br>- Trừ trang từ balance<br>- Redirect đến print history<br>- Thông báo: "Gửi lệnh in thành công" |                 |           |
| TC136 | Gửi lệnh in | Gửi lệnh in với số dư không đủ      | Balance: 5 trang<br>Required: 20 trang                                                       | - API trả về lỗi 400<br>- Hiển thị: "Số dư không đủ"<br>- Không tạo print job                                                        |                 |           |
| TC137 | Gửi lệnh in | Gửi lệnh in khi máy in đang offline | Printer status: "Inactive"                                                                   | - API trả về lỗi<br>- Hiển thị: "Máy in không khả dụng"<br>- Gợi ý chọn máy khác                                                     |                 |           |
| TC138 | Gửi lệnh in | Gửi lệnh in khi token hết hạn       | Token: Expired                                                                               | - API trả về 401<br>- Redirect về login<br>- Thông báo: "Phiên làm việc hết hạn"                                                     |                 |           |
| TC139 | Gửi lệnh in | Gửi lệnh in với document đã bị xóa  | Document: Đã bị xóa (soft delete)                                                            | - API trả về lỗi 404<br>- Hiển thị: "Tài liệu không tồn tại"                                                                         |                 |           |
| TC140 | Gửi lệnh in | Gửi lệnh in khi mất kết nối         | Network: Offline                                                                             | - Hiển thị lỗi: "Mất kết nối"<br>- Cho phép retry                                                                                    |                 |           |

### 6.4. Preview và xác nhận

| ID    | Chức năng | Trường hợp kiểm thử        | Dữ liệu đầu vào                          | Kết quả mong đợi                                                                                                          | Kết quả thực tế | Pass/Fail |
| ----- | --------- | -------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC141 | Preview   | Xem preview cấu hình       | Cấu hình: A4, 10 trang, duplex, 2 copies | - Hiển thị panel preview:<br> • Tổng số trang: 10<br> • A4 equivalent: 10<br> • Số dư hiện tại: 50<br> • Số dư sau in: 40 |                 |           |
| TC142 | Preview   | Preview cập nhật real-time | Thay đổi: A4 → A3                        | - Preview tự động cập nhật<br>- A4 equivalent: 10 → 20                                                                    |                 |           |
| TC143 | Xác nhận  | Quay lại trang trước       | Click "Quay lại"                         | - Quay lại trang chọn máy in<br>- Không mất dữ liệu đã nhập                                                               |                 |           |
| TC144 | Xác nhận  | Hủy cấu hình               | Click "Hủy" hoặc close page              | - Hiển thị dialog: "Bạn có chắc muốn hủy?"<br>- Click "Xác nhận" → Quay về dashboard                                      |                 |           |

---

## 7. STUDENT - Lịch sử in

### 7.1. Xem lịch sử in

| ID    | Chức năng   | Trường hợp kiểm thử             | Dữ liệu đầu vào                   | Kết quả mong đợi                                                                                                                               | Kết quả thực tế | Pass/Fail |
| ----- | ----------- | ------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC145 | Xem lịch sử | Xem tất cả lịch sử in           | Truy cập `/student/print-history` | - Hiển thị danh sách print jobs<br>- Thông tin: Ngày giờ, Tên tài liệu, Máy in, Số trang, Trạng thái<br>- Sắp xếp: Mới nhất trước              |                 |           |
| TC146 | Xem lịch sử | Lịch sử trống (chưa in lần nào) | Chưa có print job                 | - Hiển thị: "Chưa có lịch sử in"<br>- Gợi ý: "Bắt đầu in tài liệu"                                                                             |                 |           |
| TC147 | Xem lịch sử | Xem chi tiết một lệnh in        | Click vào một row trong table     | - Hiển thị modal chi tiết<br>- Thông tin: Document, Printer, Config (paper size, pages, sides, copies), Status, Submitted time, Completed time |                 |           |

### 7.2. Lọc lịch sử

| ID    | Chức năng | Trường hợp kiểm thử                 | Dữ liệu đầu vào                        | Kết quả mong đợi                                              | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ----------------------------------- | -------------------------------------- | ------------------------------------------------------------- | --------------- | --------- |
| TC148 | Lọc       | Lọc theo trạng thái "Hoàn thành"    | Filter Status: "Completed"             | - Chỉ hiển thị jobs có status "Completed"<br>- Badge màu xanh |                 |           |
| TC149 | Lọc       | Lọc theo trạng thái "Đang xử lý"    | Filter Status: "Pending"               | - Chỉ hiển thị jobs có status "Pending"<br>- Badge màu vàng   |                 |           |
| TC150 | Lọc       | Lọc theo trạng thái "Thất bại"      | Filter Status: "Failed"                | - Chỉ hiển thị jobs có status "Failed"<br>- Badge màu đỏ      |                 |           |
| TC151 | Lọc       | Lọc "Tất cả trạng thái"             | Filter Status: "All"                   | - Hiển thị tất cả jobs<br>- Không filter theo status          |                 |           |
| TC152 | Lọc       | Lọc theo ngày (hôm nay)             | Date Range: "Hôm nay"                  | - Chỉ hiển thị jobs hôm nay                                   |                 |           |
| TC153 | Lọc       | Lọc theo ngày (7 ngày qua)          | Date Range: "7 ngày qua"               | - Chỉ hiển thị jobs trong 7 ngày                              |                 |           |
| TC154 | Lọc       | Lọc theo ngày (30 ngày qua)         | Date Range: "30 ngày qua"              | - Chỉ hiển thị jobs trong 30 ngày                             |                 |           |
| TC155 | Lọc       | Lọc theo khoảng thời gian tùy chỉnh | From: `01/12/2024`<br>To: `15/12/2024` | - Chỉ hiển thị jobs từ 01/12 đến 15/12                        |                 |           |

### 7.3. Tìm kiếm lịch sử

| ID    | Chức năng | Trường hợp kiểm thử       | Dữ liệu đầu vào       | Kết quả mong đợi                                                        | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ------------------------- | --------------------- | ----------------------------------------------------------------------- | --------------- | --------- |
| TC156 | Tìm kiếm  | Tìm theo tên tài liệu     | Search: `bài tập`     | - Hiển thị jobs có document name chứa "bài tập"<br>- Highlight từ khóa  |                 |           |
| TC157 | Tìm kiếm  | Tìm theo tên máy in       | Search: `HP-H6`       | - Hiển thị jobs in trên máy HP-H6                                       |                 |           |
| TC158 | Tìm kiếm  | Tìm kiếm không có kết quả | Search: `notfound123` | - Hiển thị: "Không tìm thấy lịch sử nào"<br>- Gợi ý: "Thử từ khóa khác" |                 |           |

### 7.4. Hành động trên lịch sử

| ID    | Chức năng | Trường hợp kiểm thử       | Dữ liệu đầu vào                            | Kết quả mong đợi                                                                                             | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC159 | In lại    | In lại một tài liệu đã in | Click "In lại" trên job đã "Completed"     | - Chuyển đến trang cấu hình in<br>- Pre-fill: Document, Printer, Config từ lần trước<br>- Cho phép chỉnh sửa |                 |           |
| TC160 | In lại    | In lại tài liệu đã bị xóa | Click "In lại" trên job có document đã xóa | - Hiển thị lỗi: "Tài liệu không còn tồn tại"<br>- Không cho phép in lại                                      |                 |           |
| TC161 | Hủy job   | Hủy job đang "Pending"    | Click "Hủy" trên job "Pending"             | - Hiển thị dialog xác nhận<br>- Click "Xác nhận" → Job status = "Cancelled"<br>- Hoàn lại số trang đã trừ    |                 |           |
| TC162 | Hủy job   | Hủy job đã "Completed"    | Click "Hủy" trên job "Completed"           | - Không hiển thị nút "Hủy"<br>- Hoặc hiển thị: "Không thể hủy job đã hoàn thành"                             |                 |           |

### 7.5. Xuất báo cáo

| ID    | Chức năng  | Trường hợp kiểm thử   | Dữ liệu đầu vào                                       | Kết quả mong đợi                                                                                  | Kết quả thực tế | Pass/Fail |
| ----- | ---------- | --------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC163 | Xuất Excel | Xuất lịch sử ra Excel | Click "Xuất Excel"                                    | - Download file Excel<br>- Tên file: `LichSuIn_DDMMYYYY.xlsx`<br>- Chứa tất cả jobs đang hiển thị |                 |           |
| TC164 | Xuất Excel | Xuất Excel với filter | Filter: "Completed", 7 ngày qua<br>Click "Xuất Excel" | - Download file Excel<br>- Chỉ chứa jobs "Completed" trong 7 ngày                                 |                 |           |

---

## 8. SPSO - Đăng nhập

### 8.1. Đăng nhập cơ bản

| ID    | Chức năng | Trường hợp kiểm thử                    | Dữ liệu đầu vào                                                               | Kết quả mong đợi                                                         | Kết quả thực tế | Pass/Fail |
| ----- | --------- | -------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------- | --------- |
| TC165 | Đăng nhập | Đăng nhập SPSO thành công              | Email: `spso@hcmiu.edu.vn`<br>Password: `Spso@123`                            | - Chuyển hướng đến `/spso/dashboard`<br>- Token được lưu<br>- Role: SPSO |                 |           |
| TC166 | Đăng nhập | Đăng nhập SPSO với email không tồn tại | Email: `notexist@hcmiu.edu.vn`<br>Password: `Spso@123`                        | - Hiển thị lỗi: "Email hoặc mật khẩu không đúng"<br>- Không chuyển trang |                 |           |
| TC167 | Đăng nhập | Đăng nhập SPSO với password sai        | Email: `spso@hcmiu.edu.vn`<br>Password: `WrongPassword`                       | - Hiển thị lỗi: "Email hoặc mật khẩu không đúng"                         |                 |           |
| TC168 | Đăng nhập | Đăng nhập SPSO với email Student       | Email: `student@hcmiu.edu.vn`<br>Password: `Test@123`<br>Trang: `/spso-login` | - Hiển thị lỗi: "Trang này chỉ dành cho SPSO"<br>- Không đăng nhập       |                 |           |

### 8.2. Xác thực 2 lớp (SPSO)

| ID    | Chức năng    | Trường hợp kiểm thử                | Dữ liệu đầu vào                                                     | Kết quả mong đợi                                           | Kết quả thực tế | Pass/Fail |
| ----- | ------------ | ---------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- | --------------- | --------- |
| TC169 | Xác thực OTP | SPSO đăng nhập lần đầu yêu cầu OTP | Email: `spso@hcmiu.edu.vn`<br>Password: `Spso@123`<br>Thiết bị: Mới | - Hiển thị modal OTP<br>- Gửi OTP về email                 |                 |           |
| TC170 | Xác thực OTP | SPSO nhập OTP đúng                 | OTP: `123456` (đúng)                                                | - Đăng nhập thành công<br>- Chuyển đến `/spso/dashboard`   |                 |           |
| TC171 | Xác thực OTP | SPSO nhập OTP sai                  | OTP: `000000` (sai)                                                 | - Hiển thị lỗi: "Mã OTP không đúng"<br>- Cho phép nhập lại |                 |           |

### 8.3. Ghi nhớ đăng nhập (SPSO)

| ID    | Chức năng | Trường hợp kiểm thử                           | Dữ liệu đầu vào                                                        | Kết quả mong đợi                             | Kết quả thực tế | Pass/Fail |
| ----- | --------- | --------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------- | --------------- | --------- |
| TC172 | Ghi nhớ   | SPSO đăng nhập với "Ghi nhớ tôi"              | Email: `spso@hcmiu.edu.vn`<br>Password: `Spso@123`<br>Remember Me: ✓   | - Lưu deviceId<br>- Lần sau không cần OTP    |                 |           |
| TC173 | Ghi nhớ   | SPSO đăng nhập lần 2 trên thiết bị đã ghi nhớ | Email: `spso@hcmiu.edu.vn`<br>Password: `Spso@123`<br>DeviceId: Đã lưu | - Không yêu cầu OTP<br>- Đăng nhập trực tiếp |                 |           |

### 8.4. Bảo mật và phân quyền

| ID    | Chức năng  | Trường hợp kiểm thử                         | Dữ liệu đầu vào                              | Kết quả mong đợi                                                                | Kết quả thực tế | Pass/Fail |
| ----- | ---------- | ------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------- | --------------- | --------- |
| TC174 | Phân quyền | Student cố truy cập trang SPSO              | Role: Student<br>Truy cập: `/spso/dashboard` | - Redirect về `/student/dashboard`<br>- Hiển thị: "Bạn không có quyền truy cập" |                 |           |
| TC175 | Phân quyền | SPSO cố truy cập trang Student              | Role: SPSO<br>Truy cập: `/student/dashboard` | - Redirect về `/spso/dashboard`<br>- Hiển thị: "Bạn không có quyền truy cập"    |                 |           |
| TC176 | Session    | SPSO truy cập trang SPSO khi chưa đăng nhập | Chưa có token<br>Truy cập: `/spso/printers`  | - Redirect về `/spso-login`<br>- URL có query: `?redirect=/spso/printers`       |                 |           |

---

## 9. SPSO - Đăng xuất

| ID    | Chức năng | Trường hợp kiểm thử                   | Dữ liệu đầu vào                         | Kết quả mong đợi                                                          | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------- | --------------- | --------- |
| TC177 | Đăng xuất | SPSO đăng xuất thành công             | Click "Đăng xuất"                       | - Xóa token<br>- Redirect về `/spso-login`<br>- Thông báo: "Đã đăng xuất" |                 |           |
| TC178 | Đăng xuất | Truy cập trang SPSO sau khi đăng xuất | Đăng xuất<br>Truy cập: `/spso/printers` | - Redirect về `/spso-login`<br>- Không thể truy cập                       |                 |           |

---

## 10. SPSO - Quản lý máy in

### 10.1. Xem danh sách máy in

| ID    | Chức năng     | Trường hợp kiểm thử     | Dữ liệu đầu vào                | Kết quả mong đợi                                                                                                              | Kết quả thực tế | Pass/Fail |
| ----- | ------------- | ----------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC179 | Xem danh sách | Xem tất cả máy in       | Truy cập `/spso/printers`      | - Hiển thị danh sách tất cả máy in<br>- Thông tin: ID, Tên, Vị trí, Trạng thái, Khổ giấy, Hành động<br>- Có pagination        |                 |           |
| TC180 | Xem danh sách | Danh sách trống         | Chưa có máy in nào             | - Hiển thị: "Chưa có máy in nào"<br>- Hiển thị nút "+ Thêm máy in"                                                            |                 |           |
| TC181 | Xem danh sách | Xem chi tiết một máy in | Click "Xem" hoặc click vào row | - Hiển thị modal chi tiết<br>- Thông tin đầy đủ: Tên, Hãng, Model, Vị trí, IP, Khổ giấy, Màu, 2 mặt, Trạng thái, Ngày bảo trì |                 |           |

### 10.2. Thêm máy in

| ID    | Chức năng   | Trường hợp kiểm thử                     | Dữ liệu đầu vào                                                                                                                                                    | Kết quả mong đợi                                                                                               | Kết quả thực tế | Pass/Fail |
| ----- | ----------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC182 | Thêm máy in | Thêm máy in mới thành công              | Tên: `HP LaserJet Pro M404`<br>Hãng: `HP`<br>Model: `LaserJet Pro M404`<br>Cơ sở: `Dĩ An`<br>Tòa: `H6`<br>Phòng: `101`<br>Khổ giấy: `A4, A3`<br>Màu: ✓<br>2 mặt: ✓ | - API POST /printers thành công<br>- Máy in xuất hiện trong danh sách<br>- Thông báo: "Thêm máy in thành công" |                 |           |
| TC183 | Thêm máy in | Thêm máy in với tên để trống            | Tên: `` (trống)<br>Các field khác: Hợp lệ                                                                                                                          | - Hiển thị lỗi: "Tên máy in không được để trống"<br>- Không cho phép submit                                    |                 |           |
| TC184 | Thêm máy in | Thêm máy in với tên trùng               | Tên: `HP-H6-101` (đã tồn tại)<br>Các field khác: Hợp lệ                                                                                                            | - Hiển thị lỗi: "Tên máy in đã tồn tại"<br>- Không thêm được                                                   |                 |           |
| TC185 | Thêm máy in | Thêm máy in không chọn hãng             | Hãng: Không chọn<br>Các field khác: Hợp lệ                                                                                                                         | - Hiển thị lỗi: "Vui lòng chọn hãng"<br>- Không cho phép submit                                                |                 |           |
| TC186 | Thêm máy in | Thêm máy in không chọn model            | Model: Không chọn<br>Các field khác: Hợp lệ                                                                                                                        | - Hiển thị lỗi: "Vui lòng chọn model"<br>- Không cho phép submit                                               |                 |           |
| TC187 | Thêm máy in | Thêm máy in không chọn vị trí           | Cơ sở/Tòa/Phòng: Không chọn                                                                                                                                        | - Hiển thị lỗi: "Vui lòng chọn vị trí đầy đủ"<br>- Không cho phép submit                                       |                 |           |
| TC188 | Thêm máy in | Thêm máy in không chọn khổ giấy         | Khổ giấy: Không chọn                                                                                                                                               | - Hiển thị lỗi: "Vui lòng chọn ít nhất một khổ giấy"<br>- Không cho phép submit                                |                 |           |
| TC189 | Thêm máy in | Thêm máy in với IP address hợp lệ       | IP: `192.168.1.100`                                                                                                                                                | - Thêm thành công<br>- IP được lưu                                                                             |                 |           |
| TC190 | Thêm máy in | Thêm máy in với IP address không hợp lệ | IP: `999.999.999.999`                                                                                                                                              | - Hiển thị lỗi: "IP address không hợp lệ"<br>- Không cho phép submit                                           |                 |           |
| TC191 | Thêm máy in | Thêm máy in với IP để trống             | IP: `` (trống)                                                                                                                                                     | - Thêm thành công<br>- IP = null (optional field)                                                              |                 |           |
| TC192 | Thêm máy in | Hủy thêm máy in                         | Click "Hủy" trên modal                                                                                                                                             | - Đóng modal<br>- Không thêm máy in<br>- Không có thay đổi                                                     |                 |           |

### 10.3. Sửa máy in

| ID    | Chức năng  | Trường hợp kiểm thử                 | Dữ liệu đầu vào                                                      | Kết quả mong đợi                                                                                       | Kết quả thực tế | Pass/Fail |
| ----- | ---------- | ----------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC193 | Sửa máy in | Sửa thông tin máy in thành công     | Tên: `HP-H6-101` → `HP-H6-101-Updated`<br>Các field khác: Giữ nguyên | - API PUT /printers/{id} thành công<br>- Thông tin được cập nhật<br>- Thông báo: "Cập nhật thành công" |                 |           |
| TC194 | Sửa máy in | Sửa tên máy in thành tên đã tồn tại | Tên: `HP-H6-101` → `HP-H6-102` (đã tồn tại)                          | - Hiển thị lỗi: "Tên máy in đã tồn tại"<br>- Không cập nhật                                            |                 |           |
| TC195 | Sửa máy in | Sửa vị trí máy in                   | Phòng: `101` → `102`                                                 | - Cập nhật thành công<br>- Vị trí mới được hiển thị                                                    |                 |           |
| TC196 | Sửa máy in | Sửa khổ giấy (thêm A3)              | Khổ giấy: `A4` → `A4, A3`                                            | - Cập nhật thành công<br>- Máy in hỗ trợ cả A4 và A3                                                   |                 |           |
| TC197 | Sửa máy in | Sửa trạng thái máy in               | Status: `Active` → `Maintenance`                                     | - Cập nhật thành công<br>- Trạng thái hiển thị "Maintenance"                                           |                 |           |
| TC198 | Sửa máy in | Sửa ngày bảo trì                    | Last Maintenance: `01/12/2024` → `15/12/2024`                        | - Cập nhật thành công<br>- Ngày mới được lưu                                                           |                 |           |
| TC199 | Sửa máy in | Hủy sửa máy in                      | Click "Hủy" trên modal                                               | - Đóng modal<br>- Không cập nhật<br>- Giữ nguyên thông tin cũ                                          |                 |           |

### 10.4. Xóa máy in

| ID    | Chức năng  | Trường hợp kiểm thử           | Dữ liệu đầu vào                         | Kết quả mong đợi                                                                                                                                | Kết quả thực tế | Pass/Fail |
| ----- | ---------- | ----------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC200 | Xóa máy in | Xóa máy in không có print job | Máy in: `HP-H6-101` (chưa có job nào)   | - Hiển thị dialog xác nhận<br>- Click "Xác nhận" → API DELETE /printers/{id}<br>- Máy in bị xóa khỏi danh sách<br>- Thông báo: "Xóa thành công" |                 |           |
| TC201 | Xóa máy in | Xóa máy in đang có print job  | Máy in: `HP-H6-101` (có jobs "Pending") | - Hiển thị cảnh báo: "Máy in đang có lệnh in. Bạn có chắc muốn xóa?"<br>- Click "Xác nhận" → Xóa (hoặc không cho xóa)                           |                 |           |
| TC202 | Xóa máy in | Hủy xóa máy in                | Click "Xóa" → Click "Hủy"               | - Đóng dialog<br>- Máy in vẫn còn                                                                                                               |                 |           |
| TC203 | Xóa máy in | Xóa nhiều máy in cùng lúc     | Chọn 3 máy in → Click "Xóa đã chọn"     | - Hiển thị dialog: "Xóa 3 máy in?"<br>- Click "Xác nhận" → Tất cả bị xóa                                                                        |                 |           |

### 10.5. Bật/Tắt máy in

| ID    | Chức năng | Trường hợp kiểm thử              | Dữ liệu đầu vào                                   | Kết quả mong đợi                                                                                                        | Kết quả thực tế | Pass/Fail |
| ----- | --------- | -------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC204 | Toggle    | Tắt máy in đang bật              | Status: `Active` → Toggle OFF                     | - API PATCH /printers/{id}/toggle<br>- Status: `Active` → `Inactive`<br>- Badge đổi màu<br>- Thông báo: "Đã tắt máy in" |                 |           |
| TC205 | Toggle    | Bật máy in đang tắt              | Status: `Inactive` → Toggle ON                    | - API PATCH /printers/{id}/toggle<br>- Status: `Inactive` → `Active`<br>- Badge đổi màu<br>- Thông báo: "Đã bật máy in" |                 |           |
| TC206 | Toggle    | Tắt máy in đang có job "Pending" | Status: `Active`, có jobs "Pending"<br>Toggle OFF | - Hiển thị cảnh báo: "Máy in đang có lệnh in. Bạn có chắc muốn tắt?"<br>- Click "Xác nhận" → Tắt máy                    |                 |           |
| TC207 | Toggle    | Bật/Tắt nhiều máy in cùng lúc    | Chọn 3 máy in → Click "Toggle đã chọn"            | - Tất cả máy in được toggle<br>- Active → Inactive hoặc ngược lại                                                       |                 |           |

### 10.6. Lọc và tìm kiếm máy in

| ID    | Chức năng | Trường hợp kiểm thử               | Dữ liệu đầu vào              | Kết quả mong đợi                       | Kết quả thực tế | Pass/Fail |
| ----- | --------- | --------------------------------- | ---------------------------- | -------------------------------------- | --------------- | --------- |
| TC208 | Lọc       | Lọc theo cơ sở "Dĩ An"            | Filter Campus: "Dĩ An"       | - Chỉ hiển thị máy in ở Dĩ An          |                 |           |
| TC209 | Lọc       | Lọc theo trạng thái "Active"      | Filter Status: "Active"      | - Chỉ hiển thị máy in "Active"         |                 |           |
| TC210 | Lọc       | Lọc theo trạng thái "Inactive"    | Filter Status: "Inactive"    | - Chỉ hiển thị máy in "Inactive"       |                 |           |
| TC211 | Lọc       | Lọc theo trạng thái "Maintenance" | Filter Status: "Maintenance" | - Chỉ hiển thị máy in "Maintenance"    |                 |           |
| TC212 | Tìm kiếm  | Tìm theo tên máy in               | Search: `HP`                 | - Hiển thị các máy in có tên chứa "HP" |                 |           |
| TC213 | Tìm kiếm  | Tìm theo vị trí                   | Search: `H6-101`             | - Hiển thị máy in ở H6-101             |                 |           |

### 10.7. Quản lý giấy/mực (Printer Supplies)

| ID    | Chức năng    | Trường hợp kiểm thử                 | Dữ liệu đầu vào                                | Kết quả mong đợi                                                                                 | Kết quả thực tế | Pass/Fail |
| ----- | ------------ | ----------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC214 | Xem supplies | Xem thông tin giấy/mực của máy in   | Click "Xem giấy/mực" trên máy in               | - Hiển thị modal<br>- Thông tin: A4 paper, A3 paper, Toner (Black, Cyan, Magenta, Yellow)        |                 |           |
| TC215 | Nạp giấy     | Nạp giấy A4                         | A4 Paper: +500 tờ                              | - API POST /printers/{id}/refill<br>- Số lượng A4 tăng 500<br>- Thông báo: "Nạp giấy thành công" |                 |           |
| TC216 | Nạp giấy     | Nạp giấy A3                         | A3 Paper: +200 tờ                              | - Số lượng A3 tăng 200<br>- Thông báo: "Nạp giấy thành công"                                     |                 |           |
| TC217 | Nạp mực      | Nạp mực đen                         | Toner Black: +100%                             | - Toner Black = 100%<br>- Thông báo: "Nạp mực thành công"                                        |                 |           |
| TC218 | Nạp mực      | Nạp mực màu (Cyan, Magenta, Yellow) | Cyan: +100%<br>Magenta: +100%<br>Yellow: +100% | - Tất cả toner màu = 100%<br>- Thông báo: "Nạp mực thành công"                                   |                 |           |
| TC219 | Nạp supplies | Nạp giá trị âm                      | A4 Paper: -100                                 | - Hiển thị lỗi: "Giá trị phải >= 0"<br>- Không cho phép submit                                   |                 |           |
| TC220 | Nạp supplies | Nạp giá trị quá lớn                 | A4 Paper: +999999                              | - Hiển thị cảnh báo: "Giá trị quá lớn"<br>- Hoặc cho phép nạp (tùy business logic)               |                 |           |

---

## 11. SPSO - Quản lý vị trí máy in

### 11.1. Quản lý Cơ sở (Campus)

| ID    | Chức năng  | Trường hợp kiểm thử         | Dữ liệu đầu vào                                                               | Kết quả mong đợi                                                                                                | Kết quả thực tế | Pass/Fail |
| ----- | ---------- | --------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC221 | Xem cơ sở  | Xem danh sách cơ sở         | Truy cập `/spso/locations` → Tab "Cơ sở"                                      | - Hiển thị danh sách cơ sở<br>- Thông tin: Mã, Tên, Địa chỉ, Trạng thái                                         |                 |           |
| TC222 | Thêm cơ sở | Thêm cơ sở mới thành công   | Mã: `CS3`<br>Tên: `Cơ sở 3`<br>Địa chỉ: `123 Đường ABC`<br>Trạng thái: Active | - API POST /locations/campuses<br>- Cơ sở mới xuất hiện trong danh sách<br>- Thông báo: "Thêm cơ sở thành công" |                 |           |
| TC223 | Thêm cơ sở | Thêm cơ sở với mã trùng     | Mã: `DA` (đã tồn tại)<br>Tên: `Cơ sở mới`                                     | - Hiển thị lỗi: "Mã cơ sở đã tồn tại"<br>- Không thêm được                                                      |                 |           |
| TC224 | Thêm cơ sở | Thêm cơ sở với tên để trống | Mã: `CS3`<br>Tên: `` (trống)                                                  | - Hiển thị lỗi: "Tên cơ sở không được để trống"<br>- Không cho phép submit                                      |                 |           |
| TC225 | Sửa cơ sở  | Sửa thông tin cơ sở         | Tên: `Dĩ An` → `Dĩ An Campus`<br>Địa chỉ: Cập nhật                            | - API PUT /locations/campuses/{id}<br>- Thông tin được cập nhật<br>- Thông báo: "Cập nhật thành công"           |                 |           |
| TC226 | Xóa cơ sở  | Xóa cơ sở không có tòa nhà  | Cơ sở: `CS3` (chưa có building)                                               | - API DELETE /locations/campuses/{id}<br>- Cơ sở bị xóa<br>- Thông báo: "Xóa thành công"                        |                 |           |
| TC227 | Xóa cơ sở  | Xóa cơ sở đang có tòa nhà   | Cơ sở: `Dĩ An` (có buildings H1, H2, H3, H6)                                  | - Hiển thị lỗi: "Không thể xóa cơ sở đang có tòa nhà"<br>- Không cho phép xóa                                   |                 |           |

### 11.2. Quản lý Tòa nhà (Building)

| ID    | Chức năng    | Trường hợp kiểm thử           | Dữ liệu đầu vào                                           | Kết quả mong đợi                                                                                     | Kết quả thực tế | Pass/Fail |
| ----- | ------------ | ----------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC228 | Xem tòa nhà  | Xem danh sách tòa nhà         | Tab "Tòa nhà"                                             | - Hiển thị danh sách tòa nhà<br>- Thông tin: Mã, Tên, Cơ sở, Số tầng, Trạng thái                     |                 |           |
| TC229 | Thêm tòa nhà | Thêm tòa nhà mới thành công   | Cơ sở: `Dĩ An`<br>Mã: `H7`<br>Tên: `Tòa H7`<br>Số tầng: 5 | - API POST /locations/buildings<br>- Tòa nhà mới xuất hiện<br>- Thông báo: "Thêm tòa nhà thành công" |                 |           |
| TC230 | Thêm tòa nhà | Thêm tòa nhà với mã trùng     | Mã: `H6` (đã tồn tại)<br>Cơ sở: `Dĩ An`                   | - Hiển thị lỗi: "Mã tòa nhà đã tồn tại trong cơ sở này"<br>- Không thêm được                         |                 |           |
| TC231 | Thêm tòa nhà | Thêm tòa nhà không chọn cơ sở | Cơ sở: Không chọn<br>Mã: `H7`                             | - Hiển thị lỗi: "Vui lòng chọn cơ sở"<br>- Không cho phép submit                                     |                 |           |
| TC232 | Sửa tòa nhà  | Sửa thông tin tòa nhà         | Tên: `H6` → `Tòa H6 - Mới`<br>Số tầng: 4 → 5              | - API PUT /locations/buildings/{id}<br>- Thông tin được cập nhật                                     |                 |           |
| TC233 | Xóa tòa nhà  | Xóa tòa nhà không có phòng    | Tòa: `H7` (chưa có rooms)                                 | - API DELETE /locations/buildings/{id}<br>- Tòa nhà bị xóa                                           |                 |           |
| TC234 | Xóa tòa nhà  | Xóa tòa nhà đang có phòng     | Tòa: `H6` (có rooms 101, 102, 103)                        | - Hiển thị lỗi: "Không thể xóa tòa nhà đang có phòng"<br>- Không cho phép xóa                        |                 |           |

### 11.3. Quản lý Phòng (Room)

| ID    | Chức năng  | Trường hợp kiểm thử           | Dữ liệu đầu vào                                                                 | Kết quả mong đợi                                                                              | Kết quả thực tế | Pass/Fail |
| ----- | ---------- | ----------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC235 | Xem phòng  | Xem danh sách phòng           | Tab "Phòng"                                                                     | - Hiển thị danh sách phòng<br>- Thông tin: Số phòng, Tên, Tòa nhà, Loại, Sức chứa, Trạng thái |                 |           |
| TC236 | Thêm phòng | Thêm phòng mới thành công     | Tòa: `H6`<br>Số phòng: `104`<br>Tên: `Phòng 104`<br>Loại: `Lab`<br>Sức chứa: 40 | - API POST /locations/rooms<br>- Phòng mới xuất hiện<br>- Thông báo: "Thêm phòng thành công"  |                 |           |
| TC237 | Thêm phòng | Thêm phòng với số phòng trùng | Tòa: `H6`<br>Số phòng: `101` (đã tồn tại)                                       | - Hiển thị lỗi: "Số phòng đã tồn tại trong tòa nhà này"<br>- Không thêm được                  |                 |           |
| TC238 | Thêm phòng | Thêm phòng không chọn tòa nhà | Tòa: Không chọn<br>Số phòng: `104`                                              | - Hiển thị lỗi: "Vui lòng chọn tòa nhà"<br>- Không cho phép submit                            |                 |           |
| TC239 | Sửa phòng  | Sửa thông tin phòng           | Tên: `Phòng 101` → `Lab 101`<br>Sức chứa: 30 → 40                               | - API PUT /locations/rooms/{id}<br>- Thông tin được cập nhật                                  |                 |           |
| TC240 | Xóa phòng  | Xóa phòng không có máy in     | Phòng: `104` (chưa có printers)                                                 | - API DELETE /locations/rooms/{id}<br>- Phòng bị xóa                                          |                 |           |
| TC241 | Xóa phòng  | Xóa phòng đang có máy in      | Phòng: `101` (có printers)                                                      | - Hiển thị lỗi: "Không thể xóa phòng đang có máy in"<br>- Không cho phép xóa                  |                 |           |

### 11.4. Cascade loading (Chọn cơ sở → Tòa → Phòng)

| ID    | Chức năng | Trường hợp kiểm thử           | Dữ liệu đầu vào                                         | Kết quả mong đợi                                                                     | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------- | --------- |
| TC242 | Cascade   | Chọn cơ sở "Dĩ An"            | Dropdown Campus: "Dĩ An"                                | - Dropdown Building load: H1, H2, H3, H6<br>- Dropdown Room bị disable               |                 |           |
| TC243 | Cascade   | Chọn tòa nhà "H6"             | Dropdown Building: "H6"                                 | - Dropdown Room load: 101, 102, 103<br>- Có thể chọn phòng                           |                 |           |
| TC244 | Cascade   | Đổi cơ sở sau khi đã chọn tòa | Chọn: Dĩ An → H6 → 101<br>Đổi Campus: Dĩ An → Thành phố | - Dropdown Building reset<br>- Dropdown Room reset<br>- Load buildings của Thành phố |                 |           |

---

## 12. SPSO - Cài đặt hệ thống & Quản lý học kỳ

### 12.1. Xem cài đặt hệ thống

| ID    | Chức năng   | Trường hợp kiểm thử         | Dữ liệu đầu vào            | Kết quả mong đợi                                                                                                                                                         | Kết quả thực tế | Pass/Fail |
| ----- | ----------- | --------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC245 | Xem cài đặt | Xem tất cả cài đặt hệ thống | Truy cập `/spso/settings`  | - Hiển thị các config:<br> • Số trang A4 mặc định<br> • Số trang A3 mặc định<br> • Loại file cho phép<br> • Kích thước file tối đa<br> • Giá trang A4<br> • Giá trang A3 |                 |           |
| TC246 | Xem cài đặt | Xem danh sách học kỳ        | Tab "Học kỳ"               | - Hiển thị danh sách học kỳ<br>- Thông tin: Mã, Tên, Năm học, Ngày bắt đầu, Ngày kết thúc, Số trang mặc định, Trạng thái                                                 |                 |           |
| TC247 | Xem cài đặt | Xem học kỳ hiện tại         | Học kỳ có isCurrent = true | - Học kỳ hiện tại được highlight<br>- Badge "Hiện tại"                                                                                                                   |                 |           |

### 12.2. Cập nhật cài đặt hệ thống

| ID    | Chức năng       | Trường hợp kiểm thử             | Dữ liệu đầu vào                                | Kết quả mong đợi                                                                                         | Kết quả thực tế | Pass/Fail |
| ----- | --------------- | ------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC248 | Cập nhật config | Cập nhật số trang A4 mặc định   | Default A4 Pages: 50 → 100                     | - API PUT /spso/settings/config<br>- Config được cập nhật<br>- Thông báo: "Cập nhật thành công"          |                 |           |
| TC249 | Cập nhật config | Cập nhật số trang A3 mặc định   | Default A3 Pages: 10 → 20                      | - Config được cập nhật                                                                                   |                 |           |
| TC250 | Cập nhật config | Cập nhật giá trang A4           | A4 Price: 500 → 600 VND                        | - Config được cập nhật<br>- Giá mới áp dụng cho giao dịch sau                                            |                 |           |
| TC251 | Cập nhật config | Cập nhật giá trang A3           | A3 Price: 1000 → 1200 VND                      | - Config được cập nhật                                                                                   |                 |           |
| TC252 | Cập nhật config | Cập nhật kích thước file tối đa | Max File Size: 50MB → 100MB                    | - Config được cập nhật<br>- Upload file có thể lên đến 100MB                                             |                 |           |
| TC253 | Cập nhật config | Cập nhật loại file cho phép     | Allowed Types: PDF, DOCX, PPTX → Thêm XLSX     | - Config được cập nhật<br>- Cho phép upload XLSX                                                         |                 |           |
| TC254 | Cập nhật config | Cập nhật giá trị không hợp lệ   | Default A4 Pages: -10 (âm)                     | - Hiển thị lỗi: "Giá trị phải >= 0"<br>- Không cho phép submit                                           |                 |           |
| TC255 | Cập nhật config | Cập nhật nhiều config cùng lúc  | A4 Pages: 100<br>A3 Pages: 20<br>A4 Price: 600 | - API PUT /spso/settings/configs<br>- Tất cả configs được cập nhật<br>- Thông báo: "Cập nhật thành công" |                 |           |

### 12.3. Quản lý học kỳ

| ID    | Chức năng           | Trường hợp kiểm thử               | Dữ liệu đầu vào                                                                                                                                | Kết quả mong đợi                                                                                                                                                     | Kết quả thực tế | Pass/Fail |
| ----- | ------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC256 | Thêm học kỳ         | Thêm học kỳ mới thành công        | Mã: `HK1-2024-2025`<br>Tên: `Học kỳ 1`<br>Năm học: `2024-2025`<br>Ngày bắt đầu: `01/09/2024`<br>Ngày kết thúc: `31/12/2024`<br>Số trang A4: 50 | - API POST /spso/settings/semesters<br>- Học kỳ mới xuất hiện<br>- Thông báo: "Thêm học kỳ thành công"                                                               |                 |           |
| TC257 | Thêm học kỳ         | Thêm học kỳ với mã trùng          | Mã: `HK1-2024-2025` (đã tồn tại)                                                                                                               | - Hiển thị lỗi: "Mã học kỳ đã tồn tại"<br>- Không thêm được                                                                                                          |                 |           |
| TC258 | Thêm học kỳ         | Thêm học kỳ với ngày không hợp lệ | Ngày bắt đầu: `31/12/2024`<br>Ngày kết thúc: `01/09/2024` (trước ngày bắt đầu)                                                                 | - Hiển thị lỗi: "Ngày kết thúc phải sau ngày bắt đầu"<br>- Không cho phép submit                                                                                     |                 |           |
| TC259 | Sửa học kỳ          | Sửa thông tin học kỳ              | Tên: `Học kỳ 1` → `Học kỳ 1 (2024-2025)`<br>Số trang A4: 50 → 60                                                                               | - API PUT /spso/settings/semesters<br>- Thông tin được cập nhật                                                                                                      |                 |           |
| TC260 | Đặt học kỳ hiện tại | Đặt học kỳ làm hiện tại           | Click "Đặt làm hiện tại" trên học kỳ mới                                                                                                       | - API PUT /spso/settings/semesters/{id}/set-current<br>- Học kỳ cũ: isCurrent = false<br>- Học kỳ mới: isCurrent = true<br>- Badge "Hiện tại" chuyển sang học kỳ mới |                 |           |
| TC261 | Xóa học kỳ          | Xóa học kỳ không phải hiện tại    | Học kỳ: `HK1-2023-2024` (cũ, không phải current)                                                                                               | - API DELETE /spso/settings/semesters/{id}<br>- Học kỳ bị xóa                                                                                                        |                 |           |
| TC262 | Xóa học kỳ          | Xóa học kỳ hiện tại               | Học kỳ: `HK1-2024-2025` (isCurrent = true)                                                                                                     | - Hiển thị lỗi: "Không thể xóa học kỳ hiện tại"<br>- Không cho phép xóa                                                                                              |                 |           |

### 12.4. Cấp phát trang tự động

| ID    | Chức năng         | Trường hợp kiểm thử          | Dữ liệu đầu vào                                   | Kết quả mong đợi                                                                                                                      | Kết quả thực tế | Pass/Fail |
| ----- | ----------------- | ---------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC263 | Cấp phát tự động  | Cấp phát trang đầu học kỳ    | Học kỳ mới bắt đầu<br>Ngày cấp phát: `01/09/2024` | - Hệ thống tự động cấp trang cho tất cả sinh viên<br>- Mỗi sinh viên nhận: 50 trang A4, 10 trang A3 (theo config)                     |                 |           |
| TC264 | Cấp phát thủ công | SPSO cấp phát trang thủ công | Click "Cấp phát trang" cho học kỳ                 | - Hiển thị dialog xác nhận<br>- Click "Xác nhận" → Cấp trang cho tất cả sinh viên<br>- Thông báo: "Đã cấp phát trang cho X sinh viên" |                 |           |

---

## 13. SPSO - Báo cáo

### 13.1. Báo cáo theo tháng

| ID    | Chức năng         | Trường hợp kiểm thử                | Dữ liệu đầu vào                                                     | Kết quả mong đợi                                                                                                                                                                                                                            | Kết quả thực tế | Pass/Fail |
| ----- | ----------------- | ---------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC265 | Xem báo cáo tháng | Xem báo cáo tháng hiện tại         | Truy cập `/spso/reports`<br>Loại: "Tháng"<br>Năm: 2024<br>Tháng: 12 | - API GET /reports/monthly?year=2024&month=12<br>- Hiển thị thống kê:<br> • Tổng lệnh in<br> • Tổng trang in<br> • Doanh thu<br> • Sinh viên hoạt động<br> • Phân bổ A4/A3<br> • Top 5 sinh viên<br> • Top 3 máy in<br> • Biểu đồ theo ngày |                 |           |
| TC266 | Xem báo cáo tháng | Xem báo cáo tháng trước            | Năm: 2024<br>Tháng: 11                                              | - Load báo cáo tháng 11/2024<br>- Hiển thị đầy đủ thống kê                                                                                                                                                                                  |                 |           |
| TC267 | Xem báo cáo tháng | Xem báo cáo tháng không có dữ liệu | Năm: 2025<br>Tháng: 1 (chưa có data)                                | - Hiển thị: "Chưa có dữ liệu cho tháng này"<br>- Tất cả số liệu = 0                                                                                                                                                                         |                 |           |
| TC268 | Xem báo cáo tháng | Thay đổi tháng tự động load        | Đang xem tháng 12<br>Chọn tháng: 11                                 | - Tự động gọi API mới<br>- Load báo cáo tháng 11<br>- Không cần click "Tạo báo cáo"                                                                                                                                                         |                 |           |
| TC269 | Xem báo cáo tháng | Thay đổi năm tự động load          | Đang xem 2024<br>Chọn năm: 2023                                     | - Tự động gọi API mới<br>- Load báo cáo năm 2023                                                                                                                                                                                            |                 |           |

### 13.2. Báo cáo theo năm

| ID    | Chức năng       | Trường hợp kiểm thử              | Dữ liệu đầu vào                 | Kết quả mong đợi                                                                                                                                                                                                                                                                                    | Kết quả thực tế | Pass/Fail |
| ----- | --------------- | -------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC270 | Xem báo cáo năm | Xem báo cáo năm hiện tại         | Loại: "Năm"<br>Năm: 2024        | - API GET /reports/yearly?year=2024<br>- Hiển thị thống kê:<br> • Tổng lệnh in<br> • Tổng trang in<br> • Doanh thu<br> • Sinh viên hoạt động<br> • Doanh thu TB/sinh viên<br> • Tháng hoạt động nhiều nhất<br> • Phân bổ A4/A3<br> • Top 5 sinh viên<br> • Top 3 máy in<br> • Biểu đồ theo 12 tháng |                 |           |
| TC271 | Xem báo cáo năm | Xem báo cáo năm trước            | Năm: 2023                       | - Load báo cáo năm 2023<br>- Hiển thị đầy đủ thống kê                                                                                                                                                                                                                                               |                 |           |
| TC272 | Xem báo cáo năm | Xem báo cáo năm không có dữ liệu | Năm: 2025 (chưa có data)        | - Hiển thị: "Chưa có dữ liệu cho năm này"<br>- Tất cả số liệu = 0                                                                                                                                                                                                                                   |                 |           |
| TC273 | Xem báo cáo năm | Thay đổi năm tự động load        | Đang xem 2024<br>Chọn năm: 2023 | - Tự động gọi API mới<br>- Load báo cáo năm 2023                                                                                                                                                                                                                                                    |                 |           |

### 13.3. Thống kê tổng quan

| ID    | Chức năng | Trường hợp kiểm thử          | Dữ liệu đầu vào                                        | Kết quả mong đợi                                                                                   | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ---------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC274 | Thống kê  | Hiển thị tổng lệnh in        | Báo cáo tháng 12/2024                                  | - Card "Tổng lệnh in": 150 jobs<br>- Icon: 📄<br>- Màu: Blue                                       |                 |           |
| TC275 | Thống kê  | Hiển thị tổng trang in       | Báo cáo tháng 12/2024                                  | - Card "Tổng trang in": 3,500 trang<br>- Icon: 📃<br>- Màu: Purple                                 |                 |           |
| TC276 | Thống kê  | Hiển thị doanh thu           | Báo cáo tháng 12/2024                                  | - Card "Doanh thu": 1,750,000 VND<br>- Icon: 💰<br>- Màu: Green<br>- Format: Có dấu phẩy ngăn cách |                 |           |
| TC277 | Thống kê  | Hiển thị sinh viên hoạt động | Báo cáo tháng 12/2024                                  | - Card "Sinh viên hoạt động": 85 sinh viên<br>- Icon: 👥<br>- Màu: Indigo                          |                 |           |
| TC278 | Thống kê  | Hiển thị tỷ lệ thành công    | Báo cáo tháng 12/2024<br>Successful: 140<br>Failed: 10 | - Tỷ lệ thành công: 93.3%<br>- Hiển thị progress bar hoặc badge                                    |                 |           |

### 13.4. Phân bổ khổ giấy

| ID    | Chức năng | Trường hợp kiểm thử    | Dữ liệu đầu vào                              | Kết quả mong đợi                                                                                  | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC279 | Phân bổ   | Hiển thị phân bổ A4/A3 | A4: 2,800 trang (80%)<br>A3: 700 trang (20%) | - Progress bar A4: 80% (màu xanh)<br>- Progress bar A3: 20% (màu cam)<br>- Hiển thị số lượng và % |                 |           |
| TC280 | Phân bổ   | Phân bổ 100% A4        | A4: 3,500 trang<br>A3: 0 trang               | - Progress bar A4: 100%<br>- Progress bar A3: 0% (ẩn hoặc hiển thị 0%)                            |                 |           |
| TC281 | Phân bổ   | Phân bổ 100% A3        | A4: 0 trang<br>A3: 3,500 trang               | - Progress bar A4: 0%<br>- Progress bar A3: 100%                                                  |                 |           |

### 13.5. Top performers

| ID    | Chức năng     | Trường hợp kiểm thử      | Dữ liệu đầu vào              | Kết quả mong đợi                                                                                                         | Kết quả thực tế | Pass/Fail |
| ----- | ------------- | ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC282 | Top sinh viên | Hiển thị Top 5 sinh viên | Báo cáo tháng 12/2024        | - Danh sách 5 sinh viên in nhiều nhất<br>- Thông tin: Rank, Tên, Email, Số trang, Số jobs<br>- Rank 1-3 có medal: 🥇🥈🥉 |                 |           |
| TC283 | Top sinh viên | Ít hơn 5 sinh viên       | Chỉ có 3 sinh viên hoạt động | - Hiển thị 3 sinh viên<br>- Không hiển thị row trống                                                                     |                 |           |
| TC284 | Top máy in    | Hiển thị Top 3 máy in    | Báo cáo tháng 12/2024        | - Danh sách 3 máy in bận nhất<br>- Thông tin: Rank, Tên, Vị trí, Số jobs, Số trang<br>- Rank 1-3 có medal: 🥇🥈🥉        |                 |           |
| TC285 | Top máy in    | Ít hơn 3 máy in          | Chỉ có 2 máy in hoạt động    | - Hiển thị 2 máy in<br>- Không hiển thị row trống                                                                        |                 |           |

### 13.6. Biểu đồ thống kê

| ID    | Chức năng     | Trường hợp kiểm thử                    | Dữ liệu đầu vào             | Kết quả mong đợi                                                                                                         | Kết quả thực tế | Pass/Fail |
| ----- | ------------- | -------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------- | --------- |
| TC286 | Biểu đồ tháng | Hiển thị biểu đồ theo ngày (31 ngày)   | Báo cáo tháng 12/2024       | - Bar chart với 31 cột (ngày 1-31)<br>- Mỗi cột: Số jobs, Số trang, Doanh thu<br>- Tooltip khi hover: Chi tiết ngày đó   |                 |           |
| TC287 | Biểu đồ tháng | Tháng có 30 ngày                       | Báo cáo tháng 11/2024       | - Bar chart với 30 cột (ngày 1-30)                                                                                       |                 |           |
| TC288 | Biểu đồ tháng | Tháng có 28 ngày (tháng 2)             | Báo cáo tháng 2/2024        | - Bar chart với 28 hoặc 29 cột                                                                                           |                 |           |
| TC289 | Biểu đồ năm   | Hiển thị biểu đồ theo tháng (12 tháng) | Báo cáo năm 2024            | - Bar chart với 12 cột (tháng 1-12)<br>- Mỗi cột: Số jobs, Số trang, Doanh thu<br>- Tooltip khi hover: Chi tiết tháng đó |                 |           |
| TC290 | Biểu đồ       | Không có dữ liệu                       | Báo cáo tháng không có jobs | - Hiển thị: "Chưa có dữ liệu"<br>- Biểu đồ trống hoặc tất cả cột = 0                                                     |                 |           |

### 13.7. Xuất báo cáo PDF

| ID    | Chức năng      | Trường hợp kiểm thử       | Dữ liệu đầu vào                           | Kết quả mong đợi                                                                                                                                                                                                                                               | Kết quả thực tế | Pass/Fail |
| ----- | -------------- | ------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC291 | Xuất PDF tháng | Xuất báo cáo tháng ra PDF | Báo cáo tháng 12/2024<br>Click "Xuất PDF" | - API GET /reports/monthly/export/pdf?year=2024&month=12<br>- Download file: `BaoCaoThang_12_2024.pdf`<br>- File chứa:<br> • Header với logo<br> • Thống kê tổng quan<br> • Bảng phân bổ A4/A3<br> • Bảng Top 5 sinh viên<br> • Bảng Top 3 máy in<br> • Footer |                 |           |
| TC292 | Xuất PDF năm   | Xuất báo cáo năm ra PDF   | Báo cáo năm 2024<br>Click "Xuất PDF"      | - API GET /reports/yearly/export/pdf?year=2024<br>- Download file: `BaoCaoNam_2024.pdf`<br>- File chứa:<br> • Header<br> • Thống kê tổng quan<br> • Tháng hoạt động nhiều nhất<br> • Bảng Top performers<br> • Footer                                          |                 |           |
| TC293 | Xuất PDF       | PDF có định dạng đẹp      | Xuất PDF bất kỳ                           | - Font chữ rõ ràng<br>- Bảng có border<br>- Màu sắc phù hợp<br>- Logo hiển thị đúng                                                                                                                                                                            |                 |           |
| TC294 | Xuất PDF       | PDF có tiếng Việt         | Xuất PDF có tên sinh viên tiếng Việt      | - Tiếng Việt hiển thị đúng<br>- Không bị lỗi encoding                                                                                                                                                                                                          |                 |           |

### 13.8. Xuất báo cáo Excel

| ID    | Chức năng        | Trường hợp kiểm thử                | Dữ liệu đầu vào                             | Kết quả mong đợi                                                                                                                                                                                                             | Kết quả thực tế | Pass/Fail |
| ----- | ---------------- | ---------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC295 | Xuất Excel tháng | Xuất báo cáo tháng ra Excel        | Báo cáo tháng 12/2024<br>Click "Xuất Excel" | - API GET /reports/monthly/export/excel?year=2024&month=12<br>- Download file: `BaoCaoThang_12_2024.xlsx`<br>- File có 4 sheets:<br> 1. Tổng quan<br> 2. Top sinh viên<br> 3. Top máy in<br> 4. Thống kê theo ngày (31 rows) |                 |           |
| TC296 | Xuất Excel năm   | Xuất báo cáo năm ra Excel          | Báo cáo năm 2024<br>Click "Xuất Excel"      | - API GET /reports/yearly/export/excel?year=2024<br>- Download file: `BaoCaoNam_2024.xlsx`<br>- File có 4 sheets:<br> 1. Tổng quan<br> 2. Top sinh viên<br> 3. Top máy in<br> 4. Thống kê theo tháng (12 rows)               |                 |           |
| TC297 | Xuất Excel       | Excel mở được bằng Microsoft Excel | Xuất Excel bất kỳ                           | - File mở được bằng Excel<br>- Không bị lỗi format<br>- Dữ liệu hiển thị đúng                                                                                                                                                |                 |           |
| TC298 | Xuất Excel       | Excel mở được bằng Google Sheets   | Xuất Excel bất kỳ                           | - File upload được lên Google Sheets<br>- Dữ liệu hiển thị đúng                                                                                                                                                              |                 |           |
| TC299 | Xuất Excel       | Excel có tiếng Việt                | Xuất Excel có tên sinh viên tiếng Việt      | - Tiếng Việt hiển thị đúng<br>- Không bị lỗi encoding                                                                                                                                                                        |                 |           |
| TC300 | Xuất Excel       | Excel có format đẹp                | Xuất Excel bất kỳ                           | - Header có màu nền<br>- Font chữ rõ ràng<br>- Số liệu có format (dấu phẩy, VND)                                                                                                                                             |                 |           |

### 13.9. Tạo báo cáo mới

| ID    | Chức năng   | Trường hợp kiểm thử    | Dữ liệu đầu vào                               | Kết quả mong đợi                                                                                                                                                     | Kết quả thực tế | Pass/Fail |
| ----- | ----------- | ---------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------- |
| TC301 | Tạo báo cáo | Tạo báo cáo tháng mới  | Click "Tạo báo cáo"<br>Năm: 2024<br>Tháng: 12 | - API POST /reports/monthly/generate?year=2024&month=12<br>- Báo cáo được tính toán và lưu vào DB<br>- Hiển thị báo cáo mới<br>- Thông báo: "Tạo báo cáo thành công" |                 |           |
| TC302 | Tạo báo cáo | Tạo báo cáo đã tồn tại | Tạo báo cáo tháng 12/2024 (đã có)             | - Hiển thị cảnh báo: "Báo cáo đã tồn tại. Bạn có muốn tạo lại?"<br>- Click "Xác nhận" → Tạo lại (overwrite)                                                          |                 |           |

### 13.10. Lọc và tìm kiếm trong báo cáo

| ID    | Chức năng | Trường hợp kiểm thử       | Dữ liệu đầu vào  | Kết quả mong đợi                                                                      | Kết quả thực tế | Pass/Fail |
| ----- | --------- | ------------------------- | ---------------- | ------------------------------------------------------------------------------------- | --------------- | --------- |
| TC303 | Tìm kiếm  | Tìm sinh viên trong Top 5 | Search: `Nguyễn` | - Highlight sinh viên có tên chứa "Nguyễn"<br>- Hoặc filter chỉ hiển thị sinh viên đó |                 |           |
| TC304 | Tìm kiếm  | Tìm máy in trong Top 3    | Search: `HP`     | - Highlight máy in có tên chứa "HP"                                                   |                 |           |

---

## 📊 TỔNG KẾT

### Thống kê testcase

| Nhóm chức năng                          | Số lượng testcase | Ghi chú                                                          |
| --------------------------------------- | ----------------- | ---------------------------------------------------------------- |
| **STUDENT - Đăng nhập**                 | 35                | Bao gồm: Login cơ bản, 2FA/OTP, Remember Me, Google SSO, Session |
| **STUDENT - Đăng xuất**                 | 4                 | Logout và session management                                     |
| **STUDENT - Tải tài liệu**              | 23                | Upload, validation, error handling                               |
| **STUDENT - Danh sách tài liệu**        | 30                | Xem, tìm kiếm, lọc, xóa, download, pagination                    |
| **STUDENT - Chọn máy in**               | 20                | Xem, lọc, tìm kiếm, chọn máy in                                  |
| **STUDENT - Cấu hình in & Gửi lệnh in** | 32                | Cấu hình, tính toán, validation, submit                          |
| **STUDENT - Lịch sử in**                | 20                | Xem, lọc, tìm kiếm, hành động, xuất Excel                        |
| **SPSO - Đăng nhập**                    | 12                | Login, 2FA, Remember Me, phân quyền                              |
| **SPSO - Đăng xuất**                    | 2                 | Logout                                                           |
| **SPSO - Quản lý máy in**               | 42                | CRUD, toggle, lọc, tìm kiếm, supplies                            |
| **SPSO - Quản lý vị trí**               | 24                | Campus, Building, Room management, cascade                       |
| **SPSO - Cài đặt hệ thống**             | 20                | Config, semester management, auto allocation                     |
| **SPSO - Báo cáo**                      | 40                | Monthly/Yearly reports, stats, charts, export PDF/Excel          |
| **TỔNG CỘNG**                           | **304 testcases** |                                                                  |

### Phân loại theo độ ưu tiên

| Priority      | Số lượng | Tỷ lệ | Mô tả                                        |
| ------------- | -------- | ----- | -------------------------------------------- |
| P0 - Critical | ~120     | 40%   | Must-have: Login, Upload, Print, CRUD cơ bản |
| P1 - High     | ~90      | 30%   | Should-have: Filters, Search, Validation     |
| P2 - Medium   | ~60      | 20%   | Nice-to-have: Advanced features, Export      |
| P3 - Low      | ~34      | 10%   | Optional: Edge cases, UI/UX improvements     |

### Ghi chú quan trọng

1. **Cột "Kết quả thực tế"**: Để trống, QA tester sẽ điền sau khi test
2. **Cột "Pass/Fail"**: Để trống, QA tester sẽ đánh dấu ✓ (Pass) hoặc ✗ (Fail)
3. **Dữ liệu test**: Cần chuẩn bị dữ liệu mẫu trước khi test (users, documents, printers, etc.)
4. **Môi trường test**: Nên test trên môi trường staging/dev trước khi test production
5. **Browser compatibility**: Nên test trên nhiều trình duyệt (Chrome, Firefox, Edge, Safari)
6. **Responsive**: Nên test trên nhiều kích thước màn hình (Desktop, Tablet, Mobile)

### Checklist trước khi test

- [ ] Database đã được setup với dữ liệu mẫu
- [ ] Backend API đang chạy ổn định
- [ ] Frontend đang chạy ổn định
- [ ] Tài khoản test đã được tạo (Student, SPSO)
- [ ] Môi trường test đã được chuẩn bị
- [ ] Tools test đã được cài đặt (Postman, Browser DevTools, etc.)

---

**© 2025 - HCMSIU SSPS - Student Smart Printing Service**  
**Document Version:** 1.0  
**Last Updated:** 28/12/2025
