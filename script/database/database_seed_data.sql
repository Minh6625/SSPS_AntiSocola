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
-- 4. SEED REFERENCE DATA: BRANDS
-- ================================================================

SET IDENTITY_INSERT Brands ON;

INSERT INTO Brands (BrandID, BrandName, BrandDescription, IsActive) VALUES
(1, 'HP', 'Hewlett-Packard - Thương hiệu máy in hàng đầu thế giới', 1),
(2, 'Canon', 'Canon - Chuyên về máy in và máy photocopy', 1),
(3, 'Epson', 'Epson - Máy in phun màu và laser chất lượng cao', 1),
(4, 'Brother', 'Brother - Máy in văn phòng bền bỉ', 1),
(5, 'Xerox', 'Xerox - Giải pháp in ấn doanh nghiệp', 1),
(6, 'Samsung', 'Samsung - Máy in laser và đa năng', 1),
(7, 'Ricoh', 'Ricoh - Máy photocopy và máy in công suất lớn', 1),
(8, 'Kyocera', 'Kyocera - Máy in laser chuyên nghiệp', 1);

SET IDENTITY_INSERT Brands OFF;
GO

-- ================================================================
-- 5. SEED REFERENCE DATA: PRINTER MODELS
-- ================================================================

SET IDENTITY_INSERT PrinterModels ON;

INSERT INTO PrinterModels (ModelID, BrandID, ModelName, ModelDescription, DefaultPaperSizes, DefaultColorPrinting, DefaultDuplexPrinting, IsActive) VALUES
-- HP Models
(1, 1, 'LaserJet Pro M404dn', 'Máy in laser đen trắng A4 tốc độ cao', 'A4', 0, 1, 1),
(2, 1, 'LaserJet Pro MFP M428fdw', 'Máy in đa chức năng A4', 'A4', 0, 1, 1),
(3, 1, 'Color LaserJet Pro M454dw', 'Máy in laser màu A4', 'A4', 1, 1, 1),
(4, 1, 'LaserJet Enterprise M507dn', 'Máy in doanh nghiệp A4', 'A4', 0, 1, 1),
(5, 1, 'LaserJet Enterprise M607', 'Máy in doanh nghiệp tốc độ cao', 'A4', 0, 1, 1),

-- Canon Models
(6, 2, 'imageRUNNER 2425i', 'Máy photocopy đa năng A4', 'A4', 0, 1, 1),
(7, 2, 'imageRUNNER 2625i', 'Máy photocopy đa năng A4', 'A4', 0, 1, 1),
(8, 2, 'LBP226dw', 'Máy in laser đen trắng A4', 'A4', 0, 1, 1),
(9, 2, 'imageCLASS MF644Cdw', 'Máy in màu đa chức năng A4', 'A4', 1, 1, 1),

-- Epson Models
(10, 3, 'EcoTank L3250', 'Máy in phun liên tục đa năng', 'A4', 1, 0, 1),
(11, 3, 'WorkForce Pro WF-C5790', 'Máy in phun màu văn phòng', 'A4,A3', 1, 1, 1),
(12, 3, 'EcoTank L15150', 'Máy in A3 5 màu chuyên nghiệp', 'A4,A3', 1, 1, 1),

-- Brother Models
(13, 4, 'HL-L2375DW', 'Máy in laser đen trắng A4', 'A4', 0, 1, 1),
(14, 4, 'MFC-L2750DW', 'Máy in đa chức năng laser A4', 'A4', 0, 1, 1),
(15, 4, 'HL-L8360CDW', 'Máy in laser màu A4', 'A4', 1, 1, 1),

-- Xerox Models
(16, 5, 'VersaLink C405', 'Máy in màu đa năng A4', 'A4', 1, 1, 1),
(17, 5, 'WorkCentre 3335', 'Máy photocopy đa năng A4', 'A4', 0, 1, 1),

-- Samsung Models
(18, 6, 'ProXpress M3870FW', 'Máy in laser đa năng A4', 'A4', 0, 1, 1),
(19, 6, 'ProXpress C3060FR', 'Máy in màu đa năng A4', 'A4', 1, 1, 1),

