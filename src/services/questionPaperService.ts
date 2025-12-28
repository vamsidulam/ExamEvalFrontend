/**
 * Question Paper Service - Backend Integration
 * Connects to FastAPI backend for question paper management.
 */

import { getApiUrl } from '../config/api';

export interface BTLLevel {
  btl_level_name: string;
}

export interface QuestionPaperCreate {
  template_id: string;
  name: string;
  syllabus: string;
  additional_instructions?: string;
  btl_levels: BTLLevel[];
}

export interface GenerateQuestionsRequest {
  templateId: string;
  templateName: string;
  syllabus: string;
  additionalInstructions?: string;
  numQuestions: number;
  level?: string;
}

export interface QuestionPaper {
  id: string;
  userId: string;
  templateId: string;
  templateName: string;
  name: string;
  questions: any[];
  totalMarks: number;
  createdAt: string;
  updatedAt?: string;
  // Legacy fields for compatibility
  user_id?: string;
  template_id?: string;
  syllabus?: string;
  additional_instructions?: string;
  created_at?: string;
  updated_at?: string;
  btl_levels?: string[];
  has_questions?: boolean;
}

export interface GenerationResult {
  success: boolean;
  id: string;
  question_paper_id: string;
  questions: Array<{
    question_number: number;
    section_number: number;
    section_name: string;
    question_text: string;
    question_type: string;
    marks: number;
  }>;
  template_name: string;
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

/**
 * Get headers for file upload with authentication
 */
const getFormHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

class QuestionPaperService {
  // Analyze syllabus from file or text
  async analyzeSyllabus(
    file?: File,
    text?: string,
    additionalInstructions?: string
  ): Promise<{ analyzed_syllabus: string; syllabus_length: number }> {
    const formData = new FormData();
    
    if (file) {
      formData.append('file', file);
    }
    if (text) {
      formData.append('text', text);
    }
    if (additionalInstructions) {
      formData.append('additional_instructions', additionalInstructions);
    }
    
    const response = await fetch(getApiUrl('/api/question-papers/analyze-syllabus'), {
      method: 'POST',
      headers: getFormHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to analyze syllabus' }));
      throw new Error(error.detail || 'Failed to analyze syllabus');
    }

    return await response.json();
  }

  // Upload syllabus file (legacy method - now uses analyzeSyllabus)
  async uploadSyllabus(file: File): Promise<{ syllabus: string; filename: string }> {
    const result = await this.analyzeSyllabus(file);
    return {
      syllabus: result.analyzed_syllabus,
      filename: file.name
    };
  }

  // Generate questions and create question paper
  async generateQuestions(request: GenerateQuestionsRequest): Promise<GenerationResult> {
    const response = await fetch(getApiUrl('/api/question-papers/generate'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        templateId: request.templateId,
        templateName: request.templateName,
        syllabus: request.syllabus,
        additionalInstructions: request.additionalInstructions || '',
        numQuestions: request.numQuestions,
        level: request.level || 'hard'
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to generate questions' }));
      const errorMessage = error.detail || error.message || JSON.stringify(error);
      throw new Error(`Question generation failed: ${errorMessage}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      id: data.id,
      question_paper_id: data.id,
      questions: data.questions.map((q: any) => ({
        question_number: q.question_number,
        section_number: q.section_number,
        section_name: q.section_name,
        question_text: q.question_text,
        question_type: q.question_type,
        marks: q.marks
      })),
      template_name: data.templateName
    };
  }

  // Create a new question paper (legacy - now handled by generateQuestions)
  async createQuestionPaper(questionPaperData: QuestionPaperCreate): Promise<{ id: string; message: string }> {
    // This is now handled by generateQuestions
    throw new Error('Use generateQuestions instead of createQuestionPaper');
  }

  // Get all question papers for user
  async getQuestionPapers(): Promise<{ question_papers: QuestionPaper[] }> {
    const response = await fetch(getApiUrl('/api/question-papers'), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch question papers' }));
      throw new Error(error.detail || 'Failed to fetch question papers');
    }

    const data = await response.json();
    return {
      question_papers: data.map((qp: any) => ({
        ...qp,
        // Legacy compatibility
        user_id: qp.userId,
        template_id: qp.templateId,
        created_at: qp.createdAt,
        updated_at: qp.updatedAt,
        has_questions: qp.questions && qp.questions.length > 0
      }))
    };
  }

  // Get a specific question paper
  async getQuestionPaper(questionPaperId: string): Promise<QuestionPaper> {
    const response = await fetch(getApiUrl(`/api/question-papers/${questionPaperId}`), {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Question paper not found' }));
      throw new Error(error.detail || 'Question paper not found');
    }

    const data = await response.json();
    return {
      ...data,
      // Legacy compatibility
      user_id: data.userId,
      template_id: data.templateId,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      has_questions: data.questions && data.questions.length > 0
    };
  }

  // Get just the questions for a question paper
  async getQuestionPaperQuestions(questionPaperId: string): Promise<{ questions: any[]; questions_count: number }> {
    const paper = await this.getQuestionPaper(questionPaperId);
    return {
      questions: paper.questions || [],
      questions_count: paper.questions?.length || 0
    };
  }

  // Delete a question paper
  async deleteQuestionPaper(questionPaperId: string): Promise<{ message: string }> {
    const response = await fetch(getApiUrl(`/api/question-papers/${questionPaperId}`), {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete question paper' }));
      throw new Error(error.detail || 'Failed to delete question paper');
    }

    return { message: 'Question paper deleted successfully' };
  }

  // Get a specific question paper with full details including template
  async getQuestionPaperDetails(questionPaperId: string): Promise<any> {
    return await this.getQuestionPaper(questionPaperId);
  }

  // Add method to get question paper details with automatic routing
  async getQuestionPaperDetailsWithRouting(paperId: string, paperType: string) {
    return await this.getQuestionPaper(paperId);
  }

  // Update questions for a question paper (for editing)
  async updateQuestionPaperQuestions(questionPaperId: string, questions: any[]): Promise<any> {
    const response = await fetch(getApiUrl(`/api/question-papers/${questionPaperId}`), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ questions }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update questions' }));
      throw new Error(error.detail || 'Failed to update questions');
    }

    const data = await response.json();
    return {
      ...data,
      // Legacy compatibility
      user_id: data.userId,
      template_id: data.templateId,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      has_questions: data.questions && data.questions.length > 0
    };
  }

  // Utility method to format BTL levels for API
  formatBTLLevels(btlLevels: Record<string, { enabled: boolean; percentage: number }>): BTLLevel[] {
    return Object.entries(btlLevels)
      .filter(([_, level]) => level.enabled)
      .map(([key, _]) => ({
        btl_level_name: key.charAt(0).toUpperCase() + key.slice(1)
      }));
  }

  // Utility method to validate question paper data
  validateQuestionPaperData(data: Partial<QuestionPaperCreate>): string[] {
    const errors: string[] = [];
    
    if (!data.template_id) {
      errors.push('Template selection is required');
    }
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Question paper name is required');
    }
    
    if (!data.syllabus || data.syllabus.trim().length < 10) {
      errors.push('Syllabus content is required (minimum 10 characters)');
    }
    
    return errors;
  }
}

export const questionPaperService = new QuestionPaperService();
