# Hướng dẫn Quản lý Vị trí Máy in

## Tổng quan

Chức năng quản lý vị trí máy in cho phép SPSO quản lý cấu trúc địa điểm của hệ thống in theo 3 cấp độ:

- **Cơ sở (Campus)**: Các cơ sở của trường (VD: Cơ sở 1, Cơ sở 2)
- **Tòa nhà (Building)**: Các tòa nhà trong mỗi cơ sở (VD: A, B, C, H1, H2, H3, H6)
- **Phòng (Room)**: Các phòng trong mỗi tòa nhà (VD: A101, B201, H6-101)

## Cấu trúc dữ liệu

### Campus (Cơ sở)

```typescript
{
  campusId: number;
  campusCode: string;      // Mã cơ sở (VD: "CS1", "CS2")
  campusName: string;      // Tên cơ sở (VD: "Cơ sở 1", "Cơ sở 2")
  address?: string;        // Địa chỉ
  isActive: boolean;       // Trạng thái hoạt động
}
```

### Building (Tòa nhà)

```typescript
{
  buildingId: number;
  campusId: number;        // ID cơ sở
  campusName?: string;     // Tên cơ sở (hiển thị)
  buildingCode: string;    // Mã tòa nhà (VD: "A", "B", "H6")
  buildingName?: string;   // Tên tòa nhà (VD: "Tòa A", "Tòa H6")
  floorCount?: number;     // Số tầng
  isActive: boolean;       // Trạng thái hoạt động
}
```

### Room (Phòng)

```typescript
{
  roomId: number;
  buildingId: number;      // ID tòa nhà
  buildingName?: string;   // Tên tòa nhà (hiển thị)
  roomNumber: string;      // Số phòng (VD: "101", "201", "H6-101")
  roomName?: string;       // Tên phòng (VD: "Phòng máy 1")
  roomType?: string;       // Loại phòng (VD: "Phòng máy", "Thư viện")
  capacity?: number;       // Sức chứa
  isActive: boolean;       // Trạng thái hoạt động
}
```

## Backend API

### Endpoints

#### Campus APIs

- `GET /api/locations/campuses` - Lấy danh sách tất cả cơ sở
- `POST /api/locations/campuses` - Tạo cơ sở mới
- `PUT /api/locations/campuses/{id}` - Cập nhật cơ sở
- `DELETE /api/locations/campuses/{id}` - Xóa cơ sở

#### Building APIs

- `GET /api/locations/buildings` - Lấy danh sách tất cả tòa nhà
- `POST /api/locations/buildings` - Tạo tòa nhà mới
- `PUT /api/locations/buildings/{id}` - Cập nhật tòa nhà
- `DELETE /api/locations/buildings/{id}` - Xóa tòa nhà

#### Room APIs

- `GET /api/locations/rooms` - Lấy danh sách tất cả phòng
- `POST /api/locations/rooms` - Tạo phòng mới
- `PUT /api/locations/rooms/{id}` - Cập nhật phòng
- `DELETE /api/locations/rooms/{id}` - Xóa phòng

### Request/Response Format

#### Create Campus Request

```json
{
  "campusCode": "CS1",
  "campusName": "Cơ sở 1",
  "address": "268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM",
  "isActive": true
}
```

#### Create Building Request

```json
{
  "campusId": 1,
  "buildingCode": "A",
  "buildingName": "Tòa A",
  "floorCount": 5,
  "isActive": true
}
```

#### Create Room Request

```json
{
  "buildingId": 1,
  "roomNumber": "101",
  "roomName": "Phòng máy 1",
  "roomType": "Phòng máy",
  "capacity": 50,
  "isActive": true
}
```

#### Success Response

```json
{
  "success": true,
  "message": "Tạo cơ sở thành công",
  "data": {
    "campusId": 1,
    "campusCode": "CS1",
    "campusName": "Cơ sở 1",
    "address": "268 Lý Thường Kiệt...",
    "isActive": true
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Mã cơ sở đã tồn tại"
}
```

