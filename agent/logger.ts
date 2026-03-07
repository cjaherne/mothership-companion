/**
 * File-based logger for the voice agent.
 *
 * Writes to logs/agent.log with a consistent format:
 *   {ISO timestamp} [LEVEL] {message} {optional JSON meta}
 *
 * LOG_LEVEL in .env.local controls verbosity:
 *   - error: errors only
 *   - info: connection, sessions, agent state transitions (default)
 *   - debug: + user speech, transcripts, participant events
 */

import fs from "fs";
import path from "path";

const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const LOG_DIR = path.join(path.dirname(__dirname), "logs");
const AGENT_LOG = path.join(LOG_DIR, "agent.log");

function getLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && LOG_LEVELS.includes(env as LogLevel)) {
    return env as LogLevel;
  }
  return "info";
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
    fs.appendFileSync(AGENT_LOG, formatLine(level, message, meta));
  } catch {
    console.error("[Logger] Failed to write to", AGENT_LOG, message);
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
