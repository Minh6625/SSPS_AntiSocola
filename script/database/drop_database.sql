-- ================================================================
-- DROP DATABASE SCRIPT - HCMSIU_SSPS (Updated for Reference Tables)
-- Xóa toàn bộ database và dữ liệu
-- CẢNH BÁO: Script này sẽ XÓA VĨNH VIỄN toàn bộ dữ liệu!
-- ================================================================
-- Version: 2.0
-- Date: December 19, 2025
-- Changes: Added support for Reference Tables structure
-- ================================================================

USE master;
GO

-- ================================================================
-- OPTION 1: DROP ENTIRE DATABASE (RECOMMENDED)
-- Xóa toàn bộ database - Đơn giản và an toàn nhất
-- ================================================================

-- Đóng tất cả kết nối đến database
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'HCMSIU_SSPS')
BEGIN
    PRINT '================================================================';
    PRINT 'DROPPING HCMSIU_SSPS DATABASE';
    PRINT '================================================================';
    PRINT '';
    PRINT 'Closing all connections to HCMSIU_SSPS...';
    
    ALTER DATABASE HCMSIU_SSPS SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    
    PRINT 'Dropping database HCMSIU_SSPS...';
    DROP DATABASE HCMSIU_SSPS;
    
    PRINT '';
    PRINT '✓ Database HCMSIU_SSPS has been successfully dropped!';
    PRINT '';
    PRINT 'All tables removed including:';
    PRINT '- Users, Roles, Permissions (RBAC)';
    PRINT '- PageBalance, PageTransactions';
    PRINT '- Brands, PrinterModels (Reference Tables)';
    PRINT '- Campuses, Buildings, Rooms (Reference Tables)';
    PRINT '- Printers (with Foreign Keys)';
    PRINT '- PrintJobs, Documents';
    PRINT '- Reports, Notifications';
    PRINT '- SystemConfig, AllowedFileTypes';
    PRINT '';
END
ELSE
BEGIN
    PRINT 'Database HCMSIU_SSPS does not exist.';
END
GO

PRINT '================================================================';
PRINT 'DROP DATABASE COMPLETED!';
PRINT '================================================================';
PRINT '';
PRINT 'To recreate the database:';
PRINT '1. Run: script/database/database_schema_sqlserver.sql';
PRINT '2. Run: script/database/database_seed_data.sql';
PRINT '';
GO

-- ================================================================
-- OPTION 2: DROP INDIVIDUAL TABLES (for testing/development)
-- Uncomment phần này nếu muốn drop từng bảng theo thứ tự
-- ================================================================

