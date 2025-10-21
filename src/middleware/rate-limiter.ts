import rateLimit from "express-rate-limit";
import { Request } from "express";

/**
 * Rate limiter for AI chat message sending
 * 10 messages per minute per user
 */
export const messageRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per window
  message: {
    success: false,
    error:
      "Too many messages sent. Please wait before sending another message.",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
  skip: (_req: Request) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  },
});

/**
 * Rate limiter for AI chat session creation
 * 5 sessions per hour per user
 */
export const sessionRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per window
  message: {
    success: false,
    error:
      "Too many sessions created. Please wait before creating another session.",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
  skip: (_req: Request) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  },
});

/**
 * Rate limiter for learning profile updates
 * 20 updates per hour per user
 */
export const learningProfileRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per window
  message: {
    success: false,
    error:
      "Too many learning profile updates. Please wait before updating again.",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
  skip: (_req: Request) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  },
});

/**
 * Rate limiter for general AI chat endpoints
 * 30 requests per minute per user
 */
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per window
  message: {
    success: false,
    error: "Too many requests. Please wait before making another request.",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
  skip: (_req: Request) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development";
  },
});
