import { json } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { getEmployeesByTeamOwnerId } from "~/models/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  console.log("API route hit: /api/employees (loader)");
  try {
    const userId = await requireUserId(request);
    console.log("User ID:", userId);
    
    const url = new URL(request.url);
    const teamOwnerId = url.searchParams.get("teamOwnerId");
    console.log("Team Owner ID:", teamOwnerId);

    if (!teamOwnerId) {
      return json({ error: "teamOwnerId is required" }, { status: 400 });
    }

    const employees = await getEmployeesByTeamOwnerId(teamOwnerId);
    console.log("Employees fetched:", employees);
    return json({ employees });
  } catch (error) {
    console.error("Error in /api/employees:", error);
    return json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  console.log("API route hit: /api/employees (action)");
  // Handle POST, PUT, DELETE requests here
  return json({ message: "Method not allowed" }, { status: 405 });
};