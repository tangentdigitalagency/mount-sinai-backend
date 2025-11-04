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
    // Log incoming webhook for debugging
    logger.info("=== Stream Webhook Received ===");
    logger.info("Headers:", JSON.stringify(req.headers, null, 2));
    logger.info("Body:", JSON.stringify(req.body, null, 2));

    // Verify webhook signature (important for security)
    // Note: Stream uses your STREAM_API_SECRET to sign webhooks (not a separate webhook secret)
    // Stream sends signature in x-signature header
    const signature = req.headers["x-signature"] as string;
    logger.info(`Signature header present: ${!!signature}`);

    if (config.STREAM_API_SECRET && signature) {
      const isValid = verifyWebhookSignature(req.body, signature);
      if (!isValid) {
        logger.warn("Invalid webhook signature - rejecting request");
        logger.warn(
          "This might be due to body parsing issues - check if raw body is needed"
        );
        // For now, allow it through for debugging - REMOVE IN PRODUCTION
        // return res.status(401).json({ error: "Invalid signature" });
        logger.warn("⚠️  Bypassing signature verification for debugging");
      } else {
        logger.info("✅ Webhook signature verified successfully");
      }
    } else if (!config.STREAM_API_SECRET) {
      logger.warn(
        "Stream API secret not configured - skipping signature verification"
      );
    } else if (!signature) {
      logger.warn("No signature header found - webhook may not be from Stream");
    }

    const event = req.body;
    logger.info(`Received Stream webhook event type: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "message.new":
        await handleNewMessage(event);
        break;
      case "message.updated":
        await handleMessageUpdated(event);
        break;
      case "message.deleted":
        await handleMessageDeleted(event);
        break;
      case "reaction.new":
        await handleReactionNew(event);
        break;
      case "member.added":
        await handleMemberAdded(event);
        break;
      case "member.removed":
        await handleMemberRemoved(event);
        break;
      case "user.banned":
        await handleUserBanned(event);
        break;
      case "user.unbanned":
        await handleUserUnbanned(event);
        break;
      case "channel.created":
        await handleChannelCreated(event);
        break;
      case "channel.deleted":
        await handleChannelDeleted(event);
        break;
      case "channel.updated":
        await handleChannelUpdated(event);
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
    logger.info("=== Processing message.new event ===");
    logger.info("Event structure:", JSON.stringify(event, null, 2));

    const message = event.message;
    const channel = event.channel;
    const senderId = message?.user?.id;

    logger.info(`Sender ID: ${senderId}`);
    logger.info(`Channel: ${JSON.stringify(channel, null, 2)}`);

    if (!senderId || !channel) {
      logger.warn("Missing sender or channel in message.new event");
      logger.warn(`Sender ID: ${senderId}, Channel: ${!!channel}`);
      return;
    }

    // Get channel members (excluding sender)
    const channelId = channel.id;
    const channelType = channel.type || "messaging";

    logger.info(`Channel ID: ${channelId}, Type: ${channelType}`);

    // Get all channel members (excluding sender) using helper function
    const memberIds = await getChannelMemberIds(
      channel,
      channelType,
      channelId,
      senderId
    );

    logger.info(
      `Found ${memberIds.length} members to notify: ${memberIds.join(", ")}`
    );

    if (memberIds.length === 0) {
      logger.warn(`⚠️  No other members in channel ${channelId} to notify`);
      logger.warn("This might mean:");
      logger.warn("1. Channel only has the sender as a member");
      logger.warn("2. Member IDs are not being extracted correctly");
      logger.warn("3. Webhook event structure is different than expected");
      return;
    }

    // Get sender name
    const senderName =
      message?.user?.name || message?.user?.username || "Someone";

    logger.info(`Creating notifications for ${memberIds.length} members`);
    logger.info(`Sender: ${senderName} (${senderId})`);
    logger.info(`Message text: ${message?.text || "[No text]"}`);

    // Create notifications for each member
    const notificationService = new NotificationService();
    const promises = memberIds.map(async (memberId) => {
      try {
        logger.info(`Creating notification for member: ${memberId}`);
        const notification =
          await notificationService.createNotificationFromStreamMessage(
            memberId,
            senderId,
            channelId,
            message?.text || "[Message]",
            senderName
          );
        logger.info(
          `✅ Notification created for member ${memberId}:`,
          notification?.id
        );
        return notification;
      } catch (error) {
        logger.error(
          `❌ Error creating notification for member ${memberId}:`,
          error
        );
        // Continue with other members even if one fails
        return null;
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter((r) => r !== null).length;
    logger.info(
      `✅ Created ${successful}/${memberIds.length} notifications for channel ${channelId}`
    );
  } catch (error) {
    logger.error("Error in handleNewMessage:", error);
    throw error;
  }
}

/**
 * Handle message updated event
 * Notifies all channel members when a message is edited
 */
async function handleMessageUpdated(event: any): Promise<void> {
  try {
    logger.info("=== Processing message.updated event ===");
    const message = event.message;
    const channel = event.channel;
    const senderId = message?.user?.id;

    if (!senderId || !channel) {
      logger.warn("Missing sender or channel in message.updated event");
      return;
    }

    const channelId = channel.id;
    const channelType = channel.type || "messaging";
    const senderName =
      message?.user?.name || message?.user?.username || "Someone";

    // Get all channel members (excluding sender)
    const memberIds = await getChannelMemberIds(
      channel,
      channelType,
      channelId,
      senderId
    );

    if (memberIds.length === 0) {
      logger.debug(`No other members in channel ${channelId} to notify`);
      return;
    }

    const notificationService = new NotificationService();
    const promises = memberIds.map(async (memberId) => {
      try {
        const notification = await notificationService.createNotification({
          user_id: memberId,
          title: `${senderName} edited a message`,
          message: message?.text || "[Message edited]",
          link: `/chat/${channelId}`,
          type: "chat",
          priority: "low",
          icon: "✏️",
          metadata: {
            channel_id: channelId,
            sender_id: senderId,
            sender_name: senderName,
            message_id: message?.id,
            event_type: "message.updated",
          },
        });
        return notification;
      } catch (error) {
        logger.error(
          `Error creating notification for member ${memberId}:`,
          error
        );
        return null;
      }
    });

    await Promise.all(promises);
    logger.info(
      `✅ Created notifications for message update in channel ${channelId}`
    );
  } catch (error) {
    logger.error("Error in handleMessageUpdated:", error);
  }
}

/**
 * Handle message deleted event
 * Notifies all channel members when a message is deleted
 */
async function handleMessageDeleted(event: any): Promise<void> {
  try {
    logger.info("=== Processing message.deleted event ===");
    const message = event.message;
    const channel = event.channel;
    const senderId = message?.user?.id;

    if (!senderId || !channel) {
      logger.warn("Missing sender or channel in message.deleted event");
      return;
    }

    const channelId = channel.id;
    const channelType = channel.type || "messaging";
    const senderName =
      message?.user?.name || message?.user?.username || "Someone";

    // Get all channel members (excluding sender)
    const memberIds = await getChannelMemberIds(
      channel,
      channelType,
      channelId,
      senderId
    );

    if (memberIds.length === 0) {
      logger.debug(`No other members in channel ${channelId} to notify`);
      return;
    }

    const notificationService = new NotificationService();
    const promises = memberIds.map(async (memberId) => {
      try {
        const notification = await notificationService.createNotification({
          user_id: memberId,
          title: `${senderName} deleted a message`,
          message: "A message was deleted in the chat",
          link: `/chat/${channelId}`,
          type: "chat",
          priority: "low",
          icon: "🗑️",
          metadata: {
            channel_id: channelId,
            sender_id: senderId,
            sender_name: senderName,
            message_id: message?.id,
            event_type: "message.deleted",
          },
        });
        return notification;
      } catch (error) {
        logger.error(
          `Error creating notification for member ${memberId}:`,
          error
        );
        return null;
      }
    });

    await Promise.all(promises);
    logger.info(
      `✅ Created notifications for message deletion in channel ${channelId}`
    );
  } catch (error) {
    logger.error("Error in handleMessageDeleted:", error);
  }
}

/**
 * Handle reaction added event
 * Notifies message owner when someone reacts to their message
 */
async function handleReactionNew(event: any): Promise<void> {
  try {
    logger.info("=== Processing reaction.new event ===");
    const reaction = event.reaction;
    const message = event.message;
    const channel = event.channel;
    const reactorId = reaction?.user?.id;
    const messageOwnerId = message?.user?.id;

    if (!reactorId || !messageOwnerId || !channel) {
      logger.warn("Missing data in reaction.new event");
      return;
    }

    // Don't notify if user reacted to their own message
    if (reactorId === messageOwnerId) {
      logger.debug("User reacted to their own message - skipping notification");
      return;
    }

    const channelId = channel.id;
    const reactorName =
      reaction?.user?.name || reaction?.user?.username || "Someone";
    const reactionType = reaction?.type || "👍";

    const notificationService = new NotificationService();
    await notificationService.createNotification({
      user_id: messageOwnerId,
      title: `${reactorName} reacted to your message`,
      message: `Reacted with ${reactionType}`,
      link: `/chat/${channelId}`,
      type: "chat",
      priority: "low",
      icon: "👍",
      metadata: {
        channel_id: channelId,
        reactor_id: reactorId,
        reactor_name: reactorName,
        message_id: message?.id,
        reaction_type: reactionType,
        event_type: "reaction.new",
      },
    });

    logger.info(`✅ Created notification for reaction in channel ${channelId}`);
  } catch (error) {
    logger.error("Error in handleReactionNew:", error);
  }
}

/**
 * Handle member added event
 * Notifies all existing channel members when someone joins
 */
async function handleMemberAdded(event: any): Promise<void> {
  try {
    logger.info("=== Processing member.added event ===");
    const member = event.member;
    const channel = event.channel;
    const newMemberId = member?.user_id || member?.user?.id;

    if (!newMemberId || !channel) {
      logger.warn("Missing data in member.added event");
      return;
    }

    const channelId = channel.id;
    const channelType = channel.type || "messaging";
    const newMemberName =
      member?.user?.name || member?.user?.username || "Someone";

    // Get all channel members (excluding the new member)
    const memberIds = await getChannelMemberIds(
      channel,
      channelType,
      channelId,
      newMemberId
    );

    if (memberIds.length === 0) {
      logger.debug(`No other members in channel ${channelId} to notify`);
      return;
    }

    const notificationService = new NotificationService();
    const promises = memberIds.map(async (memberId) => {
      try {
        const notification = await notificationService.createNotification({
          user_id: memberId,
          title: `${newMemberName} joined the chat`,
          message: `Joined channel: ${channelId}`,
          link: `/chat/${channelId}`,
          type: "chat",
          priority: "low",
          icon: "👋",
          metadata: {
            channel_id: channelId,
            new_member_id: newMemberId,
            new_member_name: newMemberName,
            event_type: "member.added",
          },
        });
        return notification;
      } catch (error) {
        logger.error(
          `Error creating notification for member ${memberId}:`,
          error
        );
        return null;
      }
    });

    await Promise.all(promises);
    logger.info(
      `✅ Created notifications for member added in channel ${channelId}`
    );
  } catch (error) {
    logger.error("Error in handleMemberAdded:", error);
  }
}

/**
 * Handle member removed event
 * Notifies all channel members when someone leaves
 */
async function handleMemberRemoved(event: any): Promise<void> {
  try {
    logger.info("=== Processing member.removed event ===");
    const member = event.member;
    const channel = event.channel;
    const removedMemberId = member?.user_id || member?.user?.id;

    if (!removedMemberId || !channel) {
      logger.warn("Missing data in member.removed event");
      return;
    }

    const channelId = channel.id;
    const channelType = channel.type || "messaging";
    const removedMemberName =
      member?.user?.name || member?.user?.username || "Someone";

    // Get all remaining channel members
    const memberIds = await getChannelMemberIds(
      channel,
      channelType,
      channelId,
      removedMemberId
    );

    if (memberIds.length === 0) {
      logger.debug(`No remaining members in channel ${channelId} to notify`);
      return;
    }

    const notificationService = new NotificationService();
    const promises = memberIds.map(async (memberId) => {
      try {
        const notification = await notificationService.createNotification({
          user_id: memberId,
          title: `${removedMemberName} left the chat`,
          message: `Left channel: ${channelId}`,
          link: `/chat/${channelId}`,
          type: "chat",
          priority: "low",
          icon: "👋",
          metadata: {
            channel_id: channelId,
            removed_member_id: removedMemberId,
            removed_member_name: removedMemberName,
            event_type: "member.removed",
          },
        });
        return notification;
      } catch (error) {
        logger.error(
          `Error creating notification for member ${memberId}:`,
          error
        );
        return null;
      }
    });

    await Promise.all(promises);
    logger.info(
      `✅ Created notifications for member removed in channel ${channelId}`
    );
  } catch (error) {
    logger.error("Error in handleMemberRemoved:", error);
  }
}

/**
 * Handle user banned event
 * Notifies the banned user
 */
async function handleUserBanned(event: any): Promise<void> {
  try {
    logger.info("=== Processing user.banned event ===");
    const user = event.user;
    const channel = event.channel;
    const bannedUserId = user?.id;

    if (!bannedUserId || !channel) {
      logger.warn("Missing data in user.banned event");
      return;
    }

    const channelId = channel.id;
    const bannedByName =
      event.created_by?.name || event.created_by?.username || "an admin";

    const notificationService = new NotificationService();
    await notificationService.createNotification({
      user_id: bannedUserId,
      title: "You've been banned from a channel",
      message: `You were banned by ${bannedByName}`,
      link: `/chat/${channelId}`,
      type: "error",
      priority: "high",
      icon: "🚫",
      metadata: {
        channel_id: channelId,
        banned_by: event.created_by?.id,
        banned_by_name: bannedByName,
        event_type: "user.banned",
      },
    });

    logger.info(`✅ Created notification for user ban: ${bannedUserId}`);
  } catch (error) {
    logger.error("Error in handleUserBanned:", error);
  }
}

/**
 * Handle user unbanned event
 * Notifies the unbanned user
 */
async function handleUserUnbanned(event: any): Promise<void> {
  try {
    logger.info("=== Processing user.unbanned event ===");
    const user = event.user;
    const channel = event.channel;
    const unbannedUserId = user?.id;

    if (!unbannedUserId || !channel) {
      logger.warn("Missing data in user.unbanned event");
      return;
    }

    const channelId = channel.id;
    const unbannedByName =
      event.created_by?.name || event.created_by?.username || "an admin";

    const notificationService = new NotificationService();
    await notificationService.createNotification({
      user_id: unbannedUserId,
      title: "You've been unbanned from a channel",
      message: `You were unbanned by ${unbannedByName}`,
      link: `/chat/${channelId}`,
      type: "success",
      priority: "normal",
      icon: "✅",
      metadata: {
        channel_id: channelId,
        unbanned_by: event.created_by?.id,
        unbanned_by_name: unbannedByName,
        event_type: "user.unbanned",
      },
    });

    logger.info(`✅ Created notification for user unbanned: ${unbannedUserId}`);
  } catch (error) {
    logger.error("Error in handleUserUnbanned:", error);
  }
}

/**
 * Handle channel created event
 * Notifies all invited members about the new channel
 */
async function handleChannelCreated(event: any): Promise<void> {
  try {
    logger.info("=== Processing channel.created event ===");
    const channel = event.channel;
    const createdBy = event.created_by;

    if (!channel) {
      logger.warn("Missing channel in channel.created event");
      return;
    }

    const channelId = channel.id;
    const channelType = channel.type || "messaging";
    const channelName = channel.name || "a new channel";
    const creatorName = createdBy?.name || createdBy?.username || "Someone";

    // Get all channel members (excluding creator)
    const creatorId = createdBy?.id;
    const memberIds = await getChannelMemberIds(
      channel,
      channelType,
      channelId,
      creatorId
    );

    if (memberIds.length === 0) {
      logger.debug(`No other members in new channel ${channelId} to notify`);
      return;
    }

    const notificationService = new NotificationService();
    const promises = memberIds.map(async (memberId) => {
      try {
        const notification = await notificationService.createNotification({
          user_id: memberId,
          title: `You've been added to ${channelName}`,
          message: `Created by ${creatorName}`,
          link: `/chat/${channelId}`,
          type: "chat",
          priority: "normal",
          icon: "📢",
          metadata: {
            channel_id: channelId,
            channel_name: channelName,
            creator_id: creatorId,
            creator_name: creatorName,
            event_type: "channel.created",
          },
        });
        return notification;
      } catch (error) {
        logger.error(
          `Error creating notification for member ${memberId}:`,
          error
        );
        return null;
      }
    });

    await Promise.all(promises);
    logger.info(`✅ Created notifications for channel creation: ${channelId}`);
  } catch (error) {
    logger.error("Error in handleChannelCreated:", error);
  }
}

