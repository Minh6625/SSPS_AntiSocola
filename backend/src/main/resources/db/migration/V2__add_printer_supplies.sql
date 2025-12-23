-- Migration: Add paper and toner management columns to Printers table
-- Date: 2024-12-23
-- Description: Add columns to track paper and toner levels for printer status management

-- Add paper management columns
ALTER TABLE Printers 
ADD COLUMN IF NOT EXISTS A4PaperRemaining INT DEFAULT 500,
ADD COLUMN IF NOT EXISTS A3PaperRemaining INT DEFAULT 250,
ADD COLUMN IF NOT EXISTS A4PaperCapacity INT DEFAULT 500,
ADD COLUMN IF NOT EXISTS A3PaperCapacity INT DEFAULT 250;

-- Add toner management columns
ALTER TABLE Printers
ADD COLUMN IF NOT EXISTS TonerBlackRemaining INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS TonerCyanRemaining INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS TonerMagentaRemaining INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS TonerYellowRemaining INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS TonerLastReplaced TIMESTAMP;

-- Update existing printers with default values
UPDATE Printers 
SET A4PaperRemaining = 500,
    A3PaperRemaining = 250,
    A4PaperCapacity = 500,
    A3PaperCapacity = 250,
    TonerBlackRemaining = 100,
    TonerCyanRemaining = 100,
    TonerMagentaRemaining = 100,
    TonerYellowRemaining = 100
WHERE A4PaperRemaining IS NULL;

-- Add comments
COMMENT ON COLUMN Printers.A4PaperRemaining IS 'Số tờ giấy A4 còn lại trong khay';
COMMENT ON COLUMN Printers.A3PaperRemaining IS 'Số tờ giấy A3 còn lại trong khay';
COMMENT ON COLUMN Printers.A4PaperCapacity IS 'Dung lượng tối đa khay giấy A4';
COMMENT ON COLUMN Printers.A3PaperCapacity IS 'Dung lượng tối đa khay giấy A3';
COMMENT ON COLUMN Printers.TonerBlackRemaining IS 'Phần trăm mực đen còn lại (0-100)';
COMMENT ON COLUMN Printers.TonerCyanRemaining IS 'Phần trăm mực xanh còn lại (0-100)';
COMMENT ON COLUMN Printers.TonerMagentaRemaining IS 'Phần trăm mực đỏ còn lại (0-100)';
COMMENT ON COLUMN Printers.TonerYellowRemaining IS 'Phần trăm mực vàng còn lại (0-100)';
COMMENT ON COLUMN Printers.TonerLastReplaced IS 'Thời điểm thay mực lần cuối';

-- Update Status column comment
COMMENT ON COLUMN Printers.Status IS 'Trạng thái: Active, Inactive, Maintenance, Error, OutOfPaper, OutOfToner, OutOfBoth';
