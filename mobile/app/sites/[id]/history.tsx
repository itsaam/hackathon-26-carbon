import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { apiJson, getUserErrorMessage } from "../../../lib/api";
import { Screen } from "../../../ui/components/Screen";
import { AppText } from "../../../ui/components/AppText";
import { Card } from "../../../ui/components/Card";
import { Button } from "../../../ui/components/Button";
import { Banner } from "../../../ui/components/Banner";
import { useAppTheme } from "../../../ui/useTheme";
import { theme } from "../../../ui/theme";

interface CarbonResult {
  id: number;
  totalCo2Kg: number | null;
  calculatedAt: string;
}

export default function SiteHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<CarbonResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useAppTheme();

  const load = async () => {
    if (!id) return;
    const json = await apiJson<CarbonResult[]>(`/api/sites/${id}/results`);
    setItems(Array.isArray(json) ? json : []);
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

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={t.colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View />
        </View>
        <AppText variant="title" style={{ marginTop: 6 }}>
          Historique
        </AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          Liste des calculs pour ce site.
        </AppText>

        {error && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Banner text={error} variant="error" />
          </View>
        )}

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingVertical: 16, flexGrow: 1, gap: 12 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            !loading && !error ? (
              <Card style={styles.empty}>
                <AppText variant="kpi">Aucun calcul</AppText>
                <AppText variant="muted" style={{ marginTop: 6, textAlign: "center" }}>
                  Lancez un recalcul depuis la fiche du site.
                </AppText>
              </Card>
            ) : null
          }
          renderItem={({ item, index }) => {
            const totalT = item.totalCo2Kg != null ? item.totalCo2Kg / 1000 : null;
            const isLatest = index === 0;
            return (
              <Card>
                <View style={styles.cardHeader}>
                  <AppText style={{ fontWeight: theme.font.weight.semibold as any }}>
                    {new Date(item.calculatedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </AppText>
                  {isLatest && (
                    <View style={[styles.badge, { backgroundColor: `${t.colors.success}18`, borderColor: `${t.colors.success}55` }]}>
                      <AppText variant="caption" style={{ color: t.colors.success, fontWeight: theme.font.weight.bold as any }}>
                        Dernier
                      </AppText>
                    </View>
                  )}
                </View>
                <AppText variant="kpi" style={{ marginTop: 6, color: t.colors.primary }}>
                  {totalT != null ? `${totalT.toLocaleString("fr-FR")} tCO₂e` : "—"}
                </AppText>
              </Card>
            );
          }}
        />
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    marginTop: 24,
  },
});

