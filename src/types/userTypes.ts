import { z } from "zod";

// ============================================================================
// USER TYPES
// ============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  username: z.string().min(3).max(20).nullable(),
  gender: z.enum(["male", "female", "prefer-not-to-say"]).nullable(),
  birth_date: z.string().nullable(), // date
  address1: z.string().nullable(),
  address2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zipcode: z.string().nullable(),
  profile_picture_url: z.string().url().nullable(),
  avatar_type: z.enum(["upload", "generated"]).nullable(),
  avatar_config: z.record(z.string(), z.unknown()).nullable(), // JSONB
  onboarding_completed: z.boolean().nullable(),
  created_at: z.string().nullable(), // timestamptz
  updated_at: z.string().nullable(), // timestamptz
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial();

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
