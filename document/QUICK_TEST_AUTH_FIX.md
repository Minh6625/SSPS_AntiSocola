# Quick Test - Auth Protection Fix

## Chuẩn bị

```bash
cd frontend
npm run dev
```

## Test 1: Chưa login → Không vào được protected routes ✅

### Bước 1: Xóa cookies và localStorage

1. Mở DevTools (F12)
2. Console tab, chạy:

```javascript
// Xóa tất cả
localStorage.clear();
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log("Đã xóa hết!");
```

### Bước 2: Test các URL

Nhập trực tiếp vào address bar:

```
http://localhost:3000/student/dashboard
→ Phải redirect về /login ngay lập tức

http://localhost:3000/spso/dashboard
→ Phải redirect về /spso-login ngay lập tức

http://localhost:3000/student/print-document
→ Phải redirect về /login

http://localhost:3000/spso/printers
→ Phải redirect về /spso-login
```

**✅ PASS nếu**: Redirect ngay, KHÔNG thấy nội dung trang

**❌ FAIL nếu**: Thấy nội dung trang dù chỉ 1 giây

---

## Test 2: Đã login Student → Vào được student routes ✅

### Bước 1: Login với tài khoản student

```
Email: student@hcmut.edu.vn
Password: (mật khẩu của bạn)
```

### Bước 2: Kiểm tra cookies

DevTools → Application → Cookies → localhost:3000

```
✅ Phải có: accessToken
✅ Phải có: userRole = STUDENT
```

### Bước 3: Test student routes

```
http://localhost:3000/student/dashboard
→ Hiển thị dashboard bình thường

http://localhost:3000/student/print-document
→ Hiển thị trang upload

http://localhost:3000/student/print-history
→ Hiển thị lịch sử
```

**✅ PASS nếu**: Tất cả trang đều hiển thị bình thường

---

## Test 3: Student cố vào SPSO routes → Bị chặn ✅

### (Vẫn đang login với student account)

```
http://localhost:3000/spso/dashboard
→ Phải redirect về /student/dashboard

http://localhost:3000/spso/printers
→ Phải redirect về /student/dashboard

http://localhost:3000/spso/settings
→ Phải redirect về /student/dashboard
```

**✅ PASS nếu**: Redirect về student dashboard, KHÔNG thấy SPSO pages

---

## Test 4: Đã login SPSO → Vào được SPSO routes ✅

### Bước 1: Logout và login lại với SPSO

```
1. Click Logout
2. Vào /spso-login
3. Login với tài khoản SPSO
```

### Bước 2: Kiểm tra cookies

```
✅ accessToken có
✅ userRole = SPSO
```

### Bước 3: Test SPSO routes

```
http://localhost:3000/spso/dashboard
→ Hiển thị SPSO dashboard

http://localhost:3000/spso/printers
→ Hiển thị quản lý máy in

http://localhost:3000/spso/users
→ Hiển thị quản lý users
```

**✅ PASS nếu**: Tất cả SPSO pages hiển thị bình thường

---

## Test 5: SPSO cố vào Student routes → Bị chặn ✅

### (Vẫn đang login với SPSO account)

```
http://localhost:3000/student/dashboard
→ Phải redirect về /spso/dashboard

http://localhost:3000/student/print-document
→ Phải redirect về /spso/dashboard
```

**✅ PASS nếu**: Redirect về SPSO dashboard

---

## Test 6: Đã login và cố vào login page → Redirect về dashboard ✅

### Test với Student account:

```
http://localhost:3000/login
→ Redirect về /student/dashboard

http://localhost:3000/spso-login
→ Redirect về /student/dashboard
```

### Test với SPSO account:

```
http://localhost:3000/login
→ Redirect về /spso/dashboard

http://localhost:3000/spso-login
→ Redirect về /spso/dashboard
```

**✅ PASS nếu**: Không thấy login form, redirect về dashboard

---

## Test 7: Token hết hạn → Logout tự động ✅

### Cách test:

1. Login bình thường
2. DevTools → Application → Cookies
3. Xóa cookie `accessToken` (giữ lại localStorage)
4. Refresh trang hoặc nhập URL protected route

**✅ PASS nếu**: Redirect về login page

---

## Checklist tổng hợp

- [ ] Test 1: Chưa login → Bị chặn
- [ ] Test 2: Student login → Vào được student routes
- [ ] Test 3: Student → Không vào được SPSO routes
- [ ] Test 4: SPSO login → Vào được SPSO routes
- [ ] Test 5: SPSO → Không vào được student routes
- [ ] Test 6: Đã login → Không thấy login page
- [ ] Test 7: Token hết hạn → Logout

---

## Debug Commands

### Kiểm tra cookies hiện tại:

```javascript
console.log(document.cookie);
```

### Kiểm tra localStorage:

```javascript
console.log({
  accessToken: localStorage.getItem("accessToken"),
  userRole: localStorage.getItem("userRole"),
  userId: localStorage.getItem("userId"),
});
```

### Xóa tất cả để test lại:

```javascript
localStorage.clear();
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

## Kết quả mong đợi

✅ **BUG ĐÃ FIX**: User KHÔNG THỂ truy cập protected routes bằng cách nhập URL trực tiếp khi chưa login

✅ **ROLE-BASED ACCESS**: Student và SPSO không thể truy cập routes của nhau

✅ **NO FLASH CONTENT**: Không thấy nội dung protected trước khi redirect

✅ **SMOOTH UX**: Có loading state khi check authentication