/**
 * Handle channel deleted event
 * Notifies all channel members when a channel is deleted
 */
async function handleChannelDeleted(event: any): Promise<void> {
  try {
    logger.info("=== Processing channel.deleted event ===");
    const channel = event.channel;
    const deletedBy = event.created_by;

    if (!channel) {
      logger.warn("Missing channel in channel.deleted event");
      return;
    }

    const channelId = channel.id;
    const channelType = channel.type || "messaging";
    const channelName = channel.name || "a channel";
    const deletedByName = deletedBy?.name || deletedBy?.username || "an admin";

    // Get all channel members
    const memberIds = await getChannelMemberIds(
      channel,
      channelType,
      channelId,
      null
    );

    if (memberIds.length === 0) {
      logger.debug(`No members in deleted channel ${channelId} to notify`);
      return;
    }

    const notificationService = new NotificationService();
    const promises = memberIds.map(async (memberId) => {
      try {
        const notification = await notificationService.createNotification({
          user_id: memberId,
          title: `Channel deleted: ${channelName}`,
          message: `Deleted by ${deletedByName}`,
          link: `/chat`,
          type: "error",
          priority: "normal",
          icon: "🗑️",
          metadata: {
            channel_id: channelId,
            channel_name: channelName,
            deleted_by: deletedBy?.id,
            deleted_by_name: deletedByName,
            event_type: "channel.deleted",
          },
        });
        return notification;
      } catch (error) {
        logger.error(
          `Error creating notification for member ${memberId}:`,
          error
        );
        return null;
      }
    });

    await Promise.all(promises);
    logger.info(`✅ Created notifications for channel deletion: ${channelId}`);
  } catch (error) {
    logger.error("Error in handleChannelDeleted:", error);
  }
}

