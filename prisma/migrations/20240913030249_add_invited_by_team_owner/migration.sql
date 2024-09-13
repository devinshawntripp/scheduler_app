-- AlterTable
ALTER TABLE "User" ADD COLUMN     "invitedByTeamOwner" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
