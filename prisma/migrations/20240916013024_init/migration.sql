/*
  Warnings:

  - You are about to drop the column `dateTime` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `endDateTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDateTime` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "dateTime",
ADD COLUMN     "endDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDateTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasUnreadInvitation" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "teamOwnerId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
