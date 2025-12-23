-- Migration V3: Add reserved fields to Printers table
-- Purpose: Implement reserve mechanism to prevent race conditions when multiple users submit print jobs simultaneously
-- Date: 2024-12-23

-- Add reserved fields for paper
ALTER TABLE Printers ADD COLUMN A4PaperReserved INT DEFAULT 0;
ALTER TABLE Printers ADD COLUMN A3PaperReserved INT DEFAULT 0;

-- Add reserved fields for toner
ALTER TABLE Printers ADD COLUMN TonerBlackReserved INT DEFAULT 0;
ALTER TABLE Printers ADD COLUMN TonerCyanReserved INT DEFAULT 0;
ALTER TABLE Printers ADD COLUMN TonerMagentaReserved INT DEFAULT 0;
ALTER TABLE Printers ADD COLUMN TonerYellowReserved INT DEFAULT 0;

-- Add comments
COMMENT ON COLUMN Printers.A4PaperReserved IS 'Số tờ A4 đã được reserve cho các job pending';
COMMENT ON COLUMN Printers.A3PaperReserved IS 'Số tờ A3 đã được reserve cho các job pending';
COMMENT ON COLUMN Printers.TonerBlackReserved IS '% mực đen đã được reserve';
COMMENT ON COLUMN Printers.TonerCyanReserved IS '% mực xanh đã được reserve';
COMMENT ON COLUMN Printers.TonerMagentaReserved IS '% mực đỏ đã được reserve';
COMMENT ON COLUMN Printers.TonerYellowReserved IS '% mực vàng đã được reserve';
