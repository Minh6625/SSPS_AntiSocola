# Database Reference Tables - Implementation Guide

## Tổng quan

Document này hướng dẫn cách sử dụng các bảng tham chiếu (Reference Tables) cho Printer Management để đảm bảo tính nhất quán dữ liệu và cải thiện trải nghiệm người dùng.

## 1. Kiến trúc Database

### Bảng tham chiếu được tạo:

```
Brands (Thương hiệu)
  └── PrinterModels (Model máy in - phụ thuộc Brand)

Campuses (Campus)
  └── Buildings (Tòa nhà - phụ thuộc Campus)
       └── Rooms (Phòng - phụ thuộc Building)

Printers (Máy in)
  ├── BrandID → Brands
  ├── ModelID → PrinterModels
  └── RoomID → Rooms (tự động có Campus, Building)
```

### Lợi ích:

1. **Data Consistency**: Tránh lỗi chính tả (HP vs hp vs H.P.)
2. **Dropdown UX**: Người dùng chọn từ danh sách có sẵn thay vì gõ tay
3. **Data Integrity**: Foreign keys đảm bảo quan hệ hợp lệ
4. **Hierarchical Selection**: Campus → Building → Room (cascade)
5. **Easy Reporting**: Join tables dễ dàng cho báo cáo
6. **Defaults from Model**: Mỗi model có cấu hình mặc định (paper sizes, color, duplex)

## 2. Migration Steps

### Option A: Fresh Installation (Recommended)

```sql
-- 1. Chạy schema gốc (nếu chưa có)
USE master;
GO
-- Tạo database và các bảng cơ bản

-- 2. Chạy reference tables schema
sqlcmd -S localhost -d HCMSIU_SSPS -i database_schema_reference_tables.sql

-- 3. Seed reference data
sqlcmd -S localhost -d HCMSIU_SSPS -i database_seed_reference_data.sql
```

### Option B: Migrate Existing Data

Nếu bạn đã có dữ liệu Printers cũ:

```sql
-- 1. Backup dữ liệu cũ
SELECT * INTO Printers_Backup FROM Printers;

-- 2. Tạo reference tables
-- Chạy: database_schema_reference_tables.sql

-- 3. Seed reference data
-- Chạy: database_seed_reference_data.sql

-- 4. Migrate data từ Printers_Backup sang Printers mới
-- (Cần mapping Brand text → BrandID, Campus/Building/Room → RoomID)
-- Xem migration script riêng nếu cần
```

## 3. Backend Implementation

### 3.1 Entity Classes

Tạo các entity mới trong `backend/src/main/java/com/example/app/entity/`:

```java
// Brand.java
@Entity
@Table(name = "Brands")
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer brandId;

    @Column(nullable = false, unique = true, length = 50)
    private String brandName;

    private String brandDescription;

    private Boolean isActive = true;

    @OneToMany(mappedBy = "brand")
    private List<PrinterModel> models;

    // Getters, setters...
}

// PrinterModel.java
@Entity
@Table(name = "PrinterModels")
public class PrinterModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer modelId;

    @ManyToOne
    @JoinColumn(name = "BrandID", nullable = false)
    private Brand brand;

    @Column(nullable = false, length = 100)
    private String modelName;

    private String defaultPaperSizes;
    private Boolean defaultColorPrinting = false;
    private Boolean defaultDuplexPrinting = true;
    private Boolean isActive = true;

    // Getters, setters...
}

// Campus.java
@Entity
@Table(name = "Campuses")
public class Campus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer campusId;

    @Column(nullable = false, unique = true, length = 20)
    private String campusCode;

    @Column(nullable = false, length = 100)
    private String campusName;

    private String address;
    private Boolean isActive = true;

    @OneToMany(mappedBy = "campus")
    private List<Building> buildings;

    // Getters, setters...
}

// Building.java
@Entity
@Table(name = "Buildings")
public class Building {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer buildingId;

    @ManyToOne
    @JoinColumn(name = "CampusID", nullable = false)
    private Campus campus;

    @Column(nullable = false, length = 20)
    private String buildingCode;

    private String buildingName;
    private Integer floorCount;
    private Boolean isActive = true;

    @OneToMany(mappedBy = "building")
    private List<Room> rooms;

    // Getters, setters...
}

// Room.java
@Entity
@Table(name = "Rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roomId;

    @ManyToOne
    @JoinColumn(name = "BuildingID", nullable = false)
    private Building building;

    @Column(nullable = false, length = 20)
    private String roomNumber;

    private String roomName;
    private String roomType;
    private Integer capacity;
    private Boolean isActive = true;

    // Getters, setters...
}

// Printer.java (updated)
@Entity
@Table(name = "Printers")
public class Printer {
    @Id
    @Column(length = 20)
    private String printerId;

    @Column(nullable = false, length = 100)
    private String printerName;

    @ManyToOne
    @JoinColumn(name = "BrandID", nullable = false)
    private Brand brand;  // Changed from String to Brand

    @ManyToOne
    @JoinColumn(name = "ModelID", nullable = false)
    private PrinterModel model;  // Changed from String to PrinterModel

    @ManyToOne
    @JoinColumn(name = "RoomID", nullable = false)
    private Room room;  // New: replaces campus/building/roomNumber strings

    private String ipAddress;
    private String paperSizes;
    private Boolean colorPrinting;
    private Boolean duplexPrinting;

    // ... other fields

    // Helper method to get location string
    @Transient
    public String getLocation() {
        if (room != null && room.getBuilding() != null && room.getBuilding().getCampus() != null) {
            return String.format("%s - %s - %s",
                room.getBuilding().getCampus().getCampusName(),
                room.getBuilding().getBuildingCode(),
                room.getRoomNumber());
        }
        return "";
    }
}
```

### 3.2 Repository Interfaces

```java
// BrandRepository.java
public interface BrandRepository extends JpaRepository<Brand, Integer> {
    List<Brand> findByIsActiveTrue();
    Optional<Brand> findByBrandName(String brandName);
}

// PrinterModelRepository.java
public interface PrinterModelRepository extends JpaRepository<PrinterModel, Integer> {
    List<PrinterModel> findByBrandAndIsActiveTrue(Brand brand);
    List<PrinterModel> findByBrandBrandIdAndIsActiveTrue(Integer brandId);
}

// CampusRepository.java
public interface CampusRepository extends JpaRepository<Campus, Integer> {
    List<Campus> findByIsActiveTrue();
    Optional<Campus> findByCampusCode(String campusCode);
}

// BuildingRepository.java
public interface BuildingRepository extends JpaRepository<Building, Integer> {
    List<Building> findByCampusAndIsActiveTrue(Campus campus);
    List<Building> findByCampusCampusIdAndIsActiveTrue(Integer campusId);
}

// RoomRepository.java
public interface RoomRepository extends JpaRepository<Room, Integer> {
    List<Room> findByBuildingAndIsActiveTrue(Building building);
    List<Room> findByBuildingBuildingIdAndIsActiveTrue(Integer buildingId);
}
```

### 3.3 REST APIs

Tạo controller mới `ReferenceDataController.java`:

