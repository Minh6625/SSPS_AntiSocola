-- ================================================================
-- HCMSIU_SSPS - SEED DATA (Sample Data)
-- Dữ liệu mẫu cho hệ thống in ấn
-- Database: SQL Server 2019+
-- Version: 2.0
-- Date: December 7, 2025
-- ================================================================

USE HCMSIU_SSPS;
GO

-- ================================================================
-- 1. SEED ROLES & PERMISSIONS
-- ================================================================

-- Insert default roles
INSERT INTO Roles (RoleName, Description) VALUES
('Student', N'Sinh viên'),
('SPSO', N'Nhân viên vận hành in ấn'),
('Admin', N'Quản trị hệ thống');
GO

-- Insert permissions
INSERT INTO Permissions (PermissionKey, Description) VALUES
('printer.view', N'Xem thông tin máy in'),
('printer.manage', N'Thêm/sửa/xóa, bật/tắt máy in'),
('job.create', N'Tạo lệnh in'),
('job.view', N'Xem lệnh in và lịch sử'),
('config.edit', N'Chỉnh sửa cấu hình hệ thống'),
('report.view', N'Xem báo cáo'),
('report.generate', N'Tạo báo cáo');
GO

-- Assign permissions to roles
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Roles r, Permissions p
WHERE r.RoleName = 'Student' AND p.PermissionKey IN ('printer.view', 'job.create', 'job.view');

INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Roles r, Permissions p
WHERE r.RoleName = 'SPSO' AND p.PermissionKey IN ('printer.view', 'printer.manage', 'job.view', 'report.view', 'report.generate');

INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Roles r, Permissions p
WHERE r.RoleName = 'Admin';
GO

-- ================================================================
-- 2. SEED USERS (TEST ACCOUNTS)
-- Password: 123456 (BCrypt hash)
-- BCrypt rounds: 10
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMye1YLzF.U5pqxBx5.q5pqN9qo8uLOickgx
-- ================================================================

-- Test Accounts với mật khẩu 123456 đã hash bằng BCrypt
INSERT INTO Users (UserID, Email, PasswordHash, FullName, UserType, Faculty, Department, Status, EmailVerifiedAt)
VALUES 
-- Student Test Account
('STUDENT_TEST', 'student.test@edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMye1YLzF.U5pqxBx5.q5pqN9qo8uLOickgx', 
 N'Student Test Account', 'Student', N'Công nghệ thông tin', NULL, 'Active', GETDATE()),

-- SPSO Test Account
('SPSO_TEST', 'spso.test@edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMye1YLzF.U5pqxBx5.q5pqN9qo8uLOickgx', 
 N'SPSO Test Account', 'SPSO', NULL, N'Phòng In Ấn', 'Active', GETDATE()),

-- Admin Test Account
('ADMIN_TEST', 'admin.test@edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMye1YLzF.U5pqxBx5.q5pqN9qo8uLOickgx', 
 N'Admin Test Account', 'Admin', NULL, N'Phòng IT', 'Active', GETDATE());
GO

-- Assign roles to test users
INSERT INTO UserRoles (UserID, RoleID)
SELECT 'STUDENT_TEST', RoleID FROM Roles WHERE RoleName = 'Student'
UNION ALL
SELECT 'SPSO_TEST', RoleID FROM Roles WHERE RoleName = 'SPSO'
UNION ALL
SELECT 'ADMIN_TEST', RoleID FROM Roles WHERE RoleName = 'Admin';
GO

-- ================================================================
-- 3. SEED PRODUCTION USERS (Sample)
-- ================================================================

INSERT INTO Users (UserID, Email, PasswordHash, FullName, PhoneNumber, UserType, Faculty, Status, EmailVerifiedAt)
VALUES 
('ITITIU21001', 'ITITIU21001@student.hcmiu.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMye1YLzF.U5pqxBx5.q5pqN9qo8uLOickgx',
 N'Trần Văn B', '0901234567', 'Student', N'Công nghệ thông tin', 'Active', GETDATE()),
 
('ITITIU21002', 'ITITIU21002@student.hcmiu.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMye1YLzF.U5pqxBx5.q5pqN9qo8uLOickgx',
 N'Lê Thị C', '0901234568', 'Student', N'Công nghệ thông tin', 'Active', GETDATE()),
 
