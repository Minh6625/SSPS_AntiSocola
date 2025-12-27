# Location Management Module - README

## 📋 Tổng quan

Module quản lý vị trí máy in cho hệ thống SPSS SIU, cho phép SPSO quản lý cấu trúc địa điểm theo 3 cấp độ:

- **Cơ sở (Campus)**: Các cơ sở của trường
- **Tòa nhà (Building)**: Các tòa nhà trong mỗi cơ sở
- **Phòng (Room)**: Các phòng trong mỗi tòa nhà

## ✅ Checklist - Đã hoàn thành

### Backend (Java/Spring Boot)

#### Controller Layer

- [x] `LocationController.java` - REST API endpoints
  - [x] Campus CRUD endpoints
  - [x] Building CRUD endpoints
  - [x] Room CRUD endpoints
  - [x] Swagger/OpenAPI documentation
  - [x] CORS configuration
  - [x] Exception handling

#### Service Layer

- [x] `ILocationService.java` - Service interface
  - [x] Campus methods
  - [x] Building methods
  - [x] Room methods
- [x] `LocationServiceImpl.java` - Service implementation
  - [x] Business logic
  - [x] Transaction management (@Transactional)
  - [x] Validation logic
  - [x] Exception handling
  - [x] Entity ↔ DTO conversion
  - [x] Logging

#### DTO Layer

- [x] `CampusRequestDTO.java` - Request DTO với validation
- [x] `BuildingRequestDTO.java` - Request DTO với validation
- [x] `RoomRequestDTO.java` - Request DTO với validation
- [x] `BuildingDTO.java` - Response DTO
- [x] `RoomDTO.java` - Response DTO
- [x] `CampusDTO.java` - Updated với trường isActive

#### Repository Layer

- [x] Sử dụng repositories có sẵn
  - [x] CampusRepository
  - [x] BuildingRepository
  - [x] RoomRepository

### Frontend (Next.js/React/TypeScript)

#### Services

- [x] `locationService.ts` - API client
  - [x] Campus API calls
  - [x] Building API calls
  - [x] Room API calls
  - [x] TypeScript types

#### Pages

- [x] `/spso/locations/page.tsx` - Main page
  - [x] Tab navigation (Campus, Building, Room)
  - [x] Table views
  - [x] Modal forms (Create/Edit)
  - [x] Delete confirmation
  - [x] Error handling
  - [x] Loading states

#### Components

- [x] `SPSOLayout.tsx` - Updated sidebar
  - [x] "Vị trí máy in" menu item
  - [x] Location icon
  - [x] Active state highlighting

### Documentation

- [x] `LOCATION_MANAGEMENT_GUIDE.md` - Hướng dẫn chi tiết
- [x] `LOCATION_ARCHITECTURE.md` - Kiến trúc và design patterns
- [x] `SUMMARY_LOCATION_MANAGEMENT.md` - Tóm tắt
- [x] `LOCATION_MANAGEMENT_README.md` - File này

### Testing & Quality

- [x] No Java compilation errors
- [x] No TypeScript errors
- [x] Follows Layered Architecture pattern
- [x] Proper separation of concerns
- [x] Code documentation (JavaDoc, comments)

## 📁 File Structure

```
backend/src/main/java/com/example/app/
├── controller/
│   └── LocationController.java          ✅ REST API endpoints
├── service/
│   ├── interfaces/
│   │   └── ILocationService.java        ✅ Service interface
│   └── impl/
│       └── LocationServiceImpl.java     ✅ Service implementation
├── dto/
│   ├── CampusRequestDTO.java            ✅ Campus request DTO
│   ├── BuildingRequestDTO.java          ✅ Building request DTO
│   ├── RoomRequestDTO.java              ✅ Room request DTO
│   ├── CampusDTO.java                   ✅ Campus response DTO
│   ├── BuildingDTO.java                 ✅ Building response DTO
│   └── RoomDTO.java                     ✅ Room response DTO
└── repository/
    ├── CampusRepository.java            ✅ (existing)
    ├── BuildingRepository.java          ✅ (existing)
    └── RoomRepository.java              ✅ (existing)

frontend/src/
├── services/
│   └── locationService.ts               ✅ API client
├── app/spso/locations/
│   └── page.tsx                         ✅ Main page
└── components/
    └── SPSOLayout.tsx                   ✅ Updated sidebar

document/
├── LOCATION_MANAGEMENT_GUIDE.md         ✅ User guide
├── LOCATION_ARCHITECTURE.md             ✅ Architecture docs
├── SUMMARY_LOCATION_MANAGEMENT.md       ✅ Summary
└── LOCATION_MANAGEMENT_README.md        ✅ This file
```

## 🚀 Quick Start

### 1. Backend Setup

Không cần setup gì thêm! Module đã tích hợp sẵn vào project.

