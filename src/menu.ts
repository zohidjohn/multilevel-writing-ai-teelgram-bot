import { Markup } from "telegraf";
import { BotContext } from "./types.js";
import {
  getAllStudents,
  deleteStudent,
  updateStudentEmail,
} from "./supabase.js";
import { editOrReplaceMessage } from "./utils.js";

export async function showMainMenu(ctx: BotContext) {
  const text = "🤖 *Multi-level Writing AI*\n\nSelect an option:";

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("📋 Student List", "student_list")],
  ]).resize();

  await editOrReplaceMessage(ctx, text, keyboard);

  if (ctx.session) {
    ctx.session.currentMenu = "main";
  }
}

export async function showStudentList(ctx: BotContext) {
  try {
    const students = await getAllStudents();

    let text = "📋 *Student List*\n\n";

    if (students.length === 0) {
      text += "No students found.";
    } else {
      students.forEach((student, index) => {
        text += `${index + 1}. ${student.email}\n`;
      });
    }

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("➕ Add Student", "add_student")],
      [Markup.button.callback("✏️ Edit Student", "edit_student")],
      [Markup.button.callback("🗑️ Delete Student", "delete_student")],
      [Markup.button.callback("🔙 Back to Main Menu", "main_menu")],
    ]).resize();

    await editOrReplaceMessage(ctx, text, keyboard);

    if (ctx.session) {
      ctx.session.currentMenu = "studentList";
    }
  } catch (error) {
    const errorText = `❌ Error: ${
      error instanceof Error ? error.message : "Failed to fetch students"
    }`;
    await editOrReplaceMessage(ctx, errorText);
  }
}

export async function showAddStudentPrompt(ctx: BotContext) {
  const text =
    "➕ *Add Student*\n\nEnter email address(es):\n\n" +
    "• For single student: Enter one email\n" +
    "• For bulk: Enter multiple emails separated by commas\n\n" +
    "Example: `student1@example.com, student2@example.com`\n\n" +
    "Type /cancel to cancel.";

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🔙 Back", "student_list")],
  ]).resize();

  await editOrReplaceMessage(ctx, text, keyboard);

  if (ctx.session) {
    ctx.session.currentMenu = "addStudent";
  }
}

export async function showEditStudentPrompt(ctx: BotContext) {
  const text =
    "✏️ *Edit Student*\n\nEnter the email of the student you want to edit:\n\nType /cancel to cancel.";

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🔙 Back", "student_list")],
  ]).resize();

  await editOrReplaceMessage(ctx, text, keyboard);

  if (ctx.session) {
    ctx.session.currentMenu = "editStudent";
  }
}

export async function showDeleteStudentPrompt(ctx: BotContext) {
  const text =
    "🗑️ *Delete Student*\n\nEnter the email of the student you want to delete:\n\nType /cancel to cancel.";

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🔙 Back", "student_list")],
  ]).resize();

  await editOrReplaceMessage(ctx, text, keyboard);

  if (ctx.session) {
    ctx.session.currentMenu = "deleteStudent";
  }
}

export async function showNewEmailPrompt(ctx: BotContext, oldEmail: string) {
  const text = `✏️ *Edit Student*\n\nCurrent email: \`${oldEmail}\`\n\nEnter the new email address:\n\nType /cancel to cancel.`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🔙 Back", "student_list")],
  ]).resize();

  await editOrReplaceMessage(ctx, text, keyboard);

  if (ctx.session) {
    ctx.session.editingStudentEmail = oldEmail;
  }
}
