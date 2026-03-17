import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { apiJson, clampNonNegative, parseFrNumber } from "../../../lib/api";
import { Screen } from "../../../ui/components/Screen";
import { AppText } from "../../../ui/components/AppText";
import { Input } from "../../../ui/components/Input";
import { Button } from "../../../ui/components/Button";
import { Banner } from "../../../ui/components/Banner";
import { theme } from "../../../ui/theme";

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
      const concreteT = parseFrNumber(values.concrete);
      const steelT = parseFrNumber(values.steel);
      const glassT = parseFrNumber(values.glass);
      const woodT = parseFrNumber(values.wood);

      const payload = {
        concreteTons: concreteT != null ? clampNonNegative(concreteT) : 0,
        steelTons: steelT != null ? clampNonNegative(steelT) : 0,
        glassTons: glassT != null ? clampNonNegative(glassT) : 0,
        woodTons: woodT != null ? clampNonNegative(woodT) : 0,
      };

      await apiJson(`/api/sites/${id}/composition`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const year = 2024;
      await apiJson(`/api/sites/${id}/results/calculate`, {
        method: "POST",
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
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Button title="← Retour" variant="ghost" size="sm" onPress={() => router.back()} />
        <AppText variant="title" style={{ marginTop: 6 }}>
          Saisie matériaux
        </AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          Estimation des tonnages (t) par matériau principal.
        </AppText>

        <View style={{ height: theme.spacing.lg }} />
        {(Object.keys(MATERIAL_LABELS) as MaterialKey[]).map((key) => (
          <View key={key} style={styles.field}>
            <AppText variant="muted" style={styles.fieldLabel}>
              {MATERIAL_LABELS[key]}
            </AppText>
            <Input keyboardType="numeric" value={values[key]} onChangeText={(v) => setValue(key, v)} placeholder="0" />
          </View>
        ))}

        {error && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Banner text={error} variant="error" />
          </View>
        )}

        <View style={{ marginTop: theme.spacing.lg }}>
          <Button title={saving ? "Enregistrement..." : "Enregistrer & recalculer"} onPress={handleSave} loading={saving} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  field: {
    marginBottom: 10,
  },
  fieldLabel: {
    marginBottom: 4,
  },
});

