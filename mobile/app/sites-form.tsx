import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { apiJson, getUserErrorMessage, parseFrNumber, clampNonNegative } from "../lib/api";
import { Screen } from "../ui/components/Screen";
import { AppText } from "../ui/components/AppText";
import { Input } from "../ui/components/Input";
import { Button } from "../ui/components/Button";
import { Banner } from "../ui/components/Banner";
import { theme } from "../ui/theme";
import { useAppTheme } from "../ui/useTheme";

type FormState = {
  name: string;
  surface: string;
  employees: string;
  workstations: string;
  parkingBasement: string;
  parkingUnderground: string;
  parkingOutdoor: string;
  energyConsumption: string;
  buildingType: string;
  usageType: string;
  activityDescription: string;
};

export default function SiteFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useAppTheme();

  const [form, setForm] = useState<FormState>({
    name: "",
    surface: "",
    employees: "",
    workstations: "",
    parkingBasement: "",
    parkingUnderground: "",
    parkingOutdoor: "",
    energyConsumption: "",
    buildingType: "",
    usageType: "",
    activityDescription: "",
  });

  const update = (key: keyof FormState, value: string) => setForm((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    if (!isEdit || !id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const site = await apiJson<any>(`/api/sites/${id}`);
        if (!alive) return;
        setForm({
          name: site.name ?? "",
          surface: site.surfaceM2 != null ? String(site.surfaceM2) : "",
          employees: site.employeeCount != null ? String(site.employeeCount) : "",
          workstations: site.workstationCount != null ? String(site.workstationCount) : "",
          parkingBasement: site.parkingBasement != null ? String(site.parkingBasement) : "",
          parkingUnderground: site.parkingUnderground != null ? String(site.parkingUnderground) : "",
          parkingOutdoor: site.parkingOutdoor != null ? String(site.parkingOutdoor) : "",
          energyConsumption: site.energyConsumptionKwh != null ? String(site.energyConsumptionKwh / 1000) : "",
          buildingType: site.buildingType ?? "",
          usageType: site.usageType ?? "",
          activityDescription: site.activityDescription ?? "",
        });
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
  }, [isEdit, id]);

  const handleSave = async () => {
    setError(null);
    const surfaceM2 = parseFrNumber(form.surface);
    const employeeCount = parseFrNumber(form.employees);

    if (!form.name.trim() || surfaceM2 == null || employeeCount == null) {
      setError("Merci de renseigner au minimum le nom du site, la surface et le nombre d'employés.");
      return;
    }

    if (surfaceM2 <= 0 || employeeCount <= 0) {
      setError("La surface et le nombre d'employés doivent être strictement positifs.");
      return;
    }

    const workstationCount = form.workstations ? clampNonNegative(parseFrNumber(form.workstations) ?? 0) : 0;
    const parkingBasement = form.parkingBasement ? clampNonNegative(parseFrNumber(form.parkingBasement) ?? 0) : 0;
    const parkingUnderground = form.parkingUnderground ? clampNonNegative(parseFrNumber(form.parkingUnderground) ?? 0) : 0;
    const parkingOutdoor = form.parkingOutdoor ? clampNonNegative(parseFrNumber(form.parkingOutdoor) ?? 0) : 0;
    const energyConsumptionMwh = form.energyConsumption ? clampNonNegative(parseFrNumber(form.energyConsumption) ?? 0) : 0;
    const energyConsumptionKwh = energyConsumptionMwh * 1000;

    const payload = {
      name: form.name.trim(),
      surfaceM2,
      employeeCount,
      workstationCount,
      parkingBasement,
      parkingUnderground,
      parkingOutdoor,
      energyConsumptionKwh,
      buildingType: form.buildingType || undefined,
      usageType: form.usageType || undefined,
      activityDescription: form.activityDescription || undefined,
    };

    try {
      setSaving(true);
      if (isEdit && id) {
        await apiJson(`/api/sites/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        router.replace(`/sites/${id}` as any);
      } else {
        const created = await apiJson<{ id: number }>(`/api/sites`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.replace(`/sites/${created.id}` as any);
      }
    } catch (e) {
      setError(getUserErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <AppText variant="title" style={{ marginTop: 6 }}>
          {isEdit ? "Modifier le site" : "Nouveau site"}
        </AppText>
        <AppText variant="muted" style={{ marginTop: 6 }}>
          Renseignez les informations principales. Vous pourrez affiner les données d'exploitation et matériaux ensuite.
        </AppText>

        {error && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Banner text={error} variant="error" />
          </View>
        )}

        <View style={{ marginTop: theme.spacing.lg, gap: 10 }}>
          <AppText variant="caption" style={styles.sectionTitle}>
            Informations générales
          </AppText>
          <Field label="Nom du site">
            <Input placeholder="Ex: Tour Europlaza — La Défense" value={form.name} onChangeText={(v) => update("name", v)} />
          </Field>
          <Field label="Surface (m²)">
          <Input
            keyboardType="numeric"
            value={form.surface}
            onChangeText={(v) => update("surface", v)}
          />
          </Field>
          <Field label="Nombre d'employés">
            <Input keyboardType="numeric" value={form.employees} onChangeText={(v) => update("employees", v)} />
          </Field>
          <Field label="Postes de travail (optionnel)">
            <Input keyboardType="numeric" value={form.workstations} onChangeText={(v) => update("workstations", v)} />
          </Field>
        </View>

        <View style={{ marginTop: theme.spacing.lg, gap: 10 }}>
          <AppText variant="caption" style={styles.sectionTitle}>
            Parkings
          </AppText>
          <Field label="Sous-dalle">
            <Input keyboardType="numeric" value={form.parkingBasement} onChangeText={(v) => update("parkingBasement", v)} />
          </Field>
          <Field label="Sous-sol">
            <Input keyboardType="numeric" value={form.parkingUnderground} onChangeText={(v) => update("parkingUnderground", v)} />
          </Field>
          <Field label="Aérien">
            <Input keyboardType="numeric" value={form.parkingOutdoor} onChangeText={(v) => update("parkingOutdoor", v)} />
          </Field>
        </View>

        <View style={{ marginTop: theme.spacing.lg, gap: 10 }}>
          <AppText variant="caption" style={styles.sectionTitle}>
            Énergie
          </AppText>
          <Field label="Consommation totale (MWh/an)">
            <Input keyboardType="numeric" value={form.energyConsumption} onChangeText={(v) => update("energyConsumption", v)} />
          </Field>
          <AppText variant="caption" style={{ marginTop: 4, color: t.colors.mutedForeground }}>
            Soit {form.energyConsumption ? (Number(form.energyConsumption) * 1000).toLocaleString("fr-FR") : "—"} kWh/an.
          </AppText>
        </View>

        <View style={{ marginTop: theme.spacing.lg, gap: 10 }}>
          <AppText variant="caption" style={styles.sectionTitle}>
            Typologie & activité
          </AppText>
          <Field label="Type de bâtiment">
            <Input placeholder="Ex: Bureaux" value={form.buildingType} onChangeText={(v) => update("buildingType", v)} />
          </Field>
          <Field label="Usage principal">
            <Input placeholder="Ex: Centre de services" value={form.usageType} onChangeText={(v) => update("usageType", v)} />
          </Field>
          <Field label="Description de l'activité">
            <Input placeholder="Ex: Services numériques, centre de support..." value={form.activityDescription} onChangeText={(v) => update("activityDescription", v)} />
          </Field>
        </View>

        <View style={{ marginTop: theme.spacing.lg }}>
          <Button title={saving ? "Enregistrement..." : "Enregistrer"} onPress={handleSave} loading={saving} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useAppTheme();
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="caption" style={{ color: t.colors.mutedForeground }}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    marginBottom: 4,
  },
});

