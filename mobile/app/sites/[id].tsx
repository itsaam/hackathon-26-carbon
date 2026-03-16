import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
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
  calculatedAt: string;
}

export default function SiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [result, setResult] = useState<CarbonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

