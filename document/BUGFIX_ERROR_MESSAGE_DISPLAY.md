# BUG FIX: Hiển thị Error Message Chi Tiết

## 🐛 Mô tả Bug

**Bug ID:** BUG-002  
**Related to:** BUG-001  
**Severity:** Medium  
**Priority:** P1  
**Reported Date:** 2024-12-28  
**Status:** ✅ Fixed

### Vấn đề

Khi có lỗi từ backend (ví dụ: validation error khi bỏ chọn hết định dạng file), frontend chỉ hiển thị message chung chung:

- ❌ "Lỗi khi cập nhật cấu hình"
- ❌ "Lỗi khi xóa học kỳ"

Không hiển thị error message chi tiết từ server như:

- ✅ "Phải chọn ít nhất 1 định dạng file cho phép"
- ✅ "Không thể xóa học kỳ đang diễn ra"

### Tác động

- User không biết lỗi cụ thể là gì
- Khó debug và troubleshoot
- UX kém, user bối rối không biết phải làm gì

### Nguyên nhân

1. **Frontend:** Catch block chỉ hiển thị message cố định, không parse error response từ server
2. **Backend:** `IllegalArgumentException` không được handle riêng, rơi vào generic handler → HTTP 500 thay vì 400

---

## ✅ Giải pháp

### 1. Frontend - Parse Error Response

**File:** `frontend/src/app/spso/settings/page.tsx`

#### A. handleSave (General Settings)

**Before:**

```typescript
} catch (error) {
  console.error("Error saving settings:", error);
  alert("Lỗi khi cập nhật cấu hình");
}
```

**After:**

```typescript
} catch (error: any) {
  console.error("Error saving settings:", error);
  // ✅ Parse error message từ response
  const errorMessage = error?.response?.data?.message || error?.message || "Lỗi khi cập nhật cấu hình";
  alert(errorMessage);
}
```

#### B. handleDelete (Delete Semester)

**Before:**

```typescript
} catch (error) {
  console.error("Error deleting semester:", error);
  alert("Lỗi khi xóa học kỳ");
}
```

**After:**

```typescript
} catch (error: any) {
  console.error("Error deleting semester:", error);
  const errorMessage = error?.response?.data?.message || error?.message || "Lỗi khi xóa học kỳ";
  alert(errorMessage);
}
```

#### C. SemesterModal - handleSubmit

**Already good!** ✅

```typescript
} catch (error) {
  console.error("Error saving semester:", error);
  const errorMsg = error instanceof Error && 'response' in error
    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
    : error instanceof Error
    ? error.message
    : "Lỗi khi lưu học kỳ";
  alert(errorMsg);
}
```

---

### 2. Backend - Add IllegalArgumentException Handler

**File:** `backend/src/main/java/com/example/app/exception/GlobalExceptionHandler.java`

**Thêm handler mới:**

```java
// Xử lý IllegalArgumentException (ví dụ: validation errors)
@ExceptionHandler(IllegalArgumentException.class)
public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
        IllegalArgumentException ex) {

    log.warn("IllegalArgumentException: {}", ex.getMessage());

    ErrorResponse response = new ErrorResponse(
        LocalDateTime.now(),
        HttpStatus.BAD_REQUEST.value(),
        ex.getMessage(),
        null
    );

    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
}
```

**Lợi ích:**

- ✅ Trả về HTTP 400 Bad Request (thay vì 500 Internal Server Error)
- ✅ Frontend có thể parse error message dễ dàng
- ✅ Consistent error response format
- ✅ Proper HTTP status code

---

## 📊 Error Response Format

### Standard Error Response

```json
{
  "timestamp": "2024-12-28T10:30:00",
  "status": 400,
  "message": "Phải chọn ít nhất 1 định dạng file cho phép",
  "errors": null
}
```

### Frontend Parsing Logic

```typescript
// Priority order:
// 1. error.response.data.message (from backend ErrorResponse)
// 2. error.message (from Error object)
// 3. Default fallback message

const errorMessage =
  error?.response?.data?.message || // Backend error message
  error?.message || // JavaScript Error message
  "Lỗi khi cập nhật cấu hình"; // Fallback
```

---

## 🧪 Test Cases

### Test Scenario 1: File Extensions Validation

**Steps:**

1. Login as SPSO
2. Vào Cài đặt hệ thống → Cấu hình chung
3. Bỏ chọn hết checkbox định dạng file
4. Click "Lưu cấu hình"

**Expected:**

