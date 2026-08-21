/*
  Warnings:

  - Added the required column `paymentType` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('AT_WEB', 'AT_HOTEL');

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "paymentType" "PaymentType" NOT NULL;
