-- ================================================================
-- HCMSIU_SSPS - SEED DATA (Sample Data)
-- Dữ liệu mẫu cho hệ thống in ấn
-- Database: SQL Server 2019+
-- Version: 3.0 (RBAC with 31 Functions)
-- Date: December 8, 2025
-- ================================================================

USE HCMSIU_SSPS;
GO

-- ================================================================
-- 1. SEED ROLES
-- ================================================================

INSERT INTO Roles (RoleName, Description) VALUES
('Student', N'Sinh viên - có 13 chức năng'),
('SPSO', N'Nhân viên vận hành - có 10 chức năng'),
('Admin', N'Quản trị hệ thống - có quyền tất cả');
GO

-- ================================================================
-- 2. SEED PERMISSIONS (31 chức năng + cross-role)
-- ================================================================
-- AUTHENTICATION MODULE (F01-F03, Common)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('AUTH.LOGIN', N'[F01] Đăng nhập', 'AUTH'),
('AUTH.REGISTER', N'[F02] Đăng ký tài khoản', 'AUTH'),
('AUTH.FORGOT_PASSWORD', N'[F03] Quên mật khẩu', 'AUTH'),
('AUTH.LOGOUT', N'Đăng xuất', 'AUTH');
GO

-- DOCUMENT PRINTING MODULE (F04-F06, Student)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('PRINT.VIEW_PRINTERS', N'[F04] Xem danh sách máy in', 'PRINT_JOB'),
('PRINT.UPLOAD_DOCUMENT', N'[F05] Tải lên tài liệu', 'PRINT_JOB'),
('PRINT.SUBMIT_JOB', N'[F06] Gửi lệnh in', 'PRINT_JOB');
GO

-- PAGE BALANCE & TRANSACTION (F07-F10, Student)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('PAGE.VIEW_BALANCE', N'[F07] Xem số dư trang', 'PAGE_BALANCE'),
('PAGE.BUY_PAGES', N'[F08] Mua trang in', 'PAGE_BALANCE'),
('PAGE.VIEW_HISTORY', N'[F09] Xem lịch sử giao dịch', 'PAGE_TRANSACTION'),
('PAGE.VIEW_PRICING', N'[F10] Xem bảng giá', 'PAGE_BALANCE');
GO

-- PRINT JOB HISTORY (F11-F13, Student)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('JOB.VIEW_MY_JOBS', N'[F11] Xem lịch sử in của tôi', 'PRINT_LOG'),
('JOB.CANCEL_JOB', N'[F12] Hủy lệnh in', 'PRINT_LOG'),
('JOB.REPRINT_JOB', N'[F13] In lại', 'PRINT_LOG');
GO

