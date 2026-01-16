import { Markup } from "telegraf";
import { BotContext } from "./types.js";
import {
  getAllStudents,
  deleteStudent,
  updateStudentEmail,
} from "./supabase.js";
import {
  editOrReplaceMessage,
  editOrReplaceMessagePlain,
  escapeMarkdown,
} from "./utils.js";

export async function showMainMenu(ctx: BotContext) {
  const text = "🤖 *Multi-level Writing AI*\n\nSelect an option:";

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("📋 Student List", "student_list")],
  ]);

  await editOrReplaceMessage(ctx, text, keyboard);

  if (ctx.session) {
    ctx.session.currentMenu = "main";
  }
}

const MAX_MESSAGE_LENGTH = 3500; // Leave some buffer below Telegram's 4096 limit
const STUDENTS_PER_PAGE_ESTIMATE = 50; // Rough estimate for initial calculation

export async function showStudentList(ctx: BotContext, page: number = 0) {
  try {
    const students = await getAllStudents();

    if (students.length === 0) {
      const text = "📋 Student List\n\nNo students found.";
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("➕ Add Student", "add_student")],
        [Markup.button.callback("🔙 Back to Main Menu", "main_menu")],
      ]);
      await editOrReplaceMessagePlain(ctx, text, keyboard);
      if (ctx.session) {
        ctx.session.currentMenu = "studentList";
        ctx.session.studentListPage = 0;
      }
      return;
    }

    // Calculate how many students fit per page by building a test message
    const baseHeader = "📋 Student List\n\nTotal: X students\nPage X of X\n\n";
    const baseHeaderLength = baseHeader.length;
    const availableLength = MAX_MESSAGE_LENGTH - baseHeaderLength;

    // Calculate students per page by testing with actual data
    let studentsPerPage = 0;
    let testLength = 0;
    for (let i = 0; i < students.length; i++) {
      // Estimate line length: "123. email@example.com\n" (roughly 25-60 chars)
      const line = `${i + 1}. ${students[i].email}\n`;
      if (testLength + line.length > availableLength) {
        break;
      }
      testLength += line.length;
      studentsPerPage++;
    }

    // Ensure at least 1 student per page
    if (studentsPerPage === 0 && students.length > 0) {
      studentsPerPage = 1;
    }

    const totalPages = Math.ceil(students.length / studentsPerPage);
    const currentPage = Math.max(0, Math.min(page, totalPages - 1));
    const startIndex = currentPage * studentsPerPage;
    const endIndex = Math.min(startIndex + studentsPerPage, students.length);
    const pageStudents = students.slice(startIndex, endIndex);

    // Build the message
    let text = `📋 Student List\n\n`;
    text += `Total: ${students.length} student${
      students.length !== 1 ? "s" : ""
    }\n`;
    if (totalPages > 1) {
      text += `Page ${currentPage + 1} of ${totalPages}\n`;
    }
    text += `\n`;

    pageStudents.forEach((student, index) => {
      const globalIndex = startIndex + index + 1;
      text += `${globalIndex}. ${student.email}\n`;
    });

    // Build keyboard with pagination
    const keyboardRows: any[] = [];

    // Pagination buttons (only if more than one page)
    if (totalPages > 1) {
      const paginationRow = [];
      if (currentPage > 0) {
        paginationRow.push(
          Markup.button.callback(
            "◀️ Previous",
            `student_list_page_${currentPage - 1}`
          )
        );
      }
      if (currentPage < totalPages - 1) {
        paginationRow.push(
          Markup.button.callback(
            "Next ▶️",
            `student_list_page_${currentPage + 1}`
          )
        );
      }
      if (paginationRow.length > 0) {
        keyboardRows.push(paginationRow);
      }
    }

    // Action buttons
    keyboardRows.push([
      Markup.button.callback("➕ Add Student", "add_student"),
    ]);
    keyboardRows.push([
      Markup.button.callback("✏️ Edit Student", "edit_student"),
      Markup.button.callback("🗑️ Delete Student", "delete_student"),
    ]);
    keyboardRows.push([
      Markup.button.callback("🔙 Back to Main Menu", "main_menu"),
    ]);

    const keyboard = Markup.inlineKeyboard(keyboardRows);

    // Use plain text mode so emails display normally without escaping
    await editOrReplaceMessagePlain(ctx, text, keyboard);

    if (ctx.session) {
      ctx.session.currentMenu = "studentList";
      ctx.session.studentListPage = currentPage;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch students";
    const errorText = `❌ Error: ${escapeMarkdown(errorMessage)}`;
    await editOrReplaceMessage(ctx, errorText);
  }
}

export async function showAddStudentPrompt(ctx: BotContext) {
  const text =
    "➕ *Add Student*\n\nEnter email address\\(es\\):\n\n" +
    "• For single student: Enter one email\n" +
    "• For bulk: Enter multiple emails separated by commas\n\n" +
    "Example: `student1@example\\.com, student2@example\\.com`\n\n" +
    "Type /cancel to cancel.";

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🔙 Back", "student_list")],
  ]);

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
  ]);

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
  ]);

  await editOrReplaceMessage(ctx, text, keyboard);

  if (ctx.session) {
    ctx.session.currentMenu = "deleteStudent";
  }
}

export async function showNewEmailPrompt(ctx: BotContext, oldEmail: string) {
  const text = `✏️ *Edit Student*\n\nCurrent email: \`${escapeMarkdown(
    oldEmail
  )}\`\n\nEnter the new email address:\n\nType /cancel to cancel.`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🔙 Back", "student_list")],
  ]);

  await editOrReplaceMessage(ctx, text, keyboard);

  if (ctx.session) {
    ctx.session.editingStudentEmail = oldEmail;
  }
}
