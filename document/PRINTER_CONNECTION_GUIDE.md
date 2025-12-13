# Hướng Dẫn Cấu Hình Kết Nối Máy In

## Tổng Quan

Hệ thống SSPS hỗ trợ kết nối với máy in thật qua mạng (Network Printer) sử dụng giao thức IPP (Internet Printing Protocol) hoặc JetDirect. Tài liệu này hướng dẫn cách cấu hình để kết nối với máy in thực tế.

---

## 1. Yêu Cầu Hệ Thống

### Máy In Yêu Cầu

- Máy in có hỗ trợ kết nối mạng (Network/WiFi)
- Hỗ trợ giao thức IPP (port 631) hoặc JetDirect (port 9100)
- Đã được cấu hình IP tĩnh hoặc DHCP reservation

### Yêu Cầu Mạng

- Máy in và server backend phải trong cùng mạng hoặc có route đến nhau
- Firewall cho phép kết nối đến port 631 (IPP) và 9100 (JetDirect)
- Có thể ping được địa chỉ IP của máy in

---

## 2. Cấu Hình Database

### Bước 1: Thêm Cột IPAddress (Nếu Chưa Có)

Chạy migration script:

```bash
cd c:\Dev\SSPS_AntiSocola\script\database
sqlcmd -S 26.188.69.156 -U user_khach -P 123456 -d HCMSIU_SSPS -i add_printer_ip_address.sql
```

Hoặc chạy trực tiếp trong SQL Server Management Studio:

```sql
USE HCMSIU_SSPS;
GO

ALTER TABLE Printers
ADD IPAddress NVARCHAR(50) NULL;
GO
```

### Bước 2: Cập Nhật IP Cho Máy In

Cập nhật IP cho từng máy in trong database:

```sql
UPDATE Printers
SET IPAddress = '192.168.1.100'  -- IP thực tế của máy in
WHERE PrinterID = 'PR-H6-101';
```

**Lưu ý:** Sử dụng IP tĩnh hoặc hostname (VD: `printer-h6-101.local`) cho ổn định.

---

## 3. Cấu Hình Backend Application

### Bước 1: Cấu Hình application.properties

Mở file `backend/src/main/resources/application.properties` và cấu hình:

```properties
# Print Queue Configuration
print.queue.enabled=true                              # Bật/tắt tính năng gửi job đến máy in
print.queue.scan-interval-seconds=30                  # Quét job pending mỗi 30 giây
print.queue.max-retry-attempts=3                      # Số lần thử lại nếu thất bại
print.queue.connection-timeout-seconds=10             # Timeout khi kết nối máy in (giây)
```

### Bước 2: Khởi Động Lại Backend

```bash
cd c:\Dev\SSPS_AntiSocola\backend
mvn clean compile spring-boot:run
```

Kiểm tra log để xác nhận service đã bật:

```
[INFO] Scanning for pending print jobs...
```

---

## 4. Cấu Hình Máy In

### Option 1: Máy In HP (Khuyến Nghị)

1. **Kết nối máy in vào mạng:**

   - Vào menu `Network` → `Wireless Setup` hoặc cắm dây ethernet
   - Cấu hình IP tĩnh hoặc ghi nhớ IP từ DHCP

2. **Bật HP JetDirect (Port 9100):**

   - Truy cập web interface: `http://<IP_May_In>`
   - Vào `Network` → `JetDirect` → Enable
   - Port mặc định: 9100

3. **Bật IPP (Port 631):**
   - Vào `Network` → `IPP` → Enable
   - Đường dẫn IPP: `http://<IP_May_In>:631/ipp/print`

### Option 2: Máy In Canon

1. Kết nối mạng và lấy IP
2. Bật chế độ "Network Printing"
3. Cấu hình qua web interface tại `http://<IP_May_In>`

### Option 3: Máy In Epson

1. Kết nối WiFi Direct hoặc Ethernet
2. In "Network Status Sheet" để xem IP
3. Bật "IPP Printing" trong Settings

---

## 5. Kiểm Tra Kết Nối

### Bước 1: Ping Máy In

```powershell
ping 192.168.1.100
```

Kết quả mong đợi:

```
Reply from 192.168.1.100: bytes=32 time=1ms TTL=64
```

### Bước 2: Test Port 9100 (JetDirect)

```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 9100
```

Kết quả mong đợi:

```
TcpTestSucceeded : True
```

### Bước 3: Test Port 631 (IPP)

```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 631
```

### Bước 4: Test In Thử

1. Gửi một print job qua API:

```bash
POST http://localhost:8080/api/print-jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": 1,
  "printerId": "PR-H6-101",
  "paperSize": "A4",
  "colorMode": "BlackWhite",
  "isSingleSided": false,
  "numCopies": 1,
  "pageRange": "1-2"
}
```

2. Kiểm tra log backend:

```
[INFO] Found 1 pending print jobs. Processing...
[INFO] Successfully connected to printer at 192.168.1.100:9100
[INFO] Successfully sent job 123 to printer PR-H6-101
[INFO] Job 123 completed successfully on printer PR-H6-101
```

---

## 6. Xử Lý Lỗi Thường Gặp

### Lỗi 1: Cannot Connect to Printer

**Nguyên nhân:**