- ✅ Alert: "Vui lòng chọn ít nhất 1 định dạng file cho phép!" (frontend validation)

**If bypass frontend (API call):**

- ✅ HTTP 400 Bad Request
- ✅ Alert: "Phải chọn ít nhất 1 định dạng file cho phép" (backend validation)

---

### Test Scenario 2: Delete Current Semester

**Steps:**

1. Login as SPSO
2. Vào Cài đặt hệ thống → Quản lý học kỳ
3. Try to delete current semester (if allowed)

**Expected:**

- ✅ HTTP 400 Bad Request
- ✅ Alert: "Không thể xóa học kỳ đang diễn ra" (or similar message)

---

### Test Scenario 3: Invalid Semester Dates

**Steps:**

1. Login as SPSO
2. Vào Cài đặt hệ thống → Quản lý học kỳ
3. Click "Thêm học kỳ"
4. Nhập endDate < startDate
5. Click "Lưu"

**Expected:**

- ✅ Alert: "Ngày kết thúc phải sau ngày bắt đầu" (frontend validation)

---

## 📝 Code Changes Summary

### Files Modified

1. ✅ `frontend/src/app/spso/settings/page.tsx`

   - Updated `handleSave` error handling
   - Updated `handleDelete` error handling

2. ✅ `backend/src/main/java/com/example/app/exception/GlobalExceptionHandler.java`
   - Added `handleIllegalArgumentException` method

### Lines Changed

- Frontend: ~10 lines
- Backend: ~15 lines
- Total: ~25 lines

---

## 🎯 Benefits

### Before Fix

- ❌ Generic error messages
- ❌ User confused
- ❌ Hard to debug
- ❌ Wrong HTTP status (500 instead of 400)

### After Fix

- ✅ Specific error messages
- ✅ User knows what to fix
- ✅ Easy to debug
- ✅ Correct HTTP status codes
- ✅ Better UX
- ✅ Consistent error handling

---

## 🔍 Error Handling Best Practices

### 1. Always Parse Error Response

```typescript
// ❌ Bad
catch (error) {
  alert("Error occurred");
}

// ✅ Good
catch (error: any) {
  const errorMessage = error?.response?.data?.message || error?.message || "Default message";
  alert(errorMessage);
}
```

### 2. Use Proper HTTP Status Codes

```java
// ❌ Bad - All errors return 500
throw new RuntimeException("Validation failed");

// ✅ Good - Use appropriate status
throw new IllegalArgumentException("Validation failed"); // → 400
throw new ResourceNotFoundException("Not found");        // → 404
throw new IllegalStateException("Conflict");             // → 409
```

### 3. Consistent Error Response Format

```java
// Always return ErrorResponse with:
// - timestamp
// - status
// - message
// - errors (optional)

ErrorResponse response = new ErrorResponse(
    LocalDateTime.now(),
    HttpStatus.BAD_REQUEST.value(),
    ex.getMessage(),
    null
);
```

### 4. Log Errors Properly

```typescript
// Frontend
console.error("Error saving settings:", error);

// Backend
log.warn("IllegalArgumentException: {}", ex.getMessage());
log.error("Unhandled exception:", ex); // with stack trace
```

---

## 🚀 Future Improvements

### 1. Toast Notifications Instead of Alerts

```typescript
// Instead of alert()
import { toast } from "react-toastify";

toast.error(errorMessage);
toast.success("Cập nhật thành công!");
```

### 2. Inline Error Messages

```typescript
// Show error below input field
<input ... />
{error && <p className="text-red-500 text-sm">{error}</p>}
```

### 3. Error Boundary Component

```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <YourComponent />
</ErrorBoundary>
```

### 4. Structured Error Codes

```json
{
  "timestamp": "2024-12-28T10:30:00",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "code": "FILE_EXTENSIONS_EMPTY",
  "message": "Phải chọn ít nhất 1 định dạng file cho phép",
  "errors": null
}
```

---

## 📚 Related Documentation

- **Related Bug:** BUG-001 (File Extensions Validation)
- **Related Files:**
  - `frontend/src/app/spso/settings/page.tsx`
  - `backend/src/main/java/com/example/app/exception/GlobalExceptionHandler.java`
  - `backend/src/main/java/com/example/app/service/impl/SystemSettingsServiceImpl.java`

---

**Fixed by:** Kiro AI Assistant  
**Reviewed by:** [Pending]  
**Approved by:** [Pending]  
**Date:** 2024-12-28
