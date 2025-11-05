import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { NotificationService } from "../../services/notifications/notification.service";
import { logger } from "../../utils/logger";

/**
 * Test notifications endpoint
 * Creates notifications for all types and priorities for testing
 */
export const testNotifications = async (req: AuthRequest, res: Response) => {
  // Get userId from params or body or authenticated user
  const userId = req.params.userId || req.body.userId || req.user?.id;

  if (!userId) {
    throw new AppError(
      400,
      "User ID is required. Provide it in URL params, body, or authenticate as the user."
    );
  }

  const notificationService = new NotificationService();

  try {
    const notifications = [];

    // Define all notification types
    const types = [
      "info",
      "success",
      "warning",
      "error",
      "achievement",
      "system",
      "social",
      "reading",
      "chat",
    ] as const;

    // Define all priority levels
    const priorities = ["low", "normal", "high", "urgent"] as const;

    // Create notifications for each type and priority combination
    for (const type of types) {
      for (const priority of priorities) {
        try {
          const notification = await notificationService.createNotification({
            user_id: userId,
            title: `Test ${type} notification (${priority} priority)`,
            message: `This is a test notification with type "${type}" and priority "${priority}". This helps you see how different notification types and priorities look in your app.`,
            link: `/test/${type}/${priority}`,
            type,
            priority,
            icon: getIconForType(type),
            metadata: {
              test: true,
              notification_type: type,
              priority_level: priority,
              created_at: new Date().toISOString(),
            },
          });

          notifications.push(notification);
          logger.info(
            `Created test notification: ${type} - ${priority} for user ${userId}`
          );
        } catch (error) {
          logger.error(
            `Error creating test notification ${type} - ${priority}:`,
            error
          );
        }
      }
    }

    // Create some additional test notifications with different scenarios
    const additionalTests = [
      {
        title: "New message from John Doe",
        message: "Hey! How are you doing today?",
        type: "chat" as const,
        priority: "normal" as const,
        icon: "💬",
      },
      {
        title: "Achievement Unlocked!",
        message: "You've read 100 chapters! 🎉",
        type: "achievement" as const,
        priority: "high" as const,
        icon: "🏆",
      },
      {
        title: "System Maintenance",
        message: "Scheduled maintenance will occur tonight at 2 AM",
        type: "system" as const,
        priority: "normal" as const,
        icon: "⚙️",
      },
      {
        title: "Friend Request",
        message: "Sarah Johnson wants to connect with you",
        type: "social" as const,
        priority: "normal" as const,
        icon: "👥",
      },
      {
        title: "Daily Reading Reminder",
        message: "Don't forget to read today's chapter!",
        type: "reading" as const,
        priority: "normal" as const,
        icon: "📖",
      },
      {
        title: "⚠️ Important Warning",
        message: "Your account will expire in 3 days",
        type: "warning" as const,
        priority: "high" as const,
        icon: "⚠️",
      },
      {
        title: "✅ Operation Successful",
        message: "Your profile has been updated successfully",
        type: "success" as const,
        priority: "normal" as const,
        icon: "✅",
      },
      {
        title: "❌ Error Occurred",
        message: "Failed to process your request. Please try again.",
        type: "error" as const,
        priority: "urgent" as const,
        icon: "❌",
      },
    ];

    for (const test of additionalTests) {
      try {
        const notification = await notificationService.createNotification({
          user_id: userId,
          title: test.title,
          message: test.message,
          link: `/test/${test.type}`,
          type: test.type,
          priority: test.priority,
          icon: test.icon,
          metadata: {
            test: true,
            scenario: "additional_test",
            created_at: new Date().toISOString(),
          },
        });
        notifications.push(notification);
      } catch (error) {
        logger.error(`Error creating additional test notification:`, error);
      }
    }

    const response: ApiSuccessResponse<{
      total_created: number;
      notifications: typeof notifications;
      user_id: string;
    }> = {
      success: true,
      data: {
        total_created: notifications.length,
        notifications,
        user_id: userId,
      },
      message: `Created ${notifications.length} test notifications for user ${userId}`,
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error("Error creating test notifications:", error);
    throw new AppError(500, "Failed to create test notifications");
  }
};

/**
 * Get icon for notification type
 */
function getIconForType(type: string): string {
  const iconMap: Record<string, string> = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    achievement: "🏆",
    system: "⚙️",
    social: "👥",
    reading: "📖",
    chat: "💬",
  };

  return iconMap[type] || "📢";
}
