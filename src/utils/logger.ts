import { config } from "../config/environment";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

class Logger {
  private formatMessage(
    level: LogLevel,
    message: string,
    data?: unknown
  ): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && typeof data === "object" ? { data } : { data: undefined }),
    };
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const logMessage = this.formatMessage(level, message, data);

    if (config.NODE_ENV === "production") {
      console.log(JSON.stringify(logMessage));
    } else {
      const emoji = {
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
        debug: "🔍",
      }[level];

      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, data || "");
    }
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
  }

  debug(message: string, data?: unknown): void {
    if (config.NODE_ENV === "development") {
      this.log("debug", message, data);
    }
  }
}

export const logger = new Logger();
