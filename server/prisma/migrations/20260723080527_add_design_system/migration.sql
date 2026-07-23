/*
  Warnings:

  - A unique constraint covering the columns `[gatewayOrderId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gatewayOrderId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "gatewayOrderId" TEXT NOT NULL,
ADD COLUMN     "gatewayProvider" TEXT NOT NULL DEFAULT 'cashfree',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "WebsiteProject" ADD COLUMN     "designSystemId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_gatewayOrderId_key" ON "Transaction"("gatewayOrderId");
