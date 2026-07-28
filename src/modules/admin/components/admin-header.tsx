"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/modules/auth/actions/sign-out";
import { Avatar, AvatarFallback } from "@/modules/common/ui/avatar";
import { Button } from "@/modules/common/ui/button";
import { Separator } from "@/modules/common/ui/separator";
import { SidebarTrigger } from "@/modules/common/ui/sidebar";
import { getAdminPageTitle } from "./admin-nav";

interface AdminHeaderProps {
  userEmail: string;
}

function getInitials(email: string) {
  const localPart = email.split("@")[0] ?? "AD";
  return localPart.slice(0, 2).toUpperCase();
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getAdminPageTitle(pathname);

  return (
    <header className="flex h-auto min-h-14 shrink-0 items-center gap-2 border-b bg-background px-3 py-2 sm:gap-3 sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 hidden h-4 md:block" />
      <h1 className="hidden min-w-0 flex-1 truncate text-sm font-medium md:block">
        {pageTitle}
      </h1>

      <div className="ml-auto flex min-w-0 max-w-[calc(100%-3rem)] items-center gap-2 rounded-full border border-border/80 bg-muted/30 py-1 pr-1 pl-1 sm:max-w-none">
        <Avatar size="sm">
          <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 max-w-[6.5rem] truncate text-xs font-medium sm:max-w-[10rem] md:max-w-[14rem]">
          {userEmail}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 rounded-full px-2.5 text-xs"
          onClick={() => {
            void signOut();
          }}
        >
          <LogOut className="size-3.5" />
          <span>Sign out</span>
        </Button>
      </div>
    </header>
  );
}
