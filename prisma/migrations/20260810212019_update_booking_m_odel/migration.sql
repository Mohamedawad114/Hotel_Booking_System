/*
  Warnings:

  - You are about to drop the column `clientRef` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_clientRef_key";

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "cancellationFees" INTEGER,
ADD COLUMN     "cancellationReference" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "clientRef";
