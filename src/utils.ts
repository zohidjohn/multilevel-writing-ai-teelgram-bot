import { BotContext } from "./types.js";
import { Markup } from "telegraf";

/**
 * Escapes special Markdown characters to prevent parsing errors
 */
export function escapeMarkdown(text: string): string {
  // Escape special Markdown characters: _ * [ ] ( ) ` ~ > # + - = | { } . !
  return text
    .replace(/\_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\`/g, "\\`")
    .replace(/\~/g, "\\~")
    .replace(/\>/g, "\\>")
    .replace(/\#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/\-/g, "\\-")
    .replace(/\=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/\!/g, "\\!");
}

/**
 * Always tries to edit the last message. If editing fails, deletes the old message and sends a new one.
 * Automatically falls back to plain text if Markdown parsing fails.
 */
export async function editOrReplaceMessage(
  ctx: BotContext,
  text: string,
  keyboard?: ReturnType<typeof Markup.inlineKeyboard>
) {
  const sendWithFallback = async (
    sendFn: (options: any) => Promise<any>,
    plainSendFn: (options: any) => Promise<any>
  ): Promise<any> => {
    try {
      return await sendFn({
        ...(keyboard || {}),
        parse_mode: "Markdown",
      });
    } catch (error: any) {
      // If Markdown parsing fails, retry without Markdown (plain text)
      if (
        error?.response?.description?.includes("can't parse entities") ||
        error?.response?.description?.includes("Bad Request") ||
        error?.message?.includes("can't parse entities")
      ) {
        // Retry without parse_mode (plain text)
        return await plainSendFn({
          ...(keyboard || {}),
          // No parse_mode
        });
      }
      throw error;
    }
  };

  if (!ctx.session || !ctx.chat) {
    // Fallback if no session or chat
    const message = await sendWithFallback(
      (options) => ctx.reply(text, options),
      (options) => ctx.reply(text, options)
    );
    if (ctx.session) {
      ctx.session.lastMessageId = message.message_id;
    }
    return;
  }

  try {
    if (ctx.session.lastMessageId) {
      // Try to edit the existing message
      await sendWithFallback(
        (options) =>
          ctx.telegram.editMessageText(
            ctx.chat!.id,
            ctx.session!.lastMessageId!,
            undefined,
            text,
            options
          ),
        (options) =>
          ctx.telegram.editMessageText(
            ctx.chat!.id,
            ctx.session!.lastMessageId!,
            undefined,
            text,
            options
          )
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
  const message = await sendWithFallback(
    (options) => ctx.reply(text, options),
    (options) => ctx.reply(text, options)
  );
  ctx.session.lastMessageId = message.message_id;
}
