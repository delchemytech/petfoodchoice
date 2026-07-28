import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/modules/common/ui/sidebar";

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string;
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader userEmail={userEmail} />
        <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
