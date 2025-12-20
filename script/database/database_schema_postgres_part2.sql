-- ================================================================
-- HCMSIU_SSPS - STUDENT SMART PRINTING SERVICE DATABASE (PART 2/2)
-- Hệ thống quản lý in ấn thông minh cho sinh viên
-- Database: PostgreSQL 14+
-- Converted from SQL Server
-- Date: December 20, 2025
-- Bảng: 15-27 (ReportsYearly → PrinterMaintenance)
-- ================================================================

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
-- END OF PART 2 - All 27 Tables Completed! ✅
-- Now run both Part 1 and Part 2 in pgAdmin
-- ================================================================
