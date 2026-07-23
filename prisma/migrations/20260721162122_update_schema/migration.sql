/*
  Warnings:

  - You are about to drop the column `roomId` on the `roomFacilities` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomCode,facilityCode]` on the table `roomFacilities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomCode` to the `roomFacilities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "roomFacilities" DROP CONSTRAINT "roomFacilities_roomId_fkey";

-- DropIndex
DROP INDEX "hotel_createdAt_idx";

-- DropIndex
DROP INDEX "roomFacilities_roomId_facilityCode_key";

-- AlterTable
ALTER TABLE "roomFacilities" DROP COLUMN "roomId",
ADD COLUMN     "roomCode" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "hotel_createdAt_id_idx" ON "hotel"("createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "roomFacilities_roomCode_facilityCode_key" ON "roomFacilities"("roomCode", "facilityCode");

-- AddForeignKey
ALTER TABLE "roomFacilities" ADD CONSTRAINT "roomFacilities_roomCode_fkey" FOREIGN KEY ("roomCode") REFERENCES "room"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