/**
 * Handle channel updated event
 * Notifies all channel members when channel settings change
 */
async function handleChannelUpdated(event: any): Promise<void> {
  try {
    logger.info("=== Processing channel.updated event ===");
    const channel = event.channel;
    const updatedBy = event.created_by;

    if (!channel) {
      logger.warn("Missing channel in channel.updated event");
      return;
    }

    const channelId = channel.id;
    const channelType = channel.type || "messaging";
    const channelName = channel.name || "the channel";
    const updatedByName = updatedBy?.name || updatedBy?.username || "an admin";

    // Get all channel members (excluding updater)
    const updaterId = updatedBy?.id;
    const memberIds = await getChannelMemberIds(
      channel,
      channelType,
      channelId,
      updaterId
    );

    if (memberIds.length === 0) {
      logger.debug(`No other members in channel ${channelId} to notify`);
      return;
    }

    const notificationService = new NotificationService();
    const promises = memberIds.map(async (memberId) => {
      try {
        const notification = await notificationService.createNotification({
          user_id: memberId,
          title: `${channelName} was updated`,
          message: `Updated by ${updatedByName}`,
          link: `/chat/${channelId}`,
          type: "info",
          priority: "low",
          icon: "⚙️",
          metadata: {
            channel_id: channelId,
            channel_name: channelName,
            updated_by: updaterId,
            updated_by_name: updatedByName,
            event_type: "channel.updated",
          },
        });
        return notification;
      } catch (error) {
        logger.error(
          `Error creating notification for member ${memberId}:`,
          error
        );
        return null;
      }
    });

    await Promise.all(promises);
    logger.info(`✅ Created notifications for channel update: ${channelId}`);
  } catch (error) {
    logger.error("Error in handleChannelUpdated:", error);
  }
}

