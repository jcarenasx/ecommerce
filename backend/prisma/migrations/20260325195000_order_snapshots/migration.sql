-- Add new snapshot columns as nullable first so existing rows can be backfilled.
ALTER TABLE "OrderItem"
ADD COLUMN "name" TEXT,
ADD COLUMN "priceCents" INTEGER;

-- Backfill snapshot data from the current schema/data.
UPDATE "OrderItem"
SET "priceCents" = "unitCents"
WHERE "priceCents" IS NULL;

UPDATE "OrderItem" AS oi
SET "name" = p."name"
FROM "Product" AS p
WHERE p."id" = oi."productId"
  AND oi."name" IS NULL;

-- Fallback in case a referenced product no longer exists.
UPDATE "OrderItem"
SET "name" = 'Product #' || "productId"::TEXT
WHERE "name" IS NULL;

-- Make the new snapshot columns required.
ALTER TABLE "OrderItem"
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "priceCents" SET NOT NULL;

-- Remove obsolete structures from the previous order implementation.
ALTER TABLE "OrderItem"
DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";

ALTER TABLE "Order"
DROP COLUMN IF EXISTS "status";

ALTER TABLE "OrderItem"
DROP COLUMN IF EXISTS "unitCents";

DROP TYPE IF EXISTS "OrderStatus";
