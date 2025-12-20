-- Migration: Add TransactionCode column to PageTransactions
-- Date: 2025-12-20
-- Safe steps: add nullable column, populate values, enforce NOT NULL and uniqueness

BEGIN;

-- 1) Add column (if not exists)
ALTER TABLE PageTransactions ADD COLUMN IF NOT EXISTS TransactionCode VARCHAR(20);

-- 2) Populate existing rows with generated codes (TXN + zero-padded TransactionID)
UPDATE PageTransactions
SET TransactionCode = 'TXN' || LPAD(TransactionID::text, 6, '0')
WHERE TransactionCode IS NULL;

-- 3) Ensure column is NOT NULL
ALTER TABLE PageTransactions ALTER COLUMN TransactionCode SET NOT NULL;

-- 4) Add unique index/constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'ux_pagetrans_transactioncode'
    ) THEN
        CREATE UNIQUE INDEX ux_pagetrans_transactioncode ON PageTransactions(TransactionCode);
    END IF;
END$$;

COMMIT;

-- Notes:
-- - Backup DB before running this migration.
-- - Adjust generation logic if you need a different TransactionCode format.
