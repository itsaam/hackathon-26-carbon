import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ApiError, apiFetch, apiJson, getUserErrorMessage } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import { Screen } from "../../ui/components/Screen";
import { AppText } from "../../ui/components/AppText";
import { Card } from "../../ui/components/Card";
import { Button } from "../../ui/components/Button";
import { Banner } from "../../ui/components/Banner";
import { useAppTheme } from "../../ui/useTheme";
import { theme } from "../../ui/theme";

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

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function SiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [result, setResult] = useState<CarbonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<CarbonResult | null>(null);
  const t = useAppTheme();

  const load = async () => {
    if (!id) return;
    const [siteRes, latestRes] = await Promise.all([
      apiFetch(`/api/sites/${id}`, { headers: { "Content-Type": "application/json" } }),
      apiFetch(`/api/sites/${id}/results/latest`, { headers: { "Content-Type": "application/json" } }),
    ]);

    if (!siteRes.ok) {
      throw new ApiError("Impossible de charger le site", siteRes.status, await safeJson(siteRes));
    }

    setSite(await siteRes.json());
    if (latestRes.ok) setResult(await latestRes.json());
    else setResult(null);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        await load();
      } catch {
        setError("Impossible de charger le site");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await load();
    } catch (e) {
      setError(getUserErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await clearToken();
    router.replace("/login");
  };

  const handleRecalculate = async () => {
    if (!id) return;
    try {
      setRecalcLoading(true);
      const year = 2024;
      const json = await apiJson<CarbonResult>(`/api/sites/${id}/results/calculate`, {
        method: "POST",
        body: JSON.stringify({ year }),
      });
      setResult(json);
      setScenarioResult(null);
    } finally {
      setRecalcLoading(false);
    }
  };

  const handleScenarioQuick = async () => {
    if (!id) return;
    try {
      setScenarioLoading(true);
      const body = {
        energyDeltaPercent: -10,
        renewableDeltaPercent: 20,
      };
      const json = await apiJson<CarbonResult>(`/api/sites/${id}/results/estimate`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setScenarioResult(json);
    } finally {
      setScenarioLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={t.colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!site) {
    return (
      <Screen>
        <View style={styles.center}>
          <Banner text="Site introuvable." variant="error" />
        </View>
      </Screen>
    );
  }

  const totalT = result?.totalCo2Kg != null ? result.totalCo2Kg / 1000 : null;

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={t.colors.primary} />}
      >
        <View style={styles.topRow}>
          <Button title="← Retour" variant="ghost" size="sm" onPress={() => router.back()} />
          <Button title="Déconnexion" variant="outline" size="sm" onPress={handleLogout} />
        </View>

        <AppText variant="title" style={{ marginTop: 6 }}>
          {site.name}
        </AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          {site.surfaceM2.toLocaleString("fr-FR")} m² · {site.employeeCount} pers.
        </AppText>

        {site.buildingType && (
          <AppText variant="caption" style={{ marginTop: 4 }}>
            {site.buildingType} {site.usageType ? `· ${site.usageType}` : ""}
          </AppText>
        )}

        {error && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Banner text={error} variant="error" />
          </View>
        )}

        <View style={styles.kpiRow}>
          <Kpi label="CO₂ total" value={totalT != null ? `${totalT.toFixed(2)} tCO₂e` : "—"} />
          <Kpi label="CO₂ / m²" value={result?.co2PerM2 != null ? `${result.co2PerM2.toFixed(2)} kgCO₂e/m²` : "—"} />
          <Kpi
            label="CO₂ / employé"
            value={result?.co2PerEmployee != null ? `${result.co2PerEmployee.toFixed(2)} kgCO₂e/employé` : "—"}
          />
        </View>

        {result && (result.scope1Co2Kg != null || result.scope2Co2Kg != null || result.scope3Co2Kg != null) && (
          <Card style={{ marginTop: theme.spacing.md }}>
            <AppText variant="kpi">Scopes</AppText>
            <View style={styles.scopeRow}>
              {result.scope1Co2Kg != null && (
                <AppText variant="muted">Scope 1 : {(result.scope1Co2Kg / 1000).toFixed(2)} tCO₂e</AppText>
              )}
              {result.scope2Co2Kg != null && (
                <AppText variant="muted">Scope 2 : {(result.scope2Co2Kg / 1000).toFixed(2)} tCO₂e</AppText>
              )}
              {result.scope3Co2Kg != null && (
                <AppText variant="muted">Scope 3 : {(result.scope3Co2Kg / 1000).toFixed(2)} tCO₂e</AppText>
              )}
            </View>
          </Card>
        )}

        <Card style={{ marginTop: theme.spacing.md }}>
          <AppText variant="kpi">Énergie & intensité</AppText>
          <AppText variant="muted" style={{ marginTop: 6 }}>
            Consommation énergie : {(site.energyConsumptionKwh / 1000).toLocaleString("fr-FR")} MWh/an
          </AppText>
          {result && (
            <>
              <AppText variant="muted" style={{ marginTop: 6 }}>
                Construction : {((result.constructionCo2Kg ?? 0) / 1000).toFixed(2)} tCO₂e
              </AppText>
              <AppText variant="muted" style={{ marginTop: 2 }}>
                Exploitation : {((result.exploitationCo2Kg ?? 0) / 1000).toFixed(2)} tCO₂e
              </AppText>
              <AppText variant="caption" style={{ marginTop: 8 }}>
                Dernier calcul : {new Date(result.calculatedAt).toLocaleDateString("fr-FR")}
              </AppText>
            </>
          )}
        </Card>

        {result && scenarioResult && (
          <Card style={{ marginTop: theme.spacing.md }}>
            <AppText variant="kpi">Scénario rapide</AppText>
            <AppText variant="muted" style={{ marginTop: 6 }}>
              -10 % énergie · +20 % renouvelable
            </AppText>
            <AppText variant="muted" style={{ marginTop: 10 }}>
              CO₂ total actuel : {((result.totalCo2Kg ?? 0) / 1000).toFixed(2)} tCO₂e
            </AppText>
            <AppText variant="muted" style={{ marginTop: 2 }}>
              CO₂ total scénario : {((scenarioResult.totalCo2Kg ?? 0) / 1000).toFixed(2)} tCO₂e
            </AppText>
            {result.totalCo2Kg != null && scenarioResult.totalCo2Kg != null && (
              <AppText variant="caption" style={{ marginTop: 8 }}>
                {(() => {
                  const deltaT = (scenarioResult.totalCo2Kg - result.totalCo2Kg) / 1000;
                  const baseT = (result.totalCo2Kg ?? 0) / 1000;
                  const pct = baseT > 0 ? (deltaT / baseT) * 100 : 0;
                  if (deltaT < 0) return `Gain estimé : -${Math.abs(deltaT).toFixed(2)} tCO₂e (${Math.abs(pct).toFixed(1)} %).`;
                  if (deltaT > 0) return `Surcoût carbone estimé : +${deltaT.toFixed(2)} tCO₂e (${pct.toFixed(1)} %).`;
                  return "Ce scénario ne change pas significativement les émissions totales.";
                })()}
              </AppText>
            )}
          </Card>
        )}

        <View style={styles.buttonsStack}>
          <Button title="Modifier le site" variant="outline" onPress={() => router.push(`/sites-form?id=${site.id}` as any)} />
          <View style={{ height: 10 }} />
          <Button title={recalcLoading ? "Recalcul..." : "Recalculer"} onPress={handleRecalculate} loading={recalcLoading} />
          <View style={{ height: 10 }} />
          <Button title="Historique" variant="outline" onPress={() => router.push(`/sites/${site.id}/history` as any)} />
          <View style={{ height: 10 }} />
          <Button
            title="Saisie exploitation"
            variant="outline"
            onPress={() => router.push(`/sites/${site.id}/quick-exploitation` as any)}
          />
          <View style={{ height: 10 }} />
          <Button
            title="Saisie matériaux"
            variant="outline"
            onPress={() => router.push(`/sites/${site.id}/quick-materials` as any)}
          />
          <View style={{ height: 10 }} />
          <Button
            title={scenarioLoading ? "Scénario..." : "Scénario -10% / +20%"}
            variant="secondary"
            onPress={handleScenarioQuick}
            loading={scenarioLoading}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  const t = useAppTheme();
  return (
    <Card style={styles.kpi}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="kpi" style={{ marginTop: 6, color: t.colors.primary }}>
        {value}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 8,
  },
  kpi: {
    flex: 1,
    padding: 12,
  },
  scopeRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  buttonsStack: { marginTop: theme.spacing.lg },
});

