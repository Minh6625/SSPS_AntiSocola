-- ================================================================
-- DROP DATABASE SCRIPT - HCMSIU_SSPS
-- Xóa toàn bộ database và dữ liệu
-- CẢNH BÁO: Script này sẽ XÓA VĨNH VIỄN toàn bộ dữ liệu!
-- ================================================================

USE master;
GO

-- Đóng tất cả kết nối đến database
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'HCMSIU_SSPS')
BEGIN
    PRINT 'Closing all connections to HCMSIU_SSPS...';
    
    ALTER DATABASE HCMSIU_SSPS SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    
    PRINT 'Dropping database HCMSIU_SSPS...';
    DROP DATABASE HCMSIU_SSPS;
    
    PRINT 'Database HCMSIU_SSPS has been successfully dropped!';
END
ELSE
BEGIN
    PRINT 'Database HCMSIU_SSPS does not exist.';
END
GO

PRINT '================================================================';
PRINT 'DROP DATABASE COMPLETED!';
PRINT '================================================================';
GO
