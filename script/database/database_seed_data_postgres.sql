-- ================================================================
-- SPSS SIU - SEED DATA (Sample Data)
-- Dữ liệu mẫu cho Hệ thống in ấn thông minh SIU
-- Database: PostgreSQL 14+
-- Version: 3.0 (RBAC with 31 Functions)
-- Converted from SQL Server
-- Date: December 20, 2025
-- ================================================================

-- ================================================================
-- 1. SEED ROLES
-- ================================================================

INSERT INTO Roles (RoleName, Description) VALUES
('Student', 'Sinh viên - có 13 chức năng'),
('SPSO', 'Nhân viên vận hành - có 10 chức năng'),
('Admin', 'Quản trị hệ thống - có quyền tất cả');

-- ================================================================
-- 2. SEED PERMISSIONS (31 chức năng + cross-role)
-- ================================================================
-- AUTHENTICATION MODULE (F01-F03, Common)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('AUTH.LOGIN', '[F01] Đăng nhập', 'AUTH'),
('AUTH.REGISTER', '[F02] Đăng ký tài khoản', 'AUTH'),
('AUTH.FORGOT_PASSWORD', '[F03] Quên mật khẩu', 'AUTH'),
('AUTH.LOGOUT', 'Đăng xuất', 'AUTH');

-- DOCUMENT PRINTING MODULE (F04-F06, Student)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('PRINT.VIEW_PRINTERS', '[F04] Xem danh sách máy in', 'PRINT_JOB'),
('PRINT.UPLOAD_DOCUMENT', '[F05] Tải lên tài liệu', 'PRINT_JOB'),
('PRINT.SUBMIT_JOB', '[F06] Gửi lệnh in', 'PRINT_JOB');

-- PAGE BALANCE & TRANSACTION (F07-F10, Student)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('PAGE.VIEW_BALANCE', '[F07] Xem số dư trang', 'PAGE_BALANCE'),
('PAGE.BUY_PAGES', '[F08] Mua trang in', 'PAGE_BALANCE'),
('PAGE.VIEW_HISTORY', '[F09] Xem lịch sử giao dịch', 'PAGE_TRANSACTION'),
('PAGE.VIEW_PRICING', '[F10] Xem bảng giá', 'PAGE_BALANCE');

-- PRINT JOB HISTORY (F11-F13, Student)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('JOB.VIEW_MY_JOBS', '[F11] Xem lịch sử in của tôi', 'PRINT_LOG'),
('JOB.CANCEL_JOB', '[F12] Hủy lệnh in', 'PRINT_LOG'),
('JOB.REPRINT_JOB', '[F13] In lại', 'PRINT_LOG');

-- DASHBOARD (F14-F15, Student + SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('DASHBOARD.VIEW_STUDENT', '[F14] Dashboard sinh viên', 'DASHBOARD'),
('DASHBOARD.VIEW_SPSO', '[F15] Dashboard SPSO', 'DASHBOARD');

-- PRINTER MANAGEMENT (F16-F18, SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('PRINTER.VIEW_ALL', '[F16] Xem danh sách máy in', 'PRINTER'),
('PRINTER.ADD', '[F17] Thêm máy in', 'PRINTER'),
('PRINTER.EDIT', '[F18] Chỉnh sửa máy in', 'PRINTER'),
('PRINTER.TOGGLE_STATUS', 'Bật/tắt máy in', 'PRINTER'),
('PRINTER.DELETE', 'Xóa máy in', 'PRINTER');

-- PRINTER MAINTENANCE (F19-F20, SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('MAINTENANCE.VIEW', '[F19] Xem danh sách bảo trì', 'PRINTER_MAINTENANCE'),
('MAINTENANCE.CREATE', '[F20] Tạo công việc bảo trì', 'PRINTER_MAINTENANCE'),
('MAINTENANCE.EDIT', 'Chỉnh sửa công việc bảo trì', 'PRINTER_MAINTENANCE'),
('MAINTENANCE.CLOSE', 'Đóng công việc bảo trì', 'PRINTER_MAINTENANCE');

-- PRINT JOB QUEUE (F21-F23, SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('QUEUE.VIEW_ALL_JOBS', '[F21] Xem hàng đợi in', 'PRINT_LOG'),
('QUEUE.MONITOR_PRINTERS', '[F22] Giám sát máy in', 'PRINT_LOG'),
('QUEUE.CANCEL_STUDENT_JOB', '[F23] Hủy lệnh in (SPSO)', 'PRINT_LOG');

-- REPORTS (F24-F26, SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('REPORT.VIEW', '[F24] Xem báo cáo', 'REPORT'),
('REPORT.GENERATE', '[F25] Tạo báo cáo tùy chỉnh', 'REPORT'),
('REPORT.EXPORT', '[F26] Xuất báo cáo', 'REPORT');

-- NOTIFICATIONS (F27-F28, Student + SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('NOTIFICATION.VIEW', '[F27] Xem thông báo', 'NOTIFICATION'),
('NOTIFICATION.MARK_READ', '[F28] Đánh dấu đã xem', 'NOTIFICATION');

-- PROFILE & SETTINGS (F29-F31, Student + SPSO)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('PROFILE.VIEW', '[F29] Xem hồ sơ', 'PROFILE'),
('PROFILE.EDIT', '[F30] Chỉnh sửa hồ sơ', 'PROFILE'),
('PROFILE.CHANGE_PASSWORD', '[F31] Đổi mật khẩu', 'PROFILE');

-- SYSTEM ADMIN (F32+, Admin only)
INSERT INTO Permissions (PermissionKey, Description, Module) VALUES
('ADMIN.VIEW_ALL_USERS', 'Xem tất cả người dùng', 'ADMIN'),
('ADMIN.MANAGE_USERS', 'Quản lý người dùng', 'ADMIN'),
('ADMIN.VIEW_SYSTEM_CONFIG', 'Xem cấu hình hệ thống', 'ADMIN'),
('ADMIN.EDIT_SYSTEM_CONFIG', 'Chỉnh sửa cấu hình hệ thống', 'ADMIN'),
('ADMIN.VIEW_AUDIT_LOG', 'Xem audit log', 'ADMIN');

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

-- ADMIN Role: Tất cả permissions
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT (SELECT RoleID FROM Roles WHERE RoleName = 'Admin'), PermissionID 
FROM Permissions;

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
 'Student Test Account', 'Student', 'Active', CURRENT_TIMESTAMP),

-- SPSO Test Account
('SPSO_TEST', 'spso.test@edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde', 
 'SPSO Test Account', 'SPSO', 'Active', CURRENT_TIMESTAMP),

-- Admin Test Account
('ADMIN_TEST', 'admin.test@edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde', 
 'Admin Test Account', 'Admin', 'Active', CURRENT_TIMESTAMP);

-- Assign roles to test users
INSERT INTO UserRoles (UserID, RoleID)
SELECT 'STUDENT_TEST', RoleID FROM Roles WHERE RoleName = 'Student'
UNION ALL
SELECT 'SPSO_TEST', RoleID FROM Roles WHERE RoleName = 'SPSO'
UNION ALL
SELECT 'ADMIN_TEST', RoleID FROM Roles WHERE RoleName = 'Admin';

-- ================================================================
-- 3. SEED PRODUCTION USERS (Sample)
-- ================================================================

INSERT INTO Users (UserID, Email, PasswordHash, FullName, PhoneNumber, UserType, Status, EmailVerifiedAt)
VALUES 
('ITITIU21001', 'ITITIU21001@student.hcmiu.edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde',
 'Trần Văn B', '0901234567', 'Student', 'Active', CURRENT_TIMESTAMP),
 
('ITITIU21002', 'ITITIU21002@student.hcmiu.edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde',
 'Lê Thị C', '0901234568', 'Student', 'Active', CURRENT_TIMESTAMP),
 
('IELSIU21001', 'IELSIU21001@student.hcmiu.edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde',
 'Phạm Văn D', '0901234569', 'Student', 'Active', CURRENT_TIMESTAMP),

('SPSO001', 'spso001@hcmiu.edu.vn', '$2a$10$wyRkxrQryYdEdfpXaqQerOC6.q0GDt7rRVTjTdDX5jlHjNC0IWpde',
 'Nguyễn Văn A', NULL, 'SPSO', 'Active', CURRENT_TIMESTAMP);

-- Assign roles to production users
INSERT INTO UserRoles (UserID, RoleID)
SELECT u.UserID, r.RoleID
FROM Users u
CROSS JOIN Roles r
WHERE u.UserID IN ('ITITIU21001', 'ITITIU21002', 'IELSIU21001') AND r.RoleName = 'Student'
UNION ALL
SELECT 'SPSO001', RoleID FROM Roles WHERE RoleName = 'SPSO';

-- ================================================================
-- 4. SEED REFERENCE DATA: BRANDS
-- ================================================================

INSERT INTO Brands (BrandName, BrandDescription, IsActive) VALUES
('HP', 'Hewlett-Packard - Thương hiệu máy in hàng đầu thế giới', TRUE),
('Canon', 'Canon - Chuyên về máy in và máy photocopy', TRUE),
('Epson', 'Epson - Máy in phun màu và laser chất lượng cao', TRUE),
('Brother', 'Brother - Máy in văn phòng bền bỉ', TRUE),
('Xerox', 'Xerox - Giải pháp in ấn doanh nghiệp', TRUE),
('Samsung', 'Samsung - Máy in laser và đa năng', TRUE),
('Ricoh', 'Ricoh - Máy photocopy và máy in công suất lớn', TRUE),
('Kyocera', 'Kyocera - Máy in laser chuyên nghiệp', TRUE);

-- ================================================================
-- 5. SEED REFERENCE DATA: PRINTER MODELS
-- ================================================================

INSERT INTO PrinterModels (BrandID, ModelName, ModelDescription, DefaultPaperSizes, DefaultColorPrinting, DefaultDuplexPrinting, IsActive) VALUES
-- HP Models
(1, 'LaserJet Pro M404dn', 'Máy in laser đen trắng A4 tốc độ cao', 'A4', FALSE, TRUE, TRUE),
(1, 'LaserJet Pro MFP M428fdw', 'Máy in đa chức năng A4', 'A4', FALSE, TRUE, TRUE),
(1, 'Color LaserJet Pro M454dw', 'Máy in laser màu A4', 'A4', TRUE, TRUE, TRUE),
(1, 'LaserJet Enterprise M507dn', 'Máy in doanh nghiệp A4', 'A4', FALSE, TRUE, TRUE),
(1, 'LaserJet Enterprise M607', 'Máy in doanh nghiệp tốc độ cao', 'A4', FALSE, TRUE, TRUE),

-- Canon Models
(2, 'imageRUNNER 2425i', 'Máy photocopy đa năng A4', 'A4', FALSE, TRUE, TRUE),
(2, 'imageRUNNER 2625i', 'Máy photocopy đa năng A4', 'A4', FALSE, TRUE, TRUE),
(2, 'LBP226dw', 'Máy in laser đen trắng A4', 'A4', FALSE, TRUE, TRUE),
(2, 'imageCLASS MF644Cdw', 'Máy in màu đa chức năng A4', 'A4', TRUE, TRUE, TRUE),

-- Epson Models
(3, 'EcoTank L3250', 'Máy in phun liên tục đa năng', 'A4', TRUE, FALSE, TRUE),
(3, 'WorkForce Pro WF-C5790', 'Máy in phun màu văn phòng', 'A4,A3', TRUE, TRUE, TRUE),
(3, 'EcoTank L15150', 'Máy in A3 5 màu chuyên nghiệp', 'A4,A3', TRUE, TRUE, TRUE),

-- Brother Models
(4, 'HL-L2375DW', 'Máy in laser đen trắng A4', 'A4', FALSE, TRUE, TRUE),
(4, 'MFC-L2750DW', 'Máy in đa chức năng laser A4', 'A4', FALSE, TRUE, TRUE),
(4, 'HL-L8360CDW', 'Máy in laser màu A4', 'A4', TRUE, TRUE, TRUE),

-- Xerox Models
(5, 'VersaLink C405', 'Máy in màu đa năng A4', 'A4', TRUE, TRUE, TRUE),
(5, 'WorkCentre 3335', 'Máy photocopy đa năng A4', 'A4', FALSE, TRUE, TRUE),

-- Samsung Models
(6, 'ProXpress M3870FW', 'Máy in laser đa năng A4', 'A4', FALSE, TRUE, TRUE),
(6, 'ProXpress C3060FR', 'Máy in màu đa năng A4', 'A4', TRUE, TRUE, TRUE),

-- Ricoh Models
(7, 'MP 301SPF', 'Máy photocopy đa năng A4', 'A4', FALSE, TRUE, TRUE),
(7, 'Aficio MP C3003', 'Máy photocopy màu A3', 'A4,A3', TRUE, TRUE, TRUE),

-- Kyocera Models
(8, 'ECOSYS M2640idw', 'Máy in đa năng A4', 'A4', FALSE, TRUE, TRUE),
(8, 'TASKalfa 3252ci', 'Máy photocopy màu A3', 'A4,A3', TRUE, TRUE, TRUE);

-- ================================================================
-- 6. SEED REFERENCE DATA: CAMPUSES
-- ================================================================

INSERT INTO Campuses (CampusCode, CampusName, Address, IsActive) VALUES
('DA', 'Campus Dĩ An', 'Khu phố 6, P.Linh Trung, Thủ Đức, TP.HCM', TRUE),
('LT', 'Campus Linh Trung', 'Lô E2a-7, Đường D1, P.Long Thạnh Mỹ, Quận 9, TP.HCM', TRUE);

-- ================================================================
-- 7. SEED REFERENCE DATA: BUILDINGS
-- ================================================================

INSERT INTO Buildings (CampusID, BuildingCode, BuildingName, FloorCount, IsActive) VALUES
-- Campus Dĩ An
(1, 'H6', 'Tòa H6', 8, TRUE),
(1, 'H3', 'Tòa H3', 6, TRUE),
(1, 'A', 'Tòa A (Hành chính)', 5, TRUE),
(1, 'Library', 'Thư viện Trung tâm', 5, TRUE),

-- Campus Linh Trung
(2, 'E2a', 'Tòa E2a', 10, TRUE),
(2, 'E3', 'Tòa E3', 8, TRUE);

-- ================================================================
-- 8. SEED REFERENCE DATA: ROOMS
-- ================================================================

INSERT INTO Rooms (BuildingID, RoomNumber, RoomName, RoomType, Capacity, IsActive) VALUES
-- H6 Building
(1, '101', 'Phòng máy tính 1', 'Lab', 40, TRUE),
(1, '102', 'Phòng máy tính 2', 'Lab', 40, TRUE),
(1, '201', 'Phòng máy tính 3', 'Lab', 35, TRUE),
(1, '301', 'Phòng họp H6', 'Meeting', 20, TRUE),
(1, 'Ground', 'Khu vực in chung H6', 'PrintArea', 100, TRUE),

-- H3 Building
(2, '101', 'Phòng máy tính H3-1', 'Lab', 50, TRUE),
(2, '201', 'Phòng học H3-201', 'Classroom', 80, TRUE),
(2, 'Ground', 'Khu vực in chung H3', 'PrintArea', 80, TRUE),

-- A Building (Hành chính)
(3, '101', 'Phòng Hành chính', 'Office', 10, TRUE),
(3, '102', 'Phòng Đào tạo', 'Office', 8, TRUE),
(3, 'Ground', 'Khu vực in hành chính', 'PrintArea', 30, TRUE),

-- Library
(4, 'G01', 'Khu vực in tầng trệt', 'PrintArea', 50, TRUE),
(4, '2F-PrintArea', 'Khu vực in tầng 2', 'PrintArea', 30, TRUE),

-- E2a Building (Campus Linh Trung)
(5, '101', 'Phòng máy E2a-1', 'Lab', 45, TRUE),
(5, '201', 'Phòng máy E2a-2', 'Lab', 45, TRUE),
(5, 'Ground', 'Khu vực in chung E2a', 'PrintArea', 60, TRUE),

-- E3 Building
(6, '101', 'Phòng máy E3-1', 'Lab', 40, TRUE),
(6, '201', 'Phòng họp E3', 'Meeting', 30, TRUE);

-- ================================================================
-- 9. SEED PAGE BALANCE (Cấp trang cho sinh viên - chỉ A4)
-- ================================================================

INSERT INTO PageBalance (StudentID, A4Balance)
VALUES 
('STUDENT_TEST', 100),
('ITITIU21001', 100),
('ITITIU21002', 80),
('IELSIU21001', 50);

-- ================================================================
-- 10. SEED PRINTERS (Updated với Foreign Keys)
-- ================================================================

INSERT INTO Printers (PrinterName, BrandID, ModelID, RoomID, IPAddress, PaperSizes, ColorPrinting, DuplexPrinting, Status, TotalPagesPrinted, CreatedBy)
VALUES 
-- H6 Building Printers
('Máy in H6-101 (HP LaserJet)', 1, 1, 1, '192.168.1.101', 'A4', FALSE, TRUE, 'Active', 0, 'SPSO001'),
('Máy in H6-102 (Canon)', 2, 6, 2, '192.168.1.102', 'A4', FALSE, TRUE, 'Active', 0, 'SPSO001'),
('Máy in H6-201 (HP Color)', 1, 3, 3, '192.168.1.201', 'A4', TRUE, TRUE, 'Active', 0, 'SPSO001'),

-- H3 Building Printers
('Máy in H3-101 (Brother)', 4, 13, 6, '192.168.2.101', 'A4', FALSE, TRUE, 'Active', 0, 'SPSO001'),
('Máy in chung H3 (Epson)', 3, 11, 8, '192.168.2.150', 'A4,A3', TRUE, TRUE, 'Active', 0, 'SPSO001'),

-- A Building Printers (Admin area)
('Máy in Đào tạo (Xerox)', 5, 16, 10, '192.168.3.102', 'A4', TRUE, TRUE, 'Active', 0, 'SPSO001'),

-- Library Printers
('Máy in Thư viện tầng trệt', 1, 5, 12, '192.168.4.101', 'A4', FALSE, TRUE, 'Active', 0, 'SPSO001'),
('Máy in Thư viện tầng 2', 2, 7, 13, '192.168.4.201', 'A4', FALSE, TRUE, 'Active', 0, 'SPSO001'),

-- E2a Building Printers (Campus Linh Trung)
('Máy in E2a-101 (HP)', 1, 2, 14, '192.168.5.101', 'A4', FALSE, TRUE, 'Active', 0, 'SPSO001'),
('Máy in chung E2a (Epson A3)', 3, 12, 16, '192.168.5.150', 'A4,A3', TRUE, TRUE, 'Active', 0, 'SPSO001'),

-- E3 Building Printers
('Máy in E3-101 (Brother)', 4, 14, 17, '192.168.6.101', 'A4', FALSE, TRUE, 'Active', 0, 'SPSO001');

-- ================================================================
-- 11. SEED PAGE PRICING (chỉ A4)
-- ================================================================

INSERT INTO PagePricing (PaperSize, PricePerPage, Currency, EffectiveFrom, IsActive, Notes)
VALUES 
('A4', 500.00, 'VND', '2024-01-01', TRUE, 'Giá tiêu chuẩn trang A4');

-- ================================================================
-- 12. SEED ALLOWED FILE TYPES
-- ================================================================

INSERT INTO AllowedFileTypes (FileExtension, MimeType, MaxFileSizeMB, IsAllowed, UpdatedBy)
VALUES 
('pdf', 'application/pdf', 50, TRUE, 'ADMIN_TEST'),
('docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 30, TRUE, 'ADMIN_TEST'),
('pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 50, TRUE, 'ADMIN_TEST'),
('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 20, TRUE, 'ADMIN_TEST'),
('txt', 'text/plain', 5, TRUE, 'ADMIN_TEST'),
('doc', 'application/msword', 30, TRUE, 'ADMIN_TEST'),
('ppt', 'application/vnd.ms-powerpoint', 50, TRUE, 'ADMIN_TEST'),
('xls', 'application/vnd.ms-excel', 20, TRUE, 'ADMIN_TEST');

-- ================================================================
-- 13. SEED SYSTEM CONFIG
-- ================================================================

INSERT INTO SystemConfig (ConfigKey, ConfigValue, Description, DataType, UpdatedBy)
VALUES 
-- Cấu hình trang in
('DefaultA4PagesPerSemester', '100', 'Số trang A4 mặc định mỗi học kỳ', 'Integer', 'ADMIN_TEST'),
('MaxFileSizeMB', '50', 'Kích thước file tối đa (MB)', 'Integer', 'ADMIN_TEST'),
('MaxPagesPerJob', '100', 'Số trang tối đa mỗi lần in', 'Integer', 'ADMIN_TEST'),
('AllowedFileTypes', '["pdf","docx","pptx","xlsx","txt","doc","ppt","xls"]', 'Loại file được phép', 'JSON', 'ADMIN_TEST'),

-- Giá cả
('A4PricePerPage', '500', 'Giá 1 trang A4 (VND)', 'Integer', 'ADMIN_TEST'),

-- Học kỳ
('CurrentSemester', 'HK2-2024', 'Học kỳ hiện tại', 'String', 'ADMIN_TEST'),
('PageAllocationDate', '2025-01-01', 'Ngày cấp trang học kỳ này', 'String', 'ADMIN_TEST'),

-- Authentication & Security
('TwoFactor.Enabled', 'true', 'Bật xác thực hai lớp (2FA) qua email', 'Boolean', 'ADMIN_TEST'),
('TwoFactor.TrustDays', '30', 'Số ngày ghi nhớ thiết bị tin cậy', 'Integer', 'ADMIN_TEST'),
('OTP.EmailExpirationMinutes', '10', 'Thời hạn OTP email (phút)', 'Integer', 'ADMIN_TEST'),
('OTP.MaxAttempts', '5', 'Số lần thử OTP tối đa', 'Integer', 'ADMIN_TEST'),

-- Password Policy
('Password.MinLength', '8', 'Độ dài mật khẩu tối thiểu', 'Integer', 'ADMIN_TEST'),
('Password.RequireUppercase', 'true', 'Yêu cầu chữ hoa', 'Boolean', 'ADMIN_TEST'),
('Password.RequireDigit', 'true', 'Yêu cầu số', 'Boolean', 'ADMIN_TEST'),
('Password.RequireSpecialChar', 'false', 'Yêu cầu ký tự đặc biệt', 'Boolean', 'ADMIN_TEST'),
('Password.ExpirationDays', '90', 'Số ngày hết hạn mật khẩu', 'Integer', 'ADMIN_TEST'),

-- Session & Token
('Session.TimeoutMinutes', '30', 'Thời gian timeout session (phút)', 'Integer', 'ADMIN_TEST'),
('JWT.ExpirationHours', '24', 'Thời hạn JWT token (giờ)', 'Integer', 'ADMIN_TEST'),
('JWT.RefreshTokenDays', '7', 'Thời hạn refresh token (ngày)', 'Integer', 'ADMIN_TEST');

-- ================================================================
-- VERIFICATION & SUMMARY
-- ================================================================

DO $$
DECLARE
    user_count INT;
    printer_count INT;
    role_count INT;
    perm_count INT;
    config_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM Users;
    SELECT COUNT(*) INTO printer_count FROM Printers;
    SELECT COUNT(*) INTO role_count FROM Roles;
    SELECT COUNT(*) INTO perm_count FROM Permissions;
    SELECT COUNT(*) INTO config_count FROM SystemConfig;

    RAISE NOTICE '================================================================';
    RAISE NOTICE 'SEED DATA COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'TEST ACCOUNTS (Password: 123456):';
    RAISE NOTICE '- student.test@edu.vn (Student)';
    RAISE NOTICE '- spso.test@edu.vn (SPSO)';
    RAISE NOTICE '- admin.test@edu.vn (Admin)';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Users: %', user_count;
    RAISE NOTICE 'Total Printers: %', printer_count;
    RAISE NOTICE 'Total Roles: %', role_count;
    RAISE NOTICE 'Total Permissions: %', perm_count;
    RAISE NOTICE 'Total System Configs: %', config_count;
    RAISE NOTICE '';
    RAISE NOTICE 'REFERENCE DATA SUMMARY:';
    RAISE NOTICE '- Brands: 8 (HP, Canon, Epson, Brother, Xerox, Samsung, Ricoh, Kyocera)';
    RAISE NOTICE '- Printer Models: 23 models';
    RAISE NOTICE '- Campuses: 2 (Dĩ An, Linh Trung)';
    RAISE NOTICE '- Buildings: 6 buildings';
    RAISE NOTICE '- Rooms: 18 rooms';
    RAISE NOTICE '';
    RAISE NOTICE '================================================================';
END $$;
