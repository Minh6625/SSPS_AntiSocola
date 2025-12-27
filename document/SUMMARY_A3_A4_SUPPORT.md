# TÓM TẮT: Hỗ trợ in A3 & A4

## Xác nhận

✅ **Hệ thống ĐÃ hỗ trợ đầy đủ in A3 và A4**

## Cách hoạt động

### Mua trang

- Người dùng **chỉ mua trang A4**
- Database lưu: `A4Balance` (tổng A4 equivalent)

### In ấn

- **In A4** → trừ 1 trang
- **In A3** → trừ 2 trang (A3 = 2×A4)

## Logic tính toán

```java
// Trong PrintJobServiceImpl.java
private int calculateA4Equivalent(int sheets, String paperSize, int copies) {
    int a4Equiv = sheets;

    // A3 = 2x A4
    if ("A3".equalsIgnoreCase(paperSize)) {
        a4Equiv *= 2;  // ✅ ĐÃ CÓ
    }

    // Multiply by copies
    a4Equiv *= copies;

    return a4Equiv;
}
```

## Ví dụ

### Ví dụ 1: In 10 trang A4

```
Số dư: 100 trang
In: 10 trang A4 (1 mặt, 1 bản)
→ Trừ: 10 trang
→ Còn: 90 trang
```

### Ví dụ 2: In 10 trang A3

```
Số dư: 90 trang
In: 10 trang A3 (1 mặt, 1 bản)
→ Trừ: 20 trang (10 × 2)
→ Còn: 70 trang
```

### Ví dụ 3: In 20 trang A4 (2 mặt)

```
Số dư: 70 trang
In: 20 trang A4 (2 mặt, 1 bản)
→ Sheets: 10 (2 mặt)
→ Trừ: 10 trang
→ Còn: 60 trang
```

### Ví dụ 4: In 5 trang A3 (3 bản)

```
Số dư: 60 trang
In: 5 trang A3 (1 mặt, 3 bản)
→ Trừ: 30 trang (5 × 2 × 3)
→ Còn: 30 trang
```

## Files đã cập nhật

### Backend (4 files)

1. ✅ `PrintJobServiceImpl.java` - Cập nhật comment
2. ✅ `AccountServiceImpl.java` - Cập nhật comment
3. ✅ `StudentServiceImpl.java` - Cập nhật comment
4. ✅ `StudentServiceImplTest.java` - Fix test case

### Tài liệu (1 file mới)

5. ✅ `document/PAGE_BALANCE_A3_A4_GUIDE.md` - Hướng dẫn chi tiết

## Kết luận

**Hệ thống ĐÃ hoạt động đúng:**

- ✅ Mua trang: Chỉ mua A4
- ✅ In A4: Trừ 1 trang
- ✅ In A3: Trừ 2 trang
- ✅ Duplex: Giảm 50% số tờ
- ✅ Copies: Nhân với số bản

**Không cần thay đổi logic** - Chỉ cập nhật comment để rõ ràng hơn.

---

**Ngày:** 2024-12-23  
**Tác giả:** HCMIU SSPS Development Team
