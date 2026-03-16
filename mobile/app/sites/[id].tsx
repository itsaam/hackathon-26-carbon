import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getToken } from "../../lib/auth";

interface Site {
  id: number;
  name: string;
  surfaceM2: number;
  employeeCount: number;
  energyConsumptionKwh: number;
  buildingType?: string | null;
  usageType?: string | null;
}

interface CarbonResult {
  id: number;
  totalCo2Kg: number | null;
  co2PerM2: number | null;
  co2PerEmployee: number | null;
  constructionCo2Kg: number | null;
  exploitationCo2Kg: number | null;
  scope1Co2Kg?: number | null;
  scope2Co2Kg?: number | null;
  scope3Co2Kg?: number | null;
  calculatedAt: string;
}

export default function SiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [result, setResult] = useState<CarbonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<CarbonResult | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const [siteRes, latestRes] = await Promise.all([
          fetch(process.env.EXPO_PUBLIC_API_URL + `/api/sites/${id}`, { headers }),
          fetch(process.env.EXPO_PUBLIC_API_URL + `/api/sites/${id}/results/latest`, { headers }),
        ]);

        if (!siteRes.ok) {
          setError("Impossible de charger le site");
          return;
        }
        const siteJson = await siteRes.json();
        setSite(siteJson);

        if (latestRes.ok) {
          const latestJson = await latestRes.json();
          setResult(latestJson);
        } else {
          setResult(null);
        }
      } catch {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleRecalculate = async () => {
    if (!id) return;
    try {
      setRecalcLoading(true);
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const year = 2024;
      const res = await fetch(process.env.EXPO_PUBLIC_API_URL + `/api/sites/${id}/results/calculate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ year }),
      });
      if (res.ok) {
        const json = await res.json();
        setResult(json);
      }
    } finally {
      setRecalcLoading(false);
    }
  };

  const handleScenarioQuick = async () => {
    if (!id) return;
    try {
      setScenarioLoading(true);
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const body = {
        energyDeltaPercent: -10,
        renewableDeltaPercent: 20,
      };
      const res = await fetch(process.env.EXPO_PUBLIC_API_URL + `/api/sites/${id}/results/estimate`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json: CarbonResult = await res.json();
        setScenarioResult(json);
      }
    } finally {
      setScenarioLoading(false);
    }
  };

  const handleOpenReport = async () => {
    if (!id) return;
    try {
      const token = await getToken();
      const year = new Date().getFullYear();
      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/sites/${id}/report.pdf?year=${year}`;
      // En démo, on ouvre simplement l'URL dans le navigateur.
      await Linking.openURL(url);
    } catch {
      // silencieux en démo
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#22d3ee" />
      </View>
    );
  }

  if (!site) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Site introuvable.</Text>
      </View>
    );
  }

  const totalT = result?.totalCo2Kg != null ? result.totalCo2Kg / 1000 : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{site.name}</Text>
      <Text style={styles.subtitle}>
        {site.surfaceM2.toLocaleString("fr-FR")} m² · {site.employeeCount} pers.
      </Text>

      {site.buildingType && (
        <Text style={styles.subtitleSmall}>
          {site.buildingType} {site.usageType ? `· ${site.usageType}` : ""}
        </Text>
      )}

      <View style={styles.kpiRow}>
        <Kpi label="CO₂ total" value={totalT != null ? `${totalT.toFixed(2)} t` : "—"} />
        <Kpi label="CO₂ / m²" value={result?.co2PerM2 != null ? `${result.co2PerM2.toFixed(2)} kg` : "—"} />
        <Kpi
          label="CO₂ / employé"
          value={result?.co2PerEmployee != null ? `${result.co2PerEmployee.toFixed(2)} kg` : "—"}
        />
      </View>

      {result && (result.scope1Co2Kg != null || result.scope2Co2Kg != null || result.scope3Co2Kg != null) && (
        <View style={styles.scopeRow}>
          {result.scope1Co2Kg != null && (
            <Text style={styles.scopeText}>Scope 1 : {(result.scope1Co2Kg / 1000).toFixed(2)} tCO₂e</Text>
          )}
          {result.scope2Co2Kg != null && (
            <Text style={styles.scopeText}>Scope 2 : {(result.scope2Co2Kg / 1000).toFixed(2)} tCO₂e</Text>
          )}
          {result.scope3Co2Kg != null && (
            <Text style={styles.scopeText}>Scope 3 : {(result.scope3Co2Kg / 1000).toFixed(2)} tCO₂e</Text>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Énergie & intensité</Text>
        <Text style={styles.sectionText}>
          Consommation énergie : {(site.energyConsumptionKwh / 1000).toLocaleString("fr-FR")} MWh/an
        </Text>
        {result && (
          <>
            <Text style={styles.sectionText}>
              Construction : {((result.constructionCo2Kg ?? 0) / 1000).toFixed(2)} tCO₂e
            </Text>
            <Text style={styles.sectionText}>
              Exploitation : {((result.exploitationCo2Kg ?? 0) / 1000).toFixed(2)} tCO₂e
            </Text>
            <Text style={styles.sectionMeta}>
              Dernier calcul : {new Date(result.calculatedAt).toLocaleDateString("fr-FR")}
            </Text>
          </>
        )}
      </View>

      {result && scenarioResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scénario rapide (-10 % énergie, +20 % renouvelable)</Text>
          <Text style={styles.sectionText}>
            CO₂ total actuel : {((result.totalCo2Kg ?? 0) / 1000).toFixed(2)} tCO₂e
          </Text>
          <Text style={styles.sectionText}>
            CO₂ total scénario : {((scenarioResult.totalCo2Kg ?? 0) / 1000).toFixed(2)} tCO₂e
          </Text>
          {result.totalCo2Kg != null && scenarioResult.totalCo2Kg != null && (
            <Text style={styles.sectionMeta}>
              {(() => {
                const deltaT = (scenarioResult.totalCo2Kg - result.totalCo2Kg) / 1000;
                const baseT = (result.totalCo2Kg ?? 0) / 1000;
                const pct = baseT > 0 ? (deltaT / baseT) * 100 : 0;
                if (deltaT < 0) {
                  return `Gain estimé : -${Math.abs(deltaT).toFixed(2)} tCO₂e (${Math.abs(pct).toFixed(1)} %).`;
                }
                if (deltaT > 0) {
                  return `Surcoût carbone estimé : +${deltaT.toFixed(2)} tCO₂e (${pct.toFixed(1)} %).`;
                }
                return "Ce scénario ne change pas significativement les émissions totales.";
              })()}
            </Text>
          )}
        </View>
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          onPress={handleRecalculate}
          disabled={recalcLoading}
          style={[styles.button, styles.buttonPrimary, recalcLoading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {recalcLoading ? "Recalcul..." : "Recalculer"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/sites/${site.id}/history` as any)}
          style={[styles.button, styles.buttonSecondary]}
        >
          <Text style={styles.buttonSecondaryText}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/sites/${site.id}/quick-exploitation` as any)}
          style={[styles.button, styles.buttonSecondary]}
        >
          <Text style={styles.buttonSecondaryText}>Saisie exploitation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/sites/${site.id}/quick-materials` as any)}
          style={[styles.button, styles.buttonSecondary]}
        >
          <Text style={styles.buttonSecondaryText}>Saisie matériaux</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleScenarioQuick}
          disabled={scenarioLoading}
          style={[styles.button, styles.buttonSecondary]}
        >
          <Text style={styles.buttonSecondaryText}>
            {scenarioLoading ? "Scénario..." : "Scénario -10% / +20%"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleOpenReport}
          style={[styles.button, styles.buttonSecondary]}
        >
          <Text style={styles.buttonSecondaryText}>Ouvrir le rapport PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  center: {
    flex: 1,
    backgroundColor: "#020817",
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    color: "#e5e7eb",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    color: "#9ca3af",
    marginTop: 4,
  },
  subtitleSmall: {
    color: "#9ca3af",
    marginTop: 2,
    fontSize: 12,
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 8,
  },
  kpi: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2933",
    padding: 10,
  },
  kpiLabel: {
    color: "#9ca3af",
    fontSize: 11,
  },
  kpiValue: {
    color: "#e5e7eb",
    fontWeight: "600",
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    backgroundColor: "#020617",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2933",
    padding: 14,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontWeight: "600",
    marginBottom: 6,
  },
  sectionText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  sectionMeta: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 4,
  },
  scopeRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scopeText: {
    color: "#9ca3af",
    fontSize: 11,
  },
  buttonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  buttonPrimary: {
    backgroundColor: "#22d3ee",
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#374151",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 13,
  },
  buttonSecondaryText: {
    color: "#e5e7eb",
    fontWeight: "500",
    fontSize: 13,
  },
  error: {
    color: "#f97373",
  },
});

