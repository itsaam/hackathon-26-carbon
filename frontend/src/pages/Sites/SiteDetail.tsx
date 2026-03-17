import { useParams, Link } from "react-router-dom";
import { useSites } from "@/hooks/useSites";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";
import { ArrowLeft, RefreshCw, Building2, Users, Zap, Car, Cpu, MapPin, Info, SlidersHorizontal, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { apiFetch, getAuthToken } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

export default function SiteDetail() {
  const { id } = useParams();
  const { getSite, getLatestResult, refetch } = useSites();
  const [recalculLoading, setRecalculLoading] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [scenarioEnergyDelta, setScenarioEnergyDelta] = useState(-10);
  const [scenarioRenewableDelta, setScenarioRenewableDelta] = useState(20);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<CarbonResult | null>(null);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [scenarioLabel, setScenarioLabel] = useState("Scénario énergie + renouvelable");
  const [scenarioIncludeComparison, setScenarioIncludeComparison] = useState(true);
  const [scenarioIncludeKpis, setScenarioIncludeKpis] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [teleworkLoading, setTeleworkLoading] = useState(false);
  const [teleworkError, setTeleworkError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [telework, setTelework] = useState<TeleworkRecommendation | null>(null);
  const site = getSite(Number(id));
  const result = getLatestResult(Number(id));

  if (!site) return <div className="text-center py-20 text-muted-foreground">Site non trouvé.</div>;

  const canLoadWeather = typeof site.latitude === "number" && typeof site.longitude === "number";

  useEffect(() => {
    if (!canLoadWeather) return;
    let cancelled = false;
    (async () => {
      try {
        setWeatherLoading(true);
        setWeatherError(null);
        const data = await apiFetch<WeatherForecast>(
          `/api/weather/forecast?latitude=${site.latitude}&longitude=${site.longitude}&forecastDays=7&timezone=Europe%2FParis`
        );
        if (!cancelled) setForecast(data);
      } catch {
        if (!cancelled) setWeatherError("Impossible de charger la météo.");
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canLoadWeather, site.latitude, site.longitude]);

  useEffect(() => {
    if (!canLoadWeather || !selectedDate) return;
    let cancelled = false;
    (async () => {
      try {
        setTeleworkLoading(true);
        setTeleworkError(null);
        const data = await apiFetch<TeleworkRecommendation>(
          `/api/recommendations/telework?latitude=${site.latitude}&longitude=${site.longitude}&date=${encodeURIComponent(selectedDate)}&timezone=Europe%2FParis`
        );
        if (!cancelled) setTelework(data);
      } catch {
        if (!cancelled) setTeleworkError("Impossible de calculer la recommandation.");
      } finally {
        if (!cancelled) setTeleworkLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canLoadWeather, selectedDate, site.latitude, site.longitude]);

  const selectedDateSnapshot = useMemo(() => {
    if (!forecast?.hourly?.length) return null;
    if (!selectedDate) return null;
    const pts = forecast.hourly.filter((p) => p?.time?.startsWith(selectedDate));
    if (!pts.length) return null;
    const temps = pts.map((p) => p.temperatureC).filter((v): v is number => typeof v === "number");
    const minTemp = temps.length ? Math.min(...temps) : null;
    const maxTemp = temps.length ? Math.max(...temps) : null;
    const precip = pts.map((p) => p.precipitationMm).filter((v): v is number => typeof v === "number");
    const totalPrecip = precip.reduce((s, v) => s + v, 0);
    return { minTemp, maxTemp, totalPrecip };
  }, [forecast, selectedDate]);

  const handleRecalculate = async () => {
    if (!site) return;
    try {
      setRecalculLoading(true);
      const year = 2024; // cohérence avec les facteurs d'énergie en base
      await apiFetch(`/api/sites/${site.id}/results/calculate`, {
        method: "POST",
        body: JSON.stringify({ year }),
      });
      await refetch();
    } finally {
      setRecalculLoading(false);
    }
  };

  const handleOpenScenario = () => {
    setScenarioError(null);
    setScenarioResult(null);
    setScenarioOpen(true);
  };

  const handleRunScenario = async () => {
    if (!site) return;
    try {
      setScenarioLoading(true);
      setScenarioError(null);
      const body = {
        energyDeltaPercent: scenarioEnergyDelta,
        renewableDeltaPercent: scenarioRenewableDelta,
      };
      const data = await apiFetch<CarbonResult>(`/api/sites/${site.id}/results/estimate`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setScenarioResult(data);
    } catch (e) {
      setScenarioError("Impossible de calculer le scénario. Réessayez plus tard.");
    } finally {
      setScenarioLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!site) return;
    try {
      const now = new Date();
      const year = now.getFullYear();
      const token = getAuthToken();
      const res = await fetch(`/api/sites/${site.id}/report.pdf?year=${year}`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-site-${site.id}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Silencieux pour la démo
    }
  };

  const handleExportScenarioPdf = async () => {
    if (!site) return;
    try {
      const body = {
        energyDeltaPercent: scenarioEnergyDelta,
        renewableDeltaPercent: scenarioRenewableDelta,
        scenarioLabel,
        includeComparison: scenarioIncludeComparison,
        includeKpis: scenarioIncludeKpis,
      };
      const token = getAuthToken();
      const res = await fetch(`/api/sites/${site.id}/scenario/report.pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scenario-site-${site.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // silencieux pour la démo
    }
  };

  const pieDataRaw = result
    ? [
        { name: "Construction", value: (result.constructionCo2Kg ?? 0) / 1000, color: "hsl(200, 100%, 34%)" },
        { name: "Exploitation", value: (result.exploitationCo2Kg ?? 0) / 1000, color: "hsl(193, 85%, 46%)" },
      ]
    : [];
  const pieTotal = pieDataRaw.reduce((s, d) => s + d.value, 0);
  const pieData = pieDataRaw.map((d) => ({
    ...d,
    value: d.value <= 0 && pieTotal > 0 ? 0.001 : Math.max(d.value, 0),
    realValue: d.value,
  }));
  const scopeValues = result
    ? [
        { key: "scope1" as const, label: "Scope 1", value: result.scope1Co2Kg ?? 0 },
        { key: "scope2" as const, label: "Scope 2", value: result.scope2Co2Kg ?? 0 },
        { key: "scope3" as const, label: "Scope 3", value: result.scope3Co2Kg ?? 0 },
      ]
    : [];
  const maxScopeValue = scopeValues.length ? Math.max(...scopeValues.map((s) => s.value)) : 0;

  return (
    <div>
      <PageHeader
        title={site.name}
        subtitle={`${site.surfaceM2.toLocaleString("fr-FR")} m² · ${site.employeeCount} employés`}
      />
      {/* Barre d'actions du site : sous le header pour éviter tout chevauchement */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 pb-4 border-b border-border/60" role="toolbar" aria-label="Actions du site">
        <Link to="/sites" className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm shrink-0">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <Link to={`/sites/${id}/history`} className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm shrink-0">
          Historique
        </Link>
        <Link
          to={`/sites/${id}/edit`}
          className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm shrink-0"
        >
          Modifier
        </Link>
        <span className="hidden sm:inline w-px h-6 bg-border rounded-full flex-shrink-0" aria-hidden />
        <button
          onClick={handleRecalculate}
          disabled={recalculLoading}
          className="inline-flex items-center gap-2 gradient-brand text-primary-foreground font-medium px-4 sm:px-5 py-2 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${recalculLoading ? "animate-spin" : ""}`} /> Recalculer
        </button>
        <button
          onClick={handleOpenScenario}
          className="inline-flex items-center gap-2 border border-border bg-muted/40 text-foreground font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" /> Simuler un scénario
        </button>
        <span className="hidden sm:inline w-px h-6 bg-border rounded-full flex-shrink-0" aria-hidden />
        <button
          onClick={handleExportReport}
          className="inline-flex items-center gap-2 border border-border bg-muted/40 text-foreground font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm shrink-0"
        >
          <FileText className="w-4 h-4" /> Exporter le rapport (PDF)
        </button>
      </div>

      {/* KPIs */}
      <div className="space-y-3 mb-8">
        {result ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <KpiCard title="CO₂ Total" value={(((result.totalCo2Kg ?? 0) / 1000)).toLocaleString("fr-FR")} unit="tCO₂e" icon={Zap} variant="primary" delay={0} />
              <KpiCard title="CO₂ / m²" value={(result.co2PerM2 ?? 0).toFixed(3)} unit="kg/m²" icon={Building2} variant="vibrant" delay={1} />
              <KpiCard title="CO₂ / employé" value={(result.co2PerEmployee ?? 0).toFixed(2)} unit="kg/pers." icon={Users} variant="green" delay={2} />
            </div>
            {(result.scope1Co2Kg != null || result.scope2Co2Kg != null || result.scope3Co2Kg != null) && (
              <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                {scopeValues.map((s) => (
                  <span
                    key={s.key}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md ${s.value === maxScopeValue && maxScopeValue > 0 ? "bg-cap-vibrant/10 text-cap-vibrant font-semibold" : ""}`}
                  >
                    {s.label} : {((s.value ?? 0) / 1000).toLocaleString("fr-FR")} tCO₂e
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-muted/30 border border-border rounded-xl p-8 text-center">
            <p className="text-sm font-medium text-card-foreground mb-1">Aucun calcul disponible</p>
            <p className="text-xs text-muted-foreground mb-4">Lancez un calcul pour afficher les indicateurs CO₂ de ce site.</p>
            <button
              onClick={handleRecalculate}
              disabled={recalculLoading}
              className="inline-flex items-center gap-2 gradient-brand text-primary-foreground font-medium px-4 py-2 rounded-lg text-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${recalculLoading ? "animate-spin" : ""}`} /> Recalculer
            </button>
          </div>
        )}
      </div>

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
          <div className="pt-4 border-t border-border space-y-3">
            <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" /> Météo & recommandation
            </h3>
            {!canLoadWeather ? (
              <p className="text-xs text-muted-foreground">
                Ajoutez la latitude/longitude du site pour afficher les prévisions météo et la recommandation de télétravail.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-xs text-muted-foreground">
                    Date
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="ml-2 px-2 py-1 rounded-md border border-border bg-background text-xs"
                    />
                  </label>
                  {selectedDateSnapshot && (
                    <span className="text-xs text-muted-foreground">
                      Prévision : {selectedDateSnapshot.minTemp != null ? `${selectedDateSnapshot.minTemp.toFixed(1)}°C` : "—"} →{" "}
                      {selectedDateSnapshot.maxTemp != null ? `${selectedDateSnapshot.maxTemp.toFixed(1)}°C` : "—"} · {selectedDateSnapshot.totalPrecip.toFixed(1)} mm
                    </span>
                  )}
                </div>

                {(weatherError || teleworkError) && (
                  <p className="text-xs text-destructive">{weatherError || teleworkError}</p>
                )}

                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {weatherLoading || teleworkLoading ? "Chargement..." : "Recommandation"}
                  </p>
                  {telework ? (
                    <>
                      <p className="text-sm font-semibold text-card-foreground">
                        {telework.teleworkAdvised ? "Télétravail conseillé" : "Présence possible"}
                      </p>
                      <p className="text-xs text-muted-foreground">{telework.reason}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Min: {telework.minTemperatureC != null ? `${telework.minTemperatureC.toFixed(1)}°C` : "—"} · Risque verglas:{" "}
                        {telework.iceRisk ? "Oui" : "Non"}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </div>
              </div>
            )}
          </div>
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-card-foreground mb-5">Répartition des émissions</h2>
            {result ? (
              <>
                {pieTotal > 0 ? (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} dataKey="value" strokeWidth={0}>
                            {pieData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, _name: string, props: { payload?: { realValue?: number } }) => [
                              `${(props.payload?.realValue ?? value).toLocaleString("fr-FR")} tCO₂e`,
                              "",
                            ]}
                            contentStyle={{ background: "hsl(215, 25%, 14%)", border: "1px solid hsl(215, 22%, 20%)", borderRadius: "8px", fontSize: "13px", color: "hsl(210, 20%, 94%)" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2">
                      {pieDataRaw.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-xs text-muted-foreground">{d.name}</span>
                          <span className="text-xs font-semibold text-card-foreground">{d.value.toLocaleString("fr-FR")} t</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                    Aucune émission enregistrée pour ce calcul.
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                Lancez un calcul pour afficher la répartition.
              </div>
            )}
          </div>

          {result && (
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
          )}
        </motion.div>
      </div>

      {/* Modal scénario what-if */}
      {scenarioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-card-foreground">Simuler un scénario</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Ajustez quelques leviers simples pour visualiser l’impact potentiel sur le CO₂. Le scénario n’est pas enregistré, il sert uniquement d’aide à la décision pendant l’atelier.
                </p>
              </div>
              <button
                onClick={() => setScenarioOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-card-foreground mb-1">
                  Nom du scénario
                </label>
                <input
                  type="text"
                  value={scenarioLabel}
                  onChange={(e) => setScenarioLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="Scénario rénovation énergétique 2030"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-card-foreground">Réduction de la consommation énergétique globale (%)</span>
                  <span className="text-muted-foreground">{scenarioEnergyDelta}%</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={0}
                  step={1}
                  value={scenarioEnergyDelta}
                  onChange={(e) => setScenarioEnergyDelta(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-card-foreground">Augmentation de la production renouvelable (%)</span>
                  <span className="text-muted-foreground">{scenarioRenewableDelta}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={scenarioRenewableDelta}
                  onChange={(e) => setScenarioRenewableDelta(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {scenarioError && (
                <p className="text-xs text-destructive">{scenarioError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setScenarioOpen(false)}
                  className="px-3 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRunScenario}
                  disabled={scenarioLoading}
                  className="px-4 py-2 text-xs rounded-lg gradient-brand text-primary-foreground font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {scenarioLoading ? "Calcul en cours..." : "Lancer le scénario"}
                </button>
              </div>
            </div>

            {result && scenarioResult && (
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs items-start">
                <div className="bg-muted/40 rounded-lg p-3 border border-border/60">
                  <h3 className="font-semibold text-card-foreground mb-1.5">Situation actuelle</h3>
                  <p className="text-muted-foreground">CO₂ total : <span className="font-semibold text-card-foreground">{(((result.totalCo2Kg ?? 0) / 1000)).toLocaleString("fr-FR")} tCO₂e</span></p>
                  <p className="text-muted-foreground">CO₂ / m² : <span className="font-semibold text-card-foreground">{(result.co2PerM2 ?? 0).toFixed(3)} kg/m²</span></p>
                  <p className="text-muted-foreground">CO₂ / employé : <span className="font-semibold text-card-foreground">{(result.co2PerEmployee ?? 0).toFixed(2)} kg/pers.</span></p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 border border-border/60">
                  <h3 className="font-semibold text-card-foreground mb-1.5">Scénario simulé</h3>
                  <p className="text-muted-foreground">CO₂ total : <span className="font-semibold text-card-foreground">{(((scenarioResult.totalCo2Kg ?? 0) / 1000)).toLocaleString("fr-FR")} tCO₂e</span></p>
                  <p className="text-muted-foreground">CO₂ / m² : <span className="font-semibold text-card-foreground">{(scenarioResult.co2PerM2 ?? 0).toFixed(3)} kg/m²</span></p>
                  <p className="text-muted-foreground">CO₂ / employé : <span className="font-semibold text-card-foreground">{(scenarioResult.co2PerEmployee ?? 0).toFixed(2)} kg/pers.</span></p>
                  {result.totalCo2Kg != null && scenarioResult.totalCo2Kg != null && (
                    <>
                      <p className="text-muted-foreground mt-1">
                        Delta :{" "}
                        <span className="font-semibold text-card-foreground">
                          {(((scenarioResult.totalCo2Kg - result.totalCo2Kg) / 1000)).toLocaleString("fr-FR")} tCO₂e
                        </span>
                      </p>
                      <p className="text-xs text-card-foreground mt-1">
                        {(() => {
                          const deltaT = (scenarioResult.totalCo2Kg - result.totalCo2Kg) / 1000;
                          const baseT = (result.totalCo2Kg ?? 0) / 1000;
                          const pct = baseT > 0 ? (deltaT / baseT) * 100 : 0;
                          if (deltaT < 0) {
                            return `Ce scénario permettrait de réduire d’environ ${Math.abs(deltaT).toFixed(2)} tCO₂e (${Math.abs(pct).toFixed(1)} %).`;
                          }
                          if (deltaT > 0) {
                            return `Ce scénario augmenterait les émissions d’environ ${deltaT.toFixed(2)} tCO₂e (${pct.toFixed(1)} %).`;
                          }
                          return "Ce scénario ne change pas significativement les émissions totales.";
                        })()}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-muted/40 rounded-lg p-3 border border-border/60 flex flex-col gap-2">
                  <h3 className="font-semibold text-card-foreground mb-1.5">Export PDF</h3>
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={scenarioIncludeComparison}
                      onChange={(e) => setScenarioIncludeComparison(e.target.checked)}
                    />
                    <span>Inclure la comparaison réel / scénario</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={scenarioIncludeKpis}
                      onChange={(e) => setScenarioIncludeKpis(e.target.checked)}
                    />
                    <span>Inclure le tableau des KPIs</span>
                  </label>
                  <button
                    onClick={handleExportScenarioPdf}
                    className="mt-2 inline-flex items-center justify-center gap-2 border border-border bg-background text-foreground font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-xs"
                  >
                    <FileText className="w-3 h-3" />
                    Exporter la simulation en PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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

type WeatherForecast = {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  hourly?: Array<{
    time?: string;
    temperatureC?: number | null;
    precipitationMm?: number | null;
    rainMm?: number | null;
    snowfallCm?: number | null;
  }>;
};

type TeleworkRecommendation = {
  teleworkAdvised: boolean;
  reason: string;
  date: string;
  minTemperatureC?: number | null;
  iceRisk: boolean;
};
