-- ================================================================
-- HCMSIU_SSPS - STUDENT SMART PRINTING SERVICE DATABASE
-- Hệ thống quản lý in ấn thông minh cho sinh viên
-- Database: PostgreSQL 14+
-- Total: 28 Tables
-- Date: December 20, 2025
-- ================================================================

-- ================================================================
-- HCMSIU_SSPS - STUDENT SMART PRINTING SERVICE DATABASE (PART 1/2)
-- Hệ thống quản lý in ấn thông minh cho sinh viên
-- Database: PostgreSQL 14+
-- Converted from SQL Server
-- Date: December 20, 2025
-- Bảng: 1-14 (Users → ReportsMonthly)
-- ================================================================

-- ================================================================
-- BẢNG 1: USERS - Quản lý người dùng
-- ================================================================
CREATE TABLE Users (
    UserID VARCHAR(20) PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(100) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(15),
    UserType VARCHAR(20) NOT NULL CHECK (UserType IN ('Student', 'SPSO', 'Admin')),
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP,
    EmailVerifiedAt TIMESTAMP,
    IsTwoFactorEnabled BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT CK_Users_EmailFormat CHECK (Email LIKE '%@%.%')
);

CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Type ON Users(UserType, Status);

-- ================================================================
-- BẢNG 2: PAGE_BALANCE - Số dư trang in
-- ================================================================
CREATE TABLE PageBalance (
    StudentID VARCHAR(20) PRIMARY KEY,
    A4Balance INT NOT NULL DEFAULT 0,
    LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- ================================================================
-- BẢNG 3: PAGE_TRANSACTIONS - Lịch sử cấp/mua trang
-- ================================================================
CREATE TABLE PageTransactions (
    TransactionID SERIAL PRIMARY KEY,
    TransactionCode VARCHAR(20) NOT NULL UNIQUE,
    StudentID VARCHAR(20) NOT NULL,
    TransactionType VARCHAR(20) NOT NULL CHECK (TransactionType IN ('Allocate', 'Purchase', 'Use')),
    A4Pages INT NOT NULL DEFAULT 0,
    BalanceAfterA4 INT,
    Amount DECIMAL(10,2),
    PaymentMethod VARCHAR(50),
    TransactionStatus VARCHAR(20) DEFAULT 'Completed' CHECK (TransactionStatus IN ('Pending', 'Completed', 'Failed')),
    Semester VARCHAR(20),
    Notes VARCHAR(500),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy VARCHAR(20),
    
    CONSTRAINT CK_PageTrans_NonNegative CHECK (COALESCE(Amount,0) >= 0 AND A4Pages >= -100000),
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE INDEX IX_Trans_Student ON PageTransactions(StudentID, CreatedAt DESC);
CREATE INDEX IX_Trans_Type ON PageTransactions(TransactionType, TransactionStatus);

-- ================================================================
-- BẢNG 3A: PENDING_PAYMENTS - Thanh toán chờ xử lý (SePay Integration)
-- ================================================================
CREATE TABLE PendingPayments (
    PaymentID SERIAL PRIMARY KEY,
    PaymentCode VARCHAR(50) NOT NULL UNIQUE,
    StudentID VARCHAR(20) NOT NULL,
    A4Pages INTEGER NOT NULL DEFAULT 0,
    A3Pages INTEGER NOT NULL DEFAULT 0,
    Amount BIGINT NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt TIMESTAMP,
    CompletedAt TIMESTAMP,
    BankTransactionId VARCHAR(100),
    
    CONSTRAINT fk_pending_payment_student FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE INDEX idx_pending_payments_code ON PendingPayments(PaymentCode);
CREATE INDEX idx_pending_payments_student ON PendingPayments(StudentID);
CREATE INDEX idx_pending_payments_status ON PendingPayments(Status);
CREATE INDEX idx_pending_payments_amount ON PendingPayments(Amount);

COMMENT ON TABLE PendingPayments IS 'Stores pending payment transactions for SePay QR payment integration';

-- ================================================================
-- BẢNG 4A: BRANDS - Thương hiệu máy in
-- ================================================================
CREATE TABLE Brands (
    BrandID SERIAL PRIMARY KEY,
    BrandName VARCHAR(50) NOT NULL UNIQUE,
    BrandDescription VARCHAR(200),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IX_Brands_Name ON Brands(BrandName);
CREATE INDEX IX_Brands_Active ON Brands(IsActive);

-- ================================================================
-- BẢNG 4B: PRINTER_MODELS - Model máy in
-- ================================================================
CREATE TABLE PrinterModels (
    ModelID SERIAL PRIMARY KEY,
    BrandID INT NOT NULL,
    ModelName VARCHAR(100) NOT NULL,
    ModelDescription VARCHAR(200),
    DefaultPaperSizes VARCHAR(50) DEFAULT 'A4,A3',
    DefaultColorPrinting BOOLEAN DEFAULT FALSE,
    DefaultDuplexPrinting BOOLEAN DEFAULT TRUE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (BrandID) REFERENCES Brands(BrandID) ON DELETE CASCADE,
    UNIQUE (BrandID, ModelName)
);

CREATE INDEX IX_Models_Brand ON PrinterModels(BrandID, IsActive);
CREATE INDEX IX_Models_Name ON PrinterModels(ModelName);

-- ================================================================
-- BẢNG 4C: CAMPUSES - Campus
-- ================================================================
CREATE TABLE Campuses (
    CampusID SERIAL PRIMARY KEY,
    CampusCode VARCHAR(20) NOT NULL UNIQUE,
    CampusName VARCHAR(100) NOT NULL,
    Address VARCHAR(200),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IX_Campuses_Code ON Campuses(CampusCode);
CREATE INDEX IX_Campuses_Active ON Campuses(IsActive);

-- ================================================================
-- BẢNG 4D: BUILDINGS - Tòa nhà
-- ================================================================
CREATE TABLE Buildings (
    BuildingID SERIAL PRIMARY KEY,
    CampusID INT NOT NULL,
    BuildingCode VARCHAR(20) NOT NULL,
    BuildingName VARCHAR(100),
    FloorCount INT,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (CampusID) REFERENCES Campuses(CampusID) ON DELETE CASCADE,
    UNIQUE (CampusID, BuildingCode)
);

CREATE INDEX IX_Buildings_Campus ON Buildings(CampusID, IsActive);
CREATE INDEX IX_Buildings_Code ON Buildings(BuildingCode);

-- ================================================================
-- BẢNG 4E: ROOMS - Phòng
-- ================================================================
CREATE TABLE Rooms (
    RoomID SERIAL PRIMARY KEY,
    BuildingID INT NOT NULL,
    RoomNumber VARCHAR(20) NOT NULL,
    RoomName VARCHAR(100),
    RoomType VARCHAR(50),
    Capacity INT,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (BuildingID) REFERENCES Buildings(BuildingID) ON DELETE CASCADE,
    UNIQUE (BuildingID, RoomNumber)
);

CREATE INDEX IX_Rooms_Building ON Rooms(BuildingID, IsActive);
CREATE INDEX IX_Rooms_Number ON Rooms(RoomNumber);

-- ================================================================
-- BẢNG 4: PRINTERS - Máy in
-- ================================================================
CREATE TABLE Printers (
    PrinterID BIGSERIAL PRIMARY KEY,
    PrinterName VARCHAR(100) NOT NULL,
    BrandID INT NOT NULL,
    ModelID INT NOT NULL,
    RoomID INT NOT NULL,
    IPAddress VARCHAR(50),
    PaperSizes VARCHAR(50) DEFAULT 'A4,A3',
    ColorPrinting BOOLEAN DEFAULT FALSE,
    DuplexPrinting BOOLEAN DEFAULT TRUE,
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'Maintenance', 'Error', 'OutOfPaper', 'OutOfToner', 'OutOfBoth')),
    
    -- Paper management
    A4PaperRemaining INT DEFAULT 500,
    A3PaperRemaining INT DEFAULT 250,
    A4PaperCapacity INT DEFAULT 500,
    A3PaperCapacity INT DEFAULT 250,
    
    -- Toner management
    TonerBlackRemaining INT DEFAULT 100,
    TonerCyanRemaining INT DEFAULT 100,
    TonerMagentaRemaining INT DEFAULT 100,
    TonerYellowRemaining INT DEFAULT 100,
    TonerLastReplaced TIMESTAMP,
    
    -- Reserved resources (for pending print jobs to prevent race conditions)
    A4PaperReserved INT DEFAULT 0,
    A3PaperReserved INT DEFAULT 0,
    TonerBlackReserved INT DEFAULT 0,
    TonerCyanReserved INT DEFAULT 0,
    TonerMagentaReserved INT DEFAULT 0,
    TonerYellowReserved INT DEFAULT 0,
    
    TotalPagesPrinted INT DEFAULT 0,
    LastMaintenanceDate DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy VARCHAR(20),
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (BrandID) REFERENCES Brands(BrandID),
    FOREIGN KEY (ModelID) REFERENCES PrinterModels(ModelID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

CREATE INDEX IX_Printer_Room ON Printers(RoomID, Status);
CREATE INDEX IX_Printer_Model ON Printers(ModelID);
CREATE INDEX IX_Printer_Status ON Printers(Status);

-- Comments for paper and toner columns
COMMENT ON COLUMN Printers.A4PaperRemaining IS 'Số tờ giấy A4 còn lại trong khay';
COMMENT ON COLUMN Printers.A3PaperRemaining IS 'Số tờ giấy A3 còn lại trong khay';
COMMENT ON COLUMN Printers.A4PaperCapacity IS 'Dung lượng tối đa khay giấy A4';
COMMENT ON COLUMN Printers.A3PaperCapacity IS 'Dung lượng tối đa khay giấy A3';
COMMENT ON COLUMN Printers.TonerBlackRemaining IS 'Phần trăm mực đen còn lại (0-100)';
COMMENT ON COLUMN Printers.TonerCyanRemaining IS 'Phần trăm mực xanh còn lại (0-100)';
COMMENT ON COLUMN Printers.TonerMagentaRemaining IS 'Phần trăm mực đỏ còn lại (0-100)';
COMMENT ON COLUMN Printers.TonerYellowRemaining IS 'Phần trăm mực vàng còn lại (0-100)';
COMMENT ON COLUMN Printers.TonerLastReplaced IS 'Thời điểm thay mực lần cuối';
COMMENT ON COLUMN Printers.Status IS 'Trạng thái: Active, Inactive, Maintenance, Error, OutOfPaper, OutOfToner, OutOfBoth';
COMMENT ON COLUMN Printers.A4PaperReserved IS 'Số tờ A4 đã được reserve cho các job pending';
COMMENT ON COLUMN Printers.A3PaperReserved IS 'Số tờ A3 đã được reserve cho các job pending';
COMMENT ON COLUMN Printers.TonerBlackReserved IS 'Phần trăm mực đen đã được reserve';
COMMENT ON COLUMN Printers.TonerCyanReserved IS 'Phần trăm mực xanh đã được reserve';
COMMENT ON COLUMN Printers.TonerMagentaReserved IS 'Phần trăm mực đỏ đã được reserve';
COMMENT ON COLUMN Printers.TonerYellowReserved IS 'Phần trăm mực vàng đã được reserve';

-- ================================================================
-- BẢNG 10: ROLES - Vai trò
-- ================================================================
CREATE TABLE Roles (
    RoleID SERIAL PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(200)
);

-- ================================================================
-- BẢNG 11: PERMISSIONS - Quyền hạn
-- ================================================================
CREATE TABLE Permissions (
    PermissionID SERIAL PRIMARY KEY,
    PermissionKey VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(200),
    Module VARCHAR(50)
);

CREATE INDEX IX_Permissions_Key ON Permissions(PermissionKey);

-- ================================================================
-- BẢNG 12: USER_ROLES - Vai trò của người dùng
-- ================================================================
CREATE TABLE UserRoles (
    UserID VARCHAR(20) NOT NULL,
    RoleID INT NOT NULL,
    AssignedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (UserID, RoleID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE
);

CREATE INDEX IX_UserRoles_User ON UserRoles(UserID);

-- ================================================================
-- BẢNG 13: ROLE_PERMISSIONS - Quyền của vai trò
-- ================================================================
CREATE TABLE RolePermissions (
    RoleID INT NOT NULL,
    PermissionID INT NOT NULL,
    GrantedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID) ON DELETE CASCADE
);

CREATE INDEX IX_RolePermissions_Role ON RolePermissions(RoleID);

-- ================================================================
-- BẢNG 14: REPORTS_MONTHLY - Báo cáo tháng
-- ================================================================
CREATE TABLE ReportsMonthly (
    ReportID SERIAL PRIMARY KEY,
    ReportYear INT NOT NULL,
    ReportMonth INT NOT NULL CHECK (ReportMonth BETWEEN 1 AND 12),
    TotalStudentsActive INT NOT NULL DEFAULT 0,
    TotalPrintJobs INT NOT NULL DEFAULT 0,
    SuccessfulJobs INT NOT NULL DEFAULT 0,
    FailedJobs INT NOT NULL DEFAULT 0,
    TotalPagesPrinted INT NOT NULL DEFAULT 0,
    TotalA4Equivalent INT NOT NULL DEFAULT 0,
    TotalPagesPurchased INT NOT NULL DEFAULT 0,
    TotalRevenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    MostUsedPrinterID BIGINT,
    MostUsedPrinterJobs INT,
    TopStudentID VARCHAR(20),
    TopStudentPages INT,
    GeneratedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    GeneratedBy VARCHAR(20),
    Notes VARCHAR(500),
    
    UNIQUE (ReportYear, ReportMonth),
    FOREIGN KEY (MostUsedPrinterID) REFERENCES Printers(PrinterID),
    FOREIGN KEY (TopStudentID) REFERENCES Users(UserID)
);

CREATE INDEX IX_ReportsMonthly_YM ON ReportsMonthly(ReportYear, ReportMonth);

-- ================================================================

-- BẢNG 15: REPORTS_YEARLY - Báo cáo năm
-- ================================================================
CREATE TABLE ReportsYearly (
    ReportID SERIAL PRIMARY KEY,
    ReportYear INT NOT NULL UNIQUE,
    TotalStudentsActive INT NOT NULL DEFAULT 0,
    TotalPrintJobs INT NOT NULL DEFAULT 0,
    SuccessfulJobs INT NOT NULL DEFAULT 0,
    FailedJobs INT NOT NULL DEFAULT 0,
    TotalPagesPrinted INT NOT NULL DEFAULT 0,
    TotalA4Equivalent INT NOT NULL DEFAULT 0,
    TotalPagesPurchased INT NOT NULL DEFAULT 0,
    TotalRevenue DECIMAL(15,2) NOT NULL DEFAULT 0,
    AverageRevenuePerStudent DECIMAL(10,2),
    MostActiveMonth INT,
    PeakUsageDate DATE,
    PeakUsageJobs INT,
    GeneratedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    GeneratedBy VARCHAR(20),
    Notes VARCHAR(500)
);

CREATE INDEX IX_ReportsYearly_Year ON ReportsYearly(ReportYear);

-- ================================================================
-- BẢNG 16: DOCUMENTS - Tài liệu tải lên
-- ================================================================
CREATE TABLE Documents (
    DocumentID SERIAL PRIMARY KEY,
    StudentID VARCHAR(20) NOT NULL,
    OriginalFileName VARCHAR(255) NOT NULL,
    StoredFileName VARCHAR(255) NOT NULL UNIQUE,
    FilePath VARCHAR(500) NOT NULL,
    FileExtension VARCHAR(10) NOT NULL,
    FileSizeKB DECIMAL(10,2) NOT NULL,
    TotalPages INT NOT NULL,
    UploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT CK_Documents_FileExt CHECK (LENGTH(FileExtension) BETWEEN 2 AND 10 AND FileExtension NOT LIKE '%.%' AND FileExtension NOT LIKE '%/%'),
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE INDEX IX_Doc_Student ON Documents(StudentID, IsDeleted, UploadDate DESC);

-- ================================================================
-- BẢNG 17: PRINT_JOBS - Lệnh in (Print Queue)
-- ================================================================
CREATE TABLE PrintJobs (
    JobID SERIAL PRIMARY KEY,
    ColorPageRange VARCHAR(255) NULL,
    StudentID VARCHAR(20) NOT NULL,
    DocumentID INT NOT NULL,
    PrinterID BIGINT NOT NULL,
    PaperSize VARCHAR(10) NOT NULL DEFAULT 'A4' CHECK (PaperSize IN ('A4', 'A3', 'A5')),
    PagesToPrint VARCHAR(255) NOT NULL,
    ColorMode VARCHAR(20) DEFAULT 'BlackWhite' CHECK (ColorMode IN ('Color', 'Grayscale', 'BlackWhite')),
    IsSingleSided BOOLEAN DEFAULT FALSE,
    NumCopies INT DEFAULT 1,
    TotalPagesToPrint INT NOT NULL,
    TotalSheetsUsed INT NOT NULL,
    A4EquivalentPages INT NOT NULL,
    JobStatus VARCHAR(20) DEFAULT 'Pending' CHECK (JobStatus IN ('Pending', 'Printing', 'Completed', 'Failed', 'Cancelled')),
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    StartedAt TIMESTAMP,
    CompletedAt TIMESTAMP,
    ErrorMessage VARCHAR(500),
    Notes VARCHAR(500),
    
    CONSTRAINT CK_PrintJobs_Totals CHECK (TotalPagesToPrint >= 0 AND TotalSheetsUsed >= 0 AND A4EquivalentPages >= 0),
    CONSTRAINT CK_PrintJobs_Times CHECK ((StartedAt IS NULL OR StartedAt >= SubmittedAt) AND (CompletedAt IS NULL OR CompletedAt >= StartedAt)),
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID),
    FOREIGN KEY (DocumentID) REFERENCES Documents(DocumentID),
    FOREIGN KEY (PrinterID) REFERENCES Printers(PrinterID)
);

CREATE INDEX IX_Job_Student ON PrintJobs(StudentID, JobStatus, SubmittedAt DESC);
CREATE INDEX IX_Job_Printer ON PrintJobs(PrinterID, JobStatus);
CREATE INDEX IX_Job_Status ON PrintJobs(JobStatus, SubmittedAt DESC);

-- ================================================================
-- BẢNG 18: PRINT_LOGS - Lịch sử in (Log)
-- ================================================================
CREATE TABLE PrintLogs (
    LogID SERIAL PRIMARY KEY,
    JobID INT NOT NULL,
    StudentID VARCHAR(20) NOT NULL,
    PrinterID BIGINT NOT NULL,
    DocumentName VARCHAR(255) NOT NULL,
    PaperSize VARCHAR(10) NOT NULL,
    PagesPrinted INT NOT NULL,
    A4EquivalentUsed INT NOT NULL,
    PrintTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DurationSeconds INT,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Success', 'Failed')),
    
    CONSTRAINT CK_PrintLogs_NonNegative CHECK (PagesPrinted >= 0 AND A4EquivalentUsed >= 0),
    
    FOREIGN KEY (JobID) REFERENCES PrintJobs(JobID) ON DELETE CASCADE,
    FOREIGN KEY (StudentID) REFERENCES Users(UserID),
    FOREIGN KEY (PrinterID) REFERENCES Printers(PrinterID)
);

CREATE INDEX IX_Log_Student ON PrintLogs(StudentID, PrintTime DESC);
CREATE INDEX IX_Log_Printer ON PrintLogs(PrinterID, PrintTime DESC);
CREATE INDEX IX_Log_Time ON PrintLogs(PrintTime DESC);

-- ================================================================
-- BẢNG 19: SYSTEM_CONFIG - Cấu hình hệ thống
-- ================================================================
CREATE TABLE SystemConfig (
    ConfigKey VARCHAR(100) PRIMARY KEY,
    ConfigValue TEXT NOT NULL,
    Description VARCHAR(500),
    DataType VARCHAR(20) NOT NULL CHECK (DataType IN ('String', 'Integer', 'Decimal', 'Boolean', 'JSON')),
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy VARCHAR(20)
);

-- ================================================================
-- BẢNG 20: PAGE_PRICING - Giá trang in
-- ================================================================
CREATE TABLE PagePricing (
    PricingID SERIAL PRIMARY KEY,
    PaperSize VARCHAR(10) NOT NULL CHECK (PaperSize IN ('A4','A3','A5')),
    PricePerPage DECIMAL(10,2) NOT NULL CHECK (PricePerPage >= 0),
    Currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    EffectiveFrom DATE NOT NULL,
    EffectiveTo DATE NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    Notes VARCHAR(255),
    
    UNIQUE (PaperSize, EffectiveFrom)
);

CREATE INDEX IX_PagePricing_Active ON PagePricing(IsActive, EffectiveFrom DESC);

-- ================================================================
-- BẢNG 21: REFRESH_TOKENS - Token làm mới
-- ================================================================
CREATE TABLE RefreshTokens (
    TokenID VARCHAR(100) PRIMARY KEY,
    UserID VARCHAR(20) NOT NULL,
    DeviceID VARCHAR(200),
    DeviceFingerprint VARCHAR(200),
    Token VARCHAR(500) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastUsedAt TIMESTAMP,
    RevokedAt TIMESTAMP,
    RevokeReason VARCHAR(100),
    IpAddress VARCHAR(50),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE INDEX IX_RT_UserId ON RefreshTokens(UserID, ExpiresAt DESC);
CREATE INDEX IX_RT_Token ON RefreshTokens(Token);
CREATE INDEX IX_RT_Expiry ON RefreshTokens(ExpiresAt);

-- ================================================================
-- BẢNG 22: EMAIL_OTP_CODES - Mã OTP email
-- ================================================================
CREATE TABLE EmailOtpCodes (
    OtpID SERIAL PRIMARY KEY,
    UserID VARCHAR(20) NULL,
    Email VARCHAR(100) NULL,
    Purpose VARCHAR(30) NOT NULL CHECK (Purpose IN ('PasswordReset','Login2FA','EmailVerification','Register2FA')),
    Code VARCHAR(10) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    ConsumedAt TIMESTAMP NULL,
    AttemptCount INT NOT NULL DEFAULT 0,
    MaxAttempts INT NOT NULL DEFAULT 5,
    RequestedByIp VARCHAR(45),
    DeviceId VARCHAR(64),
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Postgres partial unique index (thay WHERE clause)
CREATE UNIQUE INDEX UX_EmailOtp_Active ON EmailOtpCodes(UserID, Purpose) WHERE ConsumedAt IS NULL AND UserID IS NOT NULL;
CREATE INDEX IX_EmailOtp_UserPurpose ON EmailOtpCodes(UserID, Purpose, ExpiresAt);
CREATE INDEX IX_EmailOtp_EmailPurpose ON EmailOtpCodes(Email, Purpose, ExpiresAt);

-- ================================================================
-- BẢNG 23: PASSWORD_RESET_TOKENS - Token reset mật khẩu
-- ================================================================
CREATE TABLE PasswordResetTokens (
    TokenID VARCHAR(100) PRIMARY KEY,
    UserID VARCHAR(20) NOT NULL,
    Token VARCHAR(200) NOT NULL,
    ExpiresAt TIMESTAMP NOT NULL,
    ConsumedAt TIMESTAMP NULL,
    RequestedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    RequestedByIp VARCHAR(45),

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE INDEX IX_PwdReset_UserExpiry ON PasswordResetTokens(UserID, ExpiresAt);

-- ================================================================
-- BẢNG 24: TRUSTED_DEVICES - Thiết bị tin cậy
-- ================================================================
CREATE TABLE TrustedDevices (
    UserID VARCHAR(20) NOT NULL,
    DeviceId VARCHAR(200) NOT NULL,
    DeviceName VARCHAR(100),
    UserAgent VARCHAR(255),
    IpAddress VARCHAR(45),
    DeviceFingerprint VARCHAR(200),
    TrustedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt TIMESTAMP NOT NULL,
    LastUsedAt TIMESTAMP NULL,
    RevokedAt TIMESTAMP NULL,

    PRIMARY KEY (UserID, DeviceId),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE INDEX IX_TrustedDevices_Expiry ON TrustedDevices(UserID, ExpiresAt);

-- ================================================================
-- BẢNG 25: ALLOWED_FILE_TYPES - Loại file được phép
-- ================================================================
CREATE TABLE AllowedFileTypes (
    FileTypeID SERIAL PRIMARY KEY,
    FileExtension VARCHAR(10) NOT NULL UNIQUE,
    MimeType VARCHAR(100) NOT NULL,
    MaxFileSizeMB INT NOT NULL DEFAULT 50 CHECK (MaxFileSizeMB > 0),
    IsAllowed BOOLEAN NOT NULL DEFAULT TRUE,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy VARCHAR(20)
);

CREATE INDEX IX_FileTypes_Allowed ON AllowedFileTypes(IsAllowed);

-- ================================================================
-- BẢNG 26: NOTIFICATIONS - Thông báo
-- ================================================================
CREATE TABLE Notifications (
    NotificationID SERIAL PRIMARY KEY,
    RecipientID VARCHAR(20) NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Message VARCHAR(1000) NOT NULL,
    NotificationType VARCHAR(20) DEFAULT 'Info' CHECK (NotificationType IN ('Info', 'Warning', 'Error', 'Success')),
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (RecipientID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE INDEX IX_Notif_Recipient ON Notifications(RecipientID, IsRead, CreatedAt DESC);

-- ================================================================
-- BẢNG 27: PRINTER_MAINTENANCE - Log bảo trì máy in
-- ================================================================
CREATE TABLE PrinterMaintenance (
    MaintenanceID SERIAL PRIMARY KEY,
    PrinterID BIGINT NOT NULL,
    MaintenanceDate DATE NOT NULL,
    MaintenanceType VARCHAR(20) NOT NULL CHECK (MaintenanceType IN ('Routine','Repair','Emergency','Upgrade')),
    Description VARCHAR(500),
    Technician VARCHAR(100),
    Cost DECIMAL(12,2),
    DurationMinutes INT,
    PerformedBy VARCHAR(20),
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (PrinterID) REFERENCES Printers(PrinterID) ON DELETE CASCADE
);

CREATE INDEX IX_PM_PrinterDate ON PrinterMaintenance(PrinterID, MaintenanceDate DESC);

-- ================================================================
-- BẢNG 28: SEMESTERS - Quản lý học kỳ
-- ================================================================
CREATE TABLE Semesters (
    SemesterID SERIAL PRIMARY KEY,
    SemesterCode VARCHAR(20) NOT NULL UNIQUE,
    SemesterName VARCHAR(100) NOT NULL,
    AcademicYear VARCHAR(20) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    DefaultA4Pages INT NOT NULL DEFAULT 100,
    DefaultA3Pages INT NOT NULL DEFAULT 0,
    PageAllocationDate DATE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    IsCurrent BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy VARCHAR(20),
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedBy VARCHAR(20),
    
    CONSTRAINT CK_Semester_Dates CHECK (EndDate > StartDate),
    CONSTRAINT CK_Semester_Pages CHECK (DefaultA4Pages >= 0 AND DefaultA3Pages >= 0),
    
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

CREATE INDEX IX_Semester_Code ON Semesters(SemesterCode);
CREATE INDEX IX_Semester_Active ON Semesters(IsActive, IsCurrent);
CREATE INDEX IX_Semester_Dates ON Semesters(StartDate, EndDate);

COMMENT ON TABLE Semesters IS 'Quản lý học kỳ và cấu hình cấp trang tự động';
COMMENT ON COLUMN Semesters.SemesterCode IS 'Mã học kỳ (VD: HK1-2024, HK2-2024, HK3-2024)';
COMMENT ON COLUMN Semesters.DefaultA4Pages IS 'Số trang A4 cấp phát mặc định cho sinh viên mỗi học kỳ';
COMMENT ON COLUMN Semesters.DefaultA3Pages IS 'Số trang A3 cấp phát mặc định cho sinh viên mỗi học kỳ';
COMMENT ON COLUMN Semesters.PageAllocationDate IS 'Ngày tự động cấp trang cho sinh viên';
COMMENT ON COLUMN Semesters.IsCurrent IS 'Học kỳ hiện tại (chỉ có 1 học kỳ IsCurrent=TRUE)';

-- ================================================================
-- END OF SCHEMA - All 28 Tables Completed! ✅
-- Now run both Part 1 and Part 2 in pgAdmin
-- ================================================================

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO friend1;
GRANT ALL ON ALL TABLES IN SCHEMA public TO friend1;