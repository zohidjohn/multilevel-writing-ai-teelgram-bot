import dotenv from "dotenv";

dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || "",
  authCode: process.env.AUTH_CODE || "D0h8596l^^MNiw",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

// Validate required environment variables with better error messages
if (!config.botToken) {
  console.error("❌ ERROR: BOT_TOKEN environment variable is required but not set");
  console.error("   Please set BOT_TOKEN in your environment variables");
  process.exit(1);
}

if (!config.supabaseUrl) {
  console.error("❌ ERROR: SUPABASE_URL environment variable is required but not set");
  console.error("   Please set SUPABASE_URL in your environment variables");
  process.exit(1);
}

if (!config.supabaseServiceRoleKey) {
  console.error("❌ ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required but not set");
  console.error("   Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables");
  process.exit(1);
}

console.log("✅ All required environment variables are set");
