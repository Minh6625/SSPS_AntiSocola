# Kiến trúc Location Management Module

## Layered Architecture

Module quản lý vị trí máy in tuân thủ **Layered Architecture** chuẩn của dự án:

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer (Controller)         │
│              LocationController                  │
│  - Nhận HTTP requests                           │
│  - Validate input (@Valid)                      │
│  - Trả về responses                             │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          Business Logic Layer (Service)         │
│    ILocationService → LocationServiceImpl       │
│  - Business logic                               │
│  - Transaction management                       │
│  - Exception handling                           │
│  - Entity ↔ DTO conversion                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Data Access Layer (Repository)          │
│  CampusRepository, BuildingRepository,          │
│  RoomRepository                                 │
│  - CRUD operations                              │
│  - Custom queries                               │
│  - Spring Data JPA                              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              Database Layer                      │
│         SQL Server / PostgreSQL                  │
│  - Campuses, Buildings, Rooms tables            │
└─────────────────────────────────────────────────┘
```

## Component Details

### 1. Controller Layer

**File**: `LocationController.java`

**Responsibilities**:

- Expose REST API endpoints
- Handle HTTP requests/responses
- Input validation với Bean Validation (@Valid)
- Delegate business logic to Service layer
- Return standardized response format

**Key Features**:

- `@RestController` - REST API controller
- `@RequestMapping("/api/locations")` - Base path
- `@CrossOrigin` - CORS support
- `@Operation` - Swagger/OpenAPI documentation
- Exception handling với try-catch

**Endpoints**:

```java
// Campus
GET    /api/locations/campuses
POST   /api/locations/campuses
PUT    /api/locations/campuses/{id}
DELETE /api/locations/campuses/{id}

// Building
GET    /api/locations/buildings
POST   /api/locations/buildings
PUT    /api/locations/buildings/{id}
DELETE /api/locations/buildings/{id}

// Room
GET    /api/locations/rooms
POST   /api/locations/rooms
PUT    /api/locations/rooms/{id}
DELETE /api/locations/rooms/{id}
```

### 2. Service Layer

**Interface**: `ILocationService.java`
**Implementation**: `LocationServiceImpl.java`

**Responsibilities**:

- Implement business logic
- Transaction management với @Transactional
- Data validation và business rules
- Exception handling (BusinessException, ResourceNotFoundException)
- Convert Entity ↔ DTO
- Call Repository layer

**Key Features**:

- `@Service` - Spring service component
- `@Transactional` - Transaction management
- `@RequiredArgsConstructor` - Lombok constructor injection
- Separation of concerns (interface + implementation)

**Methods**:

```java
// Campus
List<CampusDTO> getAllCampuses()
CampusDTO createCampus(CampusRequestDTO)
CampusDTO updateCampus(Integer id, CampusRequestDTO)
void deleteCampus(Integer id)
Campus getCampusById(Integer id)

// Building
List<BuildingDTO> getAllBuildings()
BuildingDTO createBuilding(BuildingRequestDTO)
BuildingDTO updateBuilding(Integer id, BuildingRequestDTO)
void deleteBuilding(Integer id)
Building getBuildingById(Integer id)

// Room
List<RoomDTO> getAllRooms()
RoomDTO createRoom(RoomRequestDTO)
RoomDTO updateRoom(Integer id, RoomRequestDTO)
void deleteRoom(Integer id)
Room getRoomById(Integer id)
```

**Business Logic Examples**:

- Check duplicate campus code
- Validate campus exists before creating building
- Validate building exists before creating room
- Convert entities to DTOs for response

### 3. Repository Layer

**Files**:

- `CampusRepository.java` (existing)
- `BuildingRepository.java` (existing)
- `RoomRepository.java` (existing)

**Responsibilities**:

- Data access operations
- CRUD với Spring Data JPA
- Custom queries với @Query
- Relationship management

**Key Features**:

- `@Repository` - Spring repository component
- Extends `JpaRepository<Entity, ID>`
- Custom query methods
- Lazy loading support

**Example Methods**:

```java
// CampusRepository
List<Campus> findByIsActiveTrue()
Optional<Campus> findByCampusCode(String code)

// BuildingRepository
List<Building> findByCampusIdAndIsActiveTrue(Integer campusId)

// RoomRepository
List<Room> findByBuildingIdAndIsActiveTrue(Integer buildingId)
```

### 4. DTO Layer

**Request DTOs** (Input):

- `CampusRequestDTO` - Create/Update campus
- `BuildingRequestDTO` - Create/Update building
- `RoomRequestDTO` - Create/Update room

**Response DTOs** (Output):

- `CampusDTO` - Campus data
- `BuildingDTO` - Building data with campus name
- `RoomDTO` - Room data with building name

**Validation**:

```java
@NotBlank(message = "...")
@Size(max = 100, message = "...")
@NotNull(message = "...")
```

### 5. Entity Layer

**Entities** (existing):

- `Campus` - Cơ sở
- `Building` - Tòa nhà (ManyToOne → Campus)
- `Room` - Phòng (ManyToOne → Building)

**Relationships**:

```
Campus (1) ──→ (N) Building (1) ──→ (N) Room
```

## Data Flow

### Create Campus Flow

```
1. Client → POST /api/locations/campuses
   Body: { campusCode, campusName, address, isActive }