('IELSIU21001', 'IELSIU21001@student.hcmiu.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMye1YLzF.U5pqxBx5.q5pqN9qo8uLOickgx',
 N'Phạm Văn D', '0901234569', 'Student', N'Ngôn ngữ Anh', 'Active', GETDATE()),

('SPSO001', 'spso001@hcmiu.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMye1YLzF.U5pqxBx5.q5pqN9qo8uLOickgx',
 N'Nguyễn Văn A', NULL, 'SPSO', NULL, 'Active', GETDATE());
GO

-- Assign roles to production users
INSERT INTO UserRoles (UserID, RoleID)
SELECT u.UserID, r.RoleID
FROM Users u
CROSS JOIN Roles r
WHERE u.UserID IN ('ITITIU21001', 'ITITIU21002', 'IELSIU21001') AND r.RoleName = 'Student'
UNION ALL
SELECT 'SPSO001', RoleID FROM Roles WHERE RoleName = 'SPSO';
GO

-- ================================================================
-- 4. SEED PAGE BALANCE (Cấp trang cho sinh viên)
-- ================================================================

INSERT INTO PageBalance (StudentID, A4Balance, A3Balance)
VALUES 
('STUDENT_TEST', 100, 10),
('ITITIU21001', 100, 0),
('ITITIU21002', 80, 5),
('IELSIU21001', 50, 10);
GO

-- ================================================================
-- 5. SEED PRINTERS
-- ================================================================

INSERT INTO Printers (PrinterID, PrinterName, Brand, Model, Location, Campus, Building, RoomNumber, Status, CreatedBy)
VALUES 
('PR-H6-101', N'Máy in H6 - 101', 'HP', 'LaserJet Pro M428fdw', 
 N'Dĩ An - H6 - P101', N'Dĩ An', 'H6', '101', 'Active', 'SPSO001'),
 
('PR-H6-201', N'Máy in H6 - 201', 'Canon', 'imageRUNNER 2625i', 
 N'Dĩ An - H6 - P201', N'Dĩ An', 'H6', '201', 'Active', 'SPSO001'),
 
('PR-A-102', N'Máy in A - 102', 'Epson', 'WorkForce Pro WF-C5790', 
 N'Dĩ An - A - P102', N'Dĩ An', 'A', '102', 'Active', 'SPSO001'),
 
('PR-LIB-G01', N'Máy in Thư viện', 'HP', 'LaserJet Enterprise M607', 
 N'Dĩ An - Thư viện - G01', N'Dĩ An', N'Thư viện', 'G01', 'Active', 'SPSO001');
GO

-- ================================================================
-- 6. SEED PAGE PRICING
-- ================================================================

INSERT INTO PagePricing (PaperSize, PricePerPage, Currency, EffectiveFrom, IsActive, Notes)
VALUES 
('A4', 500.00, 'VND', '2024-01-01', 1, N'Giá tiêu chuẩn trang A4'),
('A3', 1000.00, 'VND', '2024-01-01', 1, N'Giá tiêu chuẩn trang A3 (= 2 x A4)'),
('A5', 300.00, 'VND', '2024-01-01', 1, N'Giá tiêu chuẩn trang A5');
GO

-- ================================================================
-- 7. SEED ALLOWED FILE TYPES
-- ================================================================

