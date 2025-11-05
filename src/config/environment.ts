import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("8000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  STREAM_API_KEY: z.string().min(1),
  STREAM_API_SECRET: z.string().min(1),
  ALLOWED_ORIGINS: z
    .string()
    .default(
      "http://localhost:3000,http://localhost:5173,https://mountsanai.app,https://www.mountsanai.app,https://mount-sinai.vercel.app,https://www.mount-sinai.vercel.app"
    ),
});

type EnvConfig = z.infer<typeof envSchema>;

const parseEnvironment = (): EnvConfig => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseEnvironment();
