import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface KeySheet {
  id: string;
  filename: string;
  pdf_url: string;
  uploaded_at: string;
}

export interface KeyMetadata {
  id: string;
  key_sheet_id: string;
  subject_name: string;
  total_questions: number;
  total_score: number;
  grade_system: string;
  created_at: string;
}

export interface StudentScript {
  id: string;
  key_sheet_id: string;
  student_id: string;
  filename: string;
  pdf_url: string;
  uploaded_at: string;
}

export interface EvaluationResult {
  id: string;
  student_script_id: string;
  score: number;
  grade: string;
  feedback: string;
  evaluated_at: string;
}

// Combined types for queries
export interface StudentScriptWithResult extends StudentScript {
  evaluation_results?: EvaluationResult[];
}

export interface EvaluationSummary {
  student_script: StudentScript;
  evaluation_result: EvaluationResult;
  key_metadata: KeyMetadata;
}