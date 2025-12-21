-- Create PendingPayments table for SePay integration
-- Run this script on your PostgreSQL database

CREATE TABLE IF NOT EXISTS "PendingPayments" (
    "PaymentID" SERIAL PRIMARY KEY,
    "PaymentCode" VARCHAR(50) NOT NULL UNIQUE,
    "StudentID" VARCHAR(20) NOT NULL,
    "A4Pages" INTEGER NOT NULL DEFAULT 0,
    "A3Pages" INTEGER NOT NULL DEFAULT 0,
    "Amount" BIGINT NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ExpiresAt" TIMESTAMP,
    "CompletedAt" TIMESTAMP,
    "BankTransactionId" VARCHAR(100),
    
    CONSTRAINT fk_pending_payment_student 
        FOREIGN KEY ("StudentID") 
        REFERENCES "Users"("UserID")
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pending_payments_code ON "PendingPayments"("PaymentCode");
CREATE INDEX IF NOT EXISTS idx_pending_payments_student ON "PendingPayments"("StudentID");
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON "PendingPayments"("Status");
CREATE INDEX IF NOT EXISTS idx_pending_payments_amount ON "PendingPayments"("Amount");

-- Add comment
COMMENT ON TABLE "PendingPayments" IS 'Stores pending payment transactions for SePay QR payment integration';
