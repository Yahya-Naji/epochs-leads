"use client";

import { Users, TrendingUp, TrendingDown, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  total: number;
  interested: number;
  notInterested: number;
  today: number;
}

interface StatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  loading?: boolean;
}

function StatCard({ label, value, subtext, icon: Icon, iconColor, iconBg, loading }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-1">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">{label}</p>
          {loading ? (
            <div className="h-8 w-14 bg-surface-elevated rounded-lg animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-ink tracking-tight">{value}</p>
          )}
          {subtext && !loading && (
            <p className="text-xs text-ink-muted">{subtext}</p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl border", iconBg)}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
      </div>
    </div>
  );
}

export default function StatsCards({ stats, loading }: { stats?: Stats; loading?: boolean }) {
  const rate = stats && stats.total > 0
    ? Math.round((stats.interested / stats.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Leads"    value={stats?.total ?? 0}        subtext="All time"           icon={Users}      iconColor="text-violet-600"  iconBg="bg-violet-50 border-violet-100"   loading={loading} />
      <StatCard label="Interested"     value={stats?.interested ?? 0}   subtext={`${rate}% conversion`} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50 border-emerald-100" loading={loading} />
      <StatCard label="Not Interested" value={stats?.notInterested ?? 0} subtext="Declined"          icon={TrendingDown} iconColor="text-red-500"    iconBg="bg-red-50 border-red-100"         loading={loading} />
      <StatCard label="Calls Today"    value={stats?.today ?? 0}        subtext={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })} icon={PhoneCall} iconColor="text-indigo-600" iconBg="bg-indigo-50 border-indigo-100" loading={loading} />
    </div>
  );
}
