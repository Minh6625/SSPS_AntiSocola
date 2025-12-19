-- ================================================================
-- HCMSIU_SSPS - STUDENT SMART PRINTING SERVICE DATABASE
-- Hệ thống quản lý in ấn thông minh cho sinh viên
-- Database: SQL Server 2019+
-- Version: 2.0 (Optimized - Gọn nhẹ, dễ truy vấn)
-- Date: December 3, 2025
-- ================================================================

USE master;
GO

-- Tạo database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'HCMSIU_SSPS')
BEGIN
    CREATE DATABASE HCMSIU_SSPS;
END
GO

USE HCMSIU_SSPS;
GO

-- ================================================================
-- BẢNG 1: USERS - Quản lý người dùng (TẠO TRƯỚC)
-- ================================================================
CREATE TABLE Users (
    UserID NVARCHAR(20) PRIMARY KEY,                    -- MSSV hoặc MSNV
    Email NVARCHAR(100) NOT NULL UNIQUE,                -- Email đăng nhập
    PasswordHash NVARCHAR(100) NOT NULL,                -- Mật khẩu đã hash (BCrypt)
    FullName NVARCHAR(100) NOT NULL,                    -- Họ tên
    PhoneNumber NVARCHAR(15),                           -- Số điện thoại
    UserType NVARCHAR(20) NOT NULL CHECK (UserType IN ('Student', 'SPSO', 'Admin')),
    Status NVARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive')),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    LastLogin DATETIME2,
    EmailVerifiedAt DATETIME2,                          -- Thời điểm xác thực email
    IsTwoFactorEnabled BIT NOT NULL DEFAULT 0,          -- Bật/tắt xác thực 2 lớp
    
    -- Email format (basic) - contains '@' and '.'
    CONSTRAINT CK_Users_EmailFormat CHECK (Email LIKE '%@%.%'),
    
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_Type (UserType, Status)
);
GO

-- ================================================================
-- BẢNG 2: PAGE_BALANCE - Số dư trang in
-- ================================================================
CREATE TABLE PageBalance (
    StudentID NVARCHAR(20) PRIMARY KEY,                 -- MSSV
    A4Balance INT NOT NULL DEFAULT 0,                   -- Số trang A4 còn lại
    A3Balance INT NOT NULL DEFAULT 0,                   -- Số trang A3 còn lại
    TotalA4Equivalent AS (A4Balance + A3Balance * 2) PERSISTED, -- Tổng quy đổi A4
    LastUpdated DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

-- ================================================================
-- BẢNG 3: PAGE_TRANSACTIONS - Lịch sử cấp/mua trang
-- ================================================================
CREATE TABLE PageTransactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID NVARCHAR(20) NOT NULL,
    TransactionType NVARCHAR(20) NOT NULL CHECK (TransactionType IN ('Allocate', 'Purchase', 'Use')),
    A4Pages INT NOT NULL DEFAULT 0,                     -- Số trang A4 (+/-)
    A3Pages INT NOT NULL DEFAULT 0,                     -- Số trang A3 (+/-)
    BalanceAfterA4 INT,                                 -- Số dư A4 sau giao dịch
    BalanceAfterA3 INT,                                 -- Số dư A3 sau giao dịch
    Amount DECIMAL(10,2),                               -- Số tiền (nếu mua)
    PaymentMethod NVARCHAR(50),                         -- SIUPay, BankTransfer...
    TransactionStatus NVARCHAR(20) DEFAULT 'Completed' CHECK (TransactionStatus IN ('Pending', 'Completed', 'Failed')),
    Semester NVARCHAR(20),                              -- HK1-2024, HK2-2024...
    Notes NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(20),                             -- SPSO thực hiện (nếu cấp phát)
    
    CONSTRAINT CK_PageTrans_NonNegative CHECK (COALESCE(Amount,0) >= 0 AND A4Pages >= -100000 AND A3Pages >= -100000),
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX IX_Trans_Student (StudentID, CreatedAt DESC),
    INDEX IX_Trans_Type (TransactionType, TransactionStatus)
);
GO

-- ================================================================
-- BẢNG 4A: BRANDS - Thương hiệu máy in (Reference Table)
-- ================================================================
CREATE TABLE Brands (
    BrandID INT IDENTITY(1,1) PRIMARY KEY,
    BrandName NVARCHAR(50) NOT NULL UNIQUE,
    BrandDescription NVARCHAR(200),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    
    INDEX IX_Brands_Name (BrandName),
    INDEX IX_Brands_Active (IsActive)
);
GO

-- ================================================================
-- BẢNG 4B: PRINTER_MODELS - Model máy in (Reference Table)
-- ================================================================
CREATE TABLE PrinterModels (
    ModelID INT IDENTITY(1,1) PRIMARY KEY,
    BrandID INT NOT NULL,
    ModelName NVARCHAR(100) NOT NULL,
    ModelDescription NVARCHAR(200),
    DefaultPaperSizes NVARCHAR(50) DEFAULT 'A4,A3',  -- Khổ giấy mặc định
    DefaultColorPrinting BIT DEFAULT 0,               -- Mặc định có màu?
    DefaultDuplexPrinting BIT DEFAULT 1,              -- Mặc định in 2 mặt?
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (BrandID) REFERENCES Brands(BrandID) ON DELETE CASCADE,
    UNIQUE (BrandID, ModelName),
    INDEX IX_Models_Brand (BrandID, IsActive),
    INDEX IX_Models_Name (ModelName)
);
GO

-- ================================================================
-- BẢNG 4C: CAMPUSES - Campus (Reference Table)
-- ================================================================
CREATE TABLE Campuses (
    CampusID INT IDENTITY(1,1) PRIMARY KEY,
    CampusCode NVARCHAR(20) NOT NULL UNIQUE,          -- CS1, CS2, DA (Dĩ An), LT (Linh Trung)
    CampusName NVARCHAR(100) NOT NULL,                 -- "Campus Dĩ An", "Campus Linh Trung"
    Address NVARCHAR(200),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    
    INDEX IX_Campuses_Code (CampusCode),
    INDEX IX_Campuses_Active (IsActive)
);
GO

-- ================================================================
-- BẢNG 4D: BUILDINGS - Tòa nhà (Reference Table)
-- ================================================================
CREATE TABLE Buildings (
    BuildingID INT IDENTITY(1,1) PRIMARY KEY,
    CampusID INT NOT NULL,
    BuildingCode NVARCHAR(20) NOT NULL,                -- H6, A, B, C
    BuildingName NVARCHAR(100),                         -- "Tòa H6", "Tòa A"
    FloorCount INT,                                     -- Số tầng
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (CampusID) REFERENCES Campuses(CampusID) ON DELETE CASCADE,
    UNIQUE (CampusID, BuildingCode),
    INDEX IX_Buildings_Campus (CampusID, IsActive),
    INDEX IX_Buildings_Code (BuildingCode)
);
GO

-- ================================================================
-- BẢNG 4E: ROOMS - Phòng (Reference Table)
-- ================================================================
CREATE TABLE Rooms (
    RoomID INT IDENTITY(1,1) PRIMARY KEY,
    BuildingID INT NOT NULL,
    RoomNumber NVARCHAR(20) NOT NULL,                  -- 101, 202, P301
    RoomName NVARCHAR(100),                             -- "Phòng máy 1", "Thư viện"
    RoomType NVARCHAR(50),                              -- Lab, Library, Office, etc.
    Capacity INT,                                       -- Sức chứa (số người)
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (BuildingID) REFERENCES Buildings(BuildingID) ON DELETE CASCADE,
    UNIQUE (BuildingID, RoomNumber),
    INDEX IX_Rooms_Building (BuildingID, IsActive),
    INDEX IX_Rooms_Number (RoomNumber)
);
GO

-- ================================================================
-- BẢNG 4: PRINTERS - Máy in (Updated với Foreign Keys)
-- ================================================================
CREATE TABLE Printers (
    PrinterID BIGINT IDENTITY(1,1) PRIMARY KEY,         -- Auto-increment ID
    PrinterName NVARCHAR(100) NOT NULL,                 -- Tên máy in
    
    -- Foreign Keys thay vì text fields
    BrandID INT NOT NULL,
    ModelID INT NOT NULL,
    RoomID INT NOT NULL,
    
    IPAddress NVARCHAR(50),                             -- IP máy in
    
    -- Cấu hình máy (có thể override defaults từ PrinterModels)
    PaperSizes NVARCHAR(50) DEFAULT 'A4,A3',
    ColorPrinting BIT DEFAULT 0,
    DuplexPrinting BIT DEFAULT 1,
    
    -- Trạng thái
    Status NVARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'Maintenance', 'Error')),
    TotalPagesPrinted INT DEFAULT 0,
    LastMaintenanceDate DATE,
    
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(20),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (BrandID) REFERENCES Brands(BrandID),
    FOREIGN KEY (ModelID) REFERENCES PrinterModels(ModelID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    
    INDEX IX_Printer_Room (RoomID, Status),
    INDEX IX_Printer_Model (ModelID),
    INDEX IX_Printer_Status (Status)
);
GO

-- ================================================================
-- PHÂN QUYỀN (RBAC) - Roles & Permissions
-- ================================================================
-- ================================================================
-- RBAC: Roles, Permissions, UserRoles, RolePermissions
-- ================================================================
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(200)
);
GO

CREATE TABLE Permissions (
    PermissionID INT IDENTITY(1,1) PRIMARY KEY,
    PermissionKey NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(200),
    Module NVARCHAR(50), -- Ví dụ: 'AUTH', 'PRINT_JOB', 'PRINTER', 'REPORT', etc.
    INDEX IX_Permissions_Key (PermissionKey)
);
GO

CREATE TABLE UserRoles (
    UserID NVARCHAR(20) NOT NULL,
    RoleID INT NOT NULL,
    AssignedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    PRIMARY KEY (UserID, RoleID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    INDEX IX_UserRoles_User (UserID)
);
GO

CREATE TABLE RolePermissions (
    RoleID INT NOT NULL,
    PermissionID INT NOT NULL,
    GrantedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID) ON DELETE CASCADE,
    INDEX IX_RolePermissions_Role (RoleID)
);
GO

-- ================================================================
-- BẢNG 10: REPORTS - Báo cáo tháng & năm
-- ================================================================
CREATE TABLE ReportsMonthly (
    ReportID INT IDENTITY(1,1) PRIMARY KEY,
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
    
    TopStudentID NVARCHAR(20),
    TopStudentPages INT,
    
    GeneratedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    GeneratedBy NVARCHAR(20),
    Notes NVARCHAR(500),
    
    UNIQUE (ReportYear, ReportMonth),
    FOREIGN KEY (MostUsedPrinterID) REFERENCES Printers(PrinterID),
    FOREIGN KEY (TopStudentID) REFERENCES Users(UserID),
    INDEX IX_ReportsMonthly_YM (ReportYear, ReportMonth)
);
GO

CREATE TABLE ReportsYearly (
    ReportID INT IDENTITY(1,1) PRIMARY KEY,
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
    
    GeneratedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    GeneratedBy NVARCHAR(20),
    Notes NVARCHAR(500),
    
    INDEX IX_ReportsYearly_Year (ReportYear)
);
GO

-- ================================================================
-- BẢNG 5: DOCUMENTS - Tài liệu tải lên
-- ================================================================
CREATE TABLE Documents (
    DocumentID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID NVARCHAR(20) NOT NULL,
    OriginalFileName NVARCHAR(255) NOT NULL,            -- Tên file gốc
    StoredFileName NVARCHAR(255) NOT NULL UNIQUE,       -- Tên file lưu (unique)
    FilePath NVARCHAR(500) NOT NULL,                    -- Đường dẫn file
    FileExtension NVARCHAR(10) NOT NULL,                -- pdf, docx, pptx...
    FileSizeKB DECIMAL(10,2) NOT NULL,                  -- Kích thước (KB)
    TotalPages INT NOT NULL,                            -- Tổng số trang
    UploadDate DATETIME2 DEFAULT GETDATE(),
    IsDeleted BIT DEFAULT 0,
    
    CONSTRAINT CK_Documents_FileExt CHECK (LEN(FileExtension) BETWEEN 2 AND 10 AND FileExtension NOT LIKE '%.%' AND FileExtension NOT LIKE '%/%'),
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX IX_Doc_Student (StudentID, IsDeleted, UploadDate DESC)
);
GO

