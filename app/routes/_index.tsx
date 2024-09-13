import { LoaderFunction, redirect } from "@remix-run/node";
import { getUserId } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    // If the user is logged in, redirect to the dashboard
    return redirect("/dashboard");
  } else {
    // If the user is not logged in, redirect to the login page
    return redirect("/login");
  }
};

// We don't need to export a default component here since we're always redirecting
