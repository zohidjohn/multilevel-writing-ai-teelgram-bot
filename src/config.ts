import dotenv from "dotenv";

dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || "",
  authCode: process.env.AUTH_CODE || "D0h8596l^^MNiw",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

// Validate required environment variables
if (!config.botToken) {
  throw new Error("BOT_TOKEN is required");
}

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}
