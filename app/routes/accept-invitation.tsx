import { json, redirect, ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/db.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const invitationId = params.invitationId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { invitedByTeamOwner: true, role: true }
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  if (user.invitedByTeamOwner) {
    const teamOwner = await prisma.user.findUnique({
      where: { id: user.invitedByTeamOwner },
      select: { email: true }
    });

    return json({ teamOwnerEmail: teamOwner?.email });
  }

  // If not invited, check for a valid invitation
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { teamOwner: true }
  });

  if (!invitation) {
    throw new Response("Invalid invitation", { status: 400 });
  }

  return json({ teamOwnerEmail: invitation.teamOwner.email });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { invitedByTeamOwner: true, role: true }
    });

    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    if (action === "accept") {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          teamOwnerId: user.invitedByTeamOwner,
          invitedByTeamOwner: null,
          role: "contractor",
          hasUnreadInvitation: false
        },
      });
      return redirect("/dashboard");
    } else if (action === "reject") {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          invitedByTeamOwner: null,
          hasUnreadInvitation: false
        },
      });
      return json({ success: true, message: "Invitation rejected" });
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing invitation:", error);
    return json({ error: "Failed to process invitation" }, { status: 500 });
  }
};

export default function AcceptInvitation() {
  const { teamOwnerEmail } = useLoaderData<{ teamOwnerEmail: string }>();
  const actionData = useActionData<{ error?: string; success?: boolean; message?: string }>();

  return (
    <div>
      <h2>Team Invitation</h2>
      <p>You've been invited to join {teamOwnerEmail}'s team as a contractor.</p>
      <Form method="post">
        <button type="submit" name="action" value="accept">Accept</button>
        <button type="submit" name="action" value="reject">Reject</button>
      </Form>
      {actionData?.error && <p>{actionData.error}</p>}
      {actionData?.success && <p>{actionData.message}</p>}
    </div>
  );
}