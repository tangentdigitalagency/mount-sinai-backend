import type { Request, Response } from "express";
import crypto from "crypto";
import { getStreamClient } from "../../config/stream";
import { NotificationService } from "../../services/notifications/notification.service";
import { logger } from "../../utils/logger";
import { config } from "../../config/environment";

/**
 * Stream Webhook Controller
 * Handles webhook events from Stream Chat
 *
 * Stream sends webhooks for events like:
 * - message.new: When a new message is sent
 * - message.updated: When a message is updated
 * - member.added: When a member joins a channel
 * etc.
 */
export const handleStreamWebhook = async (req: Request, res: Response) => {
  try {
    // Verify webhook signature (important for security)
    // Note: Stream sends signature in x-signature header
    // If signature verification is optional, we can skip it for now
    // but it's recommended to enable it in production
    const signature = req.headers["x-signature"] as string;

    if (config.STREAM_WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(req.body, signature);
      if (!isValid) {
        logger.warn("Invalid webhook signature - rejecting request");
        return res.status(401).json({ error: "Invalid signature" });
      }
    } else if (!config.STREAM_WEBHOOK_SECRET) {
      logger.warn(
        "Stream webhook secret not configured - skipping signature verification"
      );
    }

    const event = req.body;
    logger.info(`Received Stream webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "message.new":
        await handleNewMessage(event);
        break;
      case "message.updated":
        logger.debug("Message updated event - no notification needed");
        break;
      case "member.added":
        logger.debug("Member added event - no notification needed");
        break;
      default:
        logger.debug(`Unhandled webhook event type: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error("Error handling Stream webhook:", error);
    // Still return 200 to prevent Stream from retrying
    return res.status(200).json({ received: true, error: "Internal error" });
  }
};

/**
 * Handle new message event
 * Creates notifications for all channel members except the sender
 */
async function handleNewMessage(event: any) {
  try {
    const message = event.message;
    const channel = event.channel;
    const senderId = message.user?.id;

    if (!senderId || !channel) {
      logger.warn("Missing sender or channel in message.new event");
      return;
    }

    // Get channel members (excluding sender)
    const channelId = channel.id;
    const channelType = channel.type || "messaging";

    // Get members from event data (Stream webhook includes member list)
    let memberIds: string[] = [];

    // Try to get members from channel.members in the event
    if (channel.members && Array.isArray(channel.members)) {
      memberIds = channel.members
        .map((m: any) => m.user_id || m.user?.id)
        .filter((id: string) => id && id !== senderId);
    } else if (channel.members && typeof channel.members === "object") {
      // If members is an object (map of user_id -> member data)
      memberIds = Object.keys(channel.members).filter(
        (id: string) => id !== senderId
      );
    }

    // If no members found in event, try querying Stream API
    if (memberIds.length === 0) {
      try {
        const streamClient = getStreamClient();
        const channelObj = streamClient.channel(channelType, channelId);
        const state = await channelObj.query({ members: { limit: 100 } });

        if (state.members && Array.isArray(state.members)) {
          memberIds = state.members
            .map((m: any) => m.user_id || m.user?.id)
            .filter((id: string) => id && id !== senderId);
        }
      } catch (error) {
        logger.error("Error querying channel for members:", error);
      }
    }

    if (memberIds.length === 0) {
      logger.debug(`No other members in channel ${channelId} to notify`);
      return;
    }

    // Get sender name
    const senderName =
      message.user?.name || message.user?.username || "Someone";

    // Create notifications for each member
    const notificationService = new NotificationService();
    const promises = memberIds.map(async (memberId) => {
      try {
        await notificationService.createNotificationFromStreamMessage(
          memberId,
          senderId,
          channelId,
          message.text || "[Message]",
          senderName
        );
      } catch (error) {
        logger.error(
          `Error creating notification for member ${memberId}:`,
          error
        );
        // Continue with other members even if one fails
      }
    });

    await Promise.all(promises);
    logger.info(
      `Created notifications for ${memberIds.length} members in channel ${channelId}`
    );
  } catch (error) {
    logger.error("Error in handleNewMessage:", error);
    throw error;
  }
}

/**
 * Verify webhook signature from Stream
 * Stream signs webhooks with HMAC-SHA256 using the webhook secret
 *
 * Note: The signature is calculated from the raw JSON body string
 * Since Express parses JSON automatically, we stringify the parsed body
 * This should match Stream's signature calculation
 */
function verifyWebhookSignature(body: any, signature: string): boolean {
  if (!signature || !config.STREAM_WEBHOOK_SECRET) {
    logger.warn("Missing webhook signature or secret");
    return false;
  }

  try {
    // Stream calculates signature from raw JSON string
    // Since Express parsed it, we stringify it back (should match)
    const bodyString = JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac("sha256", config.STREAM_WEBHOOK_SECRET)
      .update(bodyString)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    logger.error("Error verifying webhook signature:", error);
    return false;
  }
}
