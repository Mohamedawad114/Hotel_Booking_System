/*
  Warnings:

  - You are about to drop the column `dest` on the `destination` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `destination` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `destination` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "destination_dest_key";

-- AlterTable
ALTER TABLE "destination" DROP COLUMN "dest",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "destination_code_key" ON "destination"("code");
