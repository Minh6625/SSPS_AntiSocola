-- ================================================================
-- MIGRATION: Thêm cột BalanceAfterA4 và BalanceAfterA3 vào bảng PageTransactions
-- Mục đích: Lưu số dư A4 và A3 sau mỗi giao dịch
-- ================================================================

-- Kiểm tra xem cột BalanceAfterA4 đã tồn tại chưa
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'PageTransactions' AND COLUMN_NAME = 'BalanceAfterA4'
)
BEGIN
    -- Thêm cột BalanceAfterA4
    ALTER TABLE PageTransactions
    ADD BalanceAfterA4 INT NULL;
    
    PRINT 'Cột BalanceAfterA4 đã được thêm vào bảng PageTransactions';
END
ELSE
BEGIN
    PRINT 'Cột BalanceAfterA4 đã tồn tại trong bảng PageTransactions';
END

GO

-- Kiểm tra xem cột BalanceAfterA3 đã tồn tại chưa
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'PageTransactions' AND COLUMN_NAME = 'BalanceAfterA3'
)
BEGIN
    -- Thêm cột BalanceAfterA3
    ALTER TABLE PageTransactions
    ADD BalanceAfterA3 INT NULL;
    
    PRINT 'Cột BalanceAfterA3 đã được thêm vào bảng PageTransactions';
END
ELSE
BEGIN
    PRINT 'Cột BalanceAfterA3 đã tồn tại trong bảng PageTransactions';
END

GO

-- Cập nhật dữ liệu cũ (nếu có)
-- Tính toán số dư sau dựa trên lịch sử giao dịch
UPDATE pt
SET BalanceAfterA4 = COALESCE(pb.A4Balance, 0),
    BalanceAfterA3 = COALESCE(pb.A3Balance, 0)
FROM PageTransactions pt
LEFT JOIN PageBalance pb ON pt.StudentID = pb.StudentID
WHERE pt.BalanceAfterA4 IS NULL OR pt.BalanceAfterA3 IS NULL;

PRINT 'Migration hoàn tất!';
GO
