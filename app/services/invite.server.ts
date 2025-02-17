import { prisma } from "~/db.server";
import { sendInvitationEmail } from "~/utils/email.server"; // Assuming you have this utility

export async function getInvitationsByTeamOwner(teamOwnerId: string) {
  return prisma.invitation.findMany({
    where: { teamOwnerId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createInvitation(teamOwnerId: string, email: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now
  console.log("Creating invitation for:", email, "with teamOwnerId:", teamOwnerId);
  const invitation = await prisma.invitation.create({
    data: {
      teamOwnerId,
      email,
      expiresAt,
    },
  });
  console.log("Invitation created:", invitation);
  // Send invitation email
  await sendInvitationEmail(email, teamOwnerId);

  return invitation;
}

export async function inviteContractor(teamOwnerId: string, email: string) {
  const existingUser = await prisma.user.findUnique({ where: { email }, select: { roles: true, teamOwnerId: true } });

  if (existingUser) {
    if (existingUser.roles.some(role => role.name === 'contractor' && existingUser.teamOwnerId === teamOwnerId)) {
      throw new Error('This contractor is already in your team.');
    }
    if (existingUser.roles.some(role => role.name === 'team_owner')) {
      throw new Error('This user is already a team owner and cannot be invited as a contractor.');
    }
  }

  const existingInvitation = await prisma.invitation.findFirst({
    where: { email, teamOwnerId },
  });

  if (existingInvitation) {
    throw new Error('An invitation has already been sent to this email.');
  }

  return createInvitation(teamOwnerId, email);
}

export async function getInvitations(email: string) {
  try {
    const invitations = await prisma.invitation.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        teamOwnerId: true,
        expiresAt: true,
        createdAt: true,
        teamOwner: true,
      },
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