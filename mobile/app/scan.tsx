import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Image, ScrollView } from "react-native";
import { CameraView, useCameraPermissions, type CameraViewRef } from "expo-camera";
import * as FileSystem from "expo-file-system";

import { Screen } from "../ui/components/Screen";
import { AppText } from "../ui/components/AppText";
import { Card } from "../ui/components/Card";
import { Button } from "../ui/components/Button";
import { Banner } from "../ui/components/Banner";
import { theme } from "../ui/theme";
import { useAppTheme } from "../ui/useTheme";
import { apiJson, getUserErrorMessage } from "../lib/api";

type DpeOcrField = {
  label: string;
  value: string;
};

type DpeOcrResponse = {
  rawText: string;
  fields?: DpeOcrField[];
};

export default function ScanOcrScreen() {
  const t = useAppTheme();
  const cameraRef = useRef<CameraViewRef | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [capturing, setCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<DpeOcrResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const permissionDenied = permission?.status === "denied";
  const hasPermission = permission?.granted === true;

  const hint = useMemo(
    () =>
      [
        "Cadrez la page du DPE bien à plat.",
        "Évitez les reflets et assurez-vous d’avoir assez de lumière.",
        "Gardez le téléphone stable pendant la capture.",
      ].join("\n"),
    [],
  );

  const askPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  const reset = useCallback(() => {
    setImageUri(null);
    setOcrResult(null);
    setError(null);
  }, []);

  const onTakePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      setCapturing(true);
      setError(null);
      setOcrResult(null);

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 1,
      });

      if (!photo?.uri) {
        throw new Error("Impossible de capturer la photo.");
      }

      setImageUri(photo.uri);

      setProcessing(true);
      // Base64 pour envoi au backend OCR (si non fourni par la caméra, fallback FileSystem).
      const base64 =
        photo.base64 ||
        (await FileSystem.readAsStringAsync(photo.uri, {
          encoding: FileSystem.EncodingType.Base64,
        }));
      if (!base64) {
        throw new Error("Impossible de lire l'image (base64).");
      }

      const result = await apiJson<DpeOcrResponse>("/api/ocr/dpe", {
        method: "POST",
        body: JSON.stringify({ imageBase64: base64 }),
      });

      setOcrResult(result);
    } catch (e) {
      setError(getUserErrorMessage(e));
    } finally {
      setCapturing(false);
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
          <AppText variant="title">Scanner un DPE (OCR)</AppText>
          <AppText variant="muted" style={{ marginTop: 6 }}>
            Capture du document et envoi pour analyse OCR.
          </AppText>
        </View>

        {error && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Banner text={error} variant="error" />
          </View>
        )}

        {!hasPermission ? (
          <View style={{ marginTop: theme.spacing.md }}>
            <Card>
              <AppText variant="kpi">Accès caméra requis</AppText>
              <AppText variant="body" style={{ marginTop: 8, color: t.colors.mutedForeground }}>
                Pour scanner un DPE, l’application doit pouvoir accéder à la caméra.
              </AppText>
              {permissionDenied ? (
                <View style={{ marginTop: theme.spacing.md }}>
                  <Banner
                    variant="warning"
                    text="Permission caméra refusée. Autorisez-la dans les réglages du téléphone, puis revenez ici."
                  />
                </View>
              ) : null}

              <View style={{ marginTop: theme.spacing.md }}>
                <Button title="Autoriser la caméra" onPress={askPermission} />
              </View>
            </Card>
          </View>
        ) : (
          <View style={{ marginTop: theme.spacing.md }}>
            {!imageUri ? (
              <View
                style={{
                  height: 320,
                  borderRadius: theme.radius.lg,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  backgroundColor: t.colors.card,
                }}
              >
                <CameraView
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  facing="back"
                  enableTorch={false}
                  animateShutter
                />
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: 14,
                    right: 14,
                    bottom: 14,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(0,0,0,0.55)",
                      borderRadius: theme.radius.md,
                      padding: 12,
                    }}
                  >
                    <AppText style={{ color: "#fff", fontWeight: theme.font.weight.semibold as any }}>
                      Conseils de cadrage
                    </AppText>
                    <AppText style={{ color: "rgba(255,255,255,0.92)", marginTop: 6, lineHeight: 18 }}>
                      {hint}
                    </AppText>
                  </View>
                </View>
              </View>
            ) : (
              <View
                style={{
                  borderRadius: theme.radius.lg,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  backgroundColor: t.colors.card,
                }}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: 320, resizeMode: "contain", backgroundColor: "#000" }}
                />
              </View>
            )}

            <View style={{ marginTop: theme.spacing.md, flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={imageUri ? "Reprendre une photo" : "Prendre une photo"}
                  onPress={imageUri ? reset : onTakePicture}
                  loading={capturing}
                />
              </View>
              {imageUri ? (
                <View style={{ flex: 1 }}>
                  <Button title="Analyser le DPE" onPress={onTakePicture} loading={processing} variant="secondary" />
                </View>
              ) : null}
            </View>

            {ocrResult && (
              <Card style={{ marginTop: theme.spacing.md }}>
                <AppText variant="kpi">Résultat OCR</AppText>
                {ocrResult.fields && ocrResult.fields.length > 0 ? (
                  <View style={{ marginTop: 10, gap: 4 }}>
                    {ocrResult.fields.map((f, idx) => (
                      <View key={`${f.label}-${idx}`} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <AppText variant="body" style={{ color: t.colors.mutedForeground }}>
                          {f.label}
                        </AppText>
                        <AppText variant="body" style={{ fontWeight: theme.font.weight.medium as any }}>
                          {f.value}
                        </AppText>
                      </View>
                    ))}
                  </View>
                ) : null}

                <AppText variant="caption" style={{ marginTop: 10, color: t.colors.mutedForeground }}>
                  Texte brut reconnu:
                </AppText>
                <AppText variant="body" style={{ marginTop: 4 }}>
                  {ocrResult.rawText || "—"}
                </AppText>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

