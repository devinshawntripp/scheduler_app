-- AlterTable
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "customerEmail" TEXT;

-- Update existing rows with a default value
UPDATE "Booking" SET "customerEmail" = 'no-email@example.com' WHERE "customerEmail" IS NULL;

-- Make the column required after setting defaults
ALTER TABLE "Booking" ALTER COLUMN "customerEmail" SET NOT NULL; 