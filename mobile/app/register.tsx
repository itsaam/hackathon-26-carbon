import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { setToken } from "../lib/auth";
import { apiJson, getUserErrorMessage } from "../lib/api";
import { Screen } from "../ui/components/Screen";
import { AppText } from "../ui/components/AppText";
import { Input } from "../ui/components/Input";
import { Button } from "../ui/components/Button";
import { Banner } from "../ui/components/Banner";
import { theme } from "../ui/theme";

const MIN_PASSWORD_LENGTH = 6;

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);
      const data = await apiJson<{ token: string }>("/api/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ fullName: fullName.trim() || null, email: email.trim(), password }),
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
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText variant="title">Créer un compte</AppText>
            <AppText variant="muted">Accédez à vos sites et aux indicateurs clés depuis le mobile.</AppText>
          </View>

          <Input placeholder="Nom complet (optionnel)" autoCapitalize="words" value={fullName} onChangeText={setFullName} />
          <View style={{ height: theme.spacing.sm }} />
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
            placeholder={`Mot de passe (min. ${MIN_PASSWORD_LENGTH} caractères)`}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            textContentType="newPassword"
          />
          <View style={{ height: theme.spacing.sm }} />
          <Input
            placeholder="Confirmer le mot de passe"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            textContentType="password"
          />

          {error && (
            <View style={{ marginTop: theme.spacing.md }}>
              <Banner text={error} variant="error" />
            </View>
          )}

          <View style={{ marginTop: theme.spacing.lg }}>
            <Button title="S'inscrire" onPress={handleRegister} loading={loading} />
          </View>

          <View style={{ marginTop: theme.spacing.lg, alignItems: "center" }}>
            <Button title="Déjà un compte ? Se connecter" variant="ghost" onPress={() => router.replace("/login")} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },
  container: { flex: 1, paddingHorizontal: 24 },
  header: { marginBottom: theme.spacing.xl },
});
