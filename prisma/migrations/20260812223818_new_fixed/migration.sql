-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "roomId" INTEGER;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
