# Hướng Dẫn Kết Nối Máy In Thật

## Tổng Quan

Khi có máy in thật, bạn chỉ cần:

1. **Tắt Mock Mode** trong config
2. **Cấu hình IP máy in** trong database
3. **Cài đặt driver máy in** trên server (optional)

**KHÔNG CẦN SỬA CODE!** Tất cả logic đã sẵn sàng.

---

## Bước 1: Tắt Mock Mode

### File: `application.properties`

```properties
# Print Queue Configuration
print.queue.enabled=true
print.queue.scan-interval-seconds=30  # Tăng lên 30s cho production
print.queue.max-retry-attempts=3
print.queue.connection-timeout-seconds=10

# TẮT MOCK MODE
print.queue.mock-mode=false  # ← Đổi từ true → false
```

**Chỉ cần đổi 1 dòng này!**

---

## Bước 2: Cấu Hình IP Máy In

### 2.1. Tìm IP Máy In

**Windows**:

1. Mở "Devices and Printers"
2. Right-click máy in → "Printer properties"
3. Tab "Ports" → Xem IP address (ví dụ: `192.168.1.100`)

**Mac**:

1. System Preferences → Printers & Scanners
2. Chọn máy in → Xem "Location" hoặc "IP Address"

**Linux**:

```bash
lpstat -v
# Hoặc
avahi-browse -rt _ipp._tcp
```

### 2.2. Cập Nhật IP Trong Database

```sql
-- Cập nhật IP cho máy in
UPDATE printers
SET ipaddress = '192.168.1.100'  -- IP thật của máy in
WHERE printerid = 1;

-- Kiểm tra
SELECT printerid, printername, ipaddress, status
FROM printers;
```

**Quan trọng**: Mỗi máy in phải có IP riêng!

---

## Bước 3: Kiểm Tra Kết Nối

### 3.1. Test Ping

```bash
# Windows
ping 192.168.1.100

# Linux/Mac
ping -c 4 192.168.1.100
```

**Expected**: Phải ping được!

### 3.2. Test Port

Máy in thường dùng 2 ports:

- **Port 9100**: JetDirect (HP, Canon, Brother)
- **Port 631**: IPP (Internet Printing Protocol)

```bash
# Windows (PowerShell)
Test-NetConnection -ComputerName 192.168.1.100 -Port 9100

# Linux/Mac
nc -zv 192.168.1.100 9100
nc -zv 192.168.1.100 631
```

**Expected**: Port phải mở!

---

## Bước 4: Cài Đặt Driver (Optional)

### 4.1. Windows Server

**Cách 1: Thêm Network Printer**

1. Control Panel → Devices and Printers
2. Add a printer → Add a network printer
3. Nhập IP: `192.168.1.100`
4. Chọn driver phù hợp (HP, Canon, Brother, etc.)

**Cách 2: Dùng Generic Driver**

- Windows có sẵn "Generic / Text Only" driver
- Không cần cài driver riêng

### 4.2. Linux Server

```bash
# Ubuntu/Debian
sudo apt-get install cups cups-client

# CentOS/RHEL
sudo yum install cups

# Thêm máy in
sudo lpadmin -p printer1 -v socket://192.168.1.100:9100 -E

# Kiểm tra
lpstat -p -d
```

### 4.3. Docker Container

Nếu backend chạy trong Docker, cần:

```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim

# Cài CUPS (optional)
RUN apt-get update && apt-get install -y cups cups-client

# ... rest of Dockerfile
```

---

## Bước 5: Test In Thật

### 5.1. Restart Backend

```bash
cd backend
mvn spring-boot:run
```

### 5.2. Gửi Test Job

1. Đăng nhập Student
2. Upload document PDF
3. Gửi lệnh in
4. Quan sát logs

### 5.3. Xem Logs

**Thành công**:

```
Scanning for pending print jobs...
Found 1 pending print jobs. Processing...
Job 1: Pending → Printing
Successfully connected to printer at 192.168.1.100:9100
Sending job 1 to printer...
Job 1 completed successfully on printer 1
```

**Thất bại**:

```
Cannot connect to printer at 192.168.1.100
Job 1 failed, will retry (1/3)
```

---

## Code Đã Có Sẵn

### PrintQueueServiceImpl.java

```java
private boolean sendToPrinterViaNetwork(PrintJob job, Printer printer) {
    // MOCK MODE: Giả lập in thành công
    if (mockMode) {
        // ... mock logic
        return true;
    }

    // REAL MODE: In thật qua máy in ← Code này đã có!
    try {
        // 1. Test connection
        if (!testPrinterConnection(printer.getIpAddress())) {
            log.error("Cannot connect to printer at {}", printer.getIpAddress());
            return false;
        }

        // 2. Get document file
        String documentPath = getDocumentFilePath(job);

        // 3. Find print service
        PrintService printService = findNetworkPrintService(printer.getIpAddress());

        // 4. Configure print attributes
        PrintRequestAttributeSet attributes = buildPrintAttributes(job);

        // 5. Send to printer
        DocPrintJob docPrintJob = printService.createPrintJob();
        try (InputStream is = new FileInputStream(documentPath)) {
            Doc doc = new SimpleDoc(is, DocFlavor.INPUT_STREAM.AUTOSENSE, null);
            docPrintJob.print(doc, attributes);
        }

        return true;
    } catch (Exception e) {
        log.error("Error sending to printer: {}", e.getMessage(), e);
        return false;
    }
}
```