-- ================================================================
-- BẢNG 6: PRINT_JOBS - Lệnh in (Print Queue)
-- ================================================================
CREATE TABLE PrintJobs (
    JobID INT IDENTITY(1,1) PRIMARY KEY,
    ColorPageRange NVARCHAR(255) NULL, -- Trang in màu ("1-3,5,10-15"), NULL: theo ColorMode
    StudentID NVARCHAR(20) NOT NULL,
    DocumentID INT NOT NULL,
    PrinterID BIGINT NOT NULL,
    
    -- Cấu hình in
    PaperSize NVARCHAR(10) NOT NULL DEFAULT 'A4' CHECK (PaperSize IN ('A4', 'A3', 'A5')),
    PagesToPrint NVARCHAR(255) NOT NULL,                -- "1-10,15,20-25"
    ColorMode NVARCHAR(20) DEFAULT 'BlackWhite' CHECK (ColorMode IN ('Color', 'Grayscale', 'BlackWhite')),
    IsSingleSided BIT DEFAULT 0,                        -- 0: 2 mặt, 1: 1 mặt
    NumCopies INT DEFAULT 1,                            -- Số bản copy
    
    -- Tính toán
    TotalPagesToPrint INT NOT NULL,                     -- Tổng số trang in
    TotalSheetsUsed INT NOT NULL,                       -- Tổng số tờ giấy
    A4EquivalentPages INT NOT NULL,                     -- Quy đổi A4
    
    -- Trạng thái
    JobStatus NVARCHAR(20) DEFAULT 'Pending' CHECK (JobStatus IN ('Pending', 'Printing', 'Completed', 'Failed', 'Cancelled')),
    SubmittedAt DATETIME2 DEFAULT GETDATE(),
    StartedAt DATETIME2,
    CompletedAt DATETIME2,
    ErrorMessage NVARCHAR(500),
    Notes NVARCHAR(500),                                -- Ghi chú (VD: số lần retry)
    
    CONSTRAINT CK_PrintJobs_Totals CHECK (
        TotalPagesToPrint >= 0 AND TotalSheetsUsed >= 0 AND A4EquivalentPages >= 0
    ),
    CONSTRAINT CK_PrintJobs_Times CHECK (
        (StartedAt IS NULL OR StartedAt >= SubmittedAt) AND (CompletedAt IS NULL OR CompletedAt >= StartedAt)
    ),
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID),
    FOREIGN KEY (DocumentID) REFERENCES Documents(DocumentID),
    FOREIGN KEY (PrinterID) REFERENCES Printers(PrinterID),
    INDEX IX_Job_Student (StudentID, JobStatus, SubmittedAt DESC),
    INDEX IX_Job_Printer (PrinterID, JobStatus),
    INDEX IX_Job_Status (JobStatus, SubmittedAt DESC)
);
GO

-- ================================================================
-- BẢNG 7: PRINT_LOGS - Lịch sử in (Log)
-- ================================================================
CREATE TABLE PrintLogs (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    JobID INT NOT NULL,
    StudentID NVARCHAR(20) NOT NULL,
    PrinterID BIGINT NOT NULL,
    DocumentName NVARCHAR(255) NOT NULL,
    PaperSize NVARCHAR(10) NOT NULL,
    PagesPrinted INT NOT NULL,                          -- Số trang đã in
    A4EquivalentUsed INT NOT NULL,                      -- Số trang A4 đã dùng
    PrintTime DATETIME2 DEFAULT GETDATE(),              -- Thời gian in
    DurationSeconds INT,                                -- Thời lượng (giây)
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Success', 'Failed')),
    
    CONSTRAINT CK_PrintLogs_NonNegative CHECK (PagesPrinted >= 0 AND A4EquivalentUsed >= 0),
    
    
    FOREIGN KEY (JobID) REFERENCES PrintJobs(JobID) ON DELETE CASCADE,
    FOREIGN KEY (StudentID) REFERENCES Users(UserID),
    FOREIGN KEY (PrinterID) REFERENCES Printers(PrinterID),
    INDEX IX_Log_Student (StudentID, PrintTime DESC),
    INDEX IX_Log_Printer (PrinterID, PrintTime DESC),
    INDEX IX_Log_Time (PrintTime DESC)
);
GO

-- ================================================================
-- BẢNG 8: SYSTEM_CONFIG - Cấu hình hệ thống
-- ================================================================
CREATE TABLE SystemConfig (
    ConfigKey NVARCHAR(100) PRIMARY KEY,
    ConfigValue NVARCHAR(MAX) NOT NULL,
    Description NVARCHAR(500),
    DataType NVARCHAR(20) NOT NULL CHECK (DataType IN ('String', 'Integer', 'Decimal', 'Boolean', 'JSON')),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(20)
);
GO

-- ================================================================
-- BẢNG GIÁ VÀ LOẠI FILE (Chuẩn hóa)
-- ================================================================
CREATE TABLE PagePricing (
    PricingID INT IDENTITY(1,1) PRIMARY KEY,
    PaperSize NVARCHAR(10) NOT NULL CHECK (PaperSize IN ('A4','A3','A5')),
    PricePerPage DECIMAL(10,2) NOT NULL CHECK (PricePerPage >= 0),
    Currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
    EffectiveFrom DATE NOT NULL,
    EffectiveTo DATE NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    Notes NVARCHAR(255),
    
    UNIQUE (PaperSize, EffectiveFrom),
    INDEX IX_PagePricing_Active (IsActive, EffectiveFrom DESC)
);
GO

-- ================================================================
-- AUTH: OTP qua Email & Thiết bị tin cậy & Refresh Tokens (2FA)
-- ================================================================

-- RefreshTokens: Token rotation & revocation (New - Phase 3)
CREATE TABLE RefreshTokens (
    TokenID NVARCHAR(100) PRIMARY KEY,                  -- JWT token ID (UUID format)
    UserID NVARCHAR(20) NOT NULL,                       -- User this token belongs to
    DeviceID NVARCHAR(200),                             -- SHA-256 hash of device fingerprint
    DeviceFingerprint NVARCHAR(200),                    -- SHA-256 hash of device signature
    Token NVARCHAR(500) NOT NULL,                       -- JWT token value
    ExpiresAt DATETIME2 NOT NULL,                       -- Token expiration timestamp
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),     -- Token creation time
    LastUsedAt DATETIME2,                               -- Last time token was used
    RevokedAt DATETIME2,                                -- Revocation timestamp (NULL if active)
    RevokeReason NVARCHAR(100),                         -- Reason for revocation
    IpAddress NVARCHAR(50),                             -- Client IP address
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX IX_RT_UserId (UserID, ExpiresAt DESC),
    INDEX IX_RT_Token (Token),
    INDEX IX_RT_Expiry (ExpiresAt)
);
GO

CREATE TABLE EmailOtpCodes (
    OtpID INT IDENTITY(1,1) PRIMARY KEY,
    UserID NVARCHAR(20) NULL,                           -- Nullable (dùng cho registration)
    Email NVARCHAR(100) NULL,                           -- Dùng cho registration (user chưa tồn tại)
    Purpose NVARCHAR(30) NOT NULL CHECK (Purpose IN ('PasswordReset','Login2FA','EmailVerification','Register2FA')),
    Code NVARCHAR(10) NOT NULL,                         -- Mã OTP (6 chữ số)
    ExpiresAt DATETIME2 NOT NULL,                       -- Thời điểm hết hạn
    ConsumedAt DATETIME2 NULL,                          -- Đã sử dụng
    AttemptCount INT NOT NULL DEFAULT 0,
    MaxAttempts INT NOT NULL DEFAULT 5,
    RequestedByIp NVARCHAR(45),                         -- IPv4/IPv6
    DeviceId NVARCHAR(64),                              -- Dấu vết thiết bị (nếu có)
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

-- Chỉ cho phép 1 OTP chưa dùng trên mỗi Purpose
CREATE UNIQUE INDEX UX_EmailOtp_Active ON EmailOtpCodes(UserID, Purpose) WHERE ConsumedAt IS NULL AND UserID IS NOT NULL;
CREATE INDEX IX_EmailOtp_UserPurpose ON EmailOtpCodes(UserID, Purpose, ExpiresAt);
CREATE INDEX IX_EmailOtp_EmailPurpose ON EmailOtpCodes(Email, Purpose, ExpiresAt);
GO

-- Forgot password reset tokens (phục vụ F03)
CREATE TABLE PasswordResetTokens (
    TokenID NVARCHAR(100) PRIMARY KEY,                  -- UUID
    UserID NVARCHAR(20) NOT NULL,
    Token NVARCHAR(200) NOT NULL,                       -- giá trị token gửi qua email
    ExpiresAt DATETIME2 NOT NULL,
    ConsumedAt DATETIME2 NULL,
    RequestedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    RequestedByIp NVARCHAR(45),

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

CREATE INDEX IX_PwdReset_UserExpiry ON PasswordResetTokens(UserID, ExpiresAt);
GO

CREATE TABLE TrustedDevices (
    UserID NVARCHAR(20) NOT NULL,
    DeviceId NVARCHAR(200) NOT NULL,                    -- SHA-256 hash of device fingerprint
    DeviceName NVARCHAR(100),
    UserAgent NVARCHAR(255),
    IpAddress NVARCHAR(45),
    DeviceFingerprint NVARCHAR(200),                    -- SHA-256 hash of device
    TrustedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    ExpiresAt DATETIME2 NOT NULL,
    LastUsedAt DATETIME2 NULL,
    RevokedAt DATETIME2 NULL,

    PRIMARY KEY (UserID, DeviceId),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

CREATE INDEX IX_TrustedDevices_Expiry ON TrustedDevices(UserID, ExpiresAt);
GO

CREATE TABLE AllowedFileTypes (
    FileTypeID INT IDENTITY(1,1) PRIMARY KEY,
    FileExtension NVARCHAR(10) NOT NULL, -- 'pdf', 'docx'
    MimeType NVARCHAR(100) NOT NULL,
    MaxFileSizeMB INT NOT NULL DEFAULT 50 CHECK (MaxFileSizeMB > 0),
    IsAllowed BIT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(20),
    
    CONSTRAINT UQ_AllowedFileTypes_Ext UNIQUE (FileExtension),
    INDEX IX_FileTypes_Allowed (IsAllowed)
);
GO

-- Note: Seed data moved to database_seed_data.sql
GO

-- ================================================================
-- BẢNG 9: NOTIFICATIONS - Thông báo
-- ================================================================
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    RecipientID NVARCHAR(20) NOT NULL,                  -- UserID người nhận
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    NotificationType NVARCHAR(20) DEFAULT 'Info' CHECK (NotificationType IN ('Info', 'Warning', 'Error', 'Success')),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (RecipientID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX IX_Notif_Recipient (RecipientID, IsRead, CreatedAt DESC)
);
GO

-- ================================================================
-- BẢNG 11: PRINTER_MAINTENANCE - Log bảo trì máy in (Production)
-- ================================================================
CREATE TABLE PrinterMaintenance (
    MaintenanceID INT IDENTITY(1,1) PRIMARY KEY,
    PrinterID BIGINT NOT NULL,
    MaintenanceDate DATE NOT NULL,
    MaintenanceType NVARCHAR(20) NOT NULL CHECK (MaintenanceType IN ('Routine','Repair','Emergency','Upgrade')),
    Description NVARCHAR(500),
    Technician NVARCHAR(100),
    Cost DECIMAL(12,2),
    DurationMinutes INT,
    PerformedBy NVARCHAR(20),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    FOREIGN KEY (PrinterID) REFERENCES Printers(PrinterID) ON DELETE CASCADE,
    INDEX IX_PM_PrinterDate (PrinterID, MaintenanceDate DESC)
);
GO

-- ================================================================
-- VIEWS - Truy vấn thuận tiện
-- ================================================================

-- View 1: Thông tin sinh viên và số dư trang
CREATE VIEW vw_StudentPageInfo AS
SELECT 
    u.UserID as StudentID,
    u.FullName,
    u.Email,
    pb.A4Balance,
    pb.A3Balance,
    pb.TotalA4Equivalent,
    pb.LastUpdated as BalanceLastUpdated
FROM Users u
INNER JOIN PageBalance pb ON u.UserID = pb.StudentID
WHERE u.UserType = 'Student' AND u.Status = 'Active';
GO

-- View 2: Lịch sử in của sinh viên (Updated with Reference Tables)
CREATE VIEW vw_PrintHistory AS
SELECT 
    pl.LogID,
    pl.StudentID,
    u.FullName as StudentName,
    pl.DocumentName,
    pl.PrinterID,
    p.PrinterName,
    CONCAT(c.CampusName, ' - ', bld.BuildingCode, ' - ', r.RoomNumber) AS PrinterLocation,
    pl.PaperSize,
    pl.PagesPrinted,
    pl.A4EquivalentUsed,
    pl.PrintTime,
    pl.Status
FROM PrintLogs pl
INNER JOIN Users u ON pl.StudentID = u.UserID
INNER JOIN Printers p ON pl.PrinterID = p.PrinterID
INNER JOIN Rooms r ON p.RoomID = r.RoomID
INNER JOIN Buildings bld ON r.BuildingID = bld.BuildingID
INNER JOIN Campuses c ON bld.CampusID = c.CampusID;
GO

-- View 3: Thống kê máy in (Updated with Reference Tables)
CREATE VIEW vw_PrinterStats AS
SELECT 
    p.PrinterID,
    p.PrinterName,
    CONCAT(c.CampusName, ' - ', bld.BuildingCode, ' - ', r.RoomNumber) AS Location,
    p.Status,
    p.TotalPagesPrinted,
    COUNT(pj.JobID) as TotalJobs,
    SUM(CASE WHEN pj.JobStatus = 'Completed' THEN 1 ELSE 0 END) as CompletedJobs,
    SUM(CASE WHEN pj.JobStatus = 'Failed' THEN 1 ELSE 0 END) as FailedJobs,
    SUM(CASE WHEN pj.JobStatus IN ('Pending', 'Printing') THEN 1 ELSE 0 END) as PendingJobs
FROM Printers p
INNER JOIN Rooms r ON p.RoomID = r.RoomID
INNER JOIN Buildings bld ON r.BuildingID = bld.BuildingID
INNER JOIN Campuses c ON bld.CampusID = c.CampusID
LEFT JOIN PrintJobs pj ON p.PrinterID = pj.PrinterID
GROUP BY p.PrinterID, p.PrinterName, c.CampusName, bld.BuildingCode, r.RoomNumber, p.Status, p.TotalPagesPrinted;
GO

-- ================================================================
-- STORED PROCEDURES
-- ================================================================

-- SP1: Kiểm tra số dư trang trước khi in
CREATE PROCEDURE sp_CheckPageBalance
    @StudentID NVARCHAR(20),
    @PaperSize NVARCHAR(10),
    @RequiredPages INT,
    @HasEnough BIT OUTPUT,
    @CurrentBalance INT OUTPUT
AS
BEGIN
    IF @RequiredPages < 0 RETURN;
    DECLARE @A4Equivalent INT;
    
    -- Tính số trang A4 tương đương
    IF @PaperSize = 'A3'
        SET @A4Equivalent = @RequiredPages * 2;
    ELSE
        SET @A4Equivalent = @RequiredPages;
    
    -- Lấy số dư hiện tại
    SELECT @CurrentBalance = TotalA4Equivalent
    FROM PageBalance
    WHERE StudentID = @StudentID;
    
    -- Kiểm tra đủ không
    IF @CurrentBalance >= @A4Equivalent
        SET @HasEnough = 1;
    ELSE
        SET @HasEnough = 0;
END;
GO

-- SP5: Tạo báo cáo tháng từ dữ liệu thực
CREATE PROCEDURE sp_GenerateMonthlyReport
    @ReportYear INT,
    @ReportMonth INT,
    @GeneratedBy NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Xóa báo cáo trùng (nếu đã tạo trước đó)
    DELETE FROM ReportsMonthly WHERE ReportYear = @ReportYear AND ReportMonth = @ReportMonth;
    
    DECLARE @StartDate DATE = DATEFROMPARTS(@ReportYear, @ReportMonth, 1);
    DECLARE @EndDate DATE = EOMONTH(@StartDate);
    
    INSERT INTO ReportsMonthly (
        ReportYear, ReportMonth,
        TotalStudentsActive, TotalPrintJobs,
        SuccessfulJobs, FailedJobs,
        TotalPagesPrinted, TotalA4Equivalent,
        TotalPagesPurchased, TotalRevenue,
        MostUsedPrinterID, MostUsedPrinterJobs,
        TopStudentID, TopStudentPages,
        GeneratedAt, GeneratedBy
    )
    SELECT
        @ReportYear, @ReportMonth,
        COALESCE(COUNT(DISTINCT pl.StudentID), 0) AS TotalStudentsActive,
        COALESCE(COUNT(pl.LogID), 0) AS TotalPrintJobs,
        COALESCE(SUM(CASE WHEN pl.Status = 'Success' THEN 1 ELSE 0 END), 0) AS SuccessfulJobs,
        COALESCE(SUM(CASE WHEN pl.Status = 'Failed' THEN 1 ELSE 0 END), 0) AS FailedJobs,
        COALESCE(SUM(pl.PagesPrinted), 0) AS TotalPagesPrinted,
        COALESCE(SUM(pl.A4EquivalentUsed), 0) AS TotalA4Equivalent,
        COALESCE((SELECT SUM(pt.A4Pages + pt.A3Pages * 2)
                  FROM PageTransactions pt
                  WHERE pt.TransactionType = 'Purchase'
                    AND pt.TransactionStatus = 'Completed'
                    AND pt.CreatedAt >= @StartDate AND pt.CreatedAt <= DATEADD(DAY, 1, @EndDate)), 0) AS TotalPagesPurchased,
        COALESCE((SELECT SUM(pt.Amount)
                  FROM PageTransactions pt
                  WHERE pt.TransactionType = 'Purchase'
                    AND pt.TransactionStatus = 'Completed'
                    AND pt.CreatedAt >= @StartDate AND pt.CreatedAt <= DATEADD(DAY, 1, @EndDate)), 0) AS TotalRevenue,
        -- Most used printer
        (SELECT TOP 1 pl2.PrinterID
         FROM PrintLogs pl2
         WHERE pl2.PrintTime >= @StartDate AND pl2.PrintTime <= DATEADD(DAY, 1, @EndDate)
         GROUP BY pl2.PrinterID
         ORDER BY COUNT(*) DESC) AS MostUsedPrinterID,
        (SELECT TOP 1 COUNT(*)
         FROM PrintLogs pl2
         WHERE pl2.PrintTime >= @StartDate AND pl2.PrintTime <= DATEADD(DAY, 1, @EndDate)
         GROUP BY pl2.PrinterID
         ORDER BY COUNT(*) DESC) AS MostUsedPrinterJobs,
        -- Top student
        (SELECT TOP 1 pl3.StudentID
         FROM PrintLogs pl3
         WHERE pl3.PrintTime >= @StartDate AND pl3.PrintTime <= DATEADD(DAY, 1, @EndDate)
         GROUP BY pl3.StudentID
         ORDER BY SUM(pl3.A4EquivalentUsed) DESC) AS TopStudentID,
        (SELECT TOP 1 SUM(pl3.A4EquivalentUsed)
         FROM PrintLogs pl3
         WHERE pl3.PrintTime >= @StartDate AND pl3.PrintTime <= DATEADD(DAY, 1, @EndDate)
         GROUP BY pl3.StudentID
         ORDER BY SUM(pl3.A4EquivalentUsed) DESC) AS TopStudentPages,
        GETDATE(), @GeneratedBy
    FROM PrintLogs pl
    WHERE pl.PrintTime >= @StartDate AND pl.PrintTime <= DATEADD(DAY, 1, @EndDate);
END;
GO

-- SP2: Cấp trang cho sinh viên
CREATE PROCEDURE sp_AllocatePages
    @StudentID NVARCHAR(20),
    @A4Pages INT,
    @Semester NVARCHAR(20),
    @AllocatedBy NVARCHAR(20)
AS
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        IF @A4Pages <= 0 THROW 50001, 'A4Pages must be > 0', 1;
        -- Thêm giao dịch
        INSERT INTO PageTransactions (StudentID, TransactionType, A4Pages, Semester, CreatedBy)
        VALUES (@StudentID, 'Allocate', @A4Pages, @Semester, @AllocatedBy);
        
        -- Cập nhật số dư
        UPDATE PageBalance
        SET A4Balance = A4Balance + @A4Pages,
            LastUpdated = GETDATE()
        WHERE StudentID = @StudentID;
        
        -- Nếu chưa có record trong PageBalance, tạo mới
        IF @@ROWCOUNT = 0
        BEGIN
            INSERT INTO PageBalance (StudentID, A4Balance)
            VALUES (@StudentID, @A4Pages);
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- SP3: Mua trang
CREATE PROCEDURE sp_PurchasePages
    @StudentID NVARCHAR(20),
    @A4Pages INT,
    @A3Pages INT,
    @Amount DECIMAL(10,2),
    @PaymentMethod NVARCHAR(50),
    @TransactionID INT OUTPUT
AS
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        IF @A4Pages < 0 OR @A3Pages < 0 THROW 50002, 'Pages must be >= 0', 1;
        IF @Amount < 0 THROW 50003, 'Amount must be >= 0', 1;
        -- Thêm giao dịch mua
        INSERT INTO PageTransactions (StudentID, TransactionType, A4Pages, A3Pages, Amount, PaymentMethod, TransactionStatus)
        VALUES (@StudentID, 'Purchase', @A4Pages, @A3Pages, @Amount, @PaymentMethod, 'Completed');
        
        SET @TransactionID = SCOPE_IDENTITY();
        
        -- Cập nhật số dư
        UPDATE PageBalance
        SET A4Balance = A4Balance + @A4Pages,
            A3Balance = A3Balance + @A3Pages,
            LastUpdated = GETDATE()
        WHERE StudentID = @StudentID;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- SP4: Hoàn thành lệnh in
CREATE PROCEDURE sp_CompletePrintJob
    @JobID INT
AS
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @StudentID NVARCHAR(20);
        DECLARE @PrinterID NVARCHAR(20);
        DECLARE @DocumentID INT;
        DECLARE @PaperSize NVARCHAR(10);
        DECLARE @TotalPages INT;
        DECLARE @A4Equivalent INT;
        DECLARE @DocName NVARCHAR(255);
        DECLARE @StartTime DATETIME2;
        
        -- Lấy thông tin job
        SELECT 
            @StudentID = StudentID,
            @PrinterID = PrinterID,
            @DocumentID = DocumentID,
            @PaperSize = PaperSize,
            @TotalPages = TotalPagesToPrint,
            @A4Equivalent = A4EquivalentPages,
            @StartTime = StartedAt
        FROM PrintJobs
        WHERE JobID = @JobID;
        
        -- Lấy tên tài liệu
        SELECT @DocName = OriginalFileName
        FROM Documents
        WHERE DocumentID = @DocumentID;
        
        -- Cập nhật trạng thái job
        UPDATE PrintJobs
        SET JobStatus = 'Completed',
            CompletedAt = GETDATE()
        WHERE JobID = @JobID;
        
        -- Trừ số trang
        IF @PaperSize = 'A3'
            UPDATE PageBalance
            SET A3Balance = A3Balance - (@A4Equivalent / 2)
            WHERE StudentID = @StudentID;
        ELSE
            UPDATE PageBalance
            SET A4Balance = A4Balance - @A4Equivalent
            WHERE StudentID = @StudentID;
        
        -- Ghi transaction
        INSERT INTO PageTransactions (StudentID, TransactionType, A4Pages, Notes)
        VALUES (@StudentID, 'Use', -@A4Equivalent, 'JobID: ' + CAST(@JobID AS NVARCHAR(20)));
        
        -- Tạo log
        INSERT INTO PrintLogs (JobID, StudentID, PrinterID, DocumentName, PaperSize, PagesPrinted, A4EquivalentUsed, DurationSeconds, Status)
        VALUES (@JobID, @StudentID, @PrinterID, @DocName, @PaperSize, @TotalPages, @A4Equivalent, 
                DATEDIFF(SECOND, @StartTime, GETDATE()), 'Success');
        
        -- Cập nhật tổng số trang của máy in
        UPDATE Printers
        SET TotalPagesPrinted = TotalPagesPrinted + @TotalPages
        WHERE PrinterID = @PrinterID;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        -- Re-throw with context
        THROW;
    END CATCH
END;
GO

-- SP6: Phát hành OTP qua email cho các mục đích (Reset mật khẩu, 2FA, xác thực email)
CREATE PROCEDURE sp_IssueEmailOtp
    @UserID NVARCHAR(20) = NULL,
    @Email NVARCHAR(100) = NULL,
    @Purpose NVARCHAR(30),
    @RequestedByIp NVARCHAR(45) = NULL,
    @DeviceId NVARCHAR(64) = NULL,
    @OtpCode NVARCHAR(10) OUTPUT,
    @ExpiresAt DATETIME2 OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Resolve user by email if needed
    IF @UserID IS NULL AND @Email IS NOT NULL
        SELECT @UserID = UserID FROM Users WHERE Email = @Email;

    IF @UserID IS NULL
        THROW 50010, 'User not found for issuing OTP', 1;

    DECLARE @ExpireMinutes INT = 10;
    DECLARE @MaxAttempts INT = 5;

    SELECT @ExpireMinutes = TRY_CAST(ConfigValue AS INT)
    FROM SystemConfig WHERE ConfigKey = 'OTP.EmailExpirationMinutes';

    SELECT @MaxAttempts = TRY_CAST(ConfigValue AS INT)
    FROM SystemConfig WHERE ConfigKey = 'OTP.MaxAttempts';

    SET @ExpiresAt = DATEADD(MINUTE, ISNULL(@ExpireMinutes, 10), GETDATE());

    -- Invalidate existing unconsumed OTP for the same purpose
    DELETE FROM EmailOtpCodes
    WHERE UserID = @UserID AND Purpose = @Purpose AND ConsumedAt IS NULL;

    -- Generate 6-digit numeric OTP
    SET @OtpCode = RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);

    INSERT INTO EmailOtpCodes (UserID, Purpose, Code, ExpiresAt, AttemptCount, MaxAttempts, RequestedByIp, DeviceId)
    VALUES (@UserID, @Purpose, @OtpCode, @ExpiresAt, 0, ISNULL(@MaxAttempts, 5), @RequestedByIp, @DeviceId);
END;
GO

-- SP7: Tiêu thụ/kiểm tra OTP
CREATE PROCEDURE sp_ConsumeEmailOtp
    @UserID NVARCHAR(20),
    @Purpose NVARCHAR(30),
    @Code NVARCHAR(10),
    @DeviceId NVARCHAR(64) = NULL,
    @Success BIT OUTPUT,
    @Error NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @Success = 0; SET @Error = NULL;

    DECLARE @OtpID INT;
    DECLARE @MaxAttempts INT;

    -- Get latest active OTP
    SELECT TOP 1 @OtpID = OtpID, @MaxAttempts = MaxAttempts
    FROM EmailOtpCodes
    WHERE UserID = @UserID AND Purpose = @Purpose AND ConsumedAt IS NULL AND ExpiresAt >= GETDATE()
    ORDER BY CreatedAt DESC;

    IF @OtpID IS NULL
    BEGIN
        SET @Error = N'Không có OTP hợp lệ hoặc đã hết hạn';
        RETURN;
    END

    DECLARE @CurrentAttempt INT;
    SELECT @CurrentAttempt = AttemptCount FROM EmailOtpCodes WHERE OtpID = @OtpID;

    IF @CurrentAttempt >= @MaxAttempts
    BEGIN
        UPDATE EmailOtpCodes SET ConsumedAt = GETDATE() WHERE OtpID = @OtpID; -- lock OTP
        SET @Error = N'Vượt quá số lần thử OTP';
        RETURN;
    END

    DECLARE @ActualCode NVARCHAR(10);
    SELECT @ActualCode = Code FROM EmailOtpCodes WHERE OtpID = @OtpID;

    IF @ActualCode = @Code
    BEGIN
        UPDATE EmailOtpCodes SET ConsumedAt = GETDATE() WHERE OtpID = @OtpID;
        SET @Success = 1;

        -- Side effects: nếu xác thực email
        IF @Purpose IN ('EmailVerification','Register2FA')
            UPDATE Users SET EmailVerifiedAt = GETDATE() WHERE UserID = @UserID;
        RETURN;
    END
    ELSE
    BEGIN
        UPDATE EmailOtpCodes SET AttemptCount = AttemptCount + 1 WHERE OtpID = @OtpID;
        SELECT @CurrentAttempt = AttemptCount FROM EmailOtpCodes WHERE OtpID = @OtpID;
        IF @CurrentAttempt >= @MaxAttempts
            UPDATE EmailOtpCodes SET ConsumedAt = GETDATE() WHERE OtpID = @OtpID; -- lock after max attempts
        SET @Error = N'Mã OTP không đúng';
        RETURN;
    END
END;
GO

-- ================================================================
-- VIEW: Printer Details với thông tin đầy đủ (JOIN các bảng reference)
-- ================================================================
CREATE OR ALTER VIEW vw_PrinterDetails AS
SELECT 
    p.PrinterID,
    p.PrinterName,
    
    -- Brand & Model info
    b.BrandName,
    b.BrandID,
    m.ModelName,
    m.ModelID,
    
    -- Location info (Campus -> Building -> Room)
    c.CampusCode,
    c.CampusName,
    bld.BuildingCode,
    bld.BuildingName,
    r.RoomNumber,
    r.RoomName,
    r.RoomType,
    
    -- Location string (formatted)
    CONCAT(c.CampusName, ' - ', bld.BuildingCode, ' - ', r.RoomNumber) AS Location,
    
    -- Printer config
    p.IPAddress,
    p.PaperSizes,
    p.ColorPrinting,
    p.DuplexPrinting,
    
    -- Status
    p.Status,
    p.TotalPagesPrinted,
    p.LastMaintenanceDate,
    
    p.CreatedAt,
    p.CreatedBy,
    p.UpdatedAt
FROM 
    Printers p
    INNER JOIN PrinterModels m ON p.ModelID = m.ModelID
    INNER JOIN Brands b ON m.BrandID = b.BrandID
    INNER JOIN Rooms r ON p.RoomID = r.RoomID
    INNER JOIN Buildings bld ON r.BuildingID = bld.BuildingID
    INNER JOIN Campuses c ON bld.CampusID = c.CampusID;
GO

-- ================================================================
-- STORED PROCEDURES: Reference Data Management
-- ================================================================

-- SP: Lấy danh sách Buildings theo Campus
CREATE OR ALTER PROCEDURE sp_GetBuildingsByCampus
    @CampusID INT = NULL,
    @CampusCode NVARCHAR(20) = NULL,
    @ActiveOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        b.BuildingID,
        b.CampusID,
        b.BuildingCode,
        b.BuildingName,
        b.FloorCount,
        b.IsActive,
        c.CampusCode,
        c.CampusName
    FROM 
        Buildings b
        INNER JOIN Campuses c ON b.CampusID = c.CampusID
    WHERE 
        (@CampusID IS NULL OR b.CampusID = @CampusID)
        AND (@CampusCode IS NULL OR c.CampusCode = @CampusCode)
        AND (@ActiveOnly = 0 OR b.IsActive = 1)
    ORDER BY 
        c.CampusCode, b.BuildingCode;
END
GO

-- SP: Lấy danh sách Rooms theo Building
CREATE OR ALTER PROCEDURE sp_GetRoomsByBuilding
    @BuildingID INT = NULL,
    @BuildingCode NVARCHAR(20) = NULL,
    @ActiveOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        r.RoomID,
        r.BuildingID,
        r.RoomNumber,
        r.RoomName,
        r.RoomType,
        r.Capacity,
        r.IsActive,
        b.BuildingCode,
        b.BuildingName,
        c.CampusCode,
        c.CampusName
    FROM 
        Rooms r
        INNER JOIN Buildings b ON r.BuildingID = b.BuildingID
        INNER JOIN Campuses c ON b.CampusID = c.CampusID
    WHERE 
        (@BuildingID IS NULL OR r.BuildingID = @BuildingID)
        AND (@BuildingCode IS NULL OR b.BuildingCode = @BuildingCode)
        AND (@ActiveOnly = 0 OR r.IsActive = 1)
    ORDER BY 
        c.CampusCode, b.BuildingCode, r.RoomNumber;
END
GO

-- SP: Lấy danh sách Models theo Brand
CREATE OR ALTER PROCEDURE sp_GetModelsByBrand
    @BrandID INT = NULL,
    @BrandName NVARCHAR(50) = NULL,
    @ActiveOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        m.ModelID,
        m.BrandID,
        m.ModelName,
        m.ModelDescription,
        m.DefaultPaperSizes,
        m.DefaultColorPrinting,
        m.DefaultDuplexPrinting,
        m.IsActive,
        b.BrandName
    FROM 
        PrinterModels m
        INNER JOIN Brands b ON m.BrandID = b.BrandID
    WHERE 
        (@BrandID IS NULL OR m.BrandID = @BrandID)
        AND (@BrandName IS NULL OR b.BrandName = @BrandName)
        AND (@ActiveOnly = 0 OR m.IsActive = 1)
    ORDER BY 
        b.BrandName, m.ModelName;
END
GO

-- SP8: Đăng ký thiết bị tin cậy (bỏ qua 2FA trong thời hạn)
CREATE PROCEDURE sp_RegisterTrustedDevice
    @UserID NVARCHAR(20),
    @DeviceId NVARCHAR(64),
    @DeviceName NVARCHAR(100) = NULL,
    @UserAgent NVARCHAR(255) = NULL,
    @IpAddress NVARCHAR(45) = NULL,
    @TrustDays INT = NULL,
    @ExpiresAt DATETIME2 OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DefaultTrustDays INT = 30;
    SELECT @DefaultTrustDays = TRY_CAST(ConfigValue AS INT)
    FROM SystemConfig WHERE ConfigKey = 'TwoFactor.TrustDays';

    IF @TrustDays IS NULL SET @TrustDays = ISNULL(@DefaultTrustDays, 30);
    SET @ExpiresAt = DATEADD(DAY, @TrustDays, GETDATE());

    IF EXISTS (SELECT 1 FROM TrustedDevices WHERE UserID = @UserID AND DeviceId = @DeviceId)
    BEGIN
        UPDATE TrustedDevices
        SET DeviceName = COALESCE(@DeviceName, DeviceName),
            UserAgent = COALESCE(@UserAgent, UserAgent),
            IpAddress = COALESCE(@IpAddress, IpAddress),
            TrustedAt = GETDATE(),
            ExpiresAt = @ExpiresAt,
            RevokedAt = NULL
        WHERE UserID = @UserID AND DeviceId = @DeviceId;
    END
    ELSE
    BEGIN
        INSERT INTO TrustedDevices (UserID, DeviceId, DeviceName, UserAgent, IpAddress, TrustedAt, ExpiresAt)
        VALUES (@UserID, @DeviceId, @DeviceName, @UserAgent, @IpAddress, GETDATE(), @ExpiresAt);
    END
END;
GO

-- ================================================================
-- Note: Sample data moved to database_seed_data.sql
-- ================================================================

-- ================================================================
-- FUNCTIONS HỮU ÍCH
-- ================================================================

-- Function: Tính số trang A4 tương đương
CREATE FUNCTION fn_CalculateA4Equivalent
(
    @A4Pages INT,
    @A3Pages INT
)
RETURNS INT
AS
BEGIN
    RETURN @A4Pages + (@A3Pages * 2);
END;
GO

-- Function: Kiểm tra file có được phép không
CREATE FUNCTION fn_IsFileTypeAllowed
(
    @FileExtension NVARCHAR(10)
)
RETURNS BIT
AS
BEGIN
    DECLARE @AllowedTypes NVARCHAR(MAX);
    DECLARE @IsAllowed BIT = 0;
    
    SELECT @AllowedTypes = ConfigValue
    FROM SystemConfig
    WHERE ConfigKey = 'AllowedFileTypes';
    
    IF @AllowedTypes LIKE '%' + LOWER(@FileExtension) + '%'
        SET @IsAllowed = 1;
    
    RETURN @IsAllowed;
END;
GO

-- ================================================================
-- INDEXES BỔ SUNG ĐỂ TỐI ƯU
-- ================================================================

CREATE NONCLUSTERED INDEX IX_PrintJobs_DateTime ON PrintJobs(SubmittedAt DESC, CompletedAt DESC);
CREATE NONCLUSTERED INDEX IX_PageTrans_DateTime ON PageTransactions(CreatedAt DESC);
CREATE NONCLUSTERED INDEX IX_PrintLogs_StatusTime ON PrintLogs(Status, PrintTime DESC);
CREATE NONCLUSTERED INDEX IX_Documents_Ext_Student ON Documents(FileExtension, StudentID, UploadDate DESC);
GO

-- ================================================================
-- THÔNG TIN DATABASE
-- ================================================================

SELECT 
    'Database HCMSIU_SSPS đã được tạo thành công!' as Message,
    '9 bảng chính (Users, PageBalance, PageTransactions, Printers, Documents, PrintJobs, PrintLogs, SystemConfig, Notifications)' as Tables,
    '3 Views (vw_StudentPageInfo, vw_PrintHistory, vw_PrinterStats)' as Views,
    '4 Stored Procedures (sp_CheckPageBalance, sp_AllocatePages, sp_PurchasePages, sp_CompletePrintJob)' as StoredProcedures,
    '2 Functions (fn_CalculateA4Equivalent, fn_IsFileTypeAllowed)' as Functions;
GO
