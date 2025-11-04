import { getSupabaseAdminClient } from "../../config/supabase";
import { logger } from "../../utils/logger";

export interface CreateNotificationParams {
  user_id: string;
  title: string;
  message: string;
  link?: string;
  type?:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "achievement"
    | "system"
    | "social"
    | "reading"
    | "chat";
  priority?: "low" | "normal" | "high" | "urgent";
  icon?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notification Service
 * Handles creating and managing notifications for users
 */
export class NotificationService {
  private supabase = getSupabaseAdminClient();

  /**
   * Create a notification for a user
   * Uses RPC function with SECURITY DEFINER to bypass RLS
   */
  async createNotification(params: CreateNotificationParams) {
    try {
      // Use RPC function with SECURITY DEFINER to bypass RLS
      // This is more reliable than relying on service role policies
      const { data, error } = await this.supabase.rpc("create_notification", {
        p_user_id: params.user_id,
        p_title: params.title,
        p_message: params.message,
        p_link: params.link || null,
        p_type: params.type || "info",
        p_priority: params.priority || "normal",
        p_icon: params.icon || null,
        p_metadata: params.metadata || null,
      });

      if (error) {
        logger.error("Error creating notification via RPC:", error);
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      if (!data || data.length === 0) {
        logger.error("RPC function returned no data");
        throw new Error("Failed to create notification: no data returned");
      }

      logger.info(
        `Notification created for user ${params.user_id}: ${params.title}`
      );
      return data[0];
    } catch (error) {
      logger.error("Error in createNotification:", error);
      throw error;
    }
  }

  /**
   * Create notification from Stream chat message
   * Only creates notification if the message is not from the user themselves
   */
  async createNotificationFromStreamMessage(
    recipientUserId: string,
    senderUserId: string,
    channelId: string,
    messageText: string,
    senderName?: string
  ) {
    // Don't create notification if user sent message to themselves
    if (recipientUserId === senderUserId) {
      logger.debug(
        `Skipping notification - user ${recipientUserId} sent message to themselves`
      );
      return null;
    }

    try {
      // Truncate message if too long for notification
      const truncatedMessage =
        messageText.length > 200
          ? messageText.substring(0, 197) + "..."
          : messageText;

      // Create notification
      const notification = await this.createNotification({
        user_id: recipientUserId,
        title: senderName
          ? `New message from ${senderName}`
          : "New chat message",
        message: truncatedMessage,
        link: `/chat/${channelId}`,
        type: "chat",
        priority: "normal",
        icon: "💬",
        metadata: {
          channel_id: channelId,
          sender_id: senderUserId,
          sender_name: senderName,
          message_preview: truncatedMessage,
        },
      });

      logger.info(
        `Notification created for Stream message: ${recipientUserId} -> ${channelId}`
      );
      return notification;
    } catch (error) {
      logger.error("Error creating notification from Stream message:", error);
      // Don't throw - notification creation failure shouldn't break webhook processing
      return null;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        logger.error("Error marking notification as read:", error);
        throw new Error(
          `Failed to mark notification as read: ${error.message}`
        );
      }

      return data;
    } catch (error) {
      logger.error("Error in markAsRead:", error);
      throw error;
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: string,
    options?: {
      isRead?: boolean;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      let query = this.supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (options?.isRead !== undefined) {
        query = query.eq("is_read", options.isRead);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 20) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error getting user notifications:", error);
        throw new Error(`Failed to get notifications: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getUserNotifications:", error);
      throw error;
    }
  }
}
