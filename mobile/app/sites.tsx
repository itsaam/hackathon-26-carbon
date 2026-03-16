import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getToken } from "../lib/auth";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const res = await fetch(process.env.EXPO_PUBLIC_API_URL + "/api/sites", {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          setError("Impossible de charger les sites");
          return;
        }
        const data = await res.json();
        setSites(data);
      } catch {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vos sites</Text>
      {loading && <ActivityIndicator color="#22d3ee" style={{ marginTop: 16 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList<Site>
        data={sites}
        keyExtractor={(item: Site) => String(item.id)}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }: { item: Site }) => {
          const co2t = item.lastCo2Total ? item.lastCo2Total / 1000 : null;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/sites/${item.id}` as any)}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>
                {item.surfaceM2.toLocaleString("fr-FR")} m² · {item.employeeCount} pers.
              </Text>
              <Text style={styles.cardKpi}>
                {co2t !== null ? `${co2t.toLocaleString("fr-FR")} tCO₂e` : "Pas encore de calcul"}
              </Text>
            </TouchableOpacity>
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
    paddingTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cardSubtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },
  cardKpi: {
    color: "#22d3ee",
    fontWeight: "600",
    marginTop: 8,
  },
  error: {
    color: "#f97373",
    marginTop: 8,
  },
});

