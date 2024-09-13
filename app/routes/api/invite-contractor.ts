import { json, ActionFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/db.server";
import { sendInvitationEmail } from "~/utils/email.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const contractorEmail = formData.get("email");

  if (typeof contractorEmail !== "string") {
    return json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const teamOwner = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (teamOwner?.role !== "team_owner") {
      return json({ error: "Only team owners can send invitations" }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: contractorEmail },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          invitedByTeamOwner: userId,
          hasUnreadInvitation: true
        }
      });

      await sendInvitationEmail(contractorEmail, existingUser.id);
    } else {
      const invitation = await prisma.invitation.create({
        data: {
          email: contractorEmail,
          teamOwner: { connect: { id: userId } },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });

      await sendInvitationEmail(contractorEmail, invitation.id);
    }

    return json({ success: true, message: "Invitation sent successfully" });
  } catch (error) {
    console.error("Error sending invitation:", error);
    if (error instanceof Error) {
      return json({ error: `Failed to send invitation: ${error.message}` }, { status: 500 });
    }
    return json({ error: "Failed to send invitation" }, { status: 500 });
  }
};