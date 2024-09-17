import { prisma } from "~/db.server";

export async function getInvitations(userId: string) {
  try {
    const invitations = await prisma.invitation.findMany({
      where: { email: userId },
      orderBy: { createdAt: "desc" },
    });
    return invitations;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
}

export async function acceptInvitation(invitationId: string) {
  // Implement the logic to accept the invitation
  // This might involve updating the user's teamOwnerId and deleting the invitation
  // The exact implementation depends on your business logic
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const teamOwnerId = invitation.teamOwnerId;
    //update user
    await prisma.user.update({
      where: { email: invitation.email },
      data: { teamOwnerId: teamOwnerId },
    });

    await prisma.invitation.delete({
      where: { id: invitationId },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
}

export async function declineInvitation(invitationId: string) {
  // Implement the logic to decline the invitation
  // This might involve just deleting the invitation
  try {
    await prisma.invitation.delete({
      where: { id: invitationId },
    });
  } catch (error) {
    console.error("Error declining invitation:", error);
    throw error;
  }
}

// ... other invitation-related functions ...