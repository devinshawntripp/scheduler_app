import { json, ActionFunction } from "@remix-run/node";
import { createUser } from "~/models/user.server";
import { requireUserId } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    const newContractor = await createUser(email, password, "contractor");
    return json({ success: true, contractor: newContractor });
  } catch (error) {
    console.error("Error creating contractor:", error);
    return json({ error: "Failed to create contractor" }, { status: 500 });
  }
};