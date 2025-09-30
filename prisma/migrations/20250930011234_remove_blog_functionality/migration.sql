/*
  Warnings:

  - You are about to drop the `BlogComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogComment" DROP CONSTRAINT "BlogComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "BlogComment" DROP CONSTRAINT "BlogComment_postId_fkey";

-- DropTable
DROP TABLE "BlogComment";

-- DropTable
DROP TABLE "BlogPost";
