# Validation Kích Thước File - Tóm Tắt

## Vấn Đề

SPSO cấu hình `max_file_size_mb = 10MB`, nhưng sinh viên vẫn có thể:

1. ✅ Upload file 15MB (đã bị chặn trước đó)
2. ❌ In file 15MB đã upload trước khi thay đổi config (chưa bị chặn)

## Giải Pháp

### Backend: Validation khi submit print job

**File:** `PrintJobServiceImpl.java`

**Logic:**

```java
// Step 1.6: Validate file size against current SystemConfig
int maxFileSizeMB = systemConfigRepository.findByConfigKey("max_file_size_mb")
    .map(config -> Integer.parseInt(config.getConfigValue()))
    .orElse(50);

double fileSizeMB = document.getFileSizeKB().doubleValue() / 1024.0;
if (fileSizeMB > maxFileSizeMB) {
    throw new BusinessException(
        String.format("File quá lớn (%.1f MB). Kích thước tối đa hiện tại: %d MB",
            fileSizeMB, maxFileSizeMB)
    );
}
```

**Khi nào validate:**

- Khi sinh viên submit print job (gửi lệnh in)
- Đọc config từ SystemConfig (real-time)
- Throw BusinessException nếu file quá lớn

### Frontend: Hiển thị cảnh báo trong danh sách

**File:** `print-document/page.tsx`

**Logic:**

```typescript
// Load max file size from SystemConfig
const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>(50);

useEffect(() => {
  const settings = await systemSettingsService.getAllSettings();
  const maxSize = parseInt(
    settings.configs["max_file_size_mb"]?.configValue || "50"
  );
  setMaxFileSizeMB(maxSize);
}, []);

// Check if document is allowed (extension + size)
const isDocumentAllowed = (doc: DocumentResponse): boolean => {
  const extensionAllowed = allowedExtensions.includes(
    doc.fileExtension?.toLowerCase() || ""
  );
  const fileSizeMB = doc.fileSizeKB / 1024;
  const sizeAllowed = fileSizeMB <= maxFileSizeMB;
  return extensionAllowed && sizeAllowed;
};

// Get specific reason
const getDisallowReason = (doc: DocumentResponse): string => {
  const extensionAllowed = allowedExtensions.includes(
    doc.fileExtension?.toLowerCase() || ""
  );
  const fileSizeMB = doc.fileSizeKB / 1024;
  const sizeAllowed = fileSizeMB <= maxFileSizeMB;

  if (!extensionAllowed && !sizeAllowed) {
    return `Loại file không được phép & Quá lớn (${fileSizeMB.toFixed(
      1
    )}MB > ${maxFileSizeMB}MB)`;
  } else if (!extensionAllowed) {
    return "Loại file không được phép";
  } else if (!sizeAllowed) {
    return `Quá lớn (${fileSizeMB.toFixed(1)}MB > ${maxFileSizeMB}MB)`;
  }
  return "";
};
```

**UI Changes:**

- Checkbox bị disable cho file quá lớn
- Badge "Không cho phép" với tooltip hiển thị lý do cụ thể
- Alert khi click vào file không được phép

## Kịch Bản Test

### Test Case 1: File upload trước khi thay đổi config

**Setup:**

1. Config: `max_file_size_mb = 50`
2. Upload file 15MB → Thành công
3. Thay đổi config: `max_file_size_mb = 10`

**Expected:**

- ✅ File 15MB hiển thị trong danh sách
- ✅ Badge "Không cho phép" với tooltip "Quá lớn (15.0MB > 10MB)"
- ✅ Checkbox bị disable
- ✅ Không thể chọn để in
- ✅ Backend reject nếu cố gắng in (API call)

### Test Case 2: File vừa đúng giới hạn

**Setup:**

1. Config: `max_file_size_mb = 10`
2. Upload file 10.0MB

**Expected:**

- ✅ Upload thành công
- ✅ Có thể chọn để in
- ✅ In thành công

### Test Case 3: File vượt giới hạn khi upload

**Setup:**

1. Config: `max_file_size_mb = 10`
2. Upload file 15MB

**Expected:**

- ❌ Upload bị reject ngay
- ❌ Không xuất hiện trong danh sách

### Test Case 4: Kết hợp extension + size

**Setup:**

1. Config: `max_file_size_mb = 10`, `allowed_file_extensions = pdf,docx`
2. Upload file XLSX 5MB (trước khi thay đổi config)
3. Thay đổi config: Bỏ XLSX

**Expected:**

- ✅ Badge "Không cho phép" với tooltip "Loại file không được phép"
- ✅ Không thể in

**Setup 2:**

1. Upload file XLSX 15MB (trước khi thay đổi config)
2. Thay đổi config: Bỏ XLSX + `max_file_size_mb = 10`

**Expected:**

- ✅ Badge "Không cho phép" với tooltip "Loại file không được phép & Quá lớn (15.0MB > 10MB)"

## SQL Test

```sql
-- Kiểm tra config
SELECT * FROM systemconfig WHERE configkey = 'max_file_size_mb';

-- Tìm file lớn hơn 10MB
SELECT documentid, filename, filesizekb, filesizekb/1024.0 as size_mb
FROM documents
WHERE filesizekb > 10240
ORDER BY filesizekb DESC;

-- Update config để test
UPDATE systemconfig
SET configvalue = '10'
WHERE configkey = 'max_file_size_mb';
```

## Bonus: Fix hiển thị file size

**Vấn đề:** File 14.9MB hiển thị là 14.9 KB

**Nguyên nhân:** Logic format sai

```typescript
// SAI
{
  doc.fileSizeKB < 1024
    ? `${doc.fileSizeKB.toFixed(1)} KB`
    : `${(doc.fileSizeKB / 1024).toFixed(1)} KB`;
} // ← Phải là MB

// ĐÚNG
{
  doc.fileSizeKB < 1024
    ? `${doc.fileSizeKB.toFixed(1)} KB`
    : `${(doc.fileSizeKB / 1024).toFixed(1)} MB`;
} // ← Fixed
```

**File:** `print-document/page.tsx` (line 534)

## Tổng Kết

✅ **Backend:** Validate file size khi submit print job  
✅ **Frontend:** Hiển thị cảnh báo cho file quá lớn  
✅ **UI:** Badge với tooltip lý do cụ thể  
✅ **Bonus:** Fix hiển thị file size (KB vs MB)

**Files Changed:**

- `backend/src/main/java/com/example/app/service/impl/PrintJobServiceImpl.java`
- `frontend/src/app/student/print-document/page.tsx`
