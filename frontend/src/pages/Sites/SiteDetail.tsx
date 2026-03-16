import { useParams, Link } from "react-router-dom";
import { useSites } from "@/hooks/useSites";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import { ArrowLeft, RefreshCw, Building2, Users, Zap, Car, Cpu, MapPin, Info } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { apiFetch } from "@/lib/api";
import { useState } from "react";

export default function SiteDetail() {
  const { id } = useParams();
  const { getSite, getLatestResult, refetch } = useSites();
  const [recalculLoading, setRecalculLoading] = useState(false);
  const site = getSite(Number(id));
  const result = getLatestResult(Number(id));

  if (!site) return <div className="text-center py-20 text-muted-foreground">Site non trouvé.</div>;

  const handleRecalculate = async () => {
    if (!site) return;
    try {
      setRecalculLoading(true);
      const now = new Date();
      const year = now.getFullYear();
      await apiFetch(`/api/sites/${site.id}/results/calculate`, {
        method: "POST",
        body: JSON.stringify({ year }),
      });
      await refetch();
    } finally {
      setRecalculLoading(false);
    }
  };

  const pieData = result
    ? [
        { name: "Construction", value: (result.constructionCo2Kg ?? 0) / 1000, color: "hsl(200, 100%, 34%)" },
        { name: "Exploitation", value: (result.exploitationCo2Kg ?? 0) / 1000, color: "hsl(193, 85%, 46%)" },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title={site.name}
        subtitle={`${site.surfaceM2.toLocaleString("fr-FR")} m² · ${site.employeeCount} employés`}
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link to="/sites" className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Link>
            <Link to={`/sites/${id}/history`} className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm">
              Historique
            </Link>
            <Link
              to={`/sites/${id}/edit`}
              className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              Modifier
            </Link>
            <button
              onClick={handleRecalculate}
              disabled={recalculLoading}
              className="inline-flex items-center gap-2 gradient-brand text-primary-foreground font-medium px-4 sm:px-5 py-2 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${recalculLoading ? "animate-spin" : ""}`} /> Recalculer
            </button>
          </div>
        }
      />

      {/* KPIs */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <KpiCard title="CO₂ Total" value={(((result.totalCo2Kg ?? 0) / 1000)).toLocaleString("fr-FR")} unit="tCO₂e" icon={Zap} variant="primary" delay={0} />
          <KpiCard title="CO₂ / m²" value={(result.co2PerM2 ?? 0).toFixed(3)} unit="kg/m²" icon={Building2} variant="vibrant" delay={1} />
          <KpiCard title="CO₂ / employé" value={(result.co2PerEmployee ?? 0).toFixed(2)} unit="kg/pers." icon={Users} variant="green" delay={2} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site info & localisation */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-card-foreground">Informations du site</h2>
          <div className="space-y-4">
            <InfoRow icon={Building2} label="Surface" value={`${site.surfaceM2.toLocaleString("fr-FR")} m²`} />
            <InfoRow icon={Users} label="Employés" value={String(site.employeeCount)} />
            <InfoRow icon={Cpu} label="Postes de travail" value={String(site.workstationCount)} />
            <InfoRow
              icon={Zap}
              label="Consommation énergie"
              value={`${((site.energyConsumptionKwh ?? 0) / 1000).toLocaleString("fr-FR")} MWh/an`}
            />
            <InfoRow
              icon={Car}
              label="Parkings"
              value={`Sous-dalle: ${site.parkingBasement} · Sous-sol: ${site.parkingUnderground} · Aérien: ${site.parkingOutdoor}`}
            />
          </div>
          {(site.addressLine1 || site.city || site.country) && (
            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" /> Localisation
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  {[site.addressLine1, site.addressLine2].filter(Boolean).join(", ")}
                </p>
                <p>
                  {[site.postalCode, site.city, site.country].filter(Boolean).join(" ")}
                </p>
                {(site.latitude || site.longitude) && (
                  <p className="text-xs">
                    Lat/Lon : {site.latitude?.toFixed?.(4)} / {site.longitude?.toFixed?.(4)}
                  </p>
                )}
              </div>
            </div>
          )}
          {(site.buildingType || site.usageType || site.yearOfConstruction) && (
            <div className="pt-4 border-t border-border space-y-2">
              <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" /> Typologie
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {site.buildingType && <p>Type : {site.buildingType}</p>}
                {site.usageType && <p>Usage : {site.usageType}</p>}
                {(site.yearOfConstruction || site.yearOfRenovation) && (
                  <p>
                    Construction / rénovation : {site.yearOfConstruction ?? "?"} /{" "}
                    {site.yearOfRenovation ?? "—"}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Pie chart + méthodologie */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-card-foreground mb-5">Répartition des émissions</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString("fr-FR")} tCO₂e`, ""]}
                      contentStyle={{ background: "hsl(215, 25%, 14%)", border: "1px solid hsl(215, 22%, 20%)", borderRadius: "8px", fontSize: "13px", color: "hsl(210, 20%, 94%)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-muted-foreground">{d.name}</span>
                    <span className="text-xs font-semibold text-card-foreground">{d.value.toLocaleString("fr-FR")}t</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <h3 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" /> Méthodologie & hypothèses
              </h3>
              <p className="text-xs text-muted-foreground mb-1">
                Version de calcul : {result.calculationVersion ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground mb-1">
                Facteurs d'émission : {result.factorsSource ?? "—"}
              </p>
              {result.comment && (
                <p className="text-xs text-muted-foreground">
                  Commentaire : {result.comment}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-card-foreground">{value}</p>
      </div>
    </div>
  );
}