```java
@RestController
@RequestMapping("/api/reference")
public class ReferenceDataController {

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private PrinterModelRepository modelRepository;

    @Autowired
    private CampusRepository campusRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private RoomRepository roomRepository;

    // GET /api/reference/brands
    @GetMapping("/brands")
    public ResponseEntity<List<Brand>> getBrands() {
        return ResponseEntity.ok(brandRepository.findByIsActiveTrue());
    }

    // GET /api/reference/models?brandId=1
    @GetMapping("/models")
    public ResponseEntity<List<PrinterModel>> getModelsByBrand(
            @RequestParam(required = false) Integer brandId) {
        if (brandId != null) {
            return ResponseEntity.ok(
                modelRepository.findByBrandBrandIdAndIsActiveTrue(brandId));
        }
        return ResponseEntity.ok(modelRepository.findAll());
    }

    // GET /api/reference/campuses
    @GetMapping("/campuses")
    public ResponseEntity<List<Campus>> getCampuses() {
        return ResponseEntity.ok(campusRepository.findByIsActiveTrue());
    }

    // GET /api/reference/buildings?campusId=1
    @GetMapping("/buildings")
    public ResponseEntity<List<Building>> getBuildingsByCampus(
            @RequestParam(required = false) Integer campusId) {
        if (campusId != null) {
            return ResponseEntity.ok(
                buildingRepository.findByCampusCampusIdAndIsActiveTrue(campusId));
        }
        return ResponseEntity.ok(buildingRepository.findAll());
    }

    // GET /api/reference/rooms?buildingId=1
    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getRoomsByBuilding(
            @RequestParam(required = false) Integer buildingId) {
        if (buildingId != null) {
            return ResponseEntity.ok(
                roomRepository.findByBuildingBuildingIdAndIsActiveTrue(buildingId));
        }
        return ResponseEntity.ok(roomRepository.findAll());
    }
}
```

### 3.4 Update PrinterService

```java
@Service
public class PrinterService {

    @Autowired
    private PrinterRepository printerRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private PrinterModelRepository modelRepository;

    @Autowired
    private RoomRepository roomRepository;

    public Printer createPrinter(PrinterDTO dto) {
        Printer printer = new Printer();
        printer.setPrinterId(generatePrinterId());
        printer.setPrinterName(dto.getPrinterName());

        // Lookup foreign key references
        Brand brand = brandRepository.findById(dto.getBrandId())
            .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        printer.setBrand(brand);

        PrinterModel model = modelRepository.findById(dto.getModelId())
            .orElseThrow(() -> new ResourceNotFoundException("Model not found"));
        printer.setModel(model);

        Room room = roomRepository.findById(dto.getRoomId())
            .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        printer.setRoom(room);

        // Set other fields
        printer.setIpAddress(dto.getIpAddress());
        printer.setPaperSizes(dto.getPaperSizes());
        printer.setColorPrinting(dto.getColorPrinting());
        printer.setDuplexPrinting(dto.getDuplexPrinting());
        printer.setStatus(dto.getStatus());

        return printerRepository.save(printer);
    }
}
```

## 4. Frontend Implementation

### 4.1 Create Reference Service

Tạo file `frontend/src/services/referenceService.ts`:

```typescript
import apiClient from "../config/axios";

export interface Brand {
  brandId: number;
  brandName: string;
  brandDescription?: string;
  isActive: boolean;
}

export interface PrinterModel {
  modelId: number;
  brandId: number;
  brandName: string;
  modelName: string;
  modelDescription?: string;
  defaultPaperSizes: string;
  defaultColorPrinting: boolean;
  defaultDuplexPrinting: boolean;
  isActive: boolean;
}

export interface Campus {
  campusId: number;
  campusCode: string;
  campusName: string;
  address?: string;
  isActive: boolean;
}

export interface Building {
  buildingId: number;
  campusId: number;
  campusCode: string;
  campusName: string;
  buildingCode: string;
  buildingName?: string;
  floorCount?: number;
  isActive: boolean;
}

export interface Room {
  roomId: number;
  buildingId: number;
  buildingCode: string;
  buildingName?: string;
  campusCode: string;
  campusName: string;
  roomNumber: string;
  roomName?: string;
  roomType?: string;
  capacity?: number;
  isActive: boolean;
}

export const referenceService = {
  // Get all brands
  getBrands: async (): Promise<Brand[]> => {
    const response = await apiClient.get("/api/reference/brands");
    return response.data;
  },

  // Get models by brand
  getModelsByBrand: async (brandId?: number): Promise<PrinterModel[]> => {
    const response = await apiClient.get("/api/reference/models", {
      params: brandId ? { brandId } : {},
    });
    return response.data;
  },

  // Get all campuses
  getCampuses: async (): Promise<Campus[]> => {
    const response = await apiClient.get("/api/reference/campuses");
    return response.data;
  },

  // Get buildings by campus
  getBuildingsByCampus: async (campusId?: number): Promise<Building[]> => {
    const response = await apiClient.get("/api/reference/buildings", {
      params: campusId ? { campusId } : {},
    });
    return response.data;
  },

  // Get rooms by building
  getRoomsByBuilding: async (buildingId?: number): Promise<Room[]> => {
    const response = await apiClient.get("/api/reference/rooms", {
      params: buildingId ? { buildingId } : {},
    });
    return response.data;
  },
};
```

### 4.2 Update Printer Form Component

Update `frontend/src/app/spso/printers/page.tsx` để sử dụng dropdowns:

```typescript
"use client";

import { useState, useEffect } from "react";
import { printerService } from "@/services/printerService";
import {
  referenceService,
  Brand,
  PrinterModel,
  Campus,
  Building,
  Room,
} from "@/services/referenceService";

export default function PrintersPage() {
  // Reference data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<PrinterModel[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Form data (updated to use IDs)
  const [formData, setFormData] = useState({
    printerName: "",
    brandId: 0,
    modelId: 0,
    campusId: 0,
    buildingId: 0,
    roomId: 0,
    ipAddress: "",
    paperSizes: "A4",
    colorPrinting: false,
    duplexPrinting: true,
    status: "Active",
    lastMaintenanceDate: "",
  });

  // Load reference data on mount
  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [brandsData, campusesData] = await Promise.all([
        referenceService.getBrands(),
        referenceService.getCampuses(),
      ]);
      setBrands(brandsData);
      setCampuses(campusesData);
    } catch (error) {
      console.error("Error loading reference data:", error);
    }
  };

  // When brand changes, load models
  const handleBrandChange = async (brandId: number) => {
    setFormData({ ...formData, brandId, modelId: 0 });
    if (brandId > 0) {
      const modelsData = await referenceService.getModelsByBrand(brandId);
      setModels(modelsData);

      // Auto-fill defaults if model selected
      if (modelsData.length > 0) {
        const defaultModel = modelsData[0];
        setFormData((prev) => ({
          ...prev,
          paperSizes: defaultModel.defaultPaperSizes,
          colorPrinting: defaultModel.defaultColorPrinting,
          duplexPrinting: defaultModel.defaultDuplexPrinting,
        }));
      }
    } else {
      setModels([]);
    }
  };

  // When campus changes, load buildings
  const handleCampusChange = async (campusId: number) => {
    setFormData({ ...formData, campusId, buildingId: 0, roomId: 0 });
    if (campusId > 0) {
      const buildingsData = await referenceService.getBuildingsByCampus(
        campusId
      );
      setBuildings(buildingsData);
    } else {
      setBuildings([]);
      setRooms([]);
    }
  };

  // When building changes, load rooms
  const handleBuildingChange = async (buildingId: number) => {
    setFormData({ ...formData, buildingId, roomId: 0 });
    if (buildingId > 0) {
      const roomsData = await referenceService.getRoomsByBuilding(buildingId);
      setRooms(roomsData);
    } else {
      setRooms([]);
    }
  };

  // When model changes, auto-fill defaults
  const handleModelChange = (modelId: number) => {
    setFormData({ ...formData, modelId });
    const selectedModel = models.find((m) => m.modelId === modelId);
    if (selectedModel) {
      setFormData((prev) => ({
        ...prev,
        modelId,
        paperSizes: selectedModel.defaultPaperSizes,
        colorPrinting: selectedModel.defaultColorPrinting,
        duplexPrinting: selectedModel.defaultDuplexPrinting,
      }));
    }
  };

  return (
    <div className="p-6">
      {/* Add/Edit Modal */}
      <div className="modal">
        {/* Brand Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Thương hiệu <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.brandId}
            onChange={(e) => handleBrandChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
            required
          >
            <option value={0}>-- Chọn thương hiệu --</option>
            {brands.map((brand) => (
              <option key={brand.brandId} value={brand.brandId}>
                {brand.brandName}
              </option>
            ))}
          </select>
        </div>

        {/* Model Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Model <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.modelId}
            onChange={(e) => handleModelChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
            required
            disabled={!formData.brandId}
          >
            <option value={0}>-- Chọn model --</option>
            {models.map((model) => (
              <option key={model.modelId} value={model.modelId}>
                {model.modelName}
              </option>
            ))}
          </select>
          {formData.brandId > 0 && models.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Không có model cho thương hiệu này
            </p>
          )}
        </div>

        {/* Campus Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Campus <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.campusId}
            onChange={(e) => handleCampusChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
            required
          >
            <option value={0}>-- Chọn campus --</option>
            {campuses.map((campus) => (
              <option key={campus.campusId} value={campus.campusId}>
                {campus.campusName} ({campus.campusCode})
              </option>
            ))}
          </select>
        </div>

        {/* Building Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Tòa nhà <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.buildingId}
            onChange={(e) => handleBuildingChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
            required
            disabled={!formData.campusId}
          >
            <option value={0}>-- Chọn tòa nhà --</option>
            {buildings.map((building) => (
              <option key={building.buildingId} value={building.buildingId}>
                {building.buildingCode}{" "}
                {building.buildingName && `- ${building.buildingName}`}
              </option>
            ))}
          </select>
        </div>

        {/* Room Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Phòng <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.roomId}
            onChange={(e) =>
              setFormData({ ...formData, roomId: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
            required
            disabled={!formData.buildingId}
          >
            <option value={0}>-- Chọn phòng --</option>
            {rooms.map((room) => (
              <option key={room.roomId} value={room.roomId}>
                {room.roomNumber} {room.roomName && `- ${room.roomName}`} (
                {room.roomType})
              </option>
            ))}
          </select>
        </div>

        {/* Other fields remain the same... */}
      </div>
    </div>
  );
}
```