2. LocationController.createCampus()
   - Validate input (@Valid)
   - Call locationService.createCampus()

3. LocationServiceImpl.createCampus()
   - Check duplicate code
   - Create Campus entity
   - Save to database
   - Convert to CampusDTO
   - Return DTO

4. LocationController
   - Wrap DTO in response format
   - Return HTTP 200 OK

5. Client ← Response
   { success: true, message: "...", data: {...} }
```

### Get All Buildings Flow

```
1. Client → GET /api/locations/buildings

2. LocationController.getAllBuildings()
   - Call locationService.getAllBuildings()

3. LocationServiceImpl.getAllBuildings()
   - Call buildingRepository.findAll()
   - Convert entities to DTOs
   - Include campus name in DTO
   - Return List<BuildingDTO>

4. LocationController
   - Wrap DTOs in response format
   - Return HTTP 200 OK

5. Client ← Response
   { success: true, message: "...", data: [...] }
```

## Exception Handling

### Custom Exceptions

**BusinessException**:

- Thrown when business rules violated
- Example: Duplicate campus code

**ResourceNotFoundException**:

- Thrown when entity not found
- Example: Campus ID not exists

### Exception Flow

```
Service Layer throws Exception
         ↓
Controller catches Exception
         ↓
Log error with @Slf4j
         ↓
Return error response
{ success: false, message: "..." }
```

## Transaction Management

**@Transactional** được sử dụng ở Service layer:

```java
@Transactional(readOnly = true)  // Read operations
public List<CampusDTO> getAllCampuses() { ... }

@Transactional  // Write operations
public CampusDTO createCampus(...) { ... }
```

**Benefits**:

- Automatic rollback on exception
- Database connection management
- Consistency guarantee

## Dependency Injection

**Constructor Injection** với Lombok:

```java
@RequiredArgsConstructor
public class LocationServiceImpl {
    private final CampusRepository campusRepository;
    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
}
```

**Benefits**:

- Immutable dependencies
- Easy testing (mock injection)
- Clear dependencies

## Best Practices Applied

1. **Separation of Concerns**

   - Controller: HTTP handling
   - Service: Business logic
   - Repository: Data access

2. **Single Responsibility**

   - Each class has one responsibility
   - Easy to maintain and test

3. **Dependency Inversion**

   - Depend on interfaces (ILocationService)
   - Not concrete implementations

4. **DTO Pattern**

   - Decouple API from entities
   - Control data exposure
   - Enable versioning

5. **Exception Handling**

   - Custom exceptions for business logic
   - Centralized error handling
   - Meaningful error messages

6. **Transaction Management**

   - Declarative with @Transactional
   - Proper isolation levels
   - Rollback on errors

7. **Validation**

   - Bean Validation (@Valid)
   - Business rule validation in service
   - Clear error messages

8. **Logging**
   - Slf4j for logging
   - Log important operations
   - Log errors with stack traces

## Testing Strategy

### Unit Tests

**Service Layer**:

```java
@Test
void createCampus_Success() {
    // Given
    CampusRequestDTO request = ...;
    when(campusRepository.save(...)).thenReturn(...);

    // When
    CampusDTO result = locationService.createCampus(request);

    // Then
    assertNotNull(result);
    verify(campusRepository).save(...);
}
```

**Controller Layer**:

```java
@Test
void getAllCampuses_Success() {
    // Given
    when(locationService.getAllCampuses()).thenReturn(...);

    // When
    ResponseEntity<?> response = locationController.getAllCampuses();

    // Then
    assertEquals(200, response.getStatusCodeValue());
}
```

### Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class LocationControllerIntegrationTest {

    @Test
    void createCampus_EndToEnd() {
        // Test full flow from HTTP to database
    }
}
```

## Performance Considerations

1. **Lazy Loading**: Entities use lazy loading for relationships
2. **DTO Projection**: Only fetch needed data
3. **Transaction Scope**: Keep transactions short
4. **Connection Pooling**: HikariCP for connection management
5. **Caching**: Can add @Cacheable for read operations

## Security Considerations

1. **Input Validation**: @Valid on all inputs
2. **SQL Injection**: Prevented by JPA parameterized queries
3. **Authorization**: Can add @PreAuthorize for role-based access
4. **CORS**: Configured for frontend access

## Future Enhancements

1. **Caching**: Add Redis cache for frequently accessed data
2. **Pagination**: Add pagination for large lists
3. **Search**: Add search/filter capabilities
4. **Audit**: Add audit trail (created by, updated by)
5. **Soft Delete**: Implement soft delete instead of hard delete
6. **Versioning**: Add optimistic locking with @Version
