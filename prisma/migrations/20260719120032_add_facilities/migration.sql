/*
  Warnings:

  - You are about to drop the column `facilities` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `facilities` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `hotelCode` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `maxAudits` on the `room` table. All the data in the column will be lost.
  - Added the required column `hotelId` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxAdults` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('PHONEBOOKING', 'PHONEHOTEL', 'FAXNUMBER');

-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_hotelCode_fkey";

-- AlterTable
ALTER TABLE "hotel" DROP COLUMN "facilities",
DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "room" DROP COLUMN "description",
DROP COLUMN "facilities",
DROP COLUMN "hotelCode",
DROP COLUMN "maxAudits",
ADD COLUMN     "hotelId" INTEGER NOT NULL,
ADD COLUMN     "isParentRoom" BOOLEAN,
ADD COLUMN     "maxAdults" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "hotelPhone" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "phoneType" "PhoneType" NOT NULL,
    "hotelId" INTEGER NOT NULL,

    CONSTRAINT "hotelPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "groupCode" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotelFacilities" (
    "id" SERIAL NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "facilityCode" INTEGER NOT NULL,
    "order" INTEGER,
    "indFee" BOOLEAN,
    "indLogic" BOOLEAN,
    "indYesOrNo" BOOLEAN,
    "voucher" BOOLEAN,
    "timeFrom" TEXT,
    "timeTo" TEXT,
    "number" INTEGER,

    CONSTRAINT "hotelFacilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roomFacilities" (
    "id" SERIAL NOT NULL,
    "facilityCode" INTEGER NOT NULL,
    "indFee" BOOLEAN,
    "indLogic" BOOLEAN,
    "voucher" BOOLEAN,
    "roomId" INTEGER NOT NULL,
    "number" INTEGER,

    CONSTRAINT "roomFacilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facility_code_key" ON "facility"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hotelFacilities_hotelId_facilityCode_key" ON "hotelFacilities"("hotelId", "facilityCode");

-- CreateIndex
CREATE UNIQUE INDEX "roomFacilities_roomId_facilityCode_key" ON "roomFacilities"("roomId", "facilityCode");

-- AddForeignKey
ALTER TABLE "hotelPhone" ADD CONSTRAINT "hotelPhone_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotelFacilities" ADD CONSTRAINT "hotelFacilities_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotelFacilities" ADD CONSTRAINT "hotelFacilities_facilityCode_fkey" FOREIGN KEY ("facilityCode") REFERENCES "facility"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roomFacilities" ADD CONSTRAINT "roomFacilities_facilityCode_fkey" FOREIGN KEY ("facilityCode") REFERENCES "facility"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roomFacilities" ADD CONSTRAINT "roomFacilities_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
