import React, { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

import { Screen } from "../ui/components/Screen";
import { AppText } from "../ui/components/AppText";
import { Card } from "../ui/components/Card";
import { Button } from "../ui/components/Button";
import { Banner } from "../ui/components/Banner";
import { theme } from "../ui/theme";
import { useAppTheme } from "../ui/useTheme";
import { apiJson, getUserErrorMessage } from "../lib/api";

type DpeAnalyzeResponse = {
  rawText: string;
  data: Record<string, any>;
};

export default function ScanOcrScreen() {
  const t = useAppTheme();
  const [processing, setProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<DpeAnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  const onImportPdfAndAnalyze = useCallback(async () => {
    try {
      setError(null);
      setAnalysis(null);
      setProcessing(true);

      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) throw new Error("Fichier PDF introuvable.");

      const pdfBase64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const out = await apiJson<DpeAnalyzeResponse>("/api/dpe/analyze", {
        method: "POST",
        body: JSON.stringify({ pdfBase64 }),
      });
      setAnalysis(out);
    } catch (e) {
      setError(getUserErrorMessage(e));
    } finally {
      setProcessing(false);
    }
  }, []);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        <View style={{ paddingTop: 8 }}>
          <AppText variant="title">Importer un DPE (PDF)</AppText>
          <AppText variant="muted" style={{ marginTop: 6 }}>
            Import du PDF et analyse via modèle (Ollama).
          </AppText>
        </View>

        {error && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Banner text={error} variant="error" />
          </View>
        )}

        <View style={{ marginTop: theme.spacing.md }}>
          <Button
            title="Importer un DPE (PDF) et analyser"
            variant="secondary"
            onPress={onImportPdfAndAnalyze}
            loading={processing}
          />
          <View style={{ height: 10 }} />
          <Button title="Réinitialiser" variant="outline" onPress={reset} disabled={!analysis && !error} />
        </View>

        {analysis && (
          <Card style={{ marginTop: theme.spacing.md }}>
            <AppText variant="kpi">Analyse DPE (modèle)</AppText>
            {analysis.data?.error ? (
              <View style={{ marginTop: 10 }}>
                <Banner variant="error" text={String(analysis.data.error)} />
              </View>
            ) : (
              <View style={{ marginTop: 10, gap: 6 }}>
                {Object.entries(analysis.data || {}).map(([k, v]) => (
                  <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                    <AppText variant="body" style={{ color: t.colors.mutedForeground, flex: 1 }}>
                      {k}
                    </AppText>
                    <AppText
                      variant="body"
                      style={{ fontWeight: theme.font.weight.medium as any, flex: 1, textAlign: "right" }}
                    >
                      {v == null ? "—" : String(v)}
                    </AppText>
                  </View>
                ))}
              </View>
            )}

            <AppText variant="caption" style={{ marginTop: 10, color: t.colors.mutedForeground }}>
              Texte brut extrait du PDF:
            </AppText>
            <AppText variant="body" style={{ marginTop: 4 }}>
              {analysis.rawText || "—"}
            </AppText>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