## 5. Testing

### 5.1 Database Testing

```sql
-- Test brand and models
SELECT b.BrandName, m.ModelName, m.DefaultPaperSizes
FROM PrinterModels m
JOIN Brands b ON m.BrandID = b.BrandID
WHERE b.IsActive = 1 AND m.IsActive = 1;

-- Test campus hierarchy
SELECT c.CampusName, b.BuildingCode, r.RoomNumber, r.RoomType
FROM Rooms r
JOIN Buildings b ON r.BuildingID = b.BuildingID
JOIN Campuses c ON b.CampusID = c.CampusID
WHERE c.IsActive = 1;

-- Test printer with full location
SELECT * FROM vw_PrinterDetails;
```

### 5.2 API Testing

```bash
# Test brands
curl http://localhost:8080/api/reference/brands

# Test models by brand
curl http://localhost:8080/api/reference/models?brandId=1

# Test campuses
curl http://localhost:8080/api/reference/campuses

# Test buildings by campus
curl http://localhost:8080/api/reference/buildings?campusId=1

# Test rooms by building
curl http://localhost:8080/api/reference/rooms?buildingId=1
```

## 6. Benefits Summary

### Before (String fields):

```
Brand: "HP" vs "hp" vs "H.P." vs "Hewlett Packard" ❌
Campus: "Di An" vs "Dĩ An" vs "di an" ❌
```

### After (Reference tables):

```
Brand: Select from dropdown (HP, Canon, Epson...) ✅
Campus: Select from dropdown (Campus Dĩ An, Campus Linh Trung...) ✅
Model: Auto-load based on Brand selection ✅
Building: Auto-load based on Campus selection ✅
Room: Auto-load based on Building selection ✅
Defaults: Auto-fill paper sizes, color, duplex from Model ✅
```

## 7. Next Steps

1. ✅ Database schema created
2. ✅ Seed data created
3. ⏳ Run migration scripts
4. ⏳ Create backend entities & repositories
5. ⏳ Create reference data APIs
6. ⏳ Update printer service
7. ⏳ Update frontend forms with dropdowns
8. ⏳ Test end-to-end workflow

---

**Tác giả:** BA Team  
**Ngày tạo:** December 19, 2025  
**Version:** 1.0
