import { env } from "@/lib/env";

type Level = "debug" | "info" | "warn" | "error";
type Fields = Record<string, unknown>;

/**
 * Minimal structured logger. Emits single-line JSON in production (friendly to
 * Vercel / log drains) and readable output in development. Swap the `emit`
 * body for a Sentry/Datadog transport when wiring observability.
 */
function log(level: Level, message: string, fields: Fields = {}): void {
  const entry = { level, message, time: new Date().toISOString(), ...fields };

  if (env.NODE_ENV === "production") {
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
    return;
  }

  const fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;
  fn(`[${level}] ${message}`, Object.keys(fields).length ? fields : "");
}

export const logger = {
  debug: (m: string, f?: Fields) => log("debug", m, f),
  info: (m: string, f?: Fields) => log("info", m, f),
  warn: (m: string, f?: Fields) => log("warn", m, f),
  error: (m: string, f?: Fields) => log("error", m, f),
};
