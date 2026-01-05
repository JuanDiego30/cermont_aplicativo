import { LogLevel } from "@nestjs/common";

const DEFAULT_SENSITIVE_KEYS = new Set([
  "password",
  "pass",
  "pwd",
  "token",
  "access_token",
  "accessToken",
  "refresh_token",
  "refreshToken",
  "id_token",
  "idToken",
  "authorization",
  "cookie",
  "set-cookie",
  "secret",
  "clientSecret",
  "apiKey",
  "apikey",
]);

function isJwtLike(value: string): boolean {
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value);
}

function maskString(value: string): string {
  if (!value) return value;
  if (isJwtLike(value)) return "[REDACTED_JWT]";

  const trimmed = value.trim();
  if (trimmed.length <= 8) return "[REDACTED]";

  return `${trimmed.slice(0, 2)}***${trimmed.slice(-4)}`;
}

export function sanitizeUrl(url: string): string {
  try {
    // URL puede venir sin host; usar base dummy
    const parsed = new URL(url, "http://localhost");

    for (const [key] of parsed.searchParams) {
      const lower = key.toLowerCase();
      if (
        DEFAULT_SENSITIVE_KEYS.has(key) ||
        DEFAULT_SENSITIVE_KEYS.has(lower)
      ) {
        parsed.searchParams.set(key, "[REDACTED]");
      }
    }

    // Mantener formato original (sin host si no existía)
    const path = parsed.pathname;
    const search = parsed.search;
    const hash = parsed.hash;
    return `${path}${search}${hash}`;
  } catch {
    return url;
  }
}

export function sanitizeLogMeta<T>(input: T, maxDepth = 6): T {
  const seen = new WeakSet<object>();

  const sanitizeAny = (value: any, depth: number, keyHint?: string): any => {
    if (value === null || value === undefined) return value;

    if (typeof value === "string") {
      if (keyHint) {
        const lower = keyHint.toLowerCase();
        if (
          DEFAULT_SENSITIVE_KEYS.has(keyHint) ||
          DEFAULT_SENSITIVE_KEYS.has(lower)
        ) {
          return maskString(value);
        }
      }
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") return value;

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (Array.isArray(value)) {
      if (depth >= maxDepth) return "[TRUNCATED]";
      return value.map((item) => sanitizeAny(item, depth + 1));
    }

    if (typeof value === "object") {
      if (depth >= maxDepth) return "[TRUNCATED]";
      if (seen.has(value)) return "[CIRCULAR]";
      seen.add(value);

      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        if (
          DEFAULT_SENSITIVE_KEYS.has(k) ||
          DEFAULT_SENSITIVE_KEYS.has(k.toLowerCase())
        ) {
          if (typeof v === "string") out[k] = maskString(v);
          else out[k] = "[REDACTED]";
          continue;
        }

        // Sanitizar URL si el key lo sugiere
        if (
          typeof v === "string" &&
          (k.toLowerCase() === "url" || k.toLowerCase().endsWith("url"))
        ) {
          out[k] = sanitizeUrl(v);
          continue;
        }

        out[k] = sanitizeAny(v, depth + 1, k);
      }

      return out;
    }

    return value;
  };

  return sanitizeAny(input, 0) as T;
}

export function shouldLog(level: LogLevel, configuredLevel: LogLevel): boolean {
  const order: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    log: 2,
    debug: 3,
    verbose: 4,
    fatal: 0,
  };

  return order[level] <= order[configuredLevel];
}
