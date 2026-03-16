import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSites } from "@/hooks/useSites";
import type { CarbonResult } from "@/hooks/useSites";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowLeft, Calendar, Download, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
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

const PAGE_SIZES = [10, 25, 50, 100] as const;
type SortKey = "calculatedAt" | "totalCo2Kg" | "co2PerM2" | "co2PerEmployee" | "constructionCo2Kg" | "exploitationCo2Kg";

function buildCsv(rows: CarbonResult[], sites: { id: number; name: string }[]): string {
  const header = "Date;Site;CO₂ Total (t);CO₂/m²;CO₂/employé;Construction (t);Exploitation (t)\n";
  const lines = rows.map((h) => {
    const date = new Date(h.calculatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const siteName = sites.find((s) => s.id === h.siteId)?.name ?? "";
    const total = ((h.totalCo2Kg ?? 0) / 1000).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    const perM2 = (h.co2PerM2 ?? 0).toFixed(3);
    const perEmp = (h.co2PerEmployee ?? 0).toFixed(2);
    const construction = ((h.constructionCo2Kg ?? 0) / 1000).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    const exploitation = ((h.exploitationCo2Kg ?? 0) / 1000).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return [date, siteName, total, perM2, perEmp, construction, exploitation].join(";");
  });
  return header + lines.join("\n");
}

export default function History() {
  const { id } = useParams();
  const { sites, results, getSite } = useSites();
  const siteId = id ? Number(id) : null;
  const site = siteId ? getSite(siteId) : null;

  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [filterSiteId, setFilterSiteId] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("calculatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  const history = useMemo(() => {
    let filtered = !siteId ? results : results.filter((r) => r.siteId === siteId);
    if (selectedYear !== "all") {
      filtered = filtered.filter((r) => {
        if (r.year) return r.year === selectedYear;
        const d = new Date(r.calculatedAt);
        return !Number.isNaN(d.getTime()) && d.getFullYear() === selectedYear;
      });
    }
    if (!siteId && filterSiteId !== "all") {
      filtered = filtered.filter((r) => r.siteId === filterSiteId);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((r) => {
        const name = sites.find((s) => s.id === r.siteId)?.name ?? "";
        return name.toLowerCase().includes(q);
      });
    }
    return filtered;
  }, [results, siteId, selectedYear, filterSiteId, search, sites]);

  const sortedHistory = useMemo(() => {
    const arr = [...history];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "calculatedAt") {
        cmp = new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime();
      } else {
        const aVal = a[sortBy] ?? 0;
        const bVal = b[sortBy] ?? 0;
        cmp = Number(aVal) - Number(bVal);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [history, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedHistory = useMemo(
    () => sortedHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedHistory, currentPage, pageSize]
  );

  const latestResultId = useMemo(() => {
    if (history.length === 0) return null;
    let latest = history[0];
    for (const r of history) {
      if (new Date(r.calculatedAt).getTime() > new Date(latest.calculatedAt).getTime()) latest = r;
    }
    return latest.id;
  }, [history]);

  const handleSort = (key: SortKey) => {
    setSortBy(key);
    setSortDir((prev) => (sortBy === key ? (prev === "asc" ? "desc" : "asc") : "desc"));
    setPage(1);
  };

  const handleExportCsv = () => {
    const csv = buildCsv(sortedHistory, sites);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historique-co2-${site ? `site-${siteId}` : "global"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {siteId && (
              <Link
                to={`/sites/${siteId}`}
                className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm shrink-0"
              >
                <ArrowLeft className="w-4 h-4" /> Retour au site
              </Link>
            )}
            {!siteId && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Rechercher un site..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground w-40 sm:w-48"
                />
              </div>
            )}
            {!siteId && sites.length > 0 && (
              <select
                value={filterSiteId === "all" ? "all" : String(filterSiteId)}
                onChange={(e) => { setFilterSiteId(e.target.value === "all" ? "all" : Number(e.target.value)); setPage(1); }}
                className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground min-w-[140px]"
              >
                <option value="all">Tous les sites</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name.split("—")[0].trim()}</option>
                ))}
              </select>
            )}
            {allYears.length > 0 && (
              <select
                value={selectedYear === "all" ? "all" : String(selectedYear)}
                onChange={(e) => { setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value)); setPage(1); }}
                className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
              >
                <option value="all">Toutes les années</option>
                {allYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={sortedHistory.length === 0}
              className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" /> Exporter (CSV)
            </button>
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
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("calculatedAt")} className="inline-flex items-center gap-1 hover:text-cap-vibrant transition-colors">
                    Date {sortBy === "calculatedAt" ? (sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />) : <ArrowDown className="w-3.5 h-3.5 opacity-50" />}
                  </button>
                </th>
                {!siteId && (
                  <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">Site</th>
                )}
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("totalCo2Kg")} className="inline-flex items-center ml-auto hover:text-cap-vibrant transition-colors">
                    CO₂ Total (t) {sortBy === "totalCo2Kg" ? (sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />) : <ArrowDown className="w-3.5 h-3.5 opacity-50" />}
                  </button>
                </th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("co2PerM2")} className="inline-flex items-center ml-auto hover:text-cap-vibrant transition-colors">CO₂/m²</button>
                </th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("co2PerEmployee")} className="inline-flex items-center ml-auto hover:text-cap-vibrant transition-colors">CO₂/employé</button>
                </th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("constructionCo2Kg")} className="inline-flex items-center ml-auto hover:text-cap-vibrant transition-colors">Construction</button>
                </th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("exploitationCo2Kg")} className="inline-flex items-center ml-auto hover:text-cap-vibrant transition-colors">Exploitation</button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.map((h) => {
                const siteName = sites.find((s) => s.id === h.siteId)?.name ?? "";
                const isLatest = latestResultId === h.id;
                return (
                  <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-card-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {new Date(h.calculatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        {isLatest && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-cap-vibrant/10 text-cap-vibrant px-2 py-0.5 rounded-full shrink-0">
                            Dernier
                          </span>
                        )}
                      </div>
                    </td>
                    {!siteId && (
                      <td className="px-4 sm:px-6 py-3.5 text-muted-foreground whitespace-nowrap">{siteName}</td>
                    )}
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
        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedHistory.length)} sur {sortedHistory.length}
            </span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-sm border border-border rounded-md px-2 py-1.5 bg-background text-foreground"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n} par page</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-card-foreground">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
