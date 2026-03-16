import { useState } from "react";
import { useSites } from "@/hooks/useSites";
import PageHeader from "@/components/ui/PageHeader";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const tooltipStyle = {
  background: "hsl(215, 25%, 14%)",
  border: "1px solid hsl(215, 22%, 20%)",
  borderRadius: "8px",
  fontSize: "13px",
  color: "hsl(210, 20%, 94%)",
};

export default function Compare() {
  const { sites, getLatestResult } = useSites();
  const [selected, setSelected] = useState<number[]>(sites.map((s) => s.id));

  const toggle = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const compData = sites
    .filter((s) => selected.includes(s.id))
    .map((s) => {
      const r = getLatestResult(s.id);
      return {
        name: s.name.split("—")[0].trim().split(" ").slice(-1)[0],
        fullName: s.name,
        total: ((r?.totalCo2Kg ?? 0) / 1000),
        perSqm: r?.co2PerM2 ?? 0,
        perEmp: r?.co2PerEmployee ?? 0,
      };
    });

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
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">Site</th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">CO₂ Total (t)</th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">CO₂/m²</th>
                <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-card-foreground whitespace-nowrap">CO₂/employé</th>
              </tr>
            </thead>
            <tbody>
              {compData.map((d, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 sm:px-6 py-3.5 font-medium text-card-foreground whitespace-nowrap">{d.fullName}</td>
                  <td className="px-4 sm:px-6 py-3.5 text-right font-semibold text-cap-vibrant">{d.total.toLocaleString("fr-FR")}</td>
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
          <h2 className="text-base font-semibold text-card-foreground mb-5">Comparaison visuelle</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215, 14%, 46%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="total" name="CO₂ Total (t)" fill="hsl(200, 100%, 34%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
