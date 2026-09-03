-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'CANCELLATION_PROCESSING';

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "cancellationReason" TEXT;
