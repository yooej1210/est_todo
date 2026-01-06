/*
  Warnings:

  - You are about to drop the column `content` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `todos` table. All the data in the column will be lost.
  - Added the required column `text` to the `todos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "todos" DROP COLUMN "content",
DROP COLUMN "title",
ADD COLUMN     "text" TEXT NOT NULL;