**Kiểm tra**:

```bash
# Compile backend
cd backend
mvn clean compile

# Run backend
mvn spring-boot:run
```

**API sẽ available tại**:

- Base URL: `http://localhost:8080/api/locations`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 2. Frontend Setup

Không cần setup gì thêm! Module đã tích hợp sẵn.

**Kiểm tra**:

```bash
# Install dependencies (nếu chưa)
cd frontend
npm install

# Run frontend
npm run dev
```

**Frontend sẽ available tại**:

- URL: `http://localhost:3000`
- Location page: `http://localhost:3000/spso/locations`

### 3. Sử dụng

1. Đăng nhập với tài khoản SPSO
2. Click menu "Vị trí máy in" trong sidebar
3. Chọn tab (Cơ sở/Tòa nhà/Phòng)
4. Thực hiện CRUD operations

## 📚 Documentation

### Cho Developers

- **Architecture**: Đọc `LOCATION_ARCHITECTURE.md` để hiểu kiến trúc
- **API Reference**: Xem Swagger UI hoặc `LOCATION_MANAGEMENT_GUIDE.md`
- **Code Examples**: Xem trong các file implementation

### Cho Users

- **User Guide**: Đọc `LOCATION_MANAGEMENT_GUIDE.md`
- **Quick Reference**: Xem `SUMMARY_LOCATION_MANAGEMENT.md`

## 🔧 API Endpoints

### Campus

```
GET    /api/locations/campuses       - Lấy danh sách
POST   /api/locations/campuses       - Tạo mới
PUT    /api/locations/campuses/{id}  - Cập nhật
DELETE /api/locations/campuses/{id}  - Xóa
```

### Building

```
GET    /api/locations/buildings       - Lấy danh sách
POST   /api/locations/buildings       - Tạo mới
PUT    /api/locations/buildings/{id}  - Cập nhật
DELETE /api/locations/buildings/{id}  - Xóa
```

### Room

```
GET    /api/locations/rooms       - Lấy danh sách
POST   /api/locations/rooms       - Tạo mới
PUT    /api/locations/rooms/{id}  - Cập nhật
DELETE /api/locations/rooms/{id}  - Xóa
```

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│  Controller Layer               │
│  - REST API endpoints           │
│  - Input validation             │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  Service Layer                  │
│  - Business logic               │
│  - Transaction management       │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  Repository Layer               │
│  - Data access                  │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│  Database                       │
└─────────────────────────────────┘
```

## ✨ Features

- ✅ Full CRUD operations cho Campus, Building, Room
- ✅ Hierarchical structure (Campus → Building → Room)
- ✅ Input validation (Bean Validation + Business rules)
- ✅ Transaction management
- ✅ Exception handling
- ✅ Responsive UI với tabs
- ✅ Modal forms
- ✅ Status badges
- ✅ Confirmation dialogs
- ✅ Error messages
- ✅ Loading states

## 🧪 Testing

### Manual Testing

1. **Test Campus CRUD**

   ```
   ✅ Create campus
   ✅ Update campus
   ✅ Delete campus
   ✅ List campuses
   ✅ Validate duplicate code
   ```

2. **Test Building CRUD**

   ```
   ✅ Create building
   ✅ Update building
   ✅ Delete building
   ✅ List buildings
   ✅ Validate campus exists
   ```

3. **Test Room CRUD**
   ```
   ✅ Create room
   ✅ Update room
   ✅ Delete room
   ✅ List rooms
   ✅ Validate building exists
   ```

### Automated Testing (Future)

- Unit tests cho Service layer
- Integration tests cho Controller
- E2E tests cho UI

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Compilation errors

```bash
# Solution: Clean and rebuild
mvn clean compile
```

**Problem**: Database connection errors

```bash
# Solution: Check application.properties
# Verify database is running
```

### Frontend Issues

**Problem**: TypeScript errors

```bash
# Solution: Rebuild
npm run build
```

**Problem**: API calls failing

```bash
# Solution: Check backend is running
# Verify API_BASE_URL in .env.local
```

## 📝 Notes

- Module này chỉ dành cho SPSO role
- Cần đăng nhập để truy cập
- Xóa location có thể ảnh hưởng đến printers đang sử dụng
- Mã cơ sở phải unique

## 🔮 Future Enhancements

- [ ] Search & Filter
- [ ] Pagination
- [ ] Bulk operations
- [ ] Import/Export Excel
- [ ] Hierarchy tree view
- [ ] Map integration
- [ ] Audit trail
- [ ] Soft delete

## 👥 Contributors

- Backend: Layered Architecture implementation
- Frontend: React/TypeScript with Next.js
- Documentation: Comprehensive guides

## 📄 License

Part of SPSS SIU project

---

**Last Updated**: December 27, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
