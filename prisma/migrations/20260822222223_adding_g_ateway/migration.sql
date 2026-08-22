/*
  Warnings:

  - The values [canceled] on the enum `paymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `gateway` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('stripe');

-- AlterEnum
BEGIN;
CREATE TYPE "paymentStatus_new" AS ENUM ('pending', 'completed', 'failed', 'Refund');
ALTER TABLE "payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payment" ALTER COLUMN "status" TYPE "paymentStatus_new" USING ("status"::text::"paymentStatus_new");
ALTER TYPE "paymentStatus" RENAME TO "paymentStatus_old";
ALTER TYPE "paymentStatus_new" RENAME TO "paymentStatus";
DROP TYPE "paymentStatus_old";
ALTER TABLE "payment" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "gateway" "PaymentGateway" NOT NULL;
