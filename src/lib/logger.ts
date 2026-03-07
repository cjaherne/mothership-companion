/**
 * File-based logger for Next.js API routes and client error reporting.
 *
 * Format: {ISO timestamp} [LEVEL] {message} {optional JSON meta}
 * Same format as agent logger for consistency.
 *
 * LOG_LEVEL in .env.local: error (default) | info | warn | debug
 */

import fs from "fs";
import path from "path";

const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const LOG_DIR = path.join(process.cwd(), "logs");
const ERROR_LOG = path.join(LOG_DIR, "error.log");

function getLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && LOG_LEVELS.includes(env as LogLevel)) {
    return env as LogLevel;
  }
  return "error";
}

function levelRank(l: LogLevel): number {
  return LOG_LEVELS.indexOf(l);
}

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function formatLine(level: LogLevel, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} [${level.toUpperCase()}] ${message}${metaStr}\n`;
}

function write(level: LogLevel, message: string, meta?: unknown): void {
  try {
    ensureLogDir();
    fs.appendFileSync(ERROR_LOG, formatLine(level, message, meta));
  } catch {
    console.error("[Logger] Failed to write to", ERROR_LOG, message);
  }
}

const currentLevel = getLevel();

export const logger = {
  error(message: string, meta?: unknown): void {
    write("error", message, meta);
  },

  warn(message: string, meta?: unknown): void {
    if (levelRank("warn") >= levelRank(currentLevel)) {
      write("warn", message, meta);
    }
  },

  info(message: string, meta?: unknown): void {
    if (levelRank("info") >= levelRank(currentLevel)) {
      write("info", message, meta);
    }
  },

  debug(message: string, meta?: unknown): void {
    if (levelRank("debug") >= levelRank(currentLevel)) {
      write("debug", message, meta);
    }
  },
};
