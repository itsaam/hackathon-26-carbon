import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { setToken } from "../lib/auth";
import { apiJson, getUserErrorMessage } from "../lib/api";
import { Screen } from "../ui/components/Screen";
import { AppText } from "../ui/components/AppText";
import { Input } from "../ui/components/Input";
import { Button } from "../ui/components/Button";
import { Banner } from "../ui/components/Banner";
import { useAppTheme } from "../ui/useTheme";
import { theme } from "../ui/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useAppTheme();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiJson<{ token: string }>("/api/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      await setToken(data.token);
      router.replace("/dashboard");
    } catch (e) {
      setError(getUserErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="title">CarbonTrack</AppText>
          <AppText variant="subtitle">Connexion</AppText>
        </View>

        <Input
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCorrect={false}
          textContentType="emailAddress"
          inputMode="email"
        />
        <View style={{ height: theme.spacing.sm }} />
        <Input
          placeholder="Mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textContentType="password"
        />

        {error && (
          <View style={{ marginTop: theme.spacing.md }}>
            <Banner text={error} variant="error" />
          </View>
        )}

        <View style={{ marginTop: theme.spacing.lg }}>
          <Button title="Se connecter" onPress={handleLogin} loading={loading} />
        </View>

        <View style={{ marginTop: theme.spacing.lg, alignItems: "center" }}>
          <Button title="Créer un compte" variant="ghost" onPress={() => router.push("/register")} />
          <AppText variant="caption" style={{ marginTop: theme.spacing.sm, color: t.colors.mutedForeground }}>
            Astuce: utilisez les mêmes identifiants que sur le web.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  header: { marginBottom: theme.spacing.xl },
});

