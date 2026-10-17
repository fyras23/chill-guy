import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  UPLOADTHING_TOKEN: z.string().min(1).optional(),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export function validateEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.warn("Environment variable validation warning:", parsed.error.format());
    return false;
  }
  return true;
}

// Call on startup
validateEnv();
