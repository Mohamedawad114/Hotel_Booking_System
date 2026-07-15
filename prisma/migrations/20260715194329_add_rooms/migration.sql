/*
  Warnings:

  - You are about to drop the column `hotel_id` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `booking_id` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `payment_id` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `hotel_id` on the `review` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `review` table. All the data in the column will be lost.
  - You are about to drop the `Favorite` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[check_in,check_out,roomCode]` on the table `booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookingId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomCode` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingId` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentId` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hotelId` to the `review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_user_id_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_user_id_fkey";

-- DropIndex
DROP INDEX "payment_booking_id_key";

-- DropIndex
DROP INDEX "payment_payment_id_key";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "hotel_id",
DROP COLUMN "room_id",
DROP COLUMN "user_id",
ADD COLUMN     "roomCode" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "hotel" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "facilities" TEXT[];

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "booking_id",
DROP COLUMN "payment_id",
DROP COLUMN "user_id",
ADD COLUMN     "bookingId" INTEGER NOT NULL,
ADD COLUMN     "paymentId" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "review" DROP COLUMN "hotel_id",
DROP COLUMN "user_id",
ADD COLUMN     "hotelId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Favorite";

-- CreateTable
CREATE TABLE "favorite" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "hotelCode" INTEGER NOT NULL,
    "maxAudits" INTEGER NOT NULL,
    "maxChildren" INTEGER NOT NULL,
    "description" TEXT,
    "roomType" TEXT NOT NULL,
    "roomCategory" TEXT NOT NULL,
    "facilities" TEXT[],

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "room_code_key" ON "room"("code");

-- CreateIndex
CREATE UNIQUE INDEX "booking_check_in_check_out_roomCode_key" ON "booking"("check_in", "check_out", "roomCode");

-- CreateIndex
CREATE UNIQUE INDEX "payment_paymentId_key" ON "payment"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_bookingId_key" ON "payment"("bookingId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_roomCode_fkey" FOREIGN KEY ("roomCode") REFERENCES "room"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_hotelCode_fkey" FOREIGN KEY ("hotelCode") REFERENCES "hotel"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