## Frontend Implementation

### Menu Navigation

Tab "Vị trí máy in" đã được thêm vào sidebar SPSO:

- Icon: Location pin icon
- Route: `/spso/locations`
- Position: Sau "Quản lý máy in", trước "Quản lý tài khoản"

### Page Structure

Trang quản lý locations có 3 tabs:

1. **Cơ sở**: Quản lý các cơ sở
2. **Tòa nhà**: Quản lý các tòa nhà
3. **Phòng**: Quản lý các phòng

### Features

#### 1. Danh sách (List View)

- Hiển thị dạng bảng với các cột thông tin
- Trạng thái hoạt động (badge màu xanh/đỏ)
- Nút "Sửa" và "Xóa" cho mỗi item

#### 2. Thêm mới (Create)

- Nút "+ Thêm mới" ở góc trên bên phải
- Modal form với các trường nhập liệu
- Validation: Các trường bắt buộc được đánh dấu \*
- Dropdown chọn cơ sở (cho Building) và tòa nhà (cho Room)

#### 3. Chỉnh sửa (Edit)

- Click nút "Sửa" để mở modal
- Form được điền sẵn dữ liệu hiện tại
- Cập nhật và lưu thay đổi

#### 4. Xóa (Delete)

- Click nút "Xóa" để xóa item
- Hiển thị confirm dialog trước khi xóa
- Xóa thành công sẽ reload danh sách

## Sử dụng

### 1. Tạo Cơ sở mới

1. Vào trang "Vị trí máy in"
2. Chọn tab "Cơ sở"
3. Click "+ Thêm mới"
4. Nhập thông tin:
   - Mã cơ sở (bắt buộc)
   - Tên cơ sở (bắt buộc)
   - Địa chỉ (tùy chọn)
   - Trạng thái hoạt động (checkbox)
5. Click "Lưu"

### 2. Tạo Tòa nhà mới

1. Chọn tab "Tòa nhà"
2. Click "+ Thêm mới"
3. Nhập thông tin:
   - Chọn cơ sở (bắt buộc)
   - Mã tòa nhà (bắt buộc)
   - Tên tòa nhà (tùy chọn)
   - Số tầng (tùy chọn)
   - Trạng thái hoạt động (checkbox)
4. Click "Lưu"

### 3. Tạo Phòng mới

1. Chọn tab "Phòng"
2. Click "+ Thêm mới"
3. Nhập thông tin:
   - Chọn tòa nhà (bắt buộc)
   - Số phòng (bắt buộc)
   - Tên phòng (tùy chọn)
   - Loại phòng (tùy chọn)
   - Sức chứa (tùy chọn)
   - Trạng thái hoạt động (checkbox)
4. Click "Lưu"

## Validation Rules

### Campus

- `campusCode`: Bắt buộc, tối đa 20 ký tự, không trùng lặp
- `campusName`: Bắt buộc, tối đa 100 ký tự
- `address`: Tùy chọn, tối đa 200 ký tự

### Building

- `campusId`: Bắt buộc, phải tồn tại trong database
- `buildingCode`: Bắt buộc, tối đa 20 ký tự
- `buildingName`: Tùy chọn, tối đa 100 ký tự
- `floorCount`: Tùy chọn, số nguyên dương

### Room

- `buildingId`: Bắt buộc, phải tồn tại trong database
- `roomNumber`: Bắt buộc, tối đa 20 ký tự
- `roomName`: Tùy chọn, tối đa 100 ký tự
- `roomType`: Tùy chọn, tối đa 50 ký tự
- `capacity`: Tùy chọn, số nguyên dương

## Database Schema

### Campuses Table

```sql
CREATE TABLE Campuses (
    CampusID INT PRIMARY KEY IDENTITY(1,1),
    CampusCode NVARCHAR(20) NOT NULL UNIQUE,
    CampusName NVARCHAR(100) NOT NULL,
    Address NVARCHAR(200),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
```