-- DASHBOARD (F14-F15, Student + SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('DASHBOARD.VIEW_STUDENT', N'[F14] Dashboard sinh viên', 'DASHBOARD'),
('DASHBOARD.VIEW_SPSO', N'[F15] Dashboard SPSO', 'DASHBOARD');
GO

-- PRINTER MANAGEMENT (F16-F18, SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('PRINTER.VIEW_ALL', N'[F16] Xem danh sách máy in', 'PRINTER'),
('PRINTER.ADD', N'[F17] Thêm máy in', 'PRINTER'),
('PRINTER.EDIT', N'[F18] Chỉnh sửa máy in', 'PRINTER'),
('PRINTER.TOGGLE_STATUS', N'Bật/tắt máy in', 'PRINTER'),
('PRINTER.DELETE', N'Xóa máy in', 'PRINTER');
GO

-- PRINTER MAINTENANCE (F19-F20, SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('MAINTENANCE.VIEW', N'[F19] Xem danh sách bảo trì', 'PRINTER_MAINTENANCE'),
('MAINTENANCE.CREATE', N'[F20] Tạo công việc bảo trì', 'PRINTER_MAINTENANCE'),
('MAINTENANCE.EDIT', N'Chỉnh sửa công việc bảo trì', 'PRINTER_MAINTENANCE'),
('MAINTENANCE.CLOSE', N'Đóng công việc bảo trì', 'PRINTER_MAINTENANCE');
GO

-- PRINT JOB QUEUE (F21-F23, SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('QUEUE.VIEW_ALL_JOBS', N'[F21] Xem hàng đợi in', 'PRINT_LOG'),
('QUEUE.MONITOR_PRINTERS', N'[F22] Giám sát máy in', 'PRINT_LOG'),
('QUEUE.CANCEL_STUDENT_JOB', N'[F23] Hủy lệnh in (SPSO)', 'PRINT_LOG');
GO

-- REPORTS (F24-F26, SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('REPORT.VIEW', N'[F24] Xem báo cáo', 'REPORT'),
('REPORT.GENERATE', N'[F25] Tạo báo cáo tùy chỉnh', 'REPORT'),
('REPORT.EXPORT', N'[F26] Xuất báo cáo', 'REPORT');
GO

-- NOTIFICATIONS (F27-F28, Student + SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('NOTIFICATION.VIEW', N'[F27] Xem thông báo', 'NOTIFICATION'),
('NOTIFICATION.MARK_READ', N'[F28] Đánh dấu đã xem', 'NOTIFICATION');
GO

-- PROFILE & SETTINGS (F29-F31, Student + SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('PROFILE.VIEW', N'[F29] Xem hồ sơ', 'PROFILE'),
('PROFILE.EDIT', N'[F30] Chỉnh sửa hồ sơ', 'PROFILE'),
('PROFILE.CHANGE_PASSWORD', N'[F31] Đổi mật khẩu', 'PROFILE');
GO

-- SYSTEM ADMIN (F32+, Admin only)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('ADMIN.VIEW_ALL_USERS', N'Xem tất cả người dùng', 'ADMIN'),
('ADMIN.MANAGE_USERS', N'Quản lý người dùng', 'ADMIN'),
('ADMIN.VIEW_SYSTEM_CONFIG', N'Xem cấu hình hệ thống', 'ADMIN'),
('ADMIN.EDIT_SYSTEM_CONFIG', N'Chỉnh sửa cấu hình hệ thống', 'ADMIN'),
('ADMIN.VIEW_AUDIT_LOG', N'Xem audit log', 'ADMIN');
GO

-- ================================================================
-- 3. ASSIGN PERMISSIONS TO ROLES
-- ================================================================

-- STUDENT Role: 13 chức năng (F01-F03, F04-F13, F27-F31 của student)
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Student'), PermissionID 
FROM Permissions 
WHERE PermissionKey IN (
    -- Auth: F01-F03
    'AUTH.LOGIN', 'AUTH.REGISTER', 'AUTH.FORGOT_PASSWORD', 'AUTH.LOGOUT',
    -- Print & Document: F04-F06
    'PRINT.VIEW_PRINTERS', 'PRINT.UPLOAD_DOCUMENT', 'PRINT.SUBMIT_JOB',
    -- Page Balance: F07-F10
    'PAGE.VIEW_BALANCE', 'PAGE.BUY_PAGES', 'PAGE.VIEW_HISTORY', 'PAGE.VIEW_PRICING',
    -- Print Job History: F11-F13
    'JOB.VIEW_MY_JOBS', 'JOB.CANCEL_JOB', 'JOB.REPRINT_JOB',
    -- Dashboard: F14
    'DASHBOARD.VIEW_STUDENT',
    -- Notifications: F27-F28
    'NOTIFICATION.VIEW', 'NOTIFICATION.MARK_READ',
    -- Profile: F29-F31
    'PROFILE.VIEW', 'PROFILE.EDIT', 'PROFILE.CHANGE_PASSWORD'
);
GO

-- SPSO Role: 10 chức năng (F01-F03, F16-F26)
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'SPSO'), PermissionID 
FROM Permissions 
WHERE PermissionKey IN (
    -- Auth: F01-F03
    'AUTH.LOGIN', 'AUTH.FORGOT_PASSWORD', 'AUTH.LOGOUT',
    -- Dashboard: F15
    'DASHBOARD.VIEW_SPSO',
    -- Printer Management: F16-F18
    'PRINTER.VIEW_ALL', 'PRINTER.ADD', 'PRINTER.EDIT', 'PRINTER.TOGGLE_STATUS', 'PRINTER.DELETE',
    -- Printer Maintenance: F19-F20
    'MAINTENANCE.VIEW', 'MAINTENANCE.CREATE', 'MAINTENANCE.EDIT', 'MAINTENANCE.CLOSE',
    -- Print Job Queue: F21-F23
    'QUEUE.VIEW_ALL_JOBS', 'QUEUE.MONITOR_PRINTERS', 'QUEUE.CANCEL_STUDENT_JOB',
    -- Reports: F24-F26
    'REPORT.VIEW', 'REPORT.GENERATE', 'REPORT.EXPORT',
    -- Notifications: F27-F28
    'NOTIFICATION.VIEW', 'NOTIFICATION.MARK_READ',
    -- Profile: F29-F31
    'PROFILE.VIEW', 'PROFILE.EDIT', 'PROFILE.CHANGE_PASSWORD'
);
GO

-- ADMIN Role: Tất cả permissions
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Admin'), PermissionID 
FROM Permissions;
GO

-- ================================================================
-- 2. SEED USERS (TEST ACCOUNTS)
-- Password: 123456 (BCrypt hash)
-- BCrypt rounds: 10
-- Hash: $2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde
-- ================================================================

INSERT INTO Users (UserID, Email, PasswordHash, FullName, UserType, Status, EmailVerifiedAt)
VALUES 
-- Student Test Account
('STUDENT_TEST', 'student.test@edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde', 
 N'Student Test Account', 'Student', 'Active', GETDATE()),

-- SPSO Test Account
('SPSO_TEST', 'spso.test@edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde', 
 N'SPSO Test Account', 'SPSO', 'Active', GETDATE()),

-- Admin Test Account
('ADMIN_TEST', 'admin.test@edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde', 
 N'Admin Test Account', 'Admin', 'Active', GETDATE());
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

INSERT INTO Users (UserID, Email, PasswordHash, FullName, PhoneNumber, UserType, Status, EmailVerifiedAt)
VALUES 
('ITITIU21001', 'ITITIU21001@student.hcmiu.edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde',
 N'Trần Văn B', '0901234567', 'Student', 'Active', GETDATE()),
 
('ITITIU21002', 'ITITIU21002@student.hcmiu.edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde',
 N'Lê Thị C', '0901234568', 'Student', 'Active', GETDATE()),
 
('IELSIU21001', 'IELSIU21001@student.hcmiu.edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde',
 N'Phạm Văn D', '0901234569', 'Student', 'Active', GETDATE()),

('SPSO001', 'spso001@hcmiu.edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde',
 N'Nguyễn Văn A', NULL, 'SPSO', 'Active', GETDATE());
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

INSERT INTO Printers (PrinterID, PrinterName, Brand, Model, Location, Campus, Building, RoomNumber, IPAddress, Status, CreatedBy)
VALUES 
('PR-H6-101', N'Máy in H6 - 101', 'HP', 'LaserJet Pro M428fdw', 
 N'Dĩ An - H6 - P101', N'Dĩ An', 'H6', '101', '192.168.1.101', 'Active', 'SPSO001'),
 
('PR-H6-201', N'Máy in H6 - 201', 'Canon', 'imageRUNNER 2625i', 
 N'Dĩ An - H6 - P201', N'Dĩ An', 'H6', '201', '192.168.1.102', 'Active', 'SPSO001'),
 
('PR-A-102', N'Máy in A - 102', 'Epson', 'WorkForce Pro WF-C5790', 
 N'Dĩ An - A - P102', N'Dĩ An', 'A', '102', '192.168.2.101', 'Active', 'SPSO001'),
 
('PR-LIB-G01', N'Máy in Thư viện', 'HP', 'LaserJet Enterprise M607', 
 N'Dĩ An - Thư viện - G01', N'Dĩ An', N'Thư viện', 'G01', '192.168.3.101', 'Active', 'SPSO001');
GO

-- ================================================================
-- 6. SEED PAGE PRICING
-- ================================================================

INSERT INTO PagePricing (PaperSize, PricePerPage, Currency, EffectiveFrom, IsActive, Notes)
VALUES 
('A4', 500.00, 'VND', '2024-01-01', 1, N'Giá tiêu chuẩn trang A4'),
('A3', 1000.00, 'VND', '2024-01-01', 1, N'Giá tiêu chuẩn trang A3 (= 2 x A4)');
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
