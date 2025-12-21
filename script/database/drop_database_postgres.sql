-- ================================================================
-- DROP ALL TABLES SCRIPT - HCMSIU_SSPS PostgreSQL
-- Xóa toàn bộ tables và dữ liệu
-- CẢNH BÁO: Script này sẽ XÓA VĨNH VIỄN toàn bộ dữ liệu!
-- ================================================================
-- Version: 2.0 (PostgreSQL)
-- Date: December 20, 2025
-- Total: 27 Tables
-- ================================================================

-- ================================================================
-- DROP ALL TABLES IN CORRECT ORDER (respecting foreign keys)
-- PostgreSQL will automatically handle cascade if defined
-- ================================================================

-- Step 1: Drop tables with most dependencies first
DROP TABLE IF EXISTS PrintLogs CASCADE;
DROP TABLE IF EXISTS PrintJobs CASCADE;
DROP TABLE IF EXISTS Documents CASCADE;
DROP TABLE IF EXISTS PendingPayments CASCADE;
DROP TABLE IF EXISTS PageTransactions CASCADE;
DROP TABLE IF EXISTS PageBalance CASCADE;
DROP TABLE IF EXISTS Notifications CASCADE;
DROP TABLE IF EXISTS PrinterMaintenance CASCADE;

-- Step 2: Drop Reports
DROP TABLE IF EXISTS ReportsYearly CASCADE;
DROP TABLE IF EXISTS ReportsMonthly CASCADE;

-- Step 3: Drop Printers (references multiple tables)
DROP TABLE IF EXISTS Printers CASCADE;

-- Step 4: Drop Location Reference Tables (hierarchical)
DROP TABLE IF EXISTS Rooms CASCADE;
DROP TABLE IF EXISTS Buildings CASCADE;
DROP TABLE IF EXISTS Campuses CASCADE;

-- Step 5: Drop Printer Reference Tables
DROP TABLE IF EXISTS PrinterModels CASCADE;
DROP TABLE IF EXISTS Brands CASCADE;

-- Step 6: Drop RBAC Tables
DROP TABLE IF EXISTS RolePermissions CASCADE;
DROP TABLE IF EXISTS UserRoles CASCADE;
DROP TABLE IF EXISTS Permissions CASCADE;
DROP TABLE IF EXISTS Roles CASCADE;

-- Step 7: Drop Auth & Security Tables
DROP TABLE IF EXISTS EmailOtpCodes CASCADE;
DROP TABLE IF EXISTS PasswordResetTokens CASCADE;
DROP TABLE IF EXISTS RefreshTokens CASCADE;
DROP TABLE IF EXISTS TrustedDevices CASCADE;

-- Step 8: Drop Configuration Tables
DROP TABLE IF EXISTS AllowedFileTypes CASCADE;
DROP TABLE IF EXISTS PagePricing CASCADE;
DROP TABLE IF EXISTS SystemConfig CASCADE;
DROP TABLE IF EXISTS SystemConfigs CASCADE;
DROP TABLE IF EXISTS OTPVerifications CASCADE;
DROP TABLE IF EXISTS OtpVerifications CASCADE;

-- Step 9: Drop Users (base table - last)
DROP TABLE IF EXISTS Users CASCADE;

-- ================================================================
-- Verify all tables dropped
-- ================================================================
-- Run this query to check:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- ================================================================
-- END OF DROP SCRIPT
-- All 27 tables have been dropped!
-- 
-- To recreate the database:
-- 1. Run: script/database/database_schema_postgres.sql
-- 2. Run: script/database/database_seed_data_postgres.sql (if available)
-- ================================================================
