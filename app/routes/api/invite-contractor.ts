import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { inviteContractor } from "~/models/invite.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const email = formData.get("email");

  if (typeof email !== "string") {
    return json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    await inviteContractor(userId, email);
    return json({ success: true });
  } catch (error) {
    console.error("Error sending invitation:", error);
    if (error instanceof Error) {
      return json({ error: `Failed to send invitation: ${error.message}` }, { status: 500 });
    }
    return json({ error: "Failed to send invitation" }, { status: 500 });
  }
};