-- Add optional user phone without affecting existing rows.
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Recreate the order status enum with the new lifecycle values.
CREATE TYPE "OrderStatus_new" AS ENUM (
  'PENDING',
  'PAID',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED'
);

-- Add the new status column as nullable first so old rows can be backfilled safely.
ALTER TABLE "Order"
ADD COLUMN "status" "OrderStatus_new";

UPDATE "Order"
SET "status" = 'PENDING'
WHERE "status" IS NULL;

ALTER TABLE "Order"
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
