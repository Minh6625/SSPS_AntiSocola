-- ================================================================
-- MIGRATION: Add Email column to EmailOtpCodes table
-- Purpose: Support registration OTP (user doesn't exist yet)
-- Date: December 9, 2025
-- ================================================================

USE HCMSIU_SSPS;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Step 1: Drop existing constraints
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'UX_EmailOtp_Active')
BEGIN
    DROP INDEX UX_EmailOtp_Active ON EmailOtpCodes;
END
GO

-- Step 2: Modify UserID to allow NULL
ALTER TABLE EmailOtpCodes
ALTER COLUMN UserID NVARCHAR(20) NULL;
GO

-- Step 3: Add Email column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('EmailOtpCodes') AND name = 'Email')
BEGIN
    ALTER TABLE EmailOtpCodes
    ADD Email NVARCHAR(100) NULL;
END
GO

-- Step 4: Recreate unique index (allow NULL for UserID)
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE UNIQUE INDEX UX_EmailOtp_Active ON EmailOtpCodes(UserID, Purpose) 
WHERE ConsumedAt IS NULL AND UserID IS NOT NULL;
GO

-- Step 5: Create index for email-based queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EmailOtp_EmailPurpose')
BEGIN
    CREATE INDEX IX_EmailOtp_EmailPurpose ON EmailOtpCodes(Email, Purpose, ExpiresAt);
END
GO

PRINT 'Migration completed successfully!';
GO
