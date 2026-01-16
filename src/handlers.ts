import { BotContext } from "./types.js";
import { addStudents, deleteStudent, updateStudentEmail } from "./supabase.js";
import {
  showMainMenu,
  showStudentList,
  showAddStudentPrompt,
  showEditStudentPrompt,
  showDeleteStudentPrompt,
  showNewEmailPrompt,
} from "./menu.js";
import { editOrReplaceMessage, escapeMarkdown } from "./utils.js";

export async function handleAddStudent(ctx: BotContext, text: string) {
  console.log("[DEBUG] handleAddStudent called");
  console.log("[DEBUG] Raw text received:", JSON.stringify(text));
  console.log("[DEBUG] Session exists:", !!ctx.session);
  console.log("[DEBUG] Current menu:", ctx.session?.currentMenu);

  if (!ctx.session) {
    console.log("[DEBUG] No session, returning early");
    return;
  }

  // Delete the user's message
  try {
    await ctx.deleteMessage();
    console.log("[DEBUG] User message deleted successfully");
  } catch (error) {
    console.log("[DEBUG] Failed to delete user message:", error);
    // Ignore if message can't be deleted
  }

  const emails = text
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  console.log("[DEBUG] Parsed emails:", JSON.stringify(emails));
  console.log("[DEBUG] Number of emails:", emails.length);

  if (emails.length === 0) {
    console.log("[DEBUG] No valid emails found, showing error");
    await editOrReplaceMessage(
      ctx,
      "❌ No valid emails provided. Please try again."
    );
    await showAddStudentPrompt(ctx);
    return;
  }

  try {
    console.log("[DEBUG] Calling addStudents with emails:", JSON.stringify(emails));
    const result = await addStudents(emails);
    console.log("[DEBUG] addStudents result:", {
      successCount: result.success.length,
      errorCount: result.errors.length,
      success: result.success.map(s => s.email),
      errors: result.errors
    });

    let responseText = "✅ *Student\\(s\\) Added*\n\n";

    if (result.success.length > 0) {
      responseText += `*Successfully added:*\n`;
      result.success.forEach((student) => {
        responseText += `• ${escapeMarkdown(student.email)}\n`;
      });
    }

    if (result.errors.length > 0) {
      responseText += `\n*Errors:*\n`;
      result.errors.forEach((error) => {
        responseText += `• ${escapeMarkdown(error)}\n`;
      });
    }

    console.log("[DEBUG] Response text prepared:", responseText.substring(0, 100) + "...");
    console.log("[DEBUG] Sending success message");
    
    // Show success message briefly, then show student list
    await editOrReplaceMessage(ctx, responseText);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("[DEBUG] Showing student list");
    await showStudentList(ctx);
    console.log("[DEBUG] handleAddStudent completed successfully");
  } catch (error) {
    console.error("[DEBUG] Error in handleAddStudent:", error);
    console.error("[DEBUG] Error stack:", error instanceof Error ? error.stack : "No stack");
    const errorMessage =
      error instanceof Error ? error.message : "Failed to add students";
    console.log("[DEBUG] Sending error message to user");
    await editOrReplaceMessage(
      ctx,
      `❌ Error: ${escapeMarkdown(errorMessage)}`
    );
    await showAddStudentPrompt(ctx);
  }
}

export async function handleEditStudent(ctx: BotContext, text: string) {
  if (!ctx.session) return;

  // Delete the user's message
  try {
    await ctx.deleteMessage();
  } catch (error) {
    // Ignore if message can't be deleted
  }

  const email = text.trim().toLowerCase();

  if (!ctx.session.editingStudentEmail) {
    // First step: get the email to edit
    ctx.session.editingStudentEmail = email;
    await showNewEmailPrompt(ctx, email);
  } else {
    // Second step: update with new email
    try {
      await updateStudentEmail(ctx.session.editingStudentEmail, email);
      ctx.session.editingStudentEmail = undefined;
      // Show student list immediately so emails can be copied
      await showStudentList(ctx);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update student";
      await editOrReplaceMessage(
        ctx,
        `❌ Error: ${escapeMarkdown(errorMessage)}`
      );
      await showEditStudentPrompt(ctx);
    }
  }
}

export async function handleDeleteStudent(ctx: BotContext, text: string) {
  if (!ctx.session) return;

  // Delete the user's message
  try {
    await ctx.deleteMessage();
  } catch (error) {
    // Ignore if message can't be deleted
  }

  const email = text.trim().toLowerCase();

  try {
    await deleteStudent(email);
    // Show student list immediately so emails can be copied
    await showStudentList(ctx);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete student";
    await editOrReplaceMessage(
      ctx,
      `❌ Error: ${escapeMarkdown(errorMessage)}`
    );
    await showDeleteStudentPrompt(ctx);
  }
}

export async function handleCallbackQuery(ctx: BotContext) {
  if (!ctx.session || !ctx.callbackQuery || !("data" in ctx.callbackQuery))
    return;

  const data = ctx.callbackQuery.data;

  // Answer callback query to remove loading state
  await ctx.answerCbQuery();

  switch (data) {
    case "main_menu":
      await showMainMenu(ctx);
      break;
    case "student_list":
      await showStudentList(ctx);
      break;
    case "add_student":
      await showAddStudentPrompt(ctx);
      break;
    case "edit_student":
      await showEditStudentPrompt(ctx);
      break;
    case "delete_student":
      await showDeleteStudentPrompt(ctx);
      break;
    default:
      break;
  }
}
