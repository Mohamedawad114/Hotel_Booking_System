/*
  Warnings:

  - A unique constraint covering the columns `[code,hotelId]` on the table `room` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hotelId,roomCode,facilityCode]` on the table `roomFacilities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hotelId` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hotelId` to the `roomFacilities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_roomCode_fkey";

-- DropForeignKey
ALTER TABLE "roomFacilities" DROP CONSTRAINT "roomFacilities_roomCode_fkey";

-- DropIndex
DROP INDEX "room_code_key";

-- DropIndex
DROP INDEX "roomFacilities_roomCode_facilityCode_key";

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "hotelId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "roomFacilities" ADD COLUMN     "hotelId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "room_code_hotelId_key" ON "room"("code", "hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "roomFacilities_hotelId_roomCode_facilityCode_key" ON "roomFacilities"("hotelId", "roomCode", "facilityCode");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_roomCode_hotelId_fkey" FOREIGN KEY ("roomCode", "hotelId") REFERENCES "room"("code", "hotelId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roomFacilities" ADD CONSTRAINT "roomFacilities_roomCode_hotelId_fkey" FOREIGN KEY ("roomCode", "hotelId") REFERENCES "room"("code", "hotelId") ON DELETE RESTRICT ON UPDATE CASCADE;
