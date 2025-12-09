# Token Refresh Implementation

## Vấn đề

Khi access token hết hạn, các API call bị lỗi 401 mặc dù đã có refresh token hoạt động. Người dùng không thể tiếp tục sử dụng hệ thống.

## Giải pháp

Tự động refresh access token khi nhận được lỗi 401 từ backend, sau đó retry lại request ban đầu một cách trong suốt với người dùng.

## Các thay đổi đã thực hiện

### 1. Tạo Centralized Axios Configuration

**File:** `/frontend/src/config/axios.ts` (MỚI)

Tạo một axios instance duy nhất được sử dụng bởi tất cả các service với các tính năng:

- **Request Interceptor:** Tự động thêm Bearer token từ localStorage vào header
- **Response Interceptor:** Bắt lỗi 401, tự động gọi API refresh token, retry request
- **Queue Mechanism:** Xử lý nhiều request đồng thời trong khi refresh token
- **Auto Logout:** Tự động logout và redirect đến /login nếu refresh token hết hạn

```typescript
let isRefreshing = false;
let failedQueue: Array<{ resolve; reject }> = [];

// Khi có 401 error:
// 1. Nếu đang refresh -> queue request
// 2. Nếu chưa refresh -> gọi /auth/refresh-token
// 3. Lưu access token mới vào localStorage
// 4. Retry tất cả queued requests
// 5. Nếu refresh thất bại -> logout và redirect
```

### 2. Cập nhật documentService

**File:** `/frontend/src/services/documentService.ts`

**Thay đổi:**

- Import `apiClient` từ `/config/axios` thay vì tạo axios instance riêng
- Xóa axios instance cũ và interceptor (lines 45-62)
- Cập nhật tất cả method calls:
  - `documentClient.post('/upload')` → `apiClient.post('/documents/upload')`
  - `documentClient.get('/')` → `apiClient.get('/documents')`
  - `documentClient.get('/{id}')` → `apiClient.get('/documents/{id}')`
  - `documentClient.delete('/{id}')` → `apiClient.delete('/documents/{id}')`

**Kết quả:** Tất cả document API calls giờ tự động refresh token khi cần

### 3. Cập nhật authService

**File:** `/frontend/src/services/authService.ts`

**Thay đổi:**

- Import `apiClient` từ `/config/axios`
- Xóa `authClient` instance cũ và interceptor
- Lưu `refreshToken` vào localStorage trong `login()` và `verifyOtp()`
- Cập nhật tất cả method calls:
  - `authClient.post('/login')` → `apiClient.post('/auth/login')`
  - `authClient.post('/verify-otp')` → `apiClient.post('/auth/verify-otp')`
  - `authClient.post('/refresh-token')` → `apiClient.post('/auth/refresh-token')`
  - `authClient.post('/register')` → `apiClient.post('/auth/register')`

**Quan trọng:** Giờ `refreshToken` được lưu vào localStorage:

```typescript
localStorage.setItem("refreshToken", response.data.refreshToken);
```

### 4. Cập nhật userService

**File:** `/frontend/src/services/userService.ts`

**Thay đổi:**

- Import `apiClient` từ `/config/axios`
- Xóa local `apiClient` instance
- Các method calls giữ nguyên vì đã dùng đúng path `/users`, `/users/{id}`

## Luồng hoạt động

### Khi Access Token còn hạn:

1. User gọi API (ví dụ: upload document)
2. Request interceptor thêm `Authorization: Bearer {accessToken}`
3. Backend trả về 200 OK
4. Response trả về frontend

### Khi Access Token hết hạn:

1. User gọi API
2. Request interceptor thêm `Authorization: Bearer {expired_token}`
3. Backend trả về 401 Unauthorized
4. Response interceptor bắt lỗi 401
5. **Tự động gọi** `/auth/refresh-token` với `{refreshToken}`
6. Backend trả về access token mới
7. **Tự động lưu** token mới vào localStorage
8. **Tự động retry** request ban đầu với token mới
9. Request thành công, trả về kết quả cho user

**→ User KHÔNG hề biết access token đã hết hạn, mọi thứ diễn ra trong suốt**

### Khi Refresh Token hết hạn:

1. User gọi API
2. Backend trả về 401
3. Response interceptor gọi `/auth/refresh-token`
4. Backend trả về 401 (refresh token hết hạn)
5. **Tự động logout:** Xóa tất cả tokens khỏi localStorage
6. **Redirect** đến `/login`
7. User thấy màn hình login

### Khi nhiều API calls đồng thời:

1. Nhiều API calls cùng nhận 401
2. Request đầu tiên trigger refresh process (`isRefreshing = true`)
3. Các request khác được queue vào `failedQueue`
4. Sau khi refresh xong, tất cả queued requests được retry
5. Tất cả requests đều thành công

## Testing

### Test Case 1: Access token hết hạn

1. Login vào hệ thống
2. Đợi access token hết hạn (hoặc set thời gian ngắn trong backend)
3. Thử upload document hoặc gọi bất kỳ API nào
4. **Kỳ vọng:** API call thành công, không có lỗi hiển thị cho user
5. **Verify:** Check localStorage, phải có accessToken mới

### Test Case 2: Refresh token hết hạn

1. Login vào hệ thống
2. Xóa refreshToken khỏi localStorage (hoặc đợi hết hạn)
3. Thử gọi API
4. **Kỳ vọng:** Bị redirect về `/login`, tất cả tokens bị xóa

### Test Case 3: Nhiều requests đồng thời

1. Login vào hệ thống
2. Đợi access token hết hạn
3. Gọi nhiều API calls cùng lúc (ví dụ: getDocuments, getUserInfo, ...)
4. **Kỳ vọng:** Tất cả requests đều thành công, chỉ 1 lần gọi refresh API

### Test Case 4: Network error

1. Login vào hệ thống
2. Tắt backend server
3. Thử gọi API
4. **Kỳ vọng:** Hiển thị lỗi network (không phải lỗi 401)

## Lưu ý quan trọng

### Refresh API không dùng apiClient

Trong `/config/axios.ts`, refresh call dùng plain `axios`:

```typescript
const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
  refreshToken,
});
```

**Lý do:** Tránh infinite loop. Nếu dùng `apiClient`, khi refresh API trả về 401, nó sẽ trigger interceptor lại → gọi refresh lại → 401 lại → loop vô hạn.

### localStorage vs httpOnly cookie

Hiện tại `refreshToken` lưu trong localStorage. Nếu backend gửi refreshToken qua httpOnly cookie:

- Xóa `localStorage.getItem('refreshToken')` trong axios.ts
- Backend tự động đọc refreshToken từ cookie header

### Token expiry time

- Access token: Thường ngắn (5-15 phút)
- Refresh token: Thường dài (7-30 ngày)
- Cấu hình trong backend JWT settings

## Kết quả

✅ API calls tự động refresh token khi cần  
✅ User không bao giờ thấy lỗi 401 (trừ khi refresh token hết hạn)  
✅ Tất cả services dùng chung 1 axios config  
✅ Không có duplicate code (axios instance, interceptor)  
✅ Xử lý đúng race conditions (nhiều requests đồng thời)  
✅ Tự động logout khi refresh token hết hạn
