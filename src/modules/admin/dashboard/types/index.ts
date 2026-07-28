export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface RecentActivity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface RecentProduct {
  id: string;
  name: string;
  store: string;
  category: string;
  status: string;
  price: string;
}

export interface DashboardData {
  stats: DashboardStat[];
  recentProducts: RecentProduct[];
  recentActivity: RecentActivity[];
}
