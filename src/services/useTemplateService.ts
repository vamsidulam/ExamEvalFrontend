// useTemplateService.ts
// React hook for template service with authentication

import { useState, useCallback } from 'react';
import { templateService, Template, TemplateCreateRequest, QuestionPaper } from './templateService';

export const useTemplateService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('API call error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Template methods
  const createTemplate = useCallback(async (templateData: TemplateCreateRequest): Promise<Template | null> => {
    return handleApiCall(async () => {
      const formattedData = templateService.formatTemplateForAPI(templateData);
      return templateService.createTemplate(formattedData);
    });
  }, [handleApiCall]);

  const getTemplates = useCallback(async (): Promise<{ templates: Template[]; count: number } | null> => {
    return handleApiCall(async () => {
      return templateService.getTemplates();
    });
  }, [handleApiCall]);

  const getTemplateById = useCallback(async (id: string): Promise<Template | null> => {
    return handleApiCall(async () => {
      return templateService.getTemplate(id);
    });
  }, [handleApiCall]);

  const updateTemplate = useCallback(async (
    id: string, 
    templateData: TemplateCreateRequest
  ): Promise<{ message: string; template_id: string } | null> => {
    return handleApiCall(async () => {
      const formattedData = templateService.formatTemplateForAPI(templateData);
      return templateService.updateTemplate(id, formattedData);
    });
  }, [handleApiCall]);

  const deleteTemplate = useCallback(async (id: string): Promise<{ message: string } | null> => {
    return handleApiCall(async () => {
      return templateService.deleteTemplate(id);
    });
  }, [handleApiCall]);

  // Question paper methods
  const generateQuestions = useCallback(async (
    templateId: string,
    subject: string,
    grade: string,
    additionalInstructions: string = ''
  ): Promise<any | null> => {
    return handleApiCall(async () => {
      return templateService.generateQuestions(templateId, subject, grade, additionalInstructions);
    });
  }, [handleApiCall]);

  const getQuestionPapers = useCallback(async (): Promise<{ questionPapers: QuestionPaper[]; count: number } | null> => {
    return handleApiCall(async () => {
      return templateService.getQuestionPapers();
    });
  }, [handleApiCall]);

  // Utility methods
  const healthCheck = useCallback(async (): Promise<any | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await templateService.healthCheck();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
      console.error('Health check error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const authTest = useCallback(async (): Promise<any | null> => {
    return handleApiCall(async () => {
      return templateService.authTest();
    });
  }, [handleApiCall]);

  return {
    // State
    loading,
    error,
    isAuthenticated: true, // Always authenticated since auth is removed

    // Template methods
    createTemplate,
    getTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,

    // Question paper methods
    generateQuestions,
    getQuestionPapers,

    // Utility methods
    healthCheck,
    authTest,

    // Utility functions
    formatTemplateForUI: templateService.formatTemplateForUI,
    formatTemplateForAPI: templateService.formatTemplateForAPI,
  };
};

export default useTemplateService;
