/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");
