import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export interface AllowedUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export async function getAllStudents(): Promise<AllowedUser[]> {
  const { data, error } = await supabase
    .from("allowed_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch students: ${error.message}`);
  }

  return data || [];
}

export async function addStudent(email: string): Promise<AllowedUser> {
  const trimmedEmail = email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error(`Invalid email format: ${email}`);
  }

  const { data, error } = await supabase
    .from("allowed_users")
    .insert([{ email: trimmedEmail }])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Student with email ${trimmedEmail} already exists`);
    }
    throw new Error(`Failed to add student: ${error.message}`);
  }

  return data;
}

export async function addStudents(
  emails: string[]
): Promise<{ success: AllowedUser[]; errors: string[] }> {
  const results = { success: [] as AllowedUser[], errors: [] as string[] };

  for (const email of emails) {
    try {
      const student = await addStudent(email);
      results.success.push(student);
    } catch (error) {
      results.errors.push(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  return results;
}

export async function deleteStudent(email: string): Promise<void> {
  const trimmedEmail = email.trim().toLowerCase();

  const { error } = await supabase
    .from("allowed_users")
    .delete()
    .eq("email", trimmedEmail);

  if (error) {
    throw new Error(`Failed to delete student: ${error.message}`);
  }
}

export async function updateStudentEmail(
  oldEmail: string,
  newEmail: string
): Promise<AllowedUser> {
  const trimmedOldEmail = oldEmail.trim().toLowerCase();
  const trimmedNewEmail = newEmail.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedNewEmail)) {
    throw new Error(`Invalid email format: ${newEmail}`);
  }

  const { data, error } = await supabase
    .from("allowed_users")
    .update({ email: trimmedNewEmail })
    .eq("email", trimmedOldEmail)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Student with email ${trimmedNewEmail} already exists`);
    }
    throw new Error(`Failed to update student: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Student with email ${trimmedOldEmail} not found`);
  }

  return data;
}
