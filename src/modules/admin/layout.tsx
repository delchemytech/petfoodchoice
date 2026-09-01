import type { Metadata } from "next";
import { requireAdminOrRedirect } from "@/modules/auth/lib/require-admin";
import { AdminShell } from "./components/admin-shell";

export const metadata: Metadata = {
  title: "Admin | Petfoodchoice",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminOrRedirect();

  return <AdminShell userEmail={session.email}>{children}</AdminShell>;
}
