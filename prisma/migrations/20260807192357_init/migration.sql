-- CreateEnum
CREATE TYPE "Vertical" AS ENUM ('SHORTLET', 'REAL_ESTATE');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('RENT', 'BUY');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'BOOKED', 'LOST');

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "vertical" "Vertical" NOT NULL DEFAULT 'SHORTLET',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "location" TEXT,
    "guests" INTEGER,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "bedrooms" INTEGER,
    "listingType" "ListingType",
    "budget" TEXT,
    "note" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "Inquiry_businessId_status_idx" ON "Inquiry"("businessId", "status");

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
