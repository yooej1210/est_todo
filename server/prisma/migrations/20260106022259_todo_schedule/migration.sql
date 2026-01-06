/*
  Warnings:

  - You are about to drop the column `due_date` on the `todos` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "todos_user_id_due_date_idx";

-- AlterTable
ALTER TABLE "todos" DROP COLUMN "due_date",
ADD COLUMN     "end_date" TIMESTAMPTZ(6),
ADD COLUMN     "is_all_day" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "start_date" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "todos_user_id_start_date_idx" ON "todos"("user_id", "start_date");
