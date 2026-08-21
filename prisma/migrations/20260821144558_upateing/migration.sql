/*
  Warnings:

  - You are about to drop the column `roomId` on the `booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_roomId_fkey";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "roomId";
