import {
  LayoutDashboard,
  Package,
  Tags,
  type LucideIcon,
} from "lucide-react";

interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/products/add")) return "Add Product";
  if (pathname.startsWith("/admin/products/edit")) return "Edit Product";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/categories")) return "Categories";
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  return "Admin";
}
