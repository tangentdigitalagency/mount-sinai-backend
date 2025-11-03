import { StreamChat } from "stream-chat";
import { config } from "./environment";
import { logger } from "../utils/logger";

let streamClient: StreamChat | null = null;

/**
 * Get or create the Stream Chat server client instance
 * This is a singleton that should only be used on the backend
 */
export const getStreamClient = (): StreamChat => {
  if (!streamClient) {
    if (!config.STREAM_API_KEY || !config.STREAM_API_SECRET) {
      logger.error("Stream API key or secret is missing");
      throw new Error(
        "Stream Chat is not configured. Please set STREAM_API_KEY and STREAM_API_SECRET environment variables."
      );
    }

    streamClient = StreamChat.getInstance(
      config.STREAM_API_KEY,
      config.STREAM_API_SECRET
    );

    logger.info("Stream Chat server client initialized");
  }

  return streamClient;
};
