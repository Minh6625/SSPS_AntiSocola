# HƯỚNG DẪN SETUP DỰ ÁN - LAYERED ARCHITECTURE

## 📋 TỔNG QUAN KIẾN TRÚC

### Backend (Java Spring Boot)

```
backend/
├── src/main/java/com/example/app/
│   ├── controller/          # HTTP Request/Response (KHÔNG chứa logic)
│   ├── service/
│   │   ├── interfaces/      # ✨ Service Interfaces (IUserService...)
│   │   └── impl/            # ✨ Service Implementations (UserServiceImpl...)
│   ├── repository/
│   │   └── UserRepository.java  # JPA Repository
│   ├── entity/              # Database Entity (includes Reference Tables)
│   ├── dto/                 # Data Transfer Object (API)
│   ├── exception/           # Exception Handling
│   └── config/              # Configuration (CORS, Security...)
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/            # Pages (Next.js 14 App Router)
│   ├── components/     # Reusable UI Components
│   ├── services/       # API Service Layer (includes referenceService)
│   └── types/          # TypeScript Interfaces
├── package.json
└── next.config.js
```

---

## 🚀 BƯỚC 1: CÀI ĐẶT DATABASE

### 1.1. Yêu cầu

- **SQL Server 2019+** ([Download](https://www.microsoft.com/sql-server))
- **SSMS** (SQL Server Management Studio) - Optional nhưng recommended

### 1.2. Tạo Database với Reference Tables

**Cấu trúc mới bao gồm:**

- ✅ Reference Tables cho Brands, Models, Campuses, Buildings, Rooms
- ✅ Foreign Keys để đảm bảo data integrity
- ✅ Views và Stored Procedures cho cascade loading

**Chạy theo thứ tự:**

```powershell
# Option A: Chạy trực tiếp từ PowerShell
cd script/database

# 1. Tạo schema với reference tables
sqlcmd -S localhost -i database_schema_sqlserver.sql

# 2. Populate reference data + seed data
sqlcmd -S localhost -d HCMSIU_SSPS -i database_seed_data.sql
```

```sql
-- Option B: Chạy trong SSMS (SQL Server Management Studio)
-- 1. Mở SSMS, connect to localhost
-- 2. File > Open > File > chọn database_schema_sqlserver.sql
-- 3. Execute (F5)
-- 4. File > Open > File > chọn database_seed_data.sql
-- 5. Execute (F5)
```

**Kiểm tra kết quả:**

```sql
USE HCMSIU_SSPS;

-- Kiểm tra reference tables
SELECT COUNT(*) AS BrandsCount FROM Brands;           -- Should be 8
SELECT COUNT(*) AS ModelsCount FROM PrinterModels;    -- Should be 23
SELECT COUNT(*) AS CampusesCount FROM Campuses;       -- Should be 2
SELECT COUNT(*) AS BuildingsCount FROM Buildings;     -- Should be 6
SELECT COUNT(*) AS RoomsCount FROM Rooms;             -- Should be 18

-- Xem printers với full location info
SELECT * FROM vw_PrinterDetails;

-- Test cascade queries
EXEC sp_GetBuildingsByCampus @CampusID = 1;
EXEC sp_GetRoomsByBuilding @BuildingID = 1;
EXEC sp_GetModelsByBrand @BrandID = 1;
```

### 1.3. Migration từ Database Cũ (Optional)

Nếu bạn đã có database với cấu trúc cũ (text fields):

```powershell
# 1. Backup dữ liệu cũ
sqlcmd -S localhost -d HCMSIU_SSPS -i migrate_to_reference_tables.sql

# 2. Làm theo hướng dẫn trong script
# 3. Run schema mới
# 4. Uncomment phần restore data trong migrate script
```

---

## 🚀 BƯỚC 2: CÀI ĐẶT BACKEND (Java Spring Boot)

```sql
CREATE DATABASE your_database;
```

2. Cập nhật file `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=your_database;encrypt=true;trustServerCertificate=true
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 1.3. Chạy Backend

```powershell
cd backend

# Cài đặt dependencies
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

✅ Backend chạy tại: **http://localhost:8080**

### 1.4. Test API

```powershell
# GET all users
curl http://localhost:8080/api/users

# POST create user
curl -X POST http://localhost:8080/api/users `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","fullName":"Test User"}'
```

---

## 🎨 BƯỚC 2: CÀI ĐẶT FRONTEND (Next.js)

### 2.1. Yêu cầu

- **Node.js 18+** ([Download](https://nodejs.org/))

### 2.2. Cài đặt Dependencies

```powershell
cd frontend

# Cài đặt packages
npm install
```

### 2.3. Cấu hình API URL (Optional)

Nếu Backend không chạy ở `localhost:8080`, tạo file `.env.local`:

```env
API_BASE_URL=http://your-backend-url:8080/api
```

### 2.4. Chạy Frontend

```powershell
npm run dev
```

✅ Frontend chạy tại: **http://localhost:3000**

---

## 📂 BƯỚC 3: HIỂU CẤU TRÚC CODE

### Backend Flow (Request → Response)

```
1. Client gửi HTTP Request
   ↓
2. Controller nhận request (@RestController)
   - Validate input (@Valid)
   - Gọi Service
   ↓
3. Service xử lý Business Logic (@Service)
   - Transaction Management (@Transactional)
   - Gọi Repository
   ↓
4. Repository truy vấn Database (@Repository)
   - JPA/Hibernate tự động sinh SQL
   ↓
5. Trả về DTO (KHÔNG trả Entity)
   - Controller trả ResponseEntity<DTO>
```

### Frontend Flow (User → API)

```
1. User tương tác UI (Component)
   ↓
2. Component gọi Service
   ↓
3. Service gọi API Backend (Axios)
   ↓
4. Nhận Response (Type-safe với TypeScript)
   ↓
5. Update UI State
```

---

## 🔐 QUY TẮC CODE (Theo rule.md)

### Backend ✅

- ❌ **KHÔNG** viết logic nghiệp vụ trong Controller
- ✅ Sử dụng Interface cho Service (IUserService → UserServiceImpl)
- ✅ Tách Interface và Implementation vào folder riêng
- ✅ Sử dụng `@Valid` để validate input
- ✅ Sử dụng `@Transactional` trong Service
- ✅ Mapping Entity ↔ DTO tại Service
- ✅ Exception Handler bằng `@ControllerAdvice`
- ✅ KHÔNG log thông tin nhạy cảm (password, token)

### Frontend ✅

- ✅ Tách Component nhỏ, tái sử dụng
- ✅ Type Definitions khớp với Backend DTO
- ✅ Xử lý lỗi hiển thị cho User
- ✅ Validate input ở Client (giảm tải Server)

---

## 📝 BƯỚC 4: THÊM CHỨC NĂNG MỚI

### Ví dụ: Thêm Entity "Product"

#### 4.1. Backend

```java
// 1. Entity
@Entity
@Table(name = "products")
public class Product { ... }

// 2. Repository
public interface ProductRepository extends JpaRepository<Product, Long> { }

// 3. Service Interface
public interface IProductService { ... }

// 4. Service Implementation
@Service
public class ProductServiceImpl implements IProductService { ... }

// 5. Controller
@RestController
public class ProductController {
    private final IProductService productService;
}
@RestController
@RequestMapping("/api/products")
public class ProductController { ... }
```

#### 4.2. Frontend

```typescript
// 1. Type
export interface Product { ... }

// 2. Service
export const productService = { ... }

// 3. Component
export default function ProductList() { ... }
```

---

## 🐛 TROUBLESHOOTING

### Lỗi Backend không kết nối Database

- Kiểm tra SQL Server đã chạy chưa
- Kiểm tra username/password trong `application.properties`
- Thử kết nối thủ công bằng SQL Server Management Studio

### Lỗi Frontend không gọi được API

- Kiểm tra Backend đã chạy tại `localhost:8080`
- Kiểm tra CORS config trong `WebConfig.java`
- Xem Console log trong Browser (F12)

### Lỗi Maven build

```powershell
# Xóa cache và rebuild
mvn clean
mvn install -U
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [JPA/Hibernate Guide](https://hibernate.org/orm/documentation/)
- Clean Code Principles (file `document/rule.md`)

---

## 🎯 CHECKLIST HOÀN THÀNH

- [ ] Backend chạy thành công tại `localhost:8080`
- [ ] Database kết nối OK, tạo được bảng `users`
- [ ] API `/api/users` hoạt động (GET/POST/PUT/DELETE)
- [ ] Frontend chạy thành công tại `localhost:3000`
- [ ] UI có thể CRUD users thành công
- [ ] Code tuân thủ quy tắc Layered Architecture

**Chúc bạn code thành công! 🚀**
