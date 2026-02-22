/*
  Warnings:

  - You are about to drop the `RevokedToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RevokedToken" DROP CONSTRAINT "RevokedToken_userId_fkey";

-- DropTable
DROP TABLE "RevokedToken";
