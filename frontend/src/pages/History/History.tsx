import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSites } from "@/hooks/useSites";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowLeft, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const tooltipStyle = {
  background: "hsl(215, 25%, 14%)",
  border: "1px solid hsl(215, 22%, 20%)",
  borderRadius: "8px",
  fontSize: "13px",
  color: "hsl(210, 20%, 94%)",
};

export default function History() {
  const { id } = useParams();
  const { sites, results, getSite } = useSites();
  const siteId = id ? Number(id) : null;
  const site = siteId ? getSite(siteId) : null;

  const allYears = useMemo(() => {
    const set = new Set<number>();
    results.forEach((r) => {
      if (r.year) set.add(r.year);
      else {
        const d = new Date(r.calculatedAt);
        if (!Number.isNaN(d.getTime())) set.add(d.getFullYear());
      }
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [results]);

  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  const history = useMemo(() => {
    let filtered = !siteId ? results : results.filter((r) => r.siteId === siteId);
    if (selectedYear !== "all") {
      filtered = filtered.filter((r) => {
        if (r.year) return r.year === selectedYear;
        const d = new Date(r.calculatedAt);
        return !Number.isNaN(d.getTime()) && d.getFullYear() === selectedYear;
      });
    }
    return filtered;
  }, [results, siteId, selectedYear]);

  if (siteId && !site) return <div className="text-center py-20 text-muted-foreground">Site non trouvé.</div>;

  const chartData = history
    .slice()
    .reverse()
    .map((h) => ({
      date: new Date(h.calculatedAt).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      co2: (h.totalCo2Kg ?? 0) / 1000,
    }));

  const latestDelta = history.length >= 2
    ? ((history[0].totalCo2Kg ?? 0) - (history[1].totalCo2Kg ?? 0)) / 1000
    : null;

  return (
    <div>
      <PageHeader
        title={site ? `Historique — ${site.name}` : "Historique"}
        subtitle={`${history.length} calcul${history.length > 1 ? "s" : ""} enregistré${history.length > 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-3">
            {siteId && (
              <Link
                to={`/sites/${siteId}`}
                className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Retour au site
              </Link>
            )}
            {allYears.length > 0 && (
              <select
                value={selectedYear === "all" ? "all" : String(selectedYear)}
                onChange={(e) =>
                  setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground"
              >
                <option value="all">Toutes années</option>
                {allYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      />

      {/* Trend line */}
      {chartData.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
            <h2 className="text-base font-semibold text-card-foreground">Évolution du CO₂ total</h2>
            {latestDelta !== null && (
              <span className={`text-sm font-semibold ${latestDelta <= 0 ? "text-cap-green" : "text-destructive"}`}>
                {latestDelta <= 0 ? "↓" : "↑"} {Math.abs(latestDelta).toLocaleString("fr-FR")} tCO₂e
              </span>
            )}
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString("fr-FR")} tCO₂e`, "CO₂ Total"]} />
                <Line type="monotone" dataKey="co2" stroke="hsl(193, 85%, 46%)" strokeWidth={2.5} dot={{ r: 5, fill: "hsl(193, 85%, 46%)", strokeWidth: 0 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Timeline table - scrollable on mobile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">Date</th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">CO₂ Total (t)</th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">CO₂/m²</th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">CO₂/employé</th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">Construction</th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">Exploitation</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((h, i) => {
                const isLatest = i === 0;
                const siteName = sites.find((s) => s.id === h.siteId)?.name;
                return (
                  <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-card-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Date(h.calculatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        {isLatest && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-cap-vibrant/10 text-cap-vibrant px-2 py-0.5 rounded-full">
                            Dernier
                          </span>
                        )}
                      </div>
                      {!siteId && siteName && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">{siteName}</div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-right font-semibold text-cap-vibrant">{(((h.totalCo2Kg ?? 0) / 1000)).toLocaleString("fr-FR")}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-right text-muted-foreground">{(h.co2PerM2 ?? 0).toFixed(3)}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-right text-muted-foreground">{(h.co2PerEmployee ?? 0).toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-right text-muted-foreground">{(((h.constructionCo2Kg ?? 0) / 1000)).toLocaleString("fr-FR")}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-right text-muted-foreground">{(((h.exploitationCo2Kg ?? 0) / 1000)).toLocaleString("fr-FR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
