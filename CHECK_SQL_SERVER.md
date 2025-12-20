# Cấu hình SQL Server cho Remote Access

## 1. Mở SQL Server Configuration Manager

1. Tìm "SQL Server Configuration Manager" trong Start Menu
2. Mở **SQL Server Network Configuration** > **Protocols for MSSQLSERVER**
3. Bật **TCP/IP** (Right click > Enable)
4. Double-click **TCP/IP** > tab **IP Addresses**
5. Tìm **IPAll**:
   - **TCP Port**: 1433
6. Restart SQL Server Service

## 2. Kiểm tra Firewall

Chạy lệnh PowerShell này với quyền Administrator:

```powershell
# Cho phép SQL Server qua firewall
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
```

## 3. Kiểm tra SQL Server Authentication

1. Mở SQL Server Management Studio
2. Connect vào server: 26.188.69.156
3. Right-click server > **Properties** > **Security**
4. Chọn **SQL Server and Windows Authentication mode**
5. Restart SQL Server Service

## 4. Test kết nối Local

Chạy lệnh này để test từ máy local:

```powershell
Test-NetConnection -ComputerName 26.188.69.156 -Port 1433
```

Kết quả phải có `TcpTestSucceeded: True`
