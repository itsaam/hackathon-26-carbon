import { useState, useMemo } from "react";
import { useSites } from "@/hooks/useSites";
import PageHeader from "@/components/ui/PageHeader";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart3 } from "lucide-react";

const tooltipStyle = {
  background: "hsl(215, 25%, 14%)",
  border: "1px solid hsl(215, 22%, 20%)",
  borderRadius: "8px",
  fontSize: "13px",
  color: "hsl(210, 20%, 94%)",
};

type SortKey = "fullName" | "total" | "perSqm" | "perEmp";

export default function Compare() {
  const { sites, getLatestResult } = useSites();
  const [selected, setSelected] = useState<number[]>(sites.map((s) => s.id));
  const [excludedFromChart, setExcludedFromChart] = useState<number[]>([]);
  const [useLogScale, setUseLogScale] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggle = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleExcludedFromChart = (id: number) => {
    setExcludedFromChart((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const compData = useMemo(() => {
    return sites
      .filter((s) => selected.includes(s.id))
      .map((s) => {
        const r = getLatestResult(s.id);
        return {
          id: s.id,
          name: s.name.split("—")[0].trim().split(" ").slice(-1)[0],
          fullName: s.name,
          total: (r?.totalCo2Kg ?? 0) / 1000,
          perSqm: r?.co2PerM2 ?? 0,
          perEmp: r?.co2PerEmployee ?? 0,
        };
      });
  }, [sites, selected, getLatestResult]);

  const maxTotal = useMemo(() => Math.max(...compData.map((d) => d.total), 0.001), [compData]);
  const maxTotalLog = useMemo(() => Math.log10(1 + maxTotal), [maxTotal]);

  const chartData = useMemo(() => {
    const data = compData.filter((d) => !excludedFromChart.includes(d.id));
    return data.map((d) => ({
      ...d,
      totalLog: d.total <= 0 ? 0.001 : d.total,
    }));
  }, [compData, excludedFromChart]);

  const sortedData = useMemo(() => {
    const arr = [...compData];
    arr.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const cmp = typeof aVal === "string" ? (aVal as string).localeCompare(bVal as string) : (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [compData, sortBy, sortDir]);

  const handleSort = (key: SortKey) => {
    setSortBy(key);
    setSortDir((prev) => (sortBy === key ? (prev === "asc" ? "desc" : "asc") : "desc"));
  };

  const SortIcon = ({ column }: { column: SortKey }) =>
    sortBy === column ? sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 inline ml-0.5" /> : <ArrowDown className="w-3.5 h-3.5 inline ml-0.5" /> : <ArrowUpDown className="w-3.5 h-3.5 inline ml-0.5 opacity-50" />;

  return (
    <div>
      <PageHeader title="Comparer vos sites" subtitle="Sélectionnez les sites à comparer" />

      {/* Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sites.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              selected.includes(s.id)
                ? "bg-cap-vibrant/10 border-cap-vibrant/30 text-cap-vibrant"
                : "bg-card border-border text-muted-foreground hover:border-cap-vibrant/20"
            }`}
          >
            {s.name.split("—")[0].trim()}
          </button>
        ))}
      </div>

      {/* Table - scrollable horizontally on mobile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap w-8" title="Exclure du graphique" />
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("fullName")} className="inline-flex items-center hover:text-cap-vibrant transition-colors">
                    Site <SortIcon column="fullName" />
                  </button>
                </th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("total")} className="inline-flex items-center ml-auto hover:text-cap-vibrant transition-colors">
                    CO₂ Total (t) <SortIcon column="total" />
                  </button>
                </th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap min-w-[100px]">Barre</th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("perSqm")} className="inline-flex items-center ml-auto hover:text-cap-vibrant transition-colors">
                    CO₂/m² <SortIcon column="perSqm" />
                  </button>
                </th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("perEmp")} className="inline-flex items-center ml-auto hover:text-cap-vibrant transition-colors">
                    CO₂/employé <SortIcon column="perEmp" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-2 sm:px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleExcludedFromChart(d.id)}
                      title={excludedFromChart.includes(d.id) ? "Inclure dans le graphique" : "Exclure du graphique"}
                      className={`p-1.5 rounded-md transition-colors ${excludedFromChart.includes(d.id) ? "bg-cap-vibrant/20 text-cap-vibrant" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 font-medium text-card-foreground whitespace-nowrap">{d.fullName}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-right font-semibold text-cap-vibrant whitespace-nowrap">{d.total.toLocaleString("fr-FR")}</td>
                  <td className="px-4 sm:px-6 py-3.5 align-middle">
                    <div className="h-5 min-w-[80px] bg-muted/50 rounded overflow-hidden" title={`Proportion (échelle log) : ${d.total.toLocaleString("fr-FR")} t`}>
                      <div
                        className="h-full bg-cap-vibrant/70 rounded transition-all duration-300"
                        style={{ width: `${maxTotalLog > 0 ? Math.min(100, (Math.log10(1 + d.total) / maxTotalLog) * 100) : 0}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-right text-muted-foreground">{d.perSqm.toFixed(3)}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-right text-muted-foreground">{d.perEmp.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Chart */}
      {compData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="text-base font-semibold text-card-foreground">Comparaison visuelle</h2>
            <div className="flex items-center gap-3">
              {excludedFromChart.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {excludedFromChart.length} site(s) exclu(s) du graphique
                </span>
              )}
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                <input
                  type="checkbox"
                  checked={useLogScale}
                  onChange={(e) => setUseLogScale(e.target.checked)}
                  className="rounded border-border text-cap-vibrant focus:ring-cap-vibrant"
                />
                Échelle logarithmique
              </label>
            </div>
          </div>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} axisLine={false} tickLine={false} />
                  <YAxis
                    scale={useLogScale ? "log" : "auto"}
                    domain={useLogScale ? [0.001, "auto"] : [0, "auto"]}
                    tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (useLogScale && typeof v === "number" ? (v >= 1 ? String(v) : v.toFixed(2)) : String(v))}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [value.toLocaleString("fr-FR") + " t", "CO₂ Total"]}
                    labelFormatter={(label) => compData.find((d) => d.name === label)?.fullName ?? label}
                  />
                  <Bar dataKey={useLogScale ? "totalLog" : "total"} name="CO₂ Total (t)" fill="hsl(200, 100%, 34%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Tous les sites sélectionnés sont exclus du graphique. Cliquez sur l’icône <BarChart3 className="w-4 h-4 inline mx-0.5" /> dans le tableau pour en réafficher.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