- Máy in chưa kết nối mạng
- IP sai hoặc thay đổi
- Firewall chặn port 9100/631

**Giải pháp:**

1. Ping máy in: `ping <IP>`
2. Kiểm tra firewall: `Test-NetConnection -ComputerName <IP> -Port 9100`
3. Cập nhật IP trong database nếu đã thay đổi

### Lỗi 2: Print Service Not Found

**Nguyên nhân:**

- Máy in chưa được add vào Windows/Linux print system

**Giải pháp:**

**Windows:**

```powershell
# Add network printer
Add-Printer -ConnectionName "\\192.168.1.100\printer" -Name "Printer-H6-101"
```

**Linux (CUPS):**

```bash
# Install CUPS
sudo apt install cups

# Add network printer
lpadmin -p Printer-H6-101 -v ipp://192.168.1.100:631/ipp/print -E
```

### Lỗi 3: Job Failed After 3 Attempts

**Nguyên nhân:**

- Máy in hết giấy/mực
- Máy in bị lỗi/kẹt giấy
- Document format không hỗ trợ

**Giải pháp:**

1. Kiểm tra trạng thái máy in
2. Kiểm tra format file (PDF khuyến nghị)
3. Xem log chi tiết trong database: `SELECT * FROM PrintJobs WHERE JobStatus = 'Failed'`

---

## 7. Cấu Hình Nâng Cao

### 7.1. Sử Dụng Print Server (CUPS/Windows Print Server)

Thay vì kết nối trực tiếp, bạn có thể dùng print server:

**Linux CUPS:**

```properties
# application.properties
print.server.url=http://print-server.local:631
print.server.enabled=true
```

**Windows Print Server:**

```properties
print.server.url=\\\\PRINT-SERVER\\SharedPrinter
```

### 7.2. Bảo Mật Kết Nối

Nếu máy in hỗ trợ IPPS (IPP over SSL):

```properties
print.queue.use-ssl=true
print.queue.cert-path=/path/to/printer-cert.pem
```

### 7.3. Load Balancing

Cấu hình nhiều máy in cùng location:

```sql
-- Thêm nhiều máy in backup
INSERT INTO Printers (PrinterID, PrinterName, Location, IPAddress, Status)
VALUES ('PR-H6-101-B', 'Máy in H6-101 Backup', 'Dĩ An - H6 - P101', '192.168.1.101', 'Active');
```

Service sẽ tự động chuyển sang máy backup nếu máy chính lỗi.

---

## 8. Monitoring và Maintenance

### 8.1. Xem Trạng Thái Print Queue

```sql
-- Job đang pending
SELECT * FROM PrintJobs WHERE JobStatus = 'Pending';

-- Job thất bại
SELECT * FROM PrintJobs WHERE JobStatus = 'Failed';

-- Thống kê theo máy in
SELECT
    p.PrinterName,
    p.IPAddress,
    p.Status,
    p.TotalPagesPrinted,
    COUNT(pj.JobID) as TotalJobs
FROM Printers p
LEFT JOIN PrintJobs pj ON p.PrinterID = pj.PrinterID
GROUP BY p.PrinterID, p.PrinterName, p.IPAddress, p.Status, p.TotalPagesPrinted;
```

### 8.2. Kiểm Tra Log Backend

```bash
# Xem log real-time
tail -f backend/logs/application.log

# Hoặc trong PowerShell khi chạy mvn spring-boot:run
# Log sẽ hiển thị trực tiếp
```

### 8.3. Tạm Dừng Print Queue

Nếu cần bảo trì:

```properties
# application.properties
print.queue.enabled=false
```

Restart backend hoặc dùng API endpoint (nếu có):

```bash
POST http://localhost:8080/api/admin/print-queue/pause
```

---

## 9. Checklist Triển Khai

- [ ] Database đã có cột IPAddress
- [ ] Đã cập nhật IP cho tất cả máy in
- [ ] Backend config: `print.queue.enabled=true`
- [ ] Máy in đã kết nối mạng và có IP tĩnh
- [ ] Port 9100/631 đã mở trên firewall
- [ ] Test ping và telnet thành công
- [ ] Gửi print job thử nghiệm thành công
- [ ] Log backend không có error
- [ ] Máy in thật đã in ra tài liệu

---

## 10. Liên Hệ Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra log backend: `backend/logs/application.log`
2. Kiểm tra database: `SELECT * FROM PrintJobs WHERE JobStatus = 'Failed'`
3. Test kết nối: `ping <IP>`, `Test-NetConnection <IP> -Port 9100`
4. Xem tài liệu: `document/PRINTER_CONNECTION_GUIDE.md`

---

## Appendix: IP Mẫu

```
Printer ID      | Location          | IP Address      | Port
----------------|-------------------|-----------------|------
PR-H6-101       | Dĩ An - H6 - P101| 192.168.1.101  | 9100
PR-H6-201       | Dĩ An - H6 - P201| 192.168.1.102  | 9100
PR-A-102        | Dĩ An - A - P102 | 192.168.2.101  | 9100
PR-LIB-G01      | Thư viện - G01   | 192.168.3.101  | 631
```

**Lưu ý:** Đây là IP mẫu, thay đổi theo IP thực tế của máy in trong mạng của bạn.
