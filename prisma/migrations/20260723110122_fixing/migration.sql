/*
  Warnings:

  - The primary key for the `facility` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[code,groupCode]` on the table `facility` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `facilityGroupCode` to the `hotelFacilities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilityGroupCode` to the `roomFacilities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "hotelFacilities" DROP CONSTRAINT "hotelFacilities_facilityCode_fkey";

-- DropForeignKey
ALTER TABLE "roomFacilities" DROP CONSTRAINT "roomFacilities_facilityCode_fkey";

-- DropIndex
DROP INDEX "facility_code_key";

-- AlterTable
ALTER TABLE "facility" DROP CONSTRAINT "facility_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "facility_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "hotelFacilities" ADD COLUMN     "facilityGroupCode" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "roomFacilities" ADD COLUMN     "facilityGroupCode" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "facility_code_groupCode_key" ON "facility"("code", "groupCode");

-- AddForeignKey
ALTER TABLE "hotelFacilities" ADD CONSTRAINT "hotelFacilities_facilityCode_facilityGroupCode_fkey" FOREIGN KEY ("facilityCode", "facilityGroupCode") REFERENCES "facility"("code", "groupCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roomFacilities" ADD CONSTRAINT "roomFacilities_facilityCode_facilityGroupCode_fkey" FOREIGN KEY ("facilityCode", "facilityGroupCode") REFERENCES "facility"("code", "groupCode") ON DELETE CASCADE ON UPDATE CASCADE;
