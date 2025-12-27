# Summary: Printer Reserve Mechanism Implementation

## Completed: December 23, 2024

### Problem Identified

The system had a **critical race condition** when multiple users submitted print jobs to the same printer simultaneously:

- When creating a job: Only **checked** paper/toner availability, did NOT deduct
- When printing completed: Actually **deducted** paper/toner
- **Race condition**: Multiple users could pass the check before any deduction occurred, leading to overbooking

**Example scenario**:

```
Printer has 100 sheets
User A submits 40 sheets → Check: 100 >= 40 ✓ → Pending (still 100 in DB)
User B submits 40 sheets → Check: 100 >= 40 ✓ → Pending (still 100 in DB)
User C submits 40 sheets → Check: 100 >= 40 ✓ → Pending (still 100 in DB)
Job A prints → Deduct 40 → 60 remaining
Job B prints → Deduct 40 → 20 remaining
Job C prints → Needs 40 but only 20 available → FAILS ❌
```

### Solution Implemented: Reserve Mechanism

Added **reserved fields** to track resources allocated to pending jobs:

**New Database Fields**:

- `A4PaperReserved`, `A3PaperReserved`
- `TonerBlackReserved`, `TonerCyanReserved`, `TonerMagentaReserved`, `TonerYellowReserved`

**Key Concept**:

- **Remaining**: Total resources in printer
- **Reserved**: Resources locked for pending jobs
- **Available**: Remaining - Reserved (what's actually available)

**Workflow**:

1. **Submit job**: Check available → Reserve resources immediately
2. **Print completes**: Release reserves → Deduct actual resources
3. **Cancel job**: Release reserves only (no deduction needed)
4. **Job fails**: Release reserves after max retries
5. **Refill**: Reset reserves to 0

### Files Modified

#### Backend Entity

- `backend/src/main/java/com/example/app/entity/Printer.java`
  - Added 6 reserved fields
  - Added methods: `getA4PaperAvailable()`, `getA3PaperAvailable()`, `getTonerBlackAvailable()`
  - Added methods: `reservePaper()`, `releasePaperReserve()`, `reserveToner()`, `releaseTonerReserve()`
  - Updated: `hasEnoughPaper()`, `hasEnoughToner()` to check available instead of remaining

#### Backend Services

- `backend/src/main/java/com/example/app/service/impl/PrintJobServiceImpl.java`

  - Updated `submitPrintJob()`: Check available resources & reserve immediately after creating job
  - Updated `cancelPrintJob()`: Release reserves when cancelling

- `backend/src/main/java/com/example/app/service/impl/PrintQueueServiceImpl.java`

  - Updated `sendJobToPrinter()`: Release reserves & deduct actual resources on completion
  - Updated error handling: Release reserves on final failure

- `backend/src/main/java/com/example/app/service/impl/PrinterServiceImpl.java`
  - Updated `refillSupplies()`: Reset all reserves to 0 when refilling

#### Database

- `backend/src/main/resources/db/migration/V3__add_printer_reserved_fields.sql` (NEW)

  - Migration to add 6 reserved columns with default 0

- `script/database/database_schema_postgres.sql`

  - Added 6 reserved fields to Printers table
  - Added comments for reserved fields

- `script/database/database_seed_data_postgres.sql`
  - Updated INSERT statements to include reserved=0 for all printers

#### Documentation

- `document/PRINTER_RESERVE_MECHANISM.md` (NEW)

  - Comprehensive explanation of reserve mechanism
  - Problem description, solution, workflow, examples
  - Testing scenarios

- `SUMMARY_RESERVE_MECHANISM.md` (THIS FILE)
  - High-level summary of implementation

### How It Works Now

**Example with Reserve Mechanism**:

```
T0: Printer has 100 sheets, 0 reserved
T1: User A submits 40 sheets
    → Check: available = 100 - 0 = 100 >= 40 ✓
    → Reserve 40 → remaining=100, reserved=40, available=60

T2: User B submits 40 sheets
    → Check: available = 100 - 40 = 60 >= 40 ✓
    → Reserve 40 → remaining=100, reserved=80, available=20

T3: User C submits 40 sheets
    → Check: available = 100 - 80 = 20 >= 40 ✗
    → REJECT: "Không đủ giấy. Cần 40 tờ, còn 20 tờ khả dụng" ❌

T4: Job A completes
    → Release 40 reserve → reserved=40
    → Deduct 40 actual → remaining=60, available=20

T5: Job B completes
    → Release 40 reserve → reserved=0
    → Deduct 40 actual → remaining=20, available=20

✅ No jobs fail due to overbooking!
```

### Benefits

1. **Prevents race conditions**: Resources locked immediately when job is created
2. **Fair allocation**: First-come-first-served
3. **Accurate**: No jobs fail due to overbooking
4. **Transparent**: Users see immediately if printer doesn't have enough resources
5. **Easy rollback**: Cancelling job only releases reserve, no need to refund resources

### Testing Recommendations

1. **Concurrent submissions**: 3 users submit jobs simultaneously to same printer
2. **Cancel job**: Verify reserves are released and available to other users
3. **Job failure**: Verify reserves are released after max retries
4. **Refill**: Verify reserves reset to 0 when refilling supplies
5. **Status updates**: Verify printer status updates correctly based on available resources

### Next Steps

1. Deploy migration V3 to database
2. Test concurrent job submissions
3. Monitor reserve values in production
4. Consider adding reserve metrics to admin dashboard

### Related Documents

- [PRINTER_SUPPLIES_MANAGEMENT.md](./document/PRINTER_SUPPLIES_MANAGEMENT.md)
- [PRINTER_RESERVE_MECHANISM.md](./document/PRINTER_RESERVE_MECHANISM.md)
- [PRINTER_REFILL_USER_GUIDE.md](./document/PRINTER_REFILL_USER_GUIDE.md)
