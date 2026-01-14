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
import { editOrReplaceMessage } from "./utils.js";

export async function handleAddStudent(ctx: BotContext, text: string) {
  if (!ctx.session) return;

  // Delete the user's message
  try {
    await ctx.deleteMessage();
  } catch (error) {
    // Ignore if message can't be deleted
  }

  const emails = text
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  if (emails.length === 0) {
    await editOrReplaceMessage(
      ctx,
      "❌ No valid emails provided. Please try again."
    );
    await showAddStudentPrompt(ctx);
    return;
  }

  try {
    const result = await addStudents(emails);

    let responseText = "✅ *Student(s) Added*\n\n";

    if (result.success.length > 0) {
      responseText += `*Successfully added:*\n`;
      result.success.forEach((student) => {
        responseText += `• ${student.email}\n`;
      });
    }

    if (result.errors.length > 0) {
      responseText += `\n*Errors:*\n`;
      result.errors.forEach((error) => {
        responseText += `• ${error}\n`;
      });
    }

    // Show success message briefly, then show student list
    await editOrReplaceMessage(ctx, responseText);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await showStudentList(ctx);
  } catch (error) {
    await editOrReplaceMessage(
      ctx,
      `❌ Error: ${
        error instanceof Error ? error.message : "Failed to add students"
      }`
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
      await editOrReplaceMessage(
        ctx,
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to update student"
        }`
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
    await editOrReplaceMessage(
      ctx,
      `❌ Error: ${
        error instanceof Error ? error.message : "Failed to delete student"
      }`
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
