/*
  Warnings:

  - You are about to drop the column `roomId` on the `bookingRoom` table. All the data in the column will be lost.
  - Added the required column `holderEmail` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `holderFirstName` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `holderLastName` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `holderPhone` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hotelId` to the `bookingRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomCode` to the `bookingRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookingRoom" DROP CONSTRAINT "bookingRoom_roomId_fkey";

-- DropIndex
DROP INDEX "bookingRoom_bookingId_roomId_idx";

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "holderEmail" TEXT NOT NULL,
ADD COLUMN     "holderFirstName" TEXT NOT NULL,
ADD COLUMN     "holderLastName" TEXT NOT NULL,
ADD COLUMN     "holderPhone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "bookingRoom" DROP COLUMN "roomId",
ADD COLUMN     "guestsData" JSONB,
ADD COLUMN     "hotelId" INTEGER NOT NULL,
ADD COLUMN     "roomCode" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "bookingRoom_bookingId_roomCode_hotelId_idx" ON "bookingRoom"("bookingId", "roomCode", "hotelId");

-- AddForeignKey
ALTER TABLE "bookingRoom" ADD CONSTRAINT "bookingRoom_roomCode_hotelId_fkey" FOREIGN KEY ("roomCode", "hotelId") REFERENCES "room"("code", "hotelId") ON DELETE RESTRICT ON UPDATE CASCADE;
