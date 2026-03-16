import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getToken } from "../../../lib/auth";

type MaterialKey = "concrete" | "steel" | "glass" | "wood";

const MATERIAL_LABELS: Record<MaterialKey, string> = {
  concrete: "Béton (t)",
  steel: "Acier (t)",
  glass: "Verre (t)",
  wood: "Bois (t)",
};

export default function QuickMaterialsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [values, setValues] = useState<Record<MaterialKey, string>>({
    concrete: "",
    steel: "",
    glass: "",
    wood: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = (key: MaterialKey, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Pour le hackathon, on utilise simplement un recalcul complet.
      const year = new Date().getFullYear();
      await fetch(process.env.EXPO_PUBLIC_API_URL + `/api/sites/${id}/results/calculate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ year }),
      });

      router.replace(`/sites/${id}` as any);
    } catch {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Saisie matériaux (rapide)</Text>
      <Text style={styles.subtitle}>
        Saisissez une estimation des tonnages par matériau principal. Ces valeurs servent à illustrer la
        modélisation ACV dans le rapport.
      </Text>

      {(Object.keys(MATERIAL_LABELS) as MaterialKey[]).map((key) => (
        <View key={key} style={styles.field}>
          <Text style={styles.fieldLabel}>{MATERIAL_LABELS[key]}</Text>
          <TextInput
            keyboardType="numeric"
            value={values[key]}
            onChangeText={(v) => setValue(key, v)}
            placeholder="0"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </View>
      ))}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={[styles.button, saving && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{saving ? "Enregistrement..." : "Enregistrer & recalculer"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
    paddingHorizontal: 16,
    paddingTop: 24,
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
    marginBottom: 12,
    fontSize: 13,
  },
  field: {
    marginBottom: 10,
  },
  fieldLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#020617",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2933",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#e5e7eb",
    fontSize: 13,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#22d3ee",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 14,
  },
  error: {
    color: "#f97373",
    marginTop: 8,
  },
});

