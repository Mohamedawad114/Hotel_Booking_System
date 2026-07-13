-- CreateTable
CREATE TABLE "hotel" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT[],
    "images" TEXT[],
    "web" TEXT NOT NULL,
    "ranking" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "destinationCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hotel_code_key" ON "hotel"("code");

-- CreateIndex
CREATE INDEX "hotel_createdAt_idx" ON "hotel"("createdAt");

-- AddForeignKey
ALTER TABLE "hotel" ADD CONSTRAINT "hotel_destinationCode_fkey" FOREIGN KEY ("destinationCode") REFERENCES "destination"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