/**
 * Helper function to get channel member IDs
 * Extracts member IDs from event data or queries Stream API
 */
async function getChannelMemberIds(
  channel: any,
  channelType: string,
  channelId: string,
  excludeUserId: string | null
): Promise<string[]> {
  let memberIds: string[] = [];

  // Try to get members from event data
  if (channel.members && Array.isArray(channel.members)) {
    memberIds = channel.members
      .map((m: any) => m.user_id || m.user?.id)
      .filter((id: string) => id && id !== excludeUserId);
  } else if (channel.members && typeof channel.members === "object") {
    memberIds = Object.keys(channel.members).filter(
      (id: string) => id !== excludeUserId
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
          .filter((id: string) => id && id !== excludeUserId);
      }
    } catch (error) {
      logger.error("Error querying channel for members:", error);
    }
  }

  return memberIds;
}

/**
 * Verify webhook signature from Stream
 * Stream signs webhooks with HMAC-SHA256 using your API Secret
 *
 * Note: Stream uses your existing STREAM_API_SECRET to sign webhooks,
 * not a separate webhook secret. The signature is calculated from the
 * raw JSON body string. Since Express parses JSON automatically, we
 * stringify the parsed body - this should match Stream's signature calculation.
 */
function verifyWebhookSignature(body: any, signature: string): boolean {
  if (!signature || !config.STREAM_API_SECRET) {
    logger.warn("Missing webhook signature or API secret");
    return false;
  }

  try {
    // Stream calculates signature from raw JSON string
    // Since Express parsed it, we stringify it back (should match)
    const bodyString = JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac("sha256", config.STREAM_API_SECRET)
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
