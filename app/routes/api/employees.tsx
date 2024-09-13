import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { getEmployeesByTeamOwnerId } from "~/models/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  
  const url = new URL(request.url);
  const teamOwnerId = url.searchParams.get("teamOwnerId");

  if (!teamOwnerId) {
    return json({ error: "teamOwnerId is required" }, { status: 400 });
  }

  try {
    const employees = await getEmployeesByTeamOwnerId(teamOwnerId);
    return json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return json({ error: "Failed to fetch employees" }, { status: 500 });
  }
};