-- Ricoh Models
(20, 7, 'MP 301SPF', 'Máy photocopy đa năng A4', 'A4', 0, 1, 1),
(21, 7, 'Aficio MP C3003', 'Máy photocopy màu A3', 'A4,A3', 1, 1, 1),

-- Kyocera Models
(22, 8, 'ECOSYS M2640idw', 'Máy in đa năng A4', 'A4', 0, 1, 1),
(23, 8, 'TASKalfa 3252ci', 'Máy photocopy màu A3', 'A4,A3', 1, 1, 1);

SET IDENTITY_INSERT PrinterModels OFF;
GO

-- ================================================================
-- 6. SEED REFERENCE DATA: CAMPUSES
-- ================================================================

SET IDENTITY_INSERT Campuses ON;

INSERT INTO Campuses (CampusID, CampusCode, CampusName, Address, IsActive) VALUES
(1, 'DA', 'Campus Dĩ An', 'Khu phố 6, P.Linh Trung, Thủ Đức, TP.HCM', 1),
(2, 'LT', 'Campus Linh Trung', 'Lô E2a-7, Đường D1, P.Long Thạnh Mỹ, Quận 9, TP.HCM', 1);

SET IDENTITY_INSERT Campuses OFF;
GO

-- ================================================================
-- 7. SEED REFERENCE DATA: BUILDINGS
-- ================================================================

SET IDENTITY_INSERT Buildings ON;

INSERT INTO Buildings (BuildingID, CampusID, BuildingCode, BuildingName, FloorCount, IsActive) VALUES
-- Campus Dĩ An
(1, 1, 'H6', 'Tòa H6', 8, 1),
(2, 1, 'H3', 'Tòa H3', 6, 1),
(3, 1, 'A', 'Tòa A (Hành chính)', 5, 1),
(4, 1, 'Library', 'Thư viện Trung tâm', 5, 1),

-- Campus Linh Trung
(5, 2, 'E2a', 'Tòa E2a', 10, 1),
(6, 2, 'E3', 'Tòa E3', 8, 1);

SET IDENTITY_INSERT Buildings OFF;
GO

-- ================================================================
-- 8. SEED REFERENCE DATA: ROOMS
-- ================================================================

SET IDENTITY_INSERT Rooms ON;

INSERT INTO Rooms (RoomID, BuildingID, RoomNumber, RoomName, RoomType, Capacity, IsActive) VALUES
-- H6 Building
(1, 1, '101', 'Phòng máy tính 1', 'Lab', 40, 1),
(2, 1, '102', 'Phòng máy tính 2', 'Lab', 40, 1),
(3, 1, '201', 'Phòng máy tính 3', 'Lab', 35, 1),
(4, 1, '301', 'Phòng họp H6', 'Meeting', 20, 1),
(5, 1, 'Ground', 'Khu vực in chung H6', 'PrintArea', 100, 1),

-- H3 Building
(6, 2, '101', 'Phòng máy tính H3-1', 'Lab', 50, 1),
(7, 2, '201', 'Phòng học H3-201', 'Classroom', 80, 1),
(8, 2, 'Ground', 'Khu vực in chung H3', 'PrintArea', 80, 1),

-- A Building (Hành chính)
(9, 3, '101', 'Phòng Hành chính', 'Office', 10, 1),
(10, 3, '102', 'Phòng Đào tạo', 'Office', 8, 1),
(11, 3, 'Ground', 'Khu vực in hành chính', 'PrintArea', 30, 1),

-- Library
(12, 4, 'G01', 'Khu vực in tầng trệt', 'PrintArea', 50, 1),
(13, 4, '2F-PrintArea', 'Khu vực in tầng 2', 'PrintArea', 30, 1),

-- E2a Building (Campus Linh Trung)
(14, 5, '101', 'Phòng máy E2a-1', 'Lab', 45, 1),
(15, 5, '201', 'Phòng máy E2a-2', 'Lab', 45, 1),
(16, 5, 'Ground', 'Khu vực in chung E2a', 'PrintArea', 60, 1),

