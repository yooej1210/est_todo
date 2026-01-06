/*
  Warnings:

  - You are about to alter the column `name` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `color` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.
  - Made the column `color` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "color" SET DEFAULT '#E7F3F8',
ALTER COLUMN "color" SET DATA TYPE VARCHAR(7);
