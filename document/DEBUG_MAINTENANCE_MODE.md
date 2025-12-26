# Debug Maintenance Mode - Hướng Dẫn Chi Tiết

## ⚠️ QUAN TRỌNG: Phải restart backend sau khi thêm interceptor!

## Bước 1: Kiểm tra Database

```sql
SELECT * FROM "SystemConfig" WHERE "ConfigKey" = 'system_maintenance_mode';
```

**Kết quả mong đợi:**

- ConfigValue: `true` (chữ thường)

**Nếu không có record, chạy:**

```sql
INSERT INTO "SystemConfig" ("ConfigKey", "ConfigValue", "Description", "DataType", "CreatedAt", "UpdatedAt")
VALUES ('system_maintenance_mode', 'false', 'Chế độ bảo trì hệ thống', 'Boolean', NOW(), NOW());
```

## Bước 2: Test Endpoint (Sau khi restart backend)

```bash
# Gọi endpoint test với student token
GET http://localhost:8080/api/test/maintenance/status
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Kết quả mong đợi khi maintenance = true:**

- HTTP 503
- Body: `{"success":false,"message":"Hệ thống đang bảo trì..."}`

**Nếu HTTP 200:** → Interceptor không hoạt động

## Bước 3: Kiểm tra Log

Tìm trong console backend:

```
MaintenanceInterceptor.preHandle() called for: GET /api/test/maintenance/status
```

- **Có log:** Interceptor đang chạy
- **Không có log:** Interceptor chưa được load

## Bước 4: Force Update Database

```sql
UPDATE "SystemConfig"
SET "ConfigValue" = 'true', "UpdatedAt" = NOW()
WHERE "ConfigKey" = 'system_maintenance_mode';
```

## Checklist

- [ ] Backend đã **RESTART** sau khi thêm interceptor
- [ ] Database: `ConfigValue = 'true'` (chữ thường)
- [ ] Student token có `ROLE_Student`
- [ ] Test endpoint `/api/test/maintenance/status` trả về 503
