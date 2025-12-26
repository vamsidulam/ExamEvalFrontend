import { supabase } from '../lib/supabase';
import type { KeySheet, KeyMetadata, StudentScript, EvaluationResult } from '../lib/supabase';
import { API_BASE_URL } from '../config/api';

export class EvaluationService {
  // Step 1a: Upload key sheet file only (no metadata yet)
  static async uploadKeySheetFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${API_BASE_URL}/upload-key`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload key sheet');
      }

      const uploadResult = await uploadResponse.json();
      return uploadResult.key_id;
    } catch (error) {
      console.error('Error uploading key sheet file:', error);
      throw error;
    }
  }

  // Step 1b: Set metadata for an already uploaded key sheet
  static async setKeySheetMetadata(keySheetId: string, metadata: {
    subject_name: string;
    total_questions: number;
    total_score: number;
    grade_system?: string;
  }): Promise<{ keySheet: KeySheet; keyMetadata: KeyMetadata }> {
    try {
      // Set metadata using backend
      const metadataResponse = await fetch(`${API_BASE_URL}/set-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          subject_name: metadata.subject_name,
          total_questions: metadata.total_questions.toString(),
          total_score: metadata.total_score.toString(),
          grade_system: metadata.grade_system || 'A/B/C',
          key_sheet_id: keySheetId,
        }),
      });

      if (!metadataResponse.ok) {
        const errorText = await metadataResponse.text();
        throw new Error(`Failed to set metadata: ${metadataResponse.status} - ${errorText}`);
      }

      const metadataResult = await metadataResponse.json();
      console.log('Metadata set successfully:', metadataResult);

      // Return mock data structure to maintain interface compatibility
      // The actual data is in the backend database, no need to fetch from Supabase
      return {
        keySheet: {
          id: keySheetId,
          filename: '', // Will be filled by backend
          pdf_url: '',  // Will be filled by backend
          uploaded_at: new Date().toISOString()
        } as KeySheet,
        keyMetadata: {
          id: '', // Backend handles the ID
          key_sheet_id: keySheetId,
          subject_name: metadata.subject_name,
          total_questions: metadata.total_questions,
          total_score: metadata.total_score,
          grade_system: metadata.grade_system || 'A/B/C',
          created_at: new Date().toISOString()
        } as KeyMetadata
      };
    } catch (error) {
      console.error('Error setting key sheet metadata:', error);
      throw error;
    }
  }

  // Step 1: Upload key answer sheet using Python backend (original combined method)
  static async uploadKeySheet(file: File, metadata: {
    subject_name: string;
    total_questions: number;
    total_score: number;
    grade_system?: string;
  }): Promise<{ keySheet: KeySheet; keyMetadata: KeyMetadata }> {
    try {
      // Step 1: Upload key sheet to backend
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${API_BASE_URL}/upload-key`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload key sheet');
      }

      const uploadResult = await uploadResponse.json();
      const keySheetId = uploadResult.key_id;

      // Step 2: Set metadata using backend
      const metadataResponse = await fetch(`${API_BASE_URL}/set-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          subject_name: metadata.subject_name,
          total_questions: metadata.total_questions.toString(),
          total_score: metadata.total_score.toString(),
          grade_system: metadata.grade_system || 'A/B/C',
          key_sheet_id: keySheetId,
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to set metadata');
      }

      await metadataResponse.json();

      // Return mock data structure to maintain interface compatibility
      // The actual data is in the backend database, no need to fetch from Supabase
      return {
        keySheet: {
          id: keySheetId,
          filename: file.name,
          pdf_url: '',  // Will be filled by backend
          uploaded_at: new Date().toISOString()
        } as KeySheet,
        keyMetadata: {
          id: '', // Backend handles the ID
          key_sheet_id: keySheetId,
          subject_name: metadata.subject_name,
          total_questions: metadata.total_questions,
          total_score: metadata.total_score,
          grade_system: metadata.grade_system || 'A/B/C',
          created_at: new Date().toISOString()
        } as KeyMetadata
      };
    } catch (error) {
      console.error('Error uploading key sheet:', error);
      throw error;
    }
  }

  // Step 2a: Upload individual student files immediately (for Step 3 UI)
  static async uploadStudentFile(
    keySheetId: string,
    file: File,
    studentId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      
      // Add key_sheet_id to form data (required by backend)
      formData.append('key_sheet_id', keySheetId);
      
      // Rename file to include student ID
      const renamedFile = new File([file], `${studentId}.${file.name.split('.').pop()}`, {
        type: file.type
      });
      formData.append('files', renamedFile);

      const response = await fetch(`${API_BASE_URL}/upload-students`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload student file');
      }

      const result = await response.json();
      console.log('Student file uploaded successfully:', result);

      return {
        success: true,
        message: 'Student file uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading student file:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Step 2: Upload student answer sheets using Python backend (batch upload for evaluation)
  static async uploadStudentScripts(
    keySheetId: string,
    files: { file: File; studentId: string }[]
  ): Promise<StudentScript[]> {
    try {
      const formData = new FormData();
      
      // Add key_sheet_id to form data (required by backend)
      formData.append('key_sheet_id', keySheetId);
      
      // Add all files to form data
      files.forEach(({ file, studentId }) => {
        // Rename file to include student ID
        const renamedFile = new File([file], `${studentId}.${file.name.split('.').pop()}`, {
          type: file.type
        });
        formData.append('files', renamedFile);
      });

      const response = await fetch(`${API_BASE_URL}/upload-students`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload student scripts');
      }

      const result = await response.json();
      console.log('Student scripts uploaded successfully:', result);

      // Return mock data structure to maintain interface compatibility
      // The actual data is in the backend database, no need to fetch from Supabase
      return files.map((fileData, index) => ({
        id: `student_${index}_${Date.now()}`, // Mock ID
        key_sheet_id: keySheetId,
        student_id: fileData.studentId,
        filename: fileData.file.name,
        pdf_url: '', // Will be filled by backend
        uploaded_at: new Date().toISOString()
      } as StudentScript));
    } catch (error) {
      console.error('Error uploading student scripts:', error);
      throw error;
    }
  }

  // Step 3: Start evaluation process using Python backend
  static async evaluateStudentScripts(keySheetId: string): Promise<EvaluationResult[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/start-evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          key_sheet_id: keySheetId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start evaluation');
      }

      const result = await response.json();
      console.log('Evaluation started successfully:', result);

      // Return mock data structure to maintain interface compatibility
      // The actual evaluation happens on the backend
      return [] as EvaluationResult[];
    } catch (error) {
      console.error('Error evaluating student scripts:', error);
      throw error;
    }
  }

  // Step 4: Get evaluation results from backend
  static async getEvaluationResults(keySheetId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/get-results?key_sheet_id=${keySheetId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get evaluation results');
      }

      const results = await response.json();
      console.log('Evaluation results retrieved:', results);

      return results;
    } catch (error) {
      console.error('Error fetching evaluation results:', error);
      throw error;
    }
  }

  // Get comprehensive evaluation summary from backend
  static async getEvaluationSummary(keySheetId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/get-results?key_sheet_id=${keySheetId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to get evaluation summary: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Evaluation summary retrieved:', data);

      // Handle different possible response formats from backend
      let results = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data.results && Array.isArray(data.results)) {
        results = data.results;
      } else if (data.evaluations && Array.isArray(data.evaluations)) {
        results = data.evaluations;
      } else {
        console.warn('Unexpected response format:', data);
        results = [];
      }

      // Transform backend response to match frontend expectations
      const totalStudents = results.length;
      const averageScore = totalStudents > 0 
        ? results.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / totalStudents 
        : 0;
      
      // Try to get total score from various possible locations
      const totalScore = data.total_score || data.totalScore || data.max_score || 100; // fallback
      
      const highPerformers = results.filter((r: any) => {
        const score = r.score || 0;
        return (score / totalScore) >= 0.85;
      }).length;

      return {
        results,
        summary: {
          totalStudents,
          averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
          highPerformers,
          evaluatedCount: results.length
        },
        totalScore // Include for reference
      };
    } catch (error) {
      console.error('Error fetching evaluation summary:', error);
      throw error;
    }
  }

  // Get all key sheets for dashboard (kept as backup - may not be needed for main flow)
  static async getKeySheets(): Promise<(KeySheet & { key_metadata: KeyMetadata[] })[]> {
    try {
      const { data, error } = await supabase
        .from('key_sheets')
        .select(`
          *,
          key_metadata (*)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching key sheets:', error);
      throw error;
    }
  }

  // Delete key sheet and all related data (kept as backup - may not be needed for main flow)
  static async deleteKeySheet(keySheetId: string): Promise<void> {
    try {
      // Delete from database (cascading will handle related records)
      const { error } = await supabase
        .from('key_sheets')
        .delete()
        .eq('id', keySheetId);

      if (error) throw error;

      // Note: Storage files should also be cleaned up in a production app
    } catch (error) {
      console.error('Error deleting key sheet:', error);
      throw error;
    }
  }

  // Health check for backend API
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Get student sheet by student ID
  static async getStudentSheet(studentId: string): Promise<{
    student_id: string;
    filename: string;
    pdf_url: string;
    pdf_base64: string;
    uploaded_at: string;
    file_size: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/get-student-sheet/${encodeURIComponent(studentId)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch student sheet: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching student sheet:', error);
      throw error;
    }
  }
}