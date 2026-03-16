import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getToken } from "../../../lib/auth";

interface CarbonResult {
  id: number;
  totalCo2Kg: number | null;
  calculatedAt: string;
}

export default function SiteHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<CarbonResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(process.env.EXPO_PUBLIC_API_URL + `/api/sites/${id}/results`, { headers });
        if (!res.ok) {
          setError("Impossible de charger l'historique");
          return;
        }
        const json = await res.json();
        setItems(json);
      } catch {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#22d3ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Historique des calculs</Text>
      <Text style={styles.subtitle}>Liste des calculs pour ce site.</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item, index }) => {
          const totalT = item.totalCo2Kg != null ? item.totalCo2Kg / 1000 : null;
          const isLatest = index === 0;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>
                  {new Date(item.calculatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
                {isLatest && (
                  <Text style={styles.badge}>Dernier</Text>
                )}
              </View>
              <Text style={styles.cardValue}>
                {totalT != null ? `${totalT.toLocaleString("fr-FR")} tCO₂e` : "N/A"}
              </Text>
            </View>
          );
        }}
      />
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
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    color: "#9ca3af",
    marginTop: 4,
    marginBottom: 4,
    fontSize: 13,
  },
  error: {
    color: "#f97373",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2933",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardDate: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.15)",
    color: "#4ade80",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardValue: {
    color: "#22d3ee",
    fontWeight: "600",
    fontSize: 14,
  },
});

