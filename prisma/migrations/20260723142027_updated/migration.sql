/*
  Warnings:

  - Changed the type of `phoneType` on the `hotelPhone` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "hotelPhone" DROP COLUMN "phoneType",
ADD COLUMN     "phoneType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PhoneType";
