import { router } from "expo-router";
import { clearToken, getToken } from "./auth";

function getApiBaseUrl(): string {
  const defaultProd = "https://api.carbontrack.nexsecure.fr";
  const raw = process.env.EXPO_PUBLIC_API_URL;
  const base = (raw && raw.trim()) ? raw.trim() : defaultProd;
  return base.replace(/\/+$/, "");
}

function isUnauthorized(status: number) {
  return status === 401 || status === 403;
}

async function handleUnauthorized() {
  await clearToken();
  // évite de rester bloqué sur un écran protégé
  router.replace("/login");
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getUserErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as any;
    const msg =
      (body && typeof body === "object" && (body.message || body.error)) ||
      (typeof body === "string" ? body : null);
    if (err.status === 0) return "Erreur réseau";
    if (err.status === 400) return msg || "Requête invalide";
    if (err.status === 401 || err.status === 403) return "Session expirée. Merci de vous reconnecter.";
    if (err.status >= 500) return "Erreur serveur. Réessaie dans un instant.";
    return msg || "Erreur lors de l'appel API";
  }
  // Erreurs réseau typiques de fetch en React Native (IP injoignable, backend down, pare-feu, etc.)
  if (err instanceof TypeError) {
    const msg = (err.message || "").toLowerCase();
    if (msg.includes("network request failed") || msg.includes("failed to fetch")) {
      // Si possible, on remonte l'URL (injectée dans apiFetch) pour rendre le debug immédiat.
      const match = (err.message || "").match(/\(url:\s*([^)]+)\)/i);
      const urlHint = match?.[1] ? ` (URL: ${match[1]})` : "";
      return `Erreur réseau: impossible de joindre l’API. Vérifie le réseau, et au besoin définis EXPO_PUBLIC_API_URL dans mobile/.env pour pointer vers ton backend (IP locale).${urlHint}`;
    }
  }
  if (err instanceof Error) {
    // Fallback: on remonte le message pour ne pas masquer l’erreur réelle.
    return err.message || "Erreur inattendue";
  }
  return "Erreur inattendue";
}

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  auth?: boolean;
};

export async function apiFetch(path: string, options: RequestOptions = {}): Promise<Response> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (options.auth !== false) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    // Sur iOS/Expo, un échec réseau remonte souvent comme TypeError("Network request failed")
    // On inclut l'URL appelée pour diagnostiquer rapidement une mauvaise config (IP changée, localhost, etc.)
    if (err instanceof TypeError) {
      const msg = err.message || "Network request failed";
      throw new TypeError(`${msg} (url: ${url})`);
    }
    throw err;
  }

  if (isUnauthorized(res.status) && options.auth !== false) {
    await handleUnauthorized();
  }

  return res;
}

export async function apiJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await apiFetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  const text = await res.text();
  const body = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new ApiError("Requête API en échec", res.status, body);
  }

  return body as T;
}

export function parseFrNumber(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function clampNonNegative(n: number): number {
  return n < 0 ? 0 : n;
}

