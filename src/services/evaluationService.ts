/**
 * Evaluation Service - MOCK DATA MODE
 * All backend API calls have been removed.
 * This service now uses mock data/local storage for frontend-only operation.
 */

import type { KeySheet, KeyMetadata, StudentScript, EvaluationResult } from '../types';

// Mock data storage (in a real app, this would be replaced with backend API)
const mockStorage = {
  keySheets: [] as Array<KeySheet & { key_metadata: KeyMetadata[] }>,
  studentScripts: [] as StudentScript[],
  evaluationResults: [] as EvaluationResult[],
};

export class EvaluationService {
  // Step 1a: Upload key sheet file only (no metadata yet)
  static async uploadKeySheetFile(file: File): Promise<string> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Mock: Key sheet file uploaded', { keyId, filename: file.name });
    return keyId;
  }

  // Step 1b: Set metadata for an already uploaded key sheet
  static async setKeySheetMetadata(keySheetId: string, metadata: {
    subject_name: string;
    total_questions: number;
    total_score: number;
    grade_system?: string;
  }): Promise<{ keySheet: KeySheet; keyMetadata: KeyMetadata }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const keySheet: KeySheet = {
      id: keySheetId,
      filename: `key_sheet_${keySheetId}.pdf`,
      pdf_url: '',
      uploaded_at: new Date().toISOString()
    };

    const keyMetadata: KeyMetadata = {
      id: `meta_${Date.now()}`,
      key_sheet_id: keySheetId,
      subject_name: metadata.subject_name,
      total_questions: metadata.total_questions,
      total_score: metadata.total_score,
      grade_system: metadata.grade_system || 'A/B/C',
      created_at: new Date().toISOString()
    };

    // Store in mock storage
    mockStorage.keySheets.push({
      ...keySheet,
      key_metadata: [keyMetadata]
    });

    return { keySheet, keyMetadata };
  }

  // Step 1: Upload key answer sheet (combined method)
  static async uploadKeySheet(file: File, metadata: {
    subject_name: string;
    total_questions: number;
    total_score: number;
    grade_system?: string;
  }): Promise<{ keySheet: KeySheet; keyMetadata: KeyMetadata }> {
    const keyId = await this.uploadKeySheetFile(file);
    return await this.setKeySheetMetadata(keyId, metadata);
  }

  // Step 2a: Upload individual student files immediately
  static async uploadStudentFile(
    keySheetId: string,
    file: File,
    studentId: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const studentScript: StudentScript = {
      id: `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key_sheet_id: keySheetId,
      student_id: studentId,
      filename: file.name,
      pdf_url: '',
      uploaded_at: new Date().toISOString()
    };

    mockStorage.studentScripts.push(studentScript);
    console.log('Mock: Student file uploaded', studentScript);

    return {
      success: true,
      message: 'Student file uploaded successfully (mock)'
    };
  }

  // Step 2: Upload student answer sheets (batch upload)
  static async uploadStudentScripts(
    keySheetId: string,
    files: { file: File; studentId: string }[]
  ): Promise<StudentScript[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const scripts = files.map((fileData, index) => ({
      id: `script_${Date.now()}_${index}`,
      key_sheet_id: keySheetId,
      student_id: fileData.studentId,
      filename: fileData.file.name,
      pdf_url: '',
      uploaded_at: new Date().toISOString()
    } as StudentScript));

    mockStorage.studentScripts.push(...scripts);
    console.log('Mock: Student scripts uploaded', scripts);

    return scripts;
  }

  // Step 3: Start evaluation process
  static async evaluateStudentScripts(keySheetId: string): Promise<EvaluationResult[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const scripts = mockStorage.studentScripts.filter(s => s.key_sheet_id === keySheetId);
    const keySheet = mockStorage.keySheets.find(k => k.id === keySheetId);
    const totalScore = keySheet?.key_metadata[0]?.total_score || 100;

    // Generate mock evaluation results
    const results: EvaluationResult[] = scripts.map(script => {
      const score = Math.floor(Math.random() * totalScore * 0.4 + totalScore * 0.6); // 60-100% range
      const percentage = (score / totalScore) * 100;
      
      let grade = 'F';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B';
      else if (percentage >= 70) grade = 'C';
      else if (percentage >= 60) grade = 'D';

      return {
        id: `result_${Date.now()}_${script.id}`,
        student_script_id: script.id,
        score,
        grade,
        feedback: `Mock evaluation completed. Student scored ${score}/${totalScore}.`,
        evaluated_at: new Date().toISOString()
      };
    });

    mockStorage.evaluationResults.push(...results);
    console.log('Mock: Evaluation completed', results);

    return results;
  }

  // Step 4: Get evaluation results
  static async getEvaluationResults(keySheetId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const scripts = mockStorage.studentScripts.filter(s => s.key_sheet_id === keySheetId);
    const results = mockStorage.evaluationResults.filter(r => 
      scripts.some(s => s.id === r.student_script_id)
    );

    return results;
  }

  // Get comprehensive evaluation summary
  static async getEvaluationSummary(keySheetId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const scripts = mockStorage.studentScripts.filter(s => s.key_sheet_id === keySheetId);
    const results = mockStorage.evaluationResults.filter(r => 
      scripts.some(s => s.id === r.student_script_id)
    );

    const keySheet = mockStorage.keySheets.find(k => k.id === keySheetId);
    const totalScore = keySheet?.key_metadata[0]?.total_score || 100;

    const totalStudents = results.length;
    const averageScore = totalStudents > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / totalStudents 
      : 0;
    
    const highPerformers = results.filter(r => (r.score / totalScore) >= 0.85).length;

    return {
      results,
      summary: {
        totalStudents,
        averageScore: Math.round(averageScore * 100) / 100,
        highPerformers,
        evaluatedCount: results.length
      },
      totalScore
    };
  }

  // Get all key sheets for dashboard
  static async getKeySheets(): Promise<(KeySheet & { key_metadata: KeyMetadata[] })[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStorage.keySheets;
  }

  // Delete key sheet and all related data
  static async deleteKeySheet(keySheetId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    mockStorage.keySheets = mockStorage.keySheets.filter(k => k.id !== keySheetId);
    mockStorage.studentScripts = mockStorage.studentScripts.filter(s => s.key_sheet_id !== keySheetId);
    mockStorage.evaluationResults = mockStorage.evaluationResults.filter(r => {
      const script = mockStorage.studentScripts.find(s => s.id === r.student_script_id);
      return script && script.key_sheet_id !== keySheetId;
    });

    console.log('Mock: Key sheet deleted', keySheetId);
  }

  // Health check for backend API (always returns true in mock mode)
  static async checkBackendHealth(): Promise<boolean> {
    return true; // Mock mode - always healthy
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
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const script = mockStorage.studentScripts.find(s => s.student_id === studentId);
    
    if (!script) {
      throw new Error(`Student sheet not found for student ID: ${studentId}`);
    }

    return {
      student_id: script.student_id,
      filename: script.filename,
      pdf_url: script.pdf_url,
      pdf_base64: '', // Mock - no actual PDF data
      uploaded_at: script.uploaded_at,
      file_size: 0 // Mock
    };
  }
}
