import { API_BASE_URL, getApiUrl } from '../config/api';

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
  question_paper_id: string;
}

export interface QuestionPaper {
  id: string;
  user_id: string;
  template_id: string;
  name: string;
  syllabus: string;
  additional_instructions?: string;
  created_at: string;
  updated_at: string;
  btl_levels: string[];
  questions: any[];
  has_questions: boolean;
}

export interface GenerationResult {
  success: boolean;
  question_paper_id: string;
  questions: Array<{
    section_number: number;
    section_name: string;
    content: string;
    raw_content: string;
  }>;
  template_name: string;
}

class QuestionPaperService {
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    console.log(`[QuestionPaperService] ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[QuestionPaperService] Error ${response.status}:`, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log(`[QuestionPaperService] Success:`, data);
      return data;
    } catch (error) {
      console.error(`[QuestionPaperService] Request failed:`, error);
      throw error;
    }
  }

  // Create a new question paper
  async createQuestionPaper(questionPaperData: QuestionPaperCreate): Promise<{ id: string; message: string }> {
    return this.request('/api/question-papers', {
      method: 'POST',
      body: JSON.stringify(questionPaperData),
    });
  }

  // Get all question papers for user
  async getQuestionPapers(): Promise<{ question_papers: QuestionPaper[] }> {
    return this.request('/api/question-papers', {
      method: 'GET',
    });
  }

  // Get a specific question paper
  async getQuestionPaper(questionPaperId: string): Promise<QuestionPaper> {
    return this.request(`/api/question-papers/${questionPaperId}`, {
      method: 'GET',
    });
  }

  // Get just the questions for a question paper
  async getQuestionPaperQuestions(questionPaperId: string): Promise<{ questions: any[]; questions_count: number }> {
    return this.request(`/api/question-papers/${questionPaperId}/questions`, {
      method: 'GET',
    });
  }

  // Generate questions for a question paper
  async generateQuestions(request: GenerateQuestionsRequest): Promise<GenerationResult> {
    return this.request('/api/question-papers/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Upload syllabus file
  async uploadSyllabus(file: File): Promise<{ syllabus: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/api/syllabus/upload`;
    
    console.log(`[QuestionPaperService] POST ${url} - Uploading file:`, file.name);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[QuestionPaperService] Upload Error ${response.status}:`, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log(`[QuestionPaperService] Upload Success:`, data);
      return data;
    } catch (error) {
      console.error(`[QuestionPaperService] Upload failed:`, error);
      throw error;
    }
  }

  // Delete a question paper
  async deleteQuestionPaper(questionPaperId: string): Promise<{ message: string }> {
    return this.request(`/api/question-papers/${questionPaperId}`, {
      method: 'DELETE',
    });
  }

  // Get a specific question paper with full details including template
  async getQuestionPaperDetails(questionPaperId: string): Promise<any> {
    return this.request(`/api/question-papers/${questionPaperId}`, {
      method: 'GET',
    });
  }

  // Add method to get question paper details with automatic routing
  async getQuestionPaperDetailsWithRouting(paperId: string, paperType: string) {
    if (paperType === 'generated') {
      // Use generated papers endpoint
      const response = await fetch(getApiUrl(`/api/generated-papers/${paperId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch generated paper`);
      }
      
      return await response.json();
    } else {
      // Use existing question papers endpoint
      return await questionPaperService.getQuestionPaperDetails(paperId);
    }
  }

  // Update questions for a question paper (for editing)
  async updateQuestionPaperQuestions(questionPaperId: string, questions: any[]): Promise<any> {
    return this.request(`/api/question-papers/${questionPaperId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questions }),
    });
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
    
    if (!data.btl_levels || data.btl_levels.length === 0) {
      errors.push('At least one BTL level must be selected');
    }
    
    return errors;
  }
}

export const questionPaperService = new QuestionPaperService();