INSERT INTO AllowedFileTypes (FileExtension, MimeType, MaxFileSizeMB, IsAllowed, UpdatedBy)
VALUES 
('pdf', 'application/pdf', 50, 1, 'ADMIN_TEST'),
('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 30, 1, 'ADMIN_TEST'),
('pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 50, 1, 'ADMIN_TEST'),
('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 20, 1, 'ADMIN_TEST'),
('txt', 'text/plain', 5, 1, 'ADMIN_TEST'),
('doc', 'application/msword', 30, 1, 'ADMIN_TEST'),
('ppt', 'application/vnd.ms-powerpoint', 50, 1, 'ADMIN_TEST'),
('xls', 'application/vnd.ms-excel', 20, 1, 'ADMIN_TEST');
GO

-- ================================================================
-- 8. SEED SYSTEM CONFIG
-- ================================================================

INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description, DataType, UpdatedBy)
VALUES 
-- Cấu hình trang in
('DefaultA4PagesPerSemester', '100', N'Số trang A4 mặc định mỗi học kỳ', 'Integer', 'ADMIN_TEST'),
('MaxFileSizeMB', '50', N'Kích thước file tối đa (MB)', 'Integer', 'ADMIN_TEST'),
('MaxPagesPerJob', '100', N'Số trang tối đa mỗi lần in', 'Integer', 'ADMIN_TEST'),
('AllowedFileTypes', '["pdf","docx","pptx","xlsx","txt","doc","ppt","xls"]', N'Loại file được phép', 'JSON', 'ADMIN_TEST'),

-- Giá cả
('A4PricePerPage', '500', N'Giá 1 trang A4 (VND)', 'Integer', 'ADMIN_TEST'),
('A3PricePerPage', '1000', N'Giá 1 trang A3 (VND)', 'Integer', 'ADMIN_TEST'),

-- Học kỳ
('CurrentSemester', 'HK2-2024', N'Học kỳ hiện tại', 'String', 'ADMIN_TEST'),
('PageAllocationDate', '2025-01-01', N'Ngày cấp trang học kỳ này', 'String', 'ADMIN_TEST'),

-- Authentication & Security
('TwoFactor.Enabled', 'true', N'Bật xác thực hai lớp (2FA) qua email', 'Boolean', 'ADMIN_TEST'),
('TwoFactor.TrustDays', '30', N'Số ngày ghi nhớ thiết bị tin cậy', 'Integer', 'ADMIN_TEST'),
('OTP.EmailExpirationMinutes', '10', N'Thời hạn OTP email (phút)', 'Integer', 'ADMIN_TEST'),
('OTP.MaxAttempts', '5', N'Số lần thử OTP tối đa', 'Integer', 'ADMIN_TEST'),

-- Password Policy
('Password.MinLength', '8', N'Độ dài mật khẩu tối thiểu', 'Integer', 'ADMIN_TEST'),
('Password.RequireUppercase', 'true', N'Yêu cầu chữ hoa', 'Boolean', 'ADMIN_TEST'),
('Password.RequireDigit', 'true', N'Yêu cầu số', 'Boolean', 'ADMIN_TEST'),
('Password.RequireSpecialChar', 'false', N'Yêu cầu ký tự đặc biệt', 'Boolean', 'ADMIN_TEST'),
('Password.ExpirationDays', '90', N'Số ngày hết hạn mật khẩu', 'Integer', 'ADMIN_TEST'),

-- Session & Token
('Session.TimeoutMinutes', '30', N'Thời gian timeout session (phút)', 'Integer', 'ADMIN_TEST'),
('JWT.ExpirationHours', '24', N'Thời hạn JWT token (giờ)', 'Integer', 'ADMIN_TEST'),
('JWT.RefreshTokenDays', '7', N'Thời hạn refresh token (ngày)', 'Integer', 'ADMIN_TEST');
GO

-- ================================================================
-- VERIFICATION & SUMMARY
-- ================================================================

DECLARE @UserCount INT, @PrinterCount INT, @RoleCount INT, @PermCount INT, @ConfigCount INT;

SELECT @UserCount = COUNT(*) FROM Users;
SELECT @PrinterCount = COUNT(*) FROM Printers;
SELECT @RoleCount = COUNT(*) FROM Roles;
SELECT @PermCount = COUNT(*) FROM Permissions;
SELECT @ConfigCount = COUNT(*) FROM SystemConfig;

PRINT '================================================================';
PRINT 'SEED DATA COMPLETED SUCCESSFULLY!';
PRINT '================================================================';
PRINT '';
PRINT 'TEST ACCOUNTS (Password: 123456):';
PRINT '- student.test@edu.vn (Student)';
PRINT '- spso.test@edu.vn (SPSO)';
PRINT '- admin.test@edu.vn (Admin)';
PRINT '';
PRINT 'Total Users: ' + CAST(@UserCount AS VARCHAR(10));
PRINT 'Total Printers: ' + CAST(@PrinterCount AS VARCHAR(10));
PRINT 'Total Roles: ' + CAST(@RoleCount AS VARCHAR(10));
PRINT 'Total Permissions: ' + CAST(@PermCount AS VARCHAR(10));
PRINT 'Total System Configs: ' + CAST(@ConfigCount AS VARCHAR(10));
PRINT '';
PRINT '================================================================';
GO
