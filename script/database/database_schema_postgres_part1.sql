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
    A3Balance INT NOT NULL DEFAULT 0,
    TotalA4Equivalent INT GENERATED ALWAYS AS (A4Balance + A3Balance * 2) STORED,
    LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- ================================================================
-- BẢNG 3: PAGE_TRANSACTIONS - Lịch sử cấp/mua trang
-- ================================================================
CREATE TABLE PageTransactions (
    TransactionID SERIAL PRIMARY KEY,
    StudentID VARCHAR(20) NOT NULL,
    TransactionType VARCHAR(20) NOT NULL CHECK (TransactionType IN ('Allocate', 'Purchase', 'Use')),
    A4Pages INT NOT NULL DEFAULT 0,
    A3Pages INT NOT NULL DEFAULT 0,
    BalanceAfterA4 INT,
    BalanceAfterA3 INT,
    Amount DECIMAL(10,2),
    PaymentMethod VARCHAR(50),
    TransactionStatus VARCHAR(20) DEFAULT 'Completed' CHECK (TransactionStatus IN ('Pending', 'Completed', 'Failed')),
    Semester VARCHAR(20),
    Notes VARCHAR(500),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy VARCHAR(20),
    
    CONSTRAINT CK_PageTrans_NonNegative CHECK (COALESCE(Amount,0) >= 0 AND A4Pages >= -100000 AND A3Pages >= -100000),
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE INDEX IX_Trans_Student ON PageTransactions(StudentID, CreatedAt DESC);
CREATE INDEX IX_Trans_Type ON PageTransactions(TransactionType, TransactionStatus);

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
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'Maintenance', 'Error')),
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
-- END OF PART 1 - 14 Tables Created
-- Run Part 2 for remaining 13 tables
-- ================================================================
