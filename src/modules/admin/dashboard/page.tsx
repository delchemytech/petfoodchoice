import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import { PageHeader } from "../components/page-header";
import { getDashboardData } from "./actions/get-dashboard-data";
import { RecentActivityList } from "./components/recent-activity-list";
import { RecentProductsTable } from "./components/recent-products-table";
import { StatCard } from "./components/stat-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { stats, recentProducts, recentActivity } = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your PETFOODCHOICE catalog."
        actions={
          <Button className="w-full sm:w-auto" render={<Link href="/admin/products/add" />}>
            <Plus data-icon="inline-start" />
            Add Product
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentProductsTable products={recentProducts} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityList activities={recentActivity} />
        </div>
      </div>
    </>
  );
}
