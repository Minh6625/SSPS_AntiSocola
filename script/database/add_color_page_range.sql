-- Add ColorPageRange column to PrintJobs table
-- This allows users to specify which pages should be printed in color
-- while the rest are printed in black & white

USE SSPS;
GO

-- Check if column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'PrintJobs' 
    AND COLUMN_NAME = 'ColorPageRange'
)
BEGIN
    ALTER TABLE PrintJobs
    ADD ColorPageRange NVARCHAR(255) NULL;
    
    PRINT 'Column ColorPageRange added successfully to PrintJobs table';
END
ELSE
BEGIN
    PRINT 'Column ColorPageRange already exists in PrintJobs table';
END
GO

-- Example usage comments:
-- ColorPageRange = NULL or empty: Use ColorMode for all pages
-- ColorPageRange = "1-3,5,10-15": Print these pages in color, rest in B&W (when ColorMode = 'BlackWhite')
