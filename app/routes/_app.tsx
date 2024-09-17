import { Outlet } from "@remix-run/react";
import { type LoaderFunction, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import Layout from "~/components/Layout/Layout";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  if (!userId) return redirect("/login");
  return null;
};

export default function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}