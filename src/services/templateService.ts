/**
 * Template Service - Backend Integration
 * Connects to FastAPI backend for template management.
 */

import { getApiUrl } from '../config/api';

// export interface TemplateSection {  // Commented out for now
//   sectionName: string;
//   sectionType: string;
//   questionType: string;
//   totalQuestions: number;
//   questionsToAnswer: number;
//   marksPerQuestion: number;
//   totalMarks: number;
//   customInstruction: string;
// }

export interface TemplateData {
  templateName: string;
  instituteName: string;
  duration: number;
  examDate: string;
  examTime: {
    hour: string;
    minute: string;
    period: string;
  };
  totalQuestions: number;  // e.g., 75
  totalMarks: number;  // e.g., 300
  // sections: TemplateSection[];  // Commented out for now
}

export interface Template {
  id: string;
  templateName: string;
  instituteName: string;
  duration: number;
  examDate: string;
  examTime: {
    hour: string;
    minute: string;
    period: string;
  };
  totalQuestions: number;
  totalMarks: number;
  // sections: TemplateSection[];  // Commented out for now
  createdAt: string;
  // Legacy fields for compatibility
  name?: string;
  description?: string;
  duration_minutes?: number;
  lastModified?: string;
  institute_name?: string;
  sections?: any[];  // Keep for backward compatibility
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Get headers with authentication
 */
const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const templateService = {
  async createTemplate(templateData: TemplateData) {
    const response = await fetch(getApiUrl('/api/templates'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create template' }));
      throw new Error(error.detail || 'Failed to create template');
    }

    const data = await response.json();
    return {
      id: data.id,
      ...data,
      // Legacy compatibility
      name: data.templateName,
      duration_minutes: data.duration,
      lastModified: data.createdAt,
      institute_name: data.instituteName,
    };
  },

  async getTemplates(): Promise<Template[]> {
    const response = await fetch(getApiUrl('/api/templates'), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch templates' }));
      throw new Error(error.detail || 'Failed to fetch templates');
    }

    const data = await response.json();
    return data.map((template: any) => ({
      ...template,
      // Legacy compatibility
      name: template.templateName,
      duration_minutes: template.duration,
      lastModified: template.createdAt,
      institute_name: template.instituteName,
    }));
  },

  async getTemplate(templateId: string): Promise<Template> {
    const response = await fetch(getApiUrl(`/api/templates/${templateId}`), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Template not found' }));
      throw new Error(error.detail || 'Template not found');
    }

    const data = await response.json();
    return {
      ...data,
      // Legacy compatibility
      name: data.templateName,
      duration_minutes: data.duration,
      lastModified: data.createdAt,
      institute_name: data.instituteName,
    };
  },

  async updateTemplate(templateId: string, templateData: TemplateData) {
    const response = await fetch(getApiUrl(`/api/templates/${templateId}`), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update template' }));
      throw new Error(error.detail || 'Failed to update template');
    }

    const data = await response.json();
    return {
      ...data,
      // Legacy compatibility
      name: data.templateName,
      duration_minutes: data.duration,
      lastModified: data.createdAt,
      institute_name: data.instituteName,
    };
  },

  async deleteTemplate(templateId: string) {
    const response = await fetch(getApiUrl(`/api/templates/${templateId}`), {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete template' }));
      throw new Error(error.detail || 'Failed to delete template');
    }

    return { message: 'Template deleted successfully' };
  },

  // Legacy methods for compatibility
  async generateQuestions(
    templateId: string,
    subject: string,
    grade: string,
    additionalInstructions: string
  ): Promise<any> {
    // This method is kept for compatibility but may need to be implemented separately
    throw new Error('Question generation not yet implemented');
  },

  async getQuestionPapers(): Promise<{ questionPapers: any[]; count: number }> {
    // This method is kept for compatibility but may need to be implemented separately
    return {
      questionPapers: [],
      count: 0
    };
  },

  async healthCheck(): Promise<any> {
    return { status: 'healthy' };
  },

  async authTest(): Promise<any> {
    return { authenticated: true };
  },

  // Utility methods for formatting data
  formatTemplateForUI(template: any): Template {
    return {
      id: template.id,
      templateName: template.templateName || template.name,
      instituteName: template.instituteName || template.institute_name,
      duration: template.duration || template.duration_minutes,
      examDate: template.examDate,
      examTime: template.examTime,
      sections: template.sections || [],
      createdAt: template.createdAt || template.lastModified,
      // Legacy fields
      name: template.templateName || template.name,
      description: template.description || '',
      duration_minutes: template.duration || template.duration_minutes,
      lastModified: template.createdAt || template.lastModified,
      institute_name: template.instituteName || template.institute_name,
    };
  },

  formatTemplateForAPI(templateData: any): any {
    return {
      templateName: templateData.templateName || templateData.name,
      instituteName: templateData.instituteName || templateData.institute_name,
      duration: templateData.duration || templateData.duration_minutes,
      examDate: templateData.examDate,
      examTime: templateData.examTime,
      sections: (templateData.sections || []).map((section: any) => ({
        sectionName: section.sectionName || section.section_name || section.name,
        sectionType: section.sectionType || section.section_type,
        questionType: section.questionType || section.question_type || section.questionsType,
        totalQuestions: section.totalQuestions || section.total_questions,
        questionsToAnswer: section.questionsToAnswer || section.questions_to_answer,
        marksPerQuestion: section.marksPerQuestion || section.marks_per_question,
        totalMarks: section.totalMarks || (section.questionsToAnswer || section.questions_to_answer) * (section.marksPerQuestion || section.marks_per_question),
        customInstruction: section.customInstruction || section.custom_instruction || ''
      }))
    };
  }
};