### Buildings Table

```sql
CREATE TABLE Buildings (
    BuildingID INT PRIMARY KEY IDENTITY(1,1),
    CampusID INT NOT NULL,
    BuildingCode NVARCHAR(20) NOT NULL,
    BuildingName NVARCHAR(100),
    FloorCount INT,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (CampusID) REFERENCES Campuses(CampusID),
    UNIQUE (CampusID, BuildingCode)
);
```

### Rooms Table

```sql
CREATE TABLE Rooms (
    RoomID INT PRIMARY KEY IDENTITY(1,1),
    BuildingID INT NOT NULL,
    RoomNumber NVARCHAR(20) NOT NULL,
    RoomName NVARCHAR(100),
    RoomType NVARCHAR(50),
    Capacity INT,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (BuildingID) REFERENCES Buildings(BuildingID),
    UNIQUE (BuildingID, RoomNumber)
);
```

## Files Created/Modified

### Backend

- `LocationController.java` - Controller mới cho location management
- `CampusRequestDTO.java` - DTO cho create/update campus
- `BuildingRequestDTO.java` - DTO cho create/update building
- `BuildingDTO.java` - DTO cho building response
- `RoomRequestDTO.java` - DTO cho create/update room
- `RoomDTO.java` - DTO cho room response
- `CampusDTO.java` - Updated để thêm trường isActive

### Frontend

- `locationService.ts` - Service mới cho location API calls
- `/spso/locations/page.tsx` - Trang quản lý locations với tabs
- `SPSOLayout.tsx` - Updated để thêm menu item "Vị trí máy in"

## Testing

### Manual Testing Steps

1. **Test Campus CRUD**

   - Tạo cơ sở mới
   - Sửa thông tin cơ sở
   - Xóa cơ sở
   - Kiểm tra validation

2. **Test Building CRUD**

   - Tạo tòa nhà mới (chọn cơ sở)
   - Sửa thông tin tòa nhà
   - Xóa tòa nhà
   - Kiểm tra dropdown cơ sở

3. **Test Room CRUD**

   - Tạo phòng mới (chọn tòa nhà)
   - Sửa thông tin phòng
   - Xóa phòng
   - Kiểm tra dropdown tòa nhà

4. **Test Navigation**
   - Click menu "Vị trí máy in" trong sidebar
   - Chuyển đổi giữa các tabs
   - Kiểm tra active state của menu

## Troubleshooting

### Lỗi "Không tìm thấy cơ sở"

- Kiểm tra campusId có tồn tại trong database
- Kiểm tra cơ sở có bị xóa không

### Lỗi "Mã cơ sở đã tồn tại"

- Mã cơ sở phải unique
- Sử dụng mã khác hoặc cập nhật cơ sở hiện có

### Dropdown không hiển thị dữ liệu

- Kiểm tra API `/api/locations/campuses` và `/api/locations/buildings`
- Kiểm tra console log để xem lỗi
- Kiểm tra isActive = true cho các items

## Future Enhancements

1. **Search & Filter**: Thêm tìm kiếm và lọc theo tên, mã
2. **Pagination**: Phân trang cho danh sách lớn
3. **Bulk Operations**: Xóa/cập nhật nhiều items cùng lúc
4. **Import/Export**: Import từ Excel, export ra Excel
5. **Hierarchy View**: Hiển thị cây phân cấp Campus > Building > Room
6. **Map Integration**: Tích hợp bản đồ để hiển thị vị trí
7. **Printer Assignment**: Gán máy in trực tiếp từ trang locations

## Notes

- Chức năng này chỉ dành cho SPSO
- Cần đăng nhập với role SPSO để truy cập
- Dữ liệu location được sử dụng khi tạo/cập nhật máy in
- Xóa location có thể ảnh hưởng đến máy in đang sử dụng location đó
