import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { apiJson, getUserErrorMessage } from "../lib/api";
import { Screen } from "../ui/components/Screen";
import { AppText } from "../ui/components/AppText";
import { Card } from "../ui/components/Card";
import { Button } from "../ui/components/Button";
import { Banner } from "../ui/components/Banner";
import { useAppTheme } from "../ui/useTheme";
import { theme } from "../ui/theme";

interface Site {
  id: number;
  name: string;
  surfaceM2: number;
  employeeCount: number;
  lastCo2Total?: number | null;
}

export default function SitesScreen() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useAppTheme();

  const load = async () => {
    const data = await apiJson<Site[]>("/api/sites");
    setSites(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        await load();
      } catch (e) {
        setError(getUserErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

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

  // Déconnexion disponible depuis le Dashboard uniquement.

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="title">Vos sites</AppText>
            <AppText variant="muted">Suivi rapide des indicateurs CO₂.</AppText>
          </View>
        </View>

        {loading && <ActivityIndicator color={t.colors.primary} style={{ marginTop: 16 }} />}
        {error && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Banner text={error} variant="error" />
          </View>
        )}

        <FlatList<Site>
          data={sites}
          keyExtractor={(item: Site) => String(item.id)}
          contentContainerStyle={{ paddingVertical: 16, flexGrow: 1, gap: 12 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            !loading && !error ? (
              <Card style={styles.empty}>
                <AppText variant="kpi">Aucun site</AppText>
                <AppText variant="muted" style={{ marginTop: 6, textAlign: "center" }}>
                  Créez un site depuis le web, puis revenez ici pour le consulter.
                </AppText>
              </Card>
            ) : null
          }
          renderItem={({ item }: { item: Site }) => {
            const co2t = item.lastCo2Total ? item.lastCo2Total / 1000 : null;
            return (
              <TouchableOpacity onPress={() => router.push(`/sites/${item.id}` as any)} activeOpacity={0.9}>
                <Card>
                  <AppText variant="kpi">{item.name}</AppText>
                  <AppText variant="muted" style={{ marginTop: 4 }}>
                    {item.surfaceM2.toLocaleString("fr-FR")} m² · {item.employeeCount} pers.
                  </AppText>
                  <AppText
                    style={{
                      marginTop: 10,
                      color: co2t !== null ? t.colors.primary : t.colors.mutedForeground,
                      fontWeight: theme.font.weight.semibold as any,
                    }}
                  >
                    {co2t !== null ? `${co2t.toLocaleString("fr-FR")} tCO₂e` : "Pas encore de calcul"}
                  </AppText>
                </Card>
              </TouchableOpacity>
            );
          }}
        />

        <View style={{ marginTop: theme.spacing.lg }}>
          <Button title="Nouveau site" onPress={() => router.push("/sites-form" as any)} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  empty: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
  },
});

