// templateService.ts
// Service for managing question paper templates

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface TemplateSection {
  sectionName: string;
  sectionType: string;
  questionsType: string;
  totalQuestions: string;
  questionsToAnswer: string;
  marksPerQuestion: string;
  customInstruction: string;
}

export interface TemplateData {
  templateName: string;
  instituteName: string;
  courseName: string;
  courseCode: string;
  duration: string;
  examDate: string;
  examTime: {
    hour: string;
    minute: string;
    period: string;
  };
  sections: TemplateSection[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  duration: string;
  maxMarks: string;
  lastModified: string;
  institute_type?: string;
  institute_name?: string;
  evaluation_type?: string;
  duration_minutes?: number;
  sections?: any[];
}

export interface QuestionPaper {
  id: string;
  name: string;
  subject: string;
  grade: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const templateService = {
  async createTemplate(templateData: TemplateData) {
    try {
      console.log('Creating template with data:', templateData);
      
      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Template created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  async getTemplates() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        method: 'GET',
        headers: {
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Templates fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  async getTemplate(templateId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
        method: 'GET',
        headers: {
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  async updateTemplate(templateId: string, templateData: TemplateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  async deleteTemplate(templateId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Question Paper management methods
  async generateQuestions(
    templateId: string,
    subject: string,
    grade: string,
    additionalInstructions: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('template_id', templateId);
      formData.append('subject', subject);
      formData.append('grade', grade);
      formData.append('additional_instructions', additionalInstructions);

      const response = await fetch(`${API_BASE_URL}/generate-questions`, {
        method: 'POST',
        headers: {
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to generate questions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  },

  async getQuestionPapers(): Promise<{ questionPapers: QuestionPaper[]; count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/question-papers`, {
        method: 'GET',
        headers: {
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to get question papers: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting question papers:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  // Auth test
  async authTest(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth-test`, {
        method: 'GET',
        headers: {
        },
      });

      if (!response.ok) {
        throw new Error(`Auth test failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Auth test error:', error);
      throw error;
    }
  },

  // Utility methods for formatting data
  formatTemplateForUI(template: any): Template {
    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      duration: template.duration || `${template.duration_minutes} Minutes`,
      maxMarks: template.maxMarks || '0 Max Marks',
      lastModified: template.lastModified || template.updated_at,
      institute_type: template.institute_type,
      institute_name: template.institute_name,
      evaluation_type: template.evaluation_type,
      duration_minutes: template.duration_minutes,
      sections: template.sections || []
    };
  },

  formatTemplateForAPI(templateData: any): any {
    return {
      name: templateData.name,
      description: templateData.description,
      institute: templateData.institute,
      evaluation: templateData.evaluation,
      duration: parseInt(templateData.duration),
      sections: templateData.sections.map((section: any) => ({
        section_name: section.name,
        sectionType: section.sectionType,
        questionType: section.questionType,
        totalQuestions: parseInt(section.totalQuestions),
        questionsToAnswer: parseInt(section.questionsToAnswer),
        marksPerQuestion: parseInt(section.marksPerQuestion),
        customInstruction: section.customInstruction || ''
      }))
    };
  }
};