-- E3 Building
(17, 6, '101', 'Phòng máy E3-1', 'Lab', 40, 1),
(18, 6, '201', 'Phòng họp E3', 'Meeting', 30, 1);

SET IDENTITY_INSERT Rooms OFF;
GO

-- ================================================================
-- 9. SEED PAGE BALANCE (Cấp trang cho sinh viên)
-- ================================================================

INSERT INTO PageBalance (StudentID, A4Balance, A3Balance)
VALUES 
('STUDENT_TEST', 100, 10),
('ITITIU21001', 100, 0),
('ITITIU21002', 80, 5),
('IELSIU21001', 50, 10);
GO

-- ================================================================
-- 10. SEED PRINTERS (Updated với Foreign Keys)
-- ================================================================

INSERT INTO Printers (PrinterName, BrandID, ModelID, RoomID, IPAddress, PaperSizes, ColorPrinting, DuplexPrinting, Status, TotalPagesPrinted, CreatedBy)
VALUES 
-- H6 Building Printers
(N'Máy in H6-101 (HP LaserJet)', 1, 1, 1, '192.168.1.101', 'A4', 0, 1, 'Active', 0, 'SPSO001'),
(N'Máy in H6-102 (Canon)', 2, 6, 2, '192.168.1.102', 'A4', 0, 1, 'Active', 0, 'SPSO001'),
(N'Máy in H6-201 (HP Color)', 1, 3, 3, '192.168.1.201', 'A4', 1, 1, 'Active', 0, 'SPSO001'),

-- H3 Building Printers
(N'Máy in H3-101 (Brother)', 4, 13, 6, '192.168.2.101', 'A4', 0, 1, 'Active', 0, 'SPSO001'),
(N'Máy in chung H3 (Epson)', 3, 11, 8, '192.168.2.150', 'A4,A3', 1, 1, 'Active', 0, 'SPSO001'),

-- A Building Printers (Admin area)
(N'Máy in Đào tạo (Xerox)', 5, 16, 10, '192.168.3.102', 'A4', 1, 1, 'Active', 0, 'SPSO001'),

-- Library Printers
(N'Máy in Thư viện tầng trệt', 1, 5, 12, '192.168.4.101', 'A4', 0, 1, 'Active', 0, 'SPSO001'),
(N'Máy in Thư viện tầng 2', 2, 7, 13, '192.168.4.201', 'A4', 0, 1, 'Active', 0, 'SPSO001'),

-- E2a Building Printers (Campus Linh Trung)
(N'Máy in E2a-101 (HP)', 1, 2, 14, '192.168.5.101', 'A4', 0, 1, 'Active', 0, 'SPSO001'),
(N'Máy in chung E2a (Epson A3)', 3, 12, 16, '192.168.5.150', 'A4,A3', 1, 1, 'Active', 0, 'SPSO001'),

-- E3 Building Printers
(N'Máy in E3-101 (Brother)', 4, 14, 17, '192.168.6.101', 'A4', 0, 1, 'Active', 0, 'SPSO001');
GO

-- ================================================================
-- 11. SEED PAGE PRICING
-- ================================================================

INSERT INTO PagePricing (PaperSize, PricePerPage, Currency, EffectiveFrom, IsActive, Notes)
VALUES 
('A4', 500.00, 'VND', '2024-01-01', 1, N'Giá tiêu chuẩn trang A4'),
('A3', 1000.00, 'VND', '2024-01-01', 1, N'Giá tiêu chuẩn trang A3 (= 2 x A4)');
GO

-- ================================================================
-- 12. SEED ALLOWED FILE TYPES
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
-- 13. SEED SYSTEM CONFIG
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
PRINT 'REFERENCE DATA SUMMARY:';
PRINT '- Brands: 8 (HP, Canon, Epson, Brother, Xerox, Samsung, Ricoh, Kyocera)';
PRINT '- Printer Models: 23 models';
PRINT '- Campuses: 2 (Dĩ An, Linh Trung)';
PRINT '- Buildings: 6 buildings';
PRINT '- Rooms: 18 rooms';
PRINT '';
PRINT '================================================================';
GO