**Bạn KHÔNG CẦN sửa code này!** Chỉ cần:

- Tắt mock mode
- Cấu hình IP đúng
- Đảm bảo network kết nối được

---

## Các Trường Hợp Đặc Biệt

### 1. Máy In Yêu Cầu Authentication

Nếu máy in cần username/password:

```java
// Thêm vào PrintQueueServiceImpl
private PrintService findNetworkPrintService(String ipAddress) {
    // ... existing code ...

    // Nếu cần auth
    PrintRequestAttributeSet authAttrs = new HashPrintRequestAttributeSet();
    authAttrs.add(new RequestingUserName("admin", null));
    // authAttrs.add(new JobPassword("password"));

    return printService;
}
```

### 2. Máy In Dùng HTTPS/IPP

```java
// Thay đổi URL
String printerUrl = "ipp://" + ipAddress + ":631/printers/printer1";
// Hoặc
String printerUrl = "https://" + ipAddress + ":443/printers/printer1";
```

### 3. Máy In Yêu Cầu Driver Đặc Biệt

Cài driver trên server, sau đó:

```java
// Tìm printer theo tên driver
PrintService[] services = PrintServiceLookup.lookupPrintServices(null, null);
for (PrintService service : services) {
    if (service.getName().contains("HP LaserJet")) {
        return service;
    }
}
```

---

## Troubleshooting

### Lỗi: "Cannot connect to printer"

**Nguyên nhân**:

- IP sai
- Máy in tắt
- Firewall chặn port 9100/631
- Máy in không cùng mạng với server

**Giải pháp**:

1. Ping máy in
2. Test port 9100/631
3. Tắt firewall tạm thời để test
4. Đảm bảo server và máy in cùng subnet

### Lỗi: "Print service not found"

**Nguyên nhân**:

- Driver chưa cài
- Java không tìm thấy printer

**Giải pháp**:

1. Cài driver trên server
2. Thêm printer vào OS (Windows/Linux)
3. Restart backend

### Lỗi: "Document file not found"

**Nguyên nhân**:

- File document không tồn tại
- Path sai

**Giải pháp**:
Sửa method `getDocumentFilePath()`:

```java
private String getDocumentFilePath(PrintJob job) {
    // Lấy document từ database
    Document doc = documentRepository.findById(job.getDocumentId()).orElse(null);
    if (doc == null) return null;

    // Lấy file path (từ Supabase hoặc local storage)
    String filePath = doc.getFilePath();

    // Nếu dùng Supabase, download file về local trước
    if (filePath.startsWith("http")) {
        // Download file từ Supabase
        String localPath = downloadFromSupabase(filePath);
        return localPath;
    }

    return filePath;
}
```

### Lỗi: "Unsupported file format"

**Nguyên nhân**:

- Máy in không hỗ trợ file type (DOCX, etc.)

**Giải pháp**:
Convert sang PDF trước khi in:

```java
// Nếu file là DOCX, convert sang PDF trước
if (documentPath.endsWith(".docx")) {
    documentPath = convertToPdf(documentPath);
}
```

---

## Checklist Chuyển Sang Production

- [ ] Tắt mock mode: `print.queue.mock-mode=false`
- [ ] Tăng scan interval: `scan-interval-seconds=30`
- [ ] Cập nhật IP máy in trong database
- [ ] Test ping máy in
- [ ] Test port 9100/631
- [ ] Cài driver (nếu cần)
- [ ] Test in 1 job thử
- [ ] Kiểm tra logs không có error
- [ ] Test với nhiều jobs đồng thời
- [ ] Test cancel job
- [ ] Test SPSO refill

---

## So Sánh Mock vs Real

| Feature      | Mock Mode        | Real Mode         |
| ------------ | ---------------- | ----------------- |
| Config       | `mock-mode=true` | `mock-mode=false` |
| Cần máy in   | ❌ Không         | ✅ Có             |
| Cần IP       | ❌ Không         | ✅ Có             |
| Cần driver   | ❌ Không         | ⚠️ Tùy máy in     |
| Thời gian in | Cố định (30s)    | Tùy máy in        |
| Kết quả      | Luôn thành công  | Có thể fail       |
| File output  | ❌ Không in thật | ✅ In ra giấy     |
| Dùng để      | Development/Test | Production        |

---

## Tóm Tắt

### Để Chuyển Sang Máy In Thật:

1. **Đổi 1 dòng config**:

   ```properties
   print.queue.mock-mode=false
   ```

2. **Cập nhật IP trong database**:

   ```sql
   UPDATE printers SET ipaddress = '192.168.1.100' WHERE printerid = 1;
   ```

3. **Restart backend**:

   ```bash
   mvn spring-boot:run
   ```

4. **Test in**!

**KHÔNG CẦN SỬA CODE!** 🎉

---

## Liên Hệ Hỗ Trợ

Nếu gặp vấn đề khi kết nối máy in thật:

1. Kiểm tra logs backend
2. Test ping và port
3. Đảm bảo firewall không chặn
4. Thử với máy in khác để xác định vấn đề

Good luck! 🖨️
