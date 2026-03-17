import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { apiJson, getUserErrorMessage } from "../lib/api";
import { clearToken } from "../lib/auth";
import { Screen } from "../ui/components/Screen";
import { AppText } from "../ui/components/AppText";
import { Card } from "../ui/components/Card";
import { Button } from "../ui/components/Button";
import { Banner } from "../ui/components/Banner";
import { theme } from "../ui/theme";
import { useTheme } from "../ui/ThemeProvider";
import type { ThemePreference } from "../ui/themePreference";

interface Site {
  id: number;
  name: string;
  surfaceM2: number;
  employeeCount: number;
  lastCo2Total?: number | null;
}

export default function DashboardScreen() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTheme();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiJson<Site[]>("/api/sites");
        if (!alive) return;
        setSites(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setError(getUserErrorMessage(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalSites = sites.length;
    const totalSurface = sites.reduce((acc, s) => acc + (s.surfaceM2 || 0), 0);
    const totalEmployees = sites.reduce((acc, s) => acc + (s.employeeCount || 0), 0);
    const totalCo2Kg = sites.reduce((acc, s) => acc + (s.lastCo2Total || 0), 0);
    return { totalSites, totalSurface, totalEmployees, totalCo2Kg };
  }, [sites]);

  const totalCo2T = stats.totalCo2Kg ? stats.totalCo2Kg / 1000 : 0;

  const logout = async () => {
    await clearToken();
    router.replace("/login");
  };

  const setPref = (pref: ThemePreference) => t.setPreference(pref);

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <AppText variant="title">Dashboard</AppText>
            <AppText variant="muted" style={{ marginTop: 6 }}>
              Vue globale — indicateurs clés et accès rapide.
            </AppText>
          </View>
          <Button title="Déconnexion" variant="outline" size="sm" onPress={logout} />
        </View>

        <Card style={{ marginTop: theme.spacing.md }}>
          <AppText variant="kpi">Apparence</AppText>
          <AppText variant="muted" style={{ marginTop: 6 }}>
            Choisissez un mode (ou suivez le thème du téléphone).
          </AppText>
          <View style={{ flexDirection: "row", gap: 10, marginTop: theme.spacing.md, flexWrap: "wrap" }}>
            <Button title="Système" variant={t.preference === "system" ? "primary" : "outline"} size="sm" onPress={() => setPref("system")} />
            <Button title="Clair" variant={t.preference === "light" ? "primary" : "outline"} size="sm" onPress={() => setPref("light")} />
            <Button title="Sombre" variant={t.preference === "dark" ? "primary" : "outline"} size="sm" onPress={() => setPref("dark")} />
          </View>
        </Card>

        {loading && <ActivityIndicator color={t.colors.primary} style={{ marginTop: theme.spacing.md }} />}
        {error && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Banner text={error} variant="error" />
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 10, marginTop: theme.spacing.md }}>
          <Card style={{ flex: 1 }}>
            <AppText variant="caption">Sites</AppText>
            <AppText variant="kpi" style={{ marginTop: 6, color: t.colors.primary }}>
              {stats.totalSites}
            </AppText>
          </Card>
          <Card style={{ flex: 1 }}>
            <AppText variant="caption">Surface</AppText>
            <AppText variant="kpi" style={{ marginTop: 6, color: t.colors.primary }}>
              {stats.totalSurface.toLocaleString("fr-FR")} m²
            </AppText>
          </Card>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Card style={{ flex: 1 }}>
            <AppText variant="caption">Employés</AppText>
            <AppText variant="kpi" style={{ marginTop: 6, color: t.colors.primary }}>
              {stats.totalEmployees.toLocaleString("fr-FR")}
            </AppText>
          </Card>
          <Card style={{ flex: 1 }}>
            <AppText variant="caption">CO₂ total (dernier)</AppText>
            <AppText variant="kpi" style={{ marginTop: 6, color: t.colors.primary }}>
              {totalCo2T ? `${totalCo2T.toLocaleString("fr-FR")} tCO₂e` : "—"}
            </AppText>
          </Card>
        </View>

        <Card style={{ marginTop: theme.spacing.md }}>
          <AppText variant="kpi">Accès rapides</AppText>
          <View style={{ marginTop: theme.spacing.md }}>
            <Button title="Voir tous les sites" onPress={() => router.push("/sites")} />
            <View style={{ height: 10 }} />
            <Button title="Comparer (web)" variant="outline" onPress={() => router.push("/sites")} />
            <AppText variant="caption" style={{ marginTop: 8 }}>
              La comparaison détaillée est disponible sur le web; sur mobile, vous pouvez consulter chaque site.
            </AppText>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

