# ⚠️ CẢNH BÁO BẢO MẬT

## Port 1433 đang mở ra Internet!

**Public IP**: 14.224.208.181
**Port**: 1433 → SQL Server

## Sau khi Demo xong, PHẢI làm ngay:

### 1. Tắt Port Forwarding trên Router

- Vào router: xóa rule "SQL Server" port 1433
- Hoặc disable rule đó

### 2. (Tùy chọn) Tắt TCP/IP trong SQL Server

- SQL Server Configuration Manager
- Protocols for MSSQLSERVER > TCP/IP
- Right click > Disable
- Restart SQL Server Service

### 3. Kiểm tra đã đóng chưa

```powershell
Test-NetConnection -ComputerName 14.224.208.181 -Port 1433
```

Kết quả phải là: `TcpTestSucceeded: False`

## Rủi ro nếu không tắt:

❌ Database có thể bị tấn công brute-force
❌ Dữ liệu có thể bị đánh cắp
❌ Server có thể bị chiếm quyền điều khiển

## Giải pháp an toàn hơn cho production:

✅ Dùng Heroku Postgres
✅ Dùng Azure SQL Database
✅ Dùng AWS RDS
✅ Dùng VPN để kết nối database
