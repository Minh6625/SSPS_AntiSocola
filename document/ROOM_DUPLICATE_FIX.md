# Room Duplicate Key Error Fix

## Problem

When updating a room, the application threw a database constraint violation error:

```
duplicate key value violates unique constraint "rooms_buildingid_roomnumber_key"
Key (buildingid, roomnumber)=(2, 101) already exists
```

This occurred because the database has a unique constraint on the combination of `(BuildingID, RoomNumber)`, ensuring that room numbers are unique within each building.

## Root Cause

The `updateRoom()` method in `LocationServiceImpl` was not checking for duplicate room numbers before attempting to save. When a user tried to update a room to a room number that already existed in the same building, the database rejected the operation.

## Solution

Added duplicate validation in both `createRoom()` and `updateRoom()` methods:

### 1. Added Repository Method

**File**: `backend/src/main/java/com/example/app/repository/RoomRepository.java`

```java
/**
 * Tìm room theo buildingId và roomNumber (để check duplicate)
 */
@Query("SELECT r FROM Room r WHERE r.building.buildingId = :buildingId AND r.roomNumber = :roomNumber")
java.util.Optional<Room> findByBuildingIdAndRoomNumber(@Param("buildingId") Integer buildingId, @Param("roomNumber") String roomNumber);
```

### 2. Updated createRoom() Method

**File**: `backend/src/main/java/com/example/app/service/impl/LocationServiceImpl.java`

```java
@Override
@Transactional
public RoomDTO createRoom(RoomRequestDTO request) {
    Building building = getBuildingById(request.getBuildingId());

    // Check duplicate room number in the same building
    if (roomRepository.findByBuildingIdAndRoomNumber(request.getBuildingId(), request.getRoomNumber()).isPresent()) {
        throw new BusinessException("Số phòng đã tồn tại trong tòa nhà này");
    }

    // ... rest of the code
}
```

### 3. Updated updateRoom() Method

```java
@Override
@Transactional
public RoomDTO updateRoom(Integer id, RoomRequestDTO request) {
    Room room = getRoomById(id);
    Building building = getBuildingById(request.getBuildingId());

    // Check duplicate room number in the same building (exclude current room)
    roomRepository.findByBuildingIdAndRoomNumber(request.getBuildingId(), request.getRoomNumber())
        .ifPresent(existing -> {
            if (!existing.getRoomId().equals(id)) {
                throw new BusinessException("Số phòng đã tồn tại trong tòa nhà này");
            }
        });

    // ... rest of the code
}
```

## Key Points

1. **Create validation**: Checks if the room number already exists in the building
2. **Update validation**: Checks if the room number exists, but excludes the current room being updated
3. **User-friendly error**: Throws `BusinessException` with Vietnamese message instead of database constraint error
4. **Consistent pattern**: Follows the same pattern used in `updateCampus()` for campus code validation

## Testing

- ✅ No compilation errors
- ✅ Duplicate room creation is now prevented with clear error message
- ✅ Duplicate room update is now prevented with clear error message
- ✅ Valid room updates work correctly
- ✅ Database constraint is still enforced as a safety net

## Benefits

1. **Better UX**: Users see a clear error message in Vietnamese instead of a database error
2. **Early validation**: Catches duplicates before hitting the database
3. **Consistent behavior**: Matches the validation pattern used elsewhere in the codebase
4. **Maintains data integrity**: Database constraint remains as a safety net

---

**Fixed**: December 27, 2025
**Status**: ✅ Resolved
