import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSites } from "@/hooks/useSites";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import { Activity, Building2, Users, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from "recharts";

const CHART_COLORS = {
  blue: "hsl(200, 100%, 34%)",
  vibrant: "hsl(193, 85%, 46%)",
  green: "hsl(152, 60%, 42%)",
  purple: "hsl(265, 60%, 42%)",
};

const tooltipStyle = {
  background: "hsl(215, 25%, 14%)",
  border: "1px solid hsl(215, 22%, 20%)",
  borderRadius: "8px",
  fontSize: "13px",
  color: "hsl(210, 20%, 94%)",
};

export default function Dashboard() {
  const { sites, results, getLatestResult } = useSites();
  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiFetch<{ nbSites: number; totalCo2Kg: number; avgCo2PerM2: number }>("/api/dashboard/summary"),
  });

  const summary = summaryQuery.data;

  const latestResults = useMemo(() => {
    return sites
      .map((s) => getLatestResult(s.id))
      .filter(Boolean);
  }, [sites, getLatestResult]);

  const avgCo2PerEmployee = useMemo(() => {
    const vals = latestResults
      .map((r) => r!.co2PerEmployee)
      .filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [latestResults]);

  const barData = sites.map((s) => ({
    name: s.name.split("—")[0].trim().split(" ").slice(-1)[0],
    fullName: s.name,
    total: (getLatestResult(s.id)?.totalCo2Kg ?? 0) / 1000,
    construction: (getLatestResult(s.id)?.constructionCo2Kg ?? 0) / 1000,
    exploitation: (getLatestResult(s.id)?.exploitationCo2Kg ?? 0) / 1000,
  }));

  const pieData = useMemo(() => {
    const construction = latestResults.reduce((sum, r) => sum + ((r!.constructionCo2Kg ?? 0) / 1000), 0);
    const exploitation = latestResults.reduce((sum, r) => sum + ((r!.exploitationCo2Kg ?? 0) / 1000), 0);
    return [
      { name: "Construction", value: construction, color: CHART_COLORS.blue },
      { name: "Exploitation", value: exploitation, color: CHART_COLORS.vibrant },
    ];
  }, [latestResults]);

  const monthlyHistory = useMemo(() => {
    // Agrégation mensuelle réelle basée sur tous les calculs enregistrés
    const map = new Map<string, number>();
    for (const r of results) {
      const d = new Date(r.calculatedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + ((r.totalCo2Kg ?? 0) / 1000));
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, co2]) => {
        const [y, m] = key.split("-").map(Number);
        const date = new Date(y, (m || 1) - 1, 1);
        return {
          month: date.toLocaleDateString("fr-FR", { month: "short" }),
          co2,
        };
      });
  }, [results]);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Vue globale des émissions carbone" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <KpiCard title="CO₂ Total" value={((summary?.totalCo2Kg ?? 0) / 1000).toLocaleString("fr-FR")} unit="tCO₂e" icon={Activity} variant="primary" delay={0} />
        <KpiCard title="Sites" value={summary?.nbSites ?? sites.length} icon={Building2} variant="vibrant" delay={1} />
        <KpiCard title="CO₂ moyen / m²" value={(summary?.avgCo2PerM2 ?? 0).toFixed(3)} unit="kg/m²" icon={TrendingDown} variant="green" delay={2} />
        <KpiCard title="CO₂ moyen / employé" value={avgCo2PerEmployee.toFixed(2)} unit="kg/pers." icon={Users} variant="default" delay={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-card-foreground mb-5">Émissions par site</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString("fr-FR")} tCO₂e`, ""]} />
                <Bar dataKey="construction" name="Construction" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
                <Bar dataKey="exploitation" name="Exploitation" fill={CHART_COLORS.vibrant} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-card-foreground mb-5">Construction vs Exploitation</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString("fr-FR")} tCO₂e`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Area chart - history */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold text-card-foreground mb-5">Historique mensuel des émissions</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyHistory}>
              <defs>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.vibrant} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART_COLORS.vibrant} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString("fr-FR")} tCO₂e`, "Émissions"]} />
              <Area type="monotone" dataKey="co2" stroke={CHART_COLORS.vibrant} strokeWidth={2} fill="url(#colorCo2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
