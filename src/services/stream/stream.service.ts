import { getStreamClient } from "../../config/stream";
import { getSupabaseAdminClient } from "../../config/supabase";
import { logger } from "../../utils/logger";
import type { User } from "../../types/userTypes";

interface StreamUserData {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  [key: string]: unknown;
}

interface StreamTokenResult {
  token: string;
  user: StreamUserData;
  isNewUser: boolean;
}

/**
 * Stream Chat service for user authentication and token management
 * Handles user synchronization with Stream and token generation
 */
export class StreamService {
  private supabase = getSupabaseAdminClient();

  /**
   * Get or create Stream token for a user
   * Checks if user has been synced to Stream to avoid DAU issues
   */
  async getOrCreateStreamToken(userId: string): Promise<StreamTokenResult> {
    try {
      // Get user data from Supabase
      const user = await this.getUserData(userId);
      if (!user) {
        throw new Error("User not found in database");
      }

      // Check if user already has a Stream token record
      const tokenRecord = await this.getStreamTokenRecord(userId);

      // If user doesn't have a token record, sync them to Stream for the first time
      if (!tokenRecord) {
        logger.info(`First-time Stream sync for user ${userId}`);
        return await this.createStreamUser(user);
      }

      // User already exists in Stream, just generate a fresh token
      logger.info(`Generating fresh token for existing Stream user ${userId}`);
      return await this.refreshStreamToken(userId, user);
    } catch (error) {
      logger.error("Error getting Stream token:", error);
      
      // Check if it's a Stream service error
      if (error instanceof Error && error.message.includes("Stream")) {
        throw new Error("Stream Chat service is currently unavailable. Please try again later.");
      }
      
      throw error;
    }
  }

  /**
   * Get user data from Supabase
   */
  private async getUserData(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        logger.error("Error fetching user data:", error);
        return null;
      }

      return data as User;
    } catch (error) {
      logger.error("Error getting user data:", error);
      return null;
    }
  }

  /**
   * Check if user has a Stream token record
   */
  private async getStreamTokenRecord(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("stream_user_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected for new users
        logger.error("Error fetching Stream token record:", error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Error getting Stream token record:", error);
      return null;
    }
  }

  /**
   * Create new Stream user and generate token
   */
  private async createStreamUser(user: User): Promise<StreamTokenResult> {
    const streamClient = getStreamClient();
    const streamUserId = user.id; // Use the same user ID for Stream

    // Build user data for Stream
    const streamUserData = this.buildStreamUserData(user);

    try {
      // Upsert user to Stream (this creates the user if they don't exist)
      const response = await streamClient.upsertUser({
        id: streamUserId,
        ...streamUserData,
      });

      logger.info(`Successfully synced user ${streamUserId} to Stream`);

      // Generate token
      const token = streamClient.createToken(streamUserId);

      // Create token record in database
      await this.createTokenRecord(user.id, streamUserId);

      return {
        token,
        user: {
          id: streamUserId,
          ...streamUserData,
        },
        isNewUser: true,
      };
    } catch (error) {
      logger.error("Error creating Stream user:", error);
      
      // If Stream is down, throw user-friendly error
      if (error instanceof Error) {
        if (
          error.message.includes("timeout") ||
          error.message.includes("network") ||
          error.message.includes("ECONNREFUSED")
        ) {
          throw new Error("Stream Chat service is currently unavailable. Please try again later.");
        }
      }
      
      throw error;
    }
  }

  /**
   * Refresh token for existing Stream user
   */
  private async refreshStreamToken(
    userId: string,
    user: User
  ): Promise<StreamTokenResult> {
    const streamClient = getStreamClient();
    const streamUserId = user.id;

    try {
      // Update user data in Stream (in case profile changed)
      const streamUserData = this.buildStreamUserData(user);
      await streamClient.upsertUser({
        id: streamUserId,
        ...streamUserData,
      });

      // Generate fresh token
      const token = streamClient.createToken(streamUserId);

      // Update token record
      await this.updateTokenRecord(userId);

      return {
        token,
        user: {
          id: streamUserId,
          ...streamUserData,
        },
        isNewUser: false,
      };
    } catch (error) {
      logger.error("Error refreshing Stream token:", error);
      
      // If Stream is down, throw user-friendly error
      if (error instanceof Error) {
        if (
          error.message.includes("timeout") ||
          error.message.includes("network") ||
          error.message.includes("ECONNREFUSED")
        ) {
          throw new Error("Stream Chat service is currently unavailable. Please try again later.");
        }
      }
      
      throw error;
    }
  }

  /**
   * Build Stream user data from Supabase user
   */
  private buildStreamUserData(user: User): StreamUserData {
    const name = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || user.username || undefined;

    return {
      id: user.id,
      name,
      email: user.email,
      image: user.profile_picture_url || undefined,
      // Custom fields
      username: user.username || undefined,
      first_name: user.first_name || undefined,
      last_name: user.last_name || undefined,
      avatar_type: user.avatar_type || undefined,
    };
  }

  /**
   * Create token record in database
   */
  private async createTokenRecord(userId: string, streamUserId: string) {
    try {
      const { error } = await this.supabase
        .from("stream_user_tokens")
        .insert({
          user_id: userId,
          stream_user_id: streamUserId,
          token_issued_at: new Date().toISOString(),
          last_token_refreshed_at: new Date().toISOString(),
          is_active: true,
        });

      if (error) {
        logger.error("Error creating token record:", error);
        // Don't throw - token generation succeeded, DB record is just metadata
      }
    } catch (error) {
      logger.error("Error creating token record:", error);
      // Don't throw - token generation succeeded, DB record is just metadata
    }
  }

  /**
   * Update token record with refresh timestamp
   */
  private async updateTokenRecord(userId: string) {
    try {
      const { error } = await this.supabase
        .from("stream_user_tokens")
        .update({
          last_token_refreshed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        logger.error("Error updating token record:", error);
        // Don't throw - token generation succeeded, DB record is just metadata
      }
    } catch (error) {
      logger.error("Error updating token record:", error);
      // Don't throw - token generation succeeded, DB record is just metadata
    }
  }
}

