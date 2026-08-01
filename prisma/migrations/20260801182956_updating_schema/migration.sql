/*
  Warnings:

  - You are about to drop the column `booking_status` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `check_in` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `check_out` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `hotelId` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `roomCode` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bookingNumber]` on the table `booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[providerReference]` on the table `booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingNumber` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkIn` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkOut` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_roomCode_hotelId_fkey";

-- DropIndex
DROP INDEX "booking_check_in_check_out_roomCode_key";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "booking_status",
DROP COLUMN "check_in",
DROP COLUMN "check_out",
DROP COLUMN "hotelId",
DROP COLUMN "roomCode",
DROP COLUMN "updatedAt",
ADD COLUMN     "bookingNumber" TEXT NOT NULL,
ADD COLUMN     "checkIn" DATE NOT NULL,
ADD COLUMN     "checkOut" DATE NOT NULL,
ADD COLUMN     "providerReference" TEXT,
ADD COLUMN     "roomId" INTEGER,
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalPrice" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "payment" ALTER COLUMN "paidAt" SET DATA TYPE DATE;

-- CreateTable
CREATE TABLE "bookingRoom" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "rateKey" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "adultsCount" INTEGER NOT NULL,
    "childrenCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookingRoom_bookingId_roomId_idx" ON "bookingRoom"("bookingId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_bookingNumber_key" ON "booking"("bookingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "booking_providerReference_key" ON "booking"("providerReference");

-- CreateIndex
CREATE INDEX "booking_checkIn_checkOut_idx" ON "booking"("checkIn", "checkOut");

-- CreateIndex
CREATE INDEX "room_hotelId_code_idx" ON "room"("hotelId", "code");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingRoom" ADD CONSTRAINT "bookingRoom_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingRoom" ADD CONSTRAINT "bookingRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
