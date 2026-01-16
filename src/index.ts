import { Telegraf, session } from "telegraf";
import { config } from "./config.js";
import { BotContext, SessionData } from "./types.js";
import { showMainMenu } from "./menu.js";
import {
  handleAddStudent,
  handleEditStudent,
  handleDeleteStudent,
  handleCallbackQuery,
} from "./handlers.js";
import { editOrReplaceMessage } from "./utils.js";

// Initialize bot
const bot = new Telegraf<BotContext>(config.botToken);

// Session middleware
bot.use(session());

// Initialize session
bot.use(async (ctx, next) => {
  if (!ctx.session) {
    ctx.session = {
      isAuthenticated: false,
      currentMenu: undefined,
    };
  }
  return next();
});

// Authentication middleware
bot.use(async (ctx, next) => {
  if (ctx.session?.isAuthenticated) {
    return next();
  }

  // Allow authentication command
  if (ctx.message && "text" in ctx.message) {
    const text = ctx.message.text.trim();
    if (text === config.authCode) {
      if (!ctx.session) {
        ctx.session = {
          isAuthenticated: false,
          currentMenu: undefined,
        };
      }
      ctx.session.isAuthenticated = true;

      // Delete the authentication message
      try {
        await ctx.deleteMessage();
      } catch (error) {
        // Ignore if message can't be deleted
      }

      // Go straight to main menu after authentication
      await showMainMenu(ctx);
      return;
    }
  }

  // If not authenticated, silently ignore non-command messages
  if (
    ctx.message &&
    "text" in ctx.message &&
    !ctx.message.text.startsWith("/")
  ) {
    return;
  }

  return next();
});

// Start command
bot.command("start", async (ctx) => {
  if (!ctx.session) return;

  if (ctx.session.isAuthenticated) {
    await showMainMenu(ctx);
  } else {
    // Only show auth prompt if not already authenticated
    await ctx.reply(
      "Please send the authentication code to access the admin panel.",
      { parse_mode: "Markdown" }
    );
  }
});

// Help command
bot.command("help", async (ctx) => {
  await ctx.reply(
    "📖 *Help*\n\n" +
      "This bot allows you to manage students for the Multi-level Writing AI platform.\n\n" +
      "*Commands:*\n" +
      "/start - Start the bot\n" +
      "/cancel - Cancel current operation\n" +
      "/help - Show this help message\n\n" +
      "To authenticate, send the authentication code provided by the administrator.",
    { parse_mode: "Markdown" }
  );
});

// Cancel command
bot.command("cancel", async (ctx) => {
  if (!ctx.session) return;

  ctx.session.currentMenu = undefined;
  ctx.session.editingStudentEmail = undefined;

  // Delete the cancel command message
  try {
    await ctx.deleteMessage();
  } catch (error) {
    // Ignore if message can't be deleted
  }

  await showMainMenu(ctx);
});

// Handle callback queries (button presses)
bot.on("callback_query", handleCallbackQuery);

// Handle text messages based on current menu state
bot.on("text", async (ctx) => {
  console.log("[DEBUG] Text message received");
  console.log("[DEBUG] Session exists:", !!ctx.session);
  console.log("[DEBUG] Message exists:", !!ctx.message);
  console.log("[DEBUG] Is text message:", ctx.message && "text" in ctx.message);

  if (!ctx.session || !ctx.message || !("text" in ctx.message)) {
    console.log("[DEBUG] Early return: missing session or message");
    return;
  }

  const text = ctx.message.text.trim();
  console.log("[DEBUG] Message text:", JSON.stringify(text));
  console.log("[DEBUG] Current menu:", ctx.session.currentMenu);
  console.log("[DEBUG] Is authenticated:", ctx.session.isAuthenticated);

  // Ignore commands
  if (text.startsWith("/")) {
    console.log("[DEBUG] Ignoring command");
    return;
  }

  // Handle based on current menu
  console.log("[DEBUG] Processing message for menu:", ctx.session.currentMenu);
  switch (ctx.session.currentMenu) {
    case "addStudent":
      console.log("[DEBUG] Routing to handleAddStudent");
      await handleAddStudent(ctx, text);
      break;
    case "editStudent":
      console.log("[DEBUG] Routing to handleEditStudent");
      await handleEditStudent(ctx, text);
      break;
    case "deleteStudent":
      console.log("[DEBUG] Routing to handleDeleteStudent");
      await handleDeleteStudent(ctx, text);
      break;
    default:
      console.log("[DEBUG] No specific menu, default case");
      // If authenticated but no specific menu, show main menu
      if (ctx.session.isAuthenticated) {
        console.log("[DEBUG] Showing main menu");
        await showMainMenu(ctx);
      }
      break;
  }
});

// Error handling
bot.catch(async (err, ctx) => {
  console.error("Error occurred:", err);
  await editOrReplaceMessage(
    ctx,
    "❌ An error occurred. Please try again or contact the administrator."
  );
});

// Start bot - Always use polling (simpler, no webhook setup needed)
async function startBot() {
  try {
    console.log("🤖 Starting Telegram bot...");
    console.log("📡 Using polling mode (no webhook needed)");
    console.log("🔧 Environment check:");
    console.log("  - BOT_TOKEN:", config.botToken ? "✅ Set" : "❌ Missing");
    console.log("  - SUPABASE_URL:", config.supabaseUrl ? "✅ Set" : "❌ Missing");
    console.log("  - SUPABASE_SERVICE_ROLE_KEY:", config.supabaseServiceRoleKey ? "✅ Set" : "❌ Missing");
    
    await bot.launch();
    console.log("✅ Bot is running and listening for messages!");
    console.log("Press Ctrl+C to stop the bot");

    // Graceful stop
    process.once("SIGINT", () => {
      console.log("Stopping bot (SIGINT)...");
      bot.stop("SIGINT");
      process.exit(0);
    });
    process.once("SIGTERM", () => {
      console.log("Stopping bot (SIGTERM)...");
      bot.stop("SIGTERM");
      process.exit(0);
    });

    // Keep process alive and handle uncaught errors
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      // Don't exit, try to keep running
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      // Don't exit, try to keep running
    });
  } catch (error) {
    console.error("❌ Failed to start bot:", error);
    if (error instanceof Error) {
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
    }
    // Wait a bit before exiting to see logs
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  }
}

startBot();
