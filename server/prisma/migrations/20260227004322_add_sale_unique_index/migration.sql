/*
  Warnings:

  - A unique constraint covering the columns `[userId,createdAt]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Sale_userId_createdAt_key" ON "Sale"("userId", "createdAt");
