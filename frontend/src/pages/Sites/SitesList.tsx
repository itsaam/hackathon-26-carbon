import { Link } from "react-router-dom";
import { useSites } from "@/hooks/useSites";
import PageHeader from "@/components/ui/PageHeader";
import { Plus, Search, Building2, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SitesList() {
  const { sites, getLatestResult } = useSites();
  const [search, setSearch] = useState("");

  const filtered = sites.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  function getCarbonClass(co2PerM2?: number | null, co2PerEmployee?: number | null): { label: string; color: string } {
    const perM2 = co2PerM2 ?? 0;
    const perEmp = co2PerEmployee ?? 0;
    // Seuils simplifiés inspirés de benchmarks tertiaires
    const score =
      (perM2 <= 10 ? 3 : perM2 <= 20 ? 2 : perM2 <= 35 ? 1 : 0) +
      (perEmp <= 200 ? 3 : perEmp <= 400 ? 2 : perEmp <= 800 ? 1 : 0);
    if (score >= 5) return { label: "A", color: "text-emerald-500" };
    if (score >= 3) return { label: "B", color: "text-lime-400" };
    if (score >= 2) return { label: "C", color: "text-amber-400" };
    return { label: "D", color: "text-red-400" };
  }

  return (
    <div>
      <PageHeader
        title="Vos sites"
        subtitle={`${sites.length} sites enregistrés`}
        actions={
          <Link
            to="/sites/new"
            className="inline-flex items-center gap-2 gradient-brand text-primary-foreground font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouveau site
          </Link>
        }
      />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un site…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((site, i) => {
          const result = getLatestResult(site.id);
          const carbonClass = getCarbonClass(result?.co2PerM2, result?.co2PerEmployee);
          return (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Link
                to={`/sites/${site.id}`}
                className="block bg-card border border-border rounded-xl p-6 hover:shadow-md hover:border-cap-vibrant/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-card-foreground group-hover:text-cap-vibrant transition-colors text-sm leading-tight">
                      {site.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Créé le {new Date(site.createdAt).toLocaleDateString("fr-FR")}</p>
                    {result && (
                      <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${carbonClass.color} border-border/60`}>
                        Classe carbone {carbonClass.label}
                      </span>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-cap-blue/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-cap-blue" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Surface</p>
                    <p className="text-sm font-semibold text-card-foreground">{(site.surfaceM2 / 1000).toFixed(1)}k m²</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Employés</p>
                    <p className="text-sm font-semibold text-card-foreground">{site.employeeCount}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Énergie</p>
                    <p className="text-sm font-semibold text-card-foreground">{(site.energyConsumptionKwh / 1000).toFixed(0)} MWh</p>
                  </div>
                </div>

                {result && (
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <Zap className="w-3.5 h-3.5 text-cap-green" />
                    <span className="text-sm font-bold text-cap-green">{(((result.totalCo2Kg ?? 0) / 1000)).toLocaleString("fr-FR")} tCO₂e</span>
                    <span className="text-xs text-muted-foreground ml-auto">{(result.co2PerM2 ?? 0).toFixed(3)} kg/m²</span>
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
