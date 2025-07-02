/*
  Warnings:

  - You are about to drop the column `categoryId` on the `brands` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "brands" DROP CONSTRAINT "brands_categoryId_fkey";

-- AlterTable
ALTER TABLE "brands" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "brand_categories" (
    "brandId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "brand_categories_pkey" PRIMARY KEY ("brandId","categoryId")
);

-- AddForeignKey
ALTER TABLE "brand_categories" ADD CONSTRAINT "brand_categories_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_categories" ADD CONSTRAINT "brand_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
