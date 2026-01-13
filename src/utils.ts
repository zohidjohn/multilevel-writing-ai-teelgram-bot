import { BotContext } from "./types.js";
import { Markup } from "telegraf";

/**
 * Always tries to edit the last message. If editing fails, deletes the old message and sends a new one.
 */
export async function editOrReplaceMessage(
  ctx: BotContext,
  text: string,
  keyboard?: ReturnType<typeof Markup.inlineKeyboard>
) {
  if (!ctx.session || !ctx.chat) {
    // Fallback if no session or chat
    const message = await ctx.reply(text, {
      ...(keyboard || {}),
      parse_mode: "Markdown",
    });
    if (ctx.session) {
      ctx.session.lastMessageId = message.message_id;
    }
    return;
  }

  try {
    if (ctx.session.lastMessageId) {
      // Try to edit the existing message
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        ctx.session.lastMessageId,
        undefined,
        text,
        {
          ...(keyboard || {}),
          parse_mode: "Markdown",
        }
      );
      // Successfully edited, no need to update lastMessageId
      return;
    }
  } catch (error) {
    // Editing failed, try to delete the old message and send new one
    if (ctx.session.lastMessageId) {
      try {
        await ctx.telegram.deleteMessage(
          ctx.chat.id,
          ctx.session.lastMessageId
        );
      } catch (deleteError) {
        // Ignore if deletion fails (message might already be deleted)
      }
    }
  }

  // Send new message (either because there was no lastMessageId or editing failed)
  const message = await ctx.reply(text, {
    ...(keyboard || {}),
    parse_mode: "Markdown",
  });
  ctx.session.lastMessageId = message.message_id;
}
