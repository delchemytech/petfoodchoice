import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin | PETFOODCHOICE",
};

export default function AdminModulePage() {
  redirect("/admin/dashboard");
}
