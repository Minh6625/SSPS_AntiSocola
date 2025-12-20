-- ================================================================
-- HCMSIU_SSPS - STUDENT SMART PRINTING SERVICE DATABASE
-- Hệ thống quản lý in ấn thông minh cho sinh viên
-- Database: PostgreSQL 14+
-- Converted from SQL Server
-- Version: 2.0
-- Date: December 20, 2025
-- ================================================================

-- PostgreSQL không cần USE, chỉ cần connect đúng database

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
    PrinterStatus VARCHAR(20) DEFAULT 'Active' CHECK (PrinterStatus IN ('Active', 'Inactive', 'Maintenance')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (BrandID) REFERENCES Brands(BrandID),
    FOREIGN KEY (ModelID) REFERENCES PrinterModels(ModelID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);

CREATE INDEX IX_Printers_Status ON Printers(PrinterStatus);
CREATE INDEX IX_Printers_Room ON Printers(RoomID);
CREATE INDEX IX_Printers_Brand ON Printers(BrandID);

-- ================================================================
-- BẢNG 5: PRINT_JOBS - Công việc in
-- ================================================================
CREATE TABLE PrintJobs (
    JobID BIGSERIAL PRIMARY KEY,
    StudentID VARCHAR(20) NOT NULL,
    PrinterID BIGINT NOT NULL,
    FileName VARCHAR(255) NOT NULL,
    FileSize BIGINT,
    FileType VARCHAR(20),
    FilePath VARCHAR(500),
    PaperSize VARCHAR(10) NOT NULL CHECK (PaperSize IN ('A4', 'A3')),
    ColorMode VARCHAR(20) NOT NULL CHECK (ColorMode IN ('Color', 'Grayscale')),
    DuplexMode VARCHAR(20) NOT NULL CHECK (DuplexMode IN ('OneSided', 'TwoSided')),
    NumCopies INT DEFAULT 1 CHECK (NumCopies > 0),
    TotalPages INT NOT NULL CHECK (TotalPages > 0),
    PagesUsed INT NOT NULL CHECK (PagesUsed > 0),
    JobStatus VARCHAR(20) DEFAULT 'Pending' CHECK (JobStatus IN ('Pending', 'Printing', 'Completed', 'Failed', 'Cancelled')),
    SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PrintedAt TIMESTAMP,
    ErrorMessage VARCHAR(500),
    
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PrinterID) REFERENCES Printers(PrinterID)
);

CREATE INDEX IX_Jobs_Student ON PrintJobs(StudentID, SubmittedAt DESC);
CREATE INDEX IX_Jobs_Printer ON PrintJobs(PrinterID, JobStatus);
CREATE INDEX IX_Jobs_Status ON PrintJobs(JobStatus, SubmittedAt DESC);

-- ================================================================
-- BẢNG 6: PRINT_LOGS - Log in ấn (đơn giản hóa)
-- ================================================================
CREATE TABLE PrintLogs (
    LogID BIGSERIAL PRIMARY KEY,
    JobID BIGINT NOT NULL,
    StudentID VARCHAR(20) NOT NULL,
    PrinterID BIGINT NOT NULL,
    PaperSize VARCHAR(10) NOT NULL,
    ColorMode VARCHAR(20) NOT NULL,
    DuplexMode VARCHAR(20) NOT NULL,
    NumCopies INT NOT NULL,
    TotalPages INT NOT NULL,
    PagesUsed INT NOT NULL,
    JobStatus VARCHAR(20) NOT NULL,
    SubmittedAt TIMESTAMP NOT NULL,
    PrintedAt TIMESTAMP,
    
    FOREIGN KEY (JobID) REFERENCES PrintJobs(JobID) ON DELETE CASCADE,
    FOREIGN KEY (StudentID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PrinterID) REFERENCES Printers(PrinterID)
);

CREATE INDEX IX_Logs_Student ON PrintLogs(StudentID, SubmittedAt DESC);
CREATE INDEX IX_Logs_Printer ON PrintLogs(PrinterID, SubmittedAt DESC);
CREATE INDEX IX_Logs_Date ON PrintLogs(SubmittedAt DESC);

-- ================================================================
-- BẢNG 7: PAGE_PRICING - Giá trang in
-- ================================================================
CREATE TABLE PagePricing (
    PricingID SERIAL PRIMARY KEY,
    PaperSize VARCHAR(10) NOT NULL CHECK (PaperSize IN ('A4', 'A3')),
    ColorMode VARCHAR(20) NOT NULL CHECK (ColorMode IN ('Color', 'Grayscale')),
    PricePerPage DECIMAL(10,2) NOT NULL CHECK (PricePerPage >= 0),
    EffectiveFrom TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EffectiveTo TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedBy VARCHAR(20),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (PaperSize, ColorMode, EffectiveFrom)
);

CREATE INDEX IX_Pricing_Active ON PagePricing(IsActive, EffectiveFrom DESC);

-- ================================================================
-- BẢNG 8: SYSTEM_CONFIGS - Cấu hình hệ thống
-- ================================================================
CREATE TABLE SystemConfigs (
    ConfigID SERIAL PRIMARY KEY,
    ConfigKey VARCHAR(100) NOT NULL UNIQUE,
    ConfigValue TEXT NOT NULL,
    ConfigDescription VARCHAR(500),
    DataType VARCHAR(20) DEFAULT 'String' CHECK (DataType IN ('String', 'Integer', 'Boolean', 'JSON')),
    IsEditable BOOLEAN DEFAULT TRUE,
    UpdatedBy VARCHAR(20),
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IX_Configs_Key ON SystemConfigs(ConfigKey);

-- ================================================================
-- BẢNG 9: REFRESH_TOKENS - Token làm mới
-- ================================================================
CREATE TABLE RefreshTokens (
    TokenID BIGSERIAL PRIMARY KEY,
    UserID VARCHAR(20) NOT NULL,
    Token VARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt TIMESTAMP NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    RevokedAt TIMESTAMP,
    IsRevoked BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE INDEX IX_RefreshTokens_User ON RefreshTokens(UserID);
CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(Token);
CREATE INDEX IX_RefreshTokens_Expires ON RefreshTokens(ExpiresAt, IsRevoked);

-- ================================================================
-- BẢNG 10: OTP_VERIFICATIONS - Mã OTP xác thực
-- ================================================================
CREATE TABLE OTPVerifications (
    OTPID BIGSERIAL PRIMARY KEY,
    Email VARCHAR(100) NOT NULL,
    OTPCode VARCHAR(10) NOT NULL,
    Purpose VARCHAR(50) NOT NULL CHECK (Purpose IN ('Registration', 'PasswordReset', 'EmailVerification', 'TwoFactorAuth')),
    ExpiresAt TIMESTAMP NOT NULL,
    VerifiedAt TIMESTAMP,
    IsVerified BOOLEAN DEFAULT FALSE,
    AttemptCount INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IX_OTP_Email ON OTPVerifications(Email, Purpose, IsVerified);
CREATE INDEX IX_OTP_Expires ON OTPVerifications(ExpiresAt);

-- ================================================================
-- END OF SCHEMA
-- ================================================================
