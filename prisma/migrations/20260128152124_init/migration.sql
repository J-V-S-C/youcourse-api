/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "updated_at" TIMESTAMP(3);
