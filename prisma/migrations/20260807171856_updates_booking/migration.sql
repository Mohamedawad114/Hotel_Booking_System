/*
  Warnings:

  - You are about to drop the column `roomId` on the `booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientRef]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_roomId_fkey";

-- AlterTable
ALTER TABLE "booking" DROP COLUMN "roomId";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "clientRef" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_clientRef_key" ON "user"("clientRef");
