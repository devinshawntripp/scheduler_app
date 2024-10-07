import { Outlet } from "@remix-run/react";
import Layout from "~/components/Layout/Layout";

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}