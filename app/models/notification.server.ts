import { prisma } from "~/db.server";

export async function getNotifications(userId: string) {
  try {
    const invitations = await prisma.invitation.findMany({
      where: { teamOwnerId: userId },
      orderBy: { createdAt: "desc" },
    });
    return invitations;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
}


// ... other invitation-related functions ...