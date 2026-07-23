/*
  Warnings:

  - The primary key for the `facility` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `facility` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "facility" DROP CONSTRAINT "facility_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "facility_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "hotel" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "hotel_id_seq";
