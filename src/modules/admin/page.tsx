import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin | Petfoodchoice",
};

export default function AdminModulePage() {
  redirect("/admin/dashboard");
}
