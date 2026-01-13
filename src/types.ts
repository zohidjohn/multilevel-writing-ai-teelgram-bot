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
}

export type BotContext = Context & {
  session?: SessionData;
};
