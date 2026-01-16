import { Context } from "telegraf";

export interface SessionData {
  isAuthenticated: boolean;
  currentMenu?:
    | "main"
    | "studentList"
    | "addStudent"
    | "editStudent"
    | "deleteStudent";
  editingStudentEmail?: string;
  lastMessageId?: number;
  studentListPage?: number; // Current page for student list pagination
}

export type BotContext = Context & {
  session?: SessionData;
};
