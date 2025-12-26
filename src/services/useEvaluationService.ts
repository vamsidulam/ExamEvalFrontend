import { useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

export const useEvaluationService = () => {

  // Upload key sheet file
  const uploadKeySheetFile = useCallback(async (file: File): Promise<string> => {
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
  }, []);

  // Set metadata
  const setKeyMetadata = useCallback(async (data: {
    keySheetId: string;
    subjectName: string;
    totalQuestions: number;
    totalScore: number;
    gradeSystem: string;
  }): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('key_sheet_id', data.keySheetId);
      formData.append('subject_name', data.subjectName);
      formData.append('total_questions', data.totalQuestions.toString());
      formData.append('total_score', data.totalScore.toString());
      formData.append('grade_system', data.gradeSystem);

      const response = await fetch(`${API_BASE_URL}/set-metadata`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to set metadata');
      }
    } catch (error) {
      console.error('Error setting metadata:', error);
      throw error;
    }
  }, []);

  // Upload student scripts
  const uploadStudentScripts = useCallback(async (files: File[], keySheetId: string): Promise<void> => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('key_sheet_id', keySheetId);

      const response = await fetch(`${API_BASE_URL}/upload-students`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload student scripts');
      }
    } catch (error) {
      console.error('Error uploading student scripts:', error);
      throw error;
    }
  }, []);

  // Start evaluation
  const startEvaluation = useCallback(async (keySheetId: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('key_sheet_id', keySheetId);

      const response = await fetch(`${API_BASE_URL}/start-evaluation`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to start evaluation');
      }

      return response.json();
    } catch (error) {
      console.error('Error starting evaluation:', error);
      throw error;
    }
  }, []);

  // Get results
  const getResults = useCallback(async (keySheetId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-results?key_sheet_id=${keySheetId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get results');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting results:', error);
      throw error;
    }
  }, []);

  // Get student sheet
  const getStudentSheet = useCallback(async (studentId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-student-sheet/${studentId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get student sheet');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting student sheet:', error);
      throw error;
    }
  }, []);

  // Get user dashboard stats
  const getUserStats = useCallback(async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-stats`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get user stats');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }, []);

  // Get user's key sheets
  const getUserKeySheets = useCallback(async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-key-sheets`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get user key sheets');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting user key sheets:', error);
      throw error;
    }
  }, []);

  // Get user's evaluation results
  const getUserResults = useCallback(async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-results`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get user results');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting user results:', error);
      throw error;
    }
  }, []);

  return {
    uploadKeySheetFile,
    setKeyMetadata,
    uploadStudentScripts,
    startEvaluation,
    getResults,
    getStudentSheet,
    getUserStats,
    getUserKeySheets,
    getUserResults,
  };
};

export default useEvaluationService;