/*
USE HCMSIU_SSPS;
GO

PRINT '================================================================';
PRINT 'DROPPING INDIVIDUAL TABLES (Order matters due to Foreign Keys)';
PRINT '================================================================';

-- Step 1: Drop dependent tables first (có FK references)
PRINT 'Step 1: Dropping tables with foreign key dependencies...';

IF OBJECT_ID('PrintJobs', 'U') IS NOT NULL DROP TABLE PrintJobs;
PRINT '- PrintJobs dropped';

IF OBJECT_ID('Documents', 'U') IS NOT NULL DROP TABLE Documents;
PRINT '- Documents dropped';

IF OBJECT_ID('PageTransactions', 'U') IS NOT NULL DROP TABLE PageTransactions;
PRINT '- PageTransactions dropped';

IF OBJECT_ID('PageBalance', 'U') IS NOT NULL DROP TABLE PageBalance;
PRINT '- PageBalance dropped';

IF OBJECT_ID('Notifications', 'U') IS NOT NULL DROP TABLE Notifications;
PRINT '- Notifications dropped';

IF OBJECT_ID('ReportsYearly', 'U') IS NOT NULL DROP TABLE ReportsYearly;
PRINT '- ReportsYearly dropped';

IF OBJECT_ID('ReportsMonthly', 'U') IS NOT NULL DROP TABLE ReportsMonthly;
PRINT '- ReportsMonthly dropped';

IF OBJECT_ID('PrinterMaintenanceLog', 'U') IS NOT NULL DROP TABLE PrinterMaintenanceLog;
PRINT '- PrinterMaintenanceLog dropped';

-- Step 2: Drop Printers (references Reference Tables)
PRINT '';
PRINT 'Step 2: Dropping Printers table...';

IF OBJECT_ID('Printers', 'U') IS NOT NULL DROP TABLE Printers;
PRINT '- Printers dropped';

-- Step 3: Drop Reference Tables (hierarchical order)
PRINT '';
PRINT 'Step 3: Dropping Reference Tables...';

-- Rooms → Buildings → Campuses
IF OBJECT_ID('Rooms', 'U') IS NOT NULL DROP TABLE Rooms;
PRINT '- Rooms dropped';

IF OBJECT_ID('Buildings', 'U') IS NOT NULL DROP TABLE Buildings;
PRINT '- Buildings dropped';

IF OBJECT_ID('Campuses', 'U') IS NOT NULL DROP TABLE Campuses;
PRINT '- Campuses dropped';

-- PrinterModels → Brands
IF OBJECT_ID('PrinterModels', 'U') IS NOT NULL DROP TABLE PrinterModels;
PRINT '- PrinterModels dropped';

IF OBJECT_ID('Brands', 'U') IS NOT NULL DROP TABLE Brands;
PRINT '- Brands dropped';

-- Step 4: Drop RBAC tables
PRINT '';
PRINT 'Step 4: Dropping RBAC tables...';

IF OBJECT_ID('RolePermissions', 'U') IS NOT NULL DROP TABLE RolePermissions;
PRINT '- RolePermissions dropped';

IF OBJECT_ID('UserRoles', 'U') IS NOT NULL DROP TABLE UserRoles;
PRINT '- UserRoles dropped';

IF OBJECT_ID('Permissions', 'U') IS NOT NULL DROP TABLE Permissions;
PRINT '- Permissions dropped';

IF OBJECT_ID('Roles', 'U') IS NOT NULL DROP TABLE Roles;
PRINT '- Roles dropped';

-- Step 5: Drop configuration tables
PRINT '';
PRINT 'Step 5: Dropping configuration tables...';

IF OBJECT_ID('SystemConfig', 'U') IS NOT NULL DROP TABLE SystemConfig;
PRINT '- SystemConfig dropped';

IF OBJECT_ID('AllowedFileTypes', 'U') IS NOT NULL DROP TABLE AllowedFileTypes;
PRINT '- AllowedFileTypes dropped';

IF OBJECT_ID('PagePricing', 'U') IS NOT NULL DROP TABLE PagePricing;
PRINT '- PagePricing dropped';

IF OBJECT_ID('EmailOtpCodes', 'U') IS NOT NULL DROP TABLE EmailOtpCodes;
PRINT '- EmailOtpCodes dropped';

IF OBJECT_ID('TrustedDevices', 'U') IS NOT NULL DROP TABLE TrustedDevices;
PRINT '- TrustedDevices dropped';

-- Step 6: Drop Users table (base table)
PRINT '';
PRINT 'Step 6: Dropping Users table...';

IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
PRINT '- Users dropped';

-- Step 7: Drop Views and Stored Procedures
PRINT '';
PRINT 'Step 7: Dropping Views and Stored Procedures...';

IF OBJECT_ID('vw_PrinterDetails', 'V') IS NOT NULL DROP VIEW vw_PrinterDetails;
PRINT '- vw_PrinterDetails dropped';

IF OBJECT_ID('sp_GetBuildingsByCampus', 'P') IS NOT NULL DROP PROCEDURE sp_GetBuildingsByCampus;
PRINT '- sp_GetBuildingsByCampus dropped';

IF OBJECT_ID('sp_GetRoomsByBuilding', 'P') IS NOT NULL DROP PROCEDURE sp_GetRoomsByBuilding;
PRINT '- sp_GetRoomsByBuilding dropped';

IF OBJECT_ID('sp_GetModelsByBrand', 'P') IS NOT NULL DROP PROCEDURE sp_GetModelsByBrand;
PRINT '- sp_GetModelsByBrand dropped';

PRINT '';
PRINT '================================================================';
PRINT 'ALL TABLES DROPPED SUCCESSFULLY!';
PRINT '================================================================';
GO
*/
