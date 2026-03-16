export type ApiErrorPayload =
  | { message?: string; error?: string; errors?: Record<string, string> }
  | undefined;

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getBaseUrl() {
  // En dev, on s'appuie sur le proxy Vite via "/api" par défaut.
  const env = import.meta.env as unknown as { VITE_API_BASE_URL?: string };
  return env.VITE_API_BASE_URL || "";
}

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string | null) {
  if (!token) localStorage.removeItem("auth_token");
  else localStorage.setItem("auth_token", token);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = init;
  const token = auth ? getAuthToken() : null;

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...rest,
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = (isJson ? await res.json().catch(() => undefined) : undefined) as ApiErrorPayload;

  if (!res.ok) {
    const message = payload?.message || payload?.error || `Erreur API (${res.status})`;
    throw new ApiError(res.status, message, payload);
  }

  return (payload as unknown as T) ?? (undefined as unknown as T);
}

