import React, { useState, useEffect } from 'react';
import { templateService } from '../services/templateService';
import { questionPaperService } from '../services/questionPaperService';
import QuestionPaper from './QuestionPaper';
import QuestionPaperPreview from '../components/QuestionPaperPreview';
import { getApiUrl } from '../config/api';
import {
  FileText,
  Edit3,
  RefreshCw,
  Plus,
  Layout,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  X
} from 'lucide-react';

const QuestionGeneration = () => {
  const [activeTab, setActiveTab] = useState<'papers' | 'templates'>('papers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplateCreation, setShowTemplateCreation] = useState(false);
  const [showQuestionPaperGeneration, setShowQuestionPaperGeneration] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  
  // Template form data
  const [templateData, setTemplateData] = useState({
    templateName: '',
    instituteName: '',
    courseName: '',
    courseCode: '',
    duration: '',
    examDate: '',
    examTime: {
      hour: '',
      minute: '',
      period: 'AM'
    },
    sections: [
      {
        id: 1,
        sectionName: '',
        sectionType: 'Answer All Questions',
        questionsType: 'Select Question Type',
        totalQuestions: '',
        questionsToAnswer: '',
        marksPerQuestion: '',
        customInstruction: ''
      }
    ]
  });
  
  const [generatedTemplates, setGeneratedTemplates] = useState<any[]>([]);
  const [questionPapers, setQuestionPapers] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestionPaper, setPreviewQuestionPaper] = useState<any>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  // Delete template handler
  const handleDeleteTemplate = async (templateId: string) => {
    setLoading(true);
    setError(null);
    try {
      await templateService.deleteTemplate(templateId);
      setGeneratedTemplates(generatedTemplates.filter(t => t.id !== templateId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  // Load templates when component mounts or when switching to templates tab
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateService.getTemplates();
      // Handle both array and object responses
      const templates = Array.isArray(response) ? response : (response.templates || response || []);
      console.log('Loaded templates:', templates);
      setGeneratedTemplates(templates);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Load templates when switching to templates tab
  useEffect(() => {
    if (activeTab === 'templates') {
      loadTemplates();
    }
  }, [activeTab]);

  // Load question papers when switching to papers tab
  const loadQuestionPapers = async () => {
    try {
      setLoading(true);
      // Authentication removed
      
      // Load both existing question papers and generated papers
      const [questionPapersResponse, generatedPapersResponse] = await Promise.all([
        questionPaperService.getQuestionPapers().catch(() => ({ question_papers: [] })),
        fetch(getApiUrl('/api/generated-papers'), {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : []).catch(() => [])
      ]);

      const existingPapers = questionPapersResponse.question_papers || [];
      const generatedPapers = Array.isArray(generatedPapersResponse) ? generatedPapersResponse : [];

      // Format existing papers
      const formattedExistingPapers = existingPapers.map((paper: any) => ({
        ...paper,
        type: 'existing' // Mark as existing paper
      }));

      // Format generated papers for display
      const formattedGeneratedPapers = generatedPapers.map((paper: any) => ({
        id: paper.id,
        name: paper.template_name || 'Generated Paper',
        has_questions: paper.questions && paper.questions.length > 0,
        created_at: paper.generated_at,
        questions: paper.questions,
        template_id: paper.template_id,
        total_marks: paper.total_marks,
        btl_levels: ['Generated Questions'],
        type: 'generated' // Mark as generated paper
      }));

      // Combine and set
      setQuestionPapers([...formattedGeneratedPapers, ...formattedExistingPapers]);
    } catch (err) {
      console.error('Error loading question papers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load question papers');
    } finally {
      setLoading(false);
    }
  };

  // Load question papers when switching to papers tab
  useEffect(() => {
    if (activeTab === 'papers') {
      loadQuestionPapers();
    }
  }, [activeTab]);

  const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('examTime.')) {
      const timeField = name.split('.')[1];
      setTemplateData({
        ...templateData,
        examTime: {
          ...templateData.examTime,
          [timeField]: value
        }
      });
    } else {
      setTemplateData({
        ...templateData,
        [name]: value
      });
    }
  };

  const handleSectionInputChange = (index: number, field: string, value: string) => {
    const updatedSections = [...templateData.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    
    // Reset questionsToAnswer when sectionType changes
    if (field === 'sectionType') {
      if (value === 'Answer All Questions') {
        updatedSections[index].questionsToAnswer = '';
      } else {
        updatedSections[index].questionsToAnswer = updatedSections[index].questionsToAnswer || updatedSections[index].totalQuestions;
      }
    }
    
    // Auto-calculate and update custom instruction when relevant fields change
    if (['totalQuestions', 'questionsToAnswer', 'marksPerQuestion', 'sectionType'].includes(field)) {
      updatedSections[index].customInstruction = generateCustomInstruction(updatedSections[index]);
    }
    
    setTemplateData({ ...templateData, sections: updatedSections });
  };

  // Add section button with proper key
  const addSection = () => {
    setTemplateData({
      ...templateData,
      sections: [
        ...templateData.sections,
        {
          id: templateData.sections.length + 1,
          sectionName: '',
          sectionType: 'Answer All Questions',
          questionsType: 'Select Question Type',
          totalQuestions: '',
          questionsToAnswer: '',
          marksPerQuestion: '',
          customInstruction: ''
        }
      ]
    });
  };

  // Add edit template handler
  const handleEditTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Authentication removed

      console.log('Editing template with ID:', templateId);

      // First, let's check if we can find the template in our current list
      const currentTemplate = generatedTemplates.find(t => t.id === templateId);
      console.log('Current template from list:', currentTemplate);

      let template;
      try {
        // Try to fetch template details from API
        template = await templateService.getTemplate(templateId);
        console.log('Template from API:', template);
      } catch (apiError) {
        console.warn('Failed to fetch from API, using current template:', apiError);
        // If API call fails, use the template from our current list
        template = currentTemplate;
      }

      if (!template) {
        throw new Error('Template not found');
      }
      
      // Format template data for editing with more robust field mapping
      const formattedTemplateData = {
        templateName: template.name || template.template_name || template.templateName || '',
        instituteName: template.institute_name || template.instituteName || '',
        courseName: template.course_name || template.courseName || '',
        courseCode: template.course_code || template.courseCode || '',
        duration: (template.duration_minutes || template.duration || '').toString().replace(' Minutes', ''),
        examDate: template.exam_date || template.examDate || '',
        examTime: {
          hour: template.exam_time?.hour || template.examTime?.hour || '',
          minute: template.exam_time?.minute || template.examTime?.minute || '',
          period: template.exam_time?.period || template.examTime?.period || 'AM'
        },
        sections: template.sections?.map((section: any, index: number) => ({
          id: index + 1,
          sectionName: section.section_name || section.sectionName || `Section ${index + 1}`,
          sectionType: section.section_type || section.sectionType || 'Answer All Questions',
          questionsType: section.question_type || section.questionsType || section.questions_type || 'Multiple Choice',
          totalQuestions: (section.total_questions || section.totalQuestions || '').toString(),
          questionsToAnswer: (section.questions_to_answer || section.questionsToAnswer || '').toString(),
          marksPerQuestion: (section.marks_per_question || section.marksPerQuestion || '').toString(),
          customInstruction: section.custom_instruction || section.customInstruction || ''
        })) || [
          {
            id: 1,
            sectionName: 'Section 1',
            sectionType: 'Answer All Questions',
            questionsType: 'Multiple Choice',
            totalQuestions: '',
            questionsToAnswer: '',
            marksPerQuestion: '',
            customInstruction: ''
          }
        ]
      };

      console.log('Formatted template data for editing:', formattedTemplateData);
      
      setTemplateData(formattedTemplateData);
      setEditingTemplate(template);
      setShowTemplateCreation(true);
      
    } catch (err) {
      console.error('Error loading template for editing:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setError(null);
    setEditingTemplate(null);
    console.log('Creating new template - clearing form');
    // Reset template data
    setTemplateData({
      templateName: '',
      instituteName: '',
      courseName: '',
      courseCode: '',
      duration: '',
      examDate: '',
      examTime: { hour: '', minute: '', period: 'AM' },
      sections: [{
        id: 1,
        sectionName: '',
        sectionType: 'Answer All Questions',
        questionsType: 'Select Question Type',
        totalQuestions: '',
        questionsToAnswer: '',
        marksPerQuestion: '',
        customInstruction: ''
      }]
    });
    setShowTemplateCreation(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!templateData.templateName || !templateData.instituteName || !templateData.courseName || !templateData.courseCode) {
        throw new Error('Please fill in all required fields');
      }

      if (!templateData.duration || !templateData.examDate) {
        throw new Error('Please fill in duration and exam date');
      }

      if (!templateData.examTime.hour || !templateData.examTime.minute) {
        throw new Error('Please select exam time');
      }

      for (const section of templateData.sections) {
        if (!section.sectionName || !section.questionsType || section.questionsType === 'Select Question Type') {
          throw new Error(`Please complete all section details for Section ${section.id}`);
        }
        if (!section.totalQuestions || !section.marksPerQuestion) {
          throw new Error(`Please fill in total questions and marks per question for Section ${section.id}`);
        }
        if ((section.sectionType === 'Choose Any' || section.sectionType === 'Optional') && !section.questionsToAnswer) {
          throw new Error(`Please specify questions to be answered for Section ${section.id}`);
        }
      }

      // Authentication removed

      // Format template data for API
      const formattedData = {
        templateName: templateData.templateName.trim(),
        instituteName: templateData.instituteName.trim(),
        courseName: templateData.courseName.trim(),
        courseCode: templateData.courseCode.trim(),
        duration: parseInt(templateData.duration),
        examDate: templateData.examDate.trim(),
        examTime: {
          hour: templateData.examTime.hour,
          minute: templateData.examTime.minute,
          period: templateData.examTime.period
        },
        sections: templateData.sections.map(section => ({
          sectionName: section.sectionName.trim(),
          sectionType: section.sectionType,
          questionsType: section.questionsType,
          totalQuestions: parseInt(section.totalQuestions),
          questionsToAnswer: section.sectionType === 'Answer All Questions' 
            ? parseInt(section.totalQuestions) 
            : parseInt(section.questionsToAnswer || section.totalQuestions),
          marksPerQuestion: parseFloat(section.marksPerQuestion),
          customInstruction: section.customInstruction.trim()
        }))
      };

      let savedTemplate;
      if (editingTemplate) {
        console.log('Updating template:', editingTemplate.id, formattedData);
        // Update existing template
        savedTemplate = await templateService.updateTemplate(editingTemplate.id, formattedData);
        console.log('Updated template response:', savedTemplate);
        
        // Update the template in the local list - ensure we preserve the ID and merge properly
        setGeneratedTemplates(prevTemplates => 
          prevTemplates.map(template => 
            template.id === editingTemplate.id 
              ? { ...template, ...savedTemplate, id: editingTemplate.id } 
              : template
          )
        );
        
        // Reload templates to ensure consistency
        await loadTemplates();
      } else {
        // Create new template
        savedTemplate = await templateService.createTemplate(formattedData);
        setGeneratedTemplates(prev => [...prev, savedTemplate]);
      }
      
      // Reset form and close creation view
      setShowTemplateCreation(false);
      setEditingTemplate(null);
      setTemplateData({
        templateName: '',
        instituteName: '',
        courseName: '',
        courseCode: '',
        duration: '',
        examDate: '',
        examTime: { hour: '', minute: '', period: 'AM' },
        sections: [{
          id: 1,
          sectionName: '',
          sectionType: 'Answer All Questions',
          questionsType: 'Select Question Type',
          totalQuestions: '',
          questionsToAnswer: '',
          marksPerQuestion: '',
          customInstruction: ''
        }]
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template';
      setError(errorMessage);
      console.error('Error saving template:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalMarks = (section: any) => {
    // Handle both individual section and template with sections
    if (section.sections) {
      // This is a template object
      return section.sections.reduce((total: number, sect: any) => {
        if (sect.section_type === 'Answer All Questions') {
          return total + (sect.total_questions * sect.marks_per_question);
        } else {
          return total + (sect.questions_to_answer * sect.marks_per_question);
        }
      }, 0);
    } else {
      // This is an individual section
      const totalQuestions = parseInt(section.totalQuestions) || 0;
      const questionsToAnswer = parseInt(section.questionsToAnswer) || totalQuestions;
      const marksPerQuestion = parseInt(section.marksPerQuestion) || 0;
      
      if (section.sectionType === 'Answer All Questions') {
        return totalQuestions * marksPerQuestion;
      } else {
        return questionsToAnswer * marksPerQuestion;
      }
    }
  };

  const generateCustomInstruction = (section: any) => {
    const totalQuestions = parseInt(section.totalQuestions) || 0;
    const questionsToAnswer = parseInt(section.questionsToAnswer) || totalQuestions;
    const marksPerQuestion = parseInt(section.marksPerQuestion) || 0;
    
    if (section.sectionType === 'Answer All Questions') {
      return `Answer all ${totalQuestions} questions. Each question carries ${marksPerQuestion} mark${marksPerQuestion > 1 ? 's' : ''}.`;
    } else if (section.sectionType === 'Choose Any') {
      return `Answer any ${questionsToAnswer} questions out of ${totalQuestions}. Each question carries ${marksPerQuestion} mark${marksPerQuestion > 1 ? 's' : ''}.`;
    } else if (section.sectionType === 'Optional') {
      return `This section is optional. Answer any ${questionsToAnswer} questions out of ${totalQuestions}. Each question carries ${marksPerQuestion} mark${marksPerQuestion > 1 ? 's' : ''}.`;
    }
    return '';
  };

  const handleGenerateQuestionPaper = () => {
    setShowQuestionPaperGeneration(true);
  };

  const handleBackFromQuestionPaper = () => {
    setShowQuestionPaperGeneration(false);
  };

  const handleQuestionPaperGenerated = (questionPaper: any) => {
    setQuestionPapers([questionPaper, ...questionPapers]);
  };

  // Add new method to handle structured question generation
  const handleGenerateStructuredQuestions = async (template: any, topic: string = "", difficulty: string = "medium") => {
    try {
      setLoading(true);
      setError(null);
      
      // Authentication removed
      
      // Use the new structured generation endpoint
      const response = await fetch(getApiUrl('/api/generate-questions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template_id: template.id,
          topic: topic,
          difficulty_level: difficulty
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate questions');
      }

      const generatedPaper = await response.json();
      
      // Add to question papers list
      setQuestionPapers([generatedPaper, ...questionPapers]);
      
      // Show preview with structured questions
      setPreviewQuestionPaper({
        ...generatedPaper,
        questions: generatedPaper.questions // Already structured as individual objects
      });
      setShowPreview(true);
      
    } catch (err) {
      console.error('Error generating structured questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewQuestionPaper = async (paper: any) => {
    try {
      setLoading(true);
      setError(null);
      // Authentication removed

      let fullDetails;
      
      if (paper.type === 'generated') {
        // For generated papers, fetch from generated-papers endpoint
        const response = await fetch(getApiUrl(`/api/generated-papers/${paper.id}`), {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to fetch generated paper details');
        }
        
        fullDetails = await response.json();
        
        // Fetch complete template details to ensure we have all information
        if (fullDetails.template_id) {
          try {
            const templateResponse = await fetch(getApiUrl(`/api/templates/${fullDetails.template_id}`), {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (templateResponse.ok) {
              const completeTemplate = await templateResponse.json();
              // Merge template details into fullDetails
              fullDetails.template = {
                template_name: completeTemplate.name || completeTemplate.template_name,
                institute_name: completeTemplate.institute_name,
                course_name: completeTemplate.course_name,
                course_code: completeTemplate.course_code,
                duration_minutes: completeTemplate.duration_minutes || completeTemplate.duration?.replace(' Minutes', ''),
                exam_date: completeTemplate.exam_date,
                exam_time: formatExamTime(completeTemplate.exam_time || completeTemplate.examTime),
                sections: completeTemplate.sections || []
              };
            }
          } catch (templateErr) {
            console.warn('Could not fetch complete template details:', templateErr);
          }
        }
        
        // Format for preview component with complete template details
        const formattedPaper = {
          id: fullDetails.id,
          name: fullDetails.template_name || paper.name,
          template_name: fullDetails.template_name || paper.name,
          subject: fullDetails.template?.course_name || 'General',
          grade: fullDetails.template?.course_code || 'N/A',
          totalMarks: fullDetails.total_marks ? `${fullDetails.total_marks} Max Marks` : '0 Max Marks',
          duration: fullDetails.template?.duration_minutes ? `${fullDetails.template.duration_minutes} Minutes` : '0 Minutes',
          createdAt: new Date(fullDetails.generated_at || fullDetails.created_at).toLocaleDateString(),
          questions: fullDetails.questions || [], // Structured question objects
          has_questions: fullDetails.questions && fullDetails.questions.length > 0,
          type: paper.type,
          template: fullDetails.template || {
            template_name: fullDetails.template_name || paper.name,
            institute_name: 'Institute Name',
            course_name: 'Course Name',
            course_code: 'Course Code',
            duration_minutes: '0',
            exam_date: null,
            exam_time: null,
            sections: []
          }
        };
        
        console.log('Formatted generated paper for preview:', formattedPaper);
        setPreviewQuestionPaper(formattedPaper);
        setShowPreview(true);
        return;
      }

      // For existing papers, use existing service
      fullDetails = await questionPaperService.getQuestionPaperDetails(paper.id);
      
      // Format for preview component with complete template details
      const formattedPaper = {
        id: fullDetails.id,
        name: fullDetails.template_name || fullDetails.name,
        template_name: fullDetails.template_name || fullDetails.name,
        subject: fullDetails.course_name || 'General',
        grade: fullDetails.course_code || 'N/A',
        totalMarks: fullDetails.total_marks ? `${fullDetails.total_marks} Max Marks` : '0 Max Marks',
        duration: fullDetails.duration_minutes ? `${fullDetails.duration_minutes} Minutes` : '0 Minutes',
        createdAt: new Date(fullDetails.generated_at || fullDetails.created_at).toLocaleDateString(),
        questions: fullDetails.questions || [], // Structured question objects
        has_questions: fullDetails.questions && fullDetails.questions.length > 0,
        type: paper.type, // Pass through the type
        template: {
          template_name: fullDetails.template_name,
          institute_name: fullDetails.institute_name,
          course_name: fullDetails.course_name,
          course_code: fullDetails.course_code,
          duration_minutes: fullDetails.duration_minutes,
          exam_date: fullDetails.exam_date,
          exam_time: fullDetails.exam_time,
          sections: fullDetails.sections || []
        }
      };

      console.log('Formatted paper for preview with complete template details:', formattedPaper);
      setPreviewQuestionPaper(formattedPaper);
      setShowPreview(true);
    } catch (err) {
      console.error('Error fetching question paper details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load question paper details');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format exam time
  const formatExamTime = (examTime: any) => {
    if (!examTime) return null;
    
    if (typeof examTime === 'string') return examTime;
    
    if (examTime.hour && examTime.minute && examTime.period) {
      return `${examTime.hour}:${examTime.minute.toString().padStart(2, '0')} ${examTime.period}`;
    }
    
    return null;
  };

  const handleSaveQuestionEdits = async (updatedQuestions: any[]) => {
    try {
      setLoading(true);
      // Authentication removed

      if (previewQuestionPaper.type === 'generated') {
        // For generated papers, use the new update endpoint
        const response = await fetch(getApiUrl(`/api/generated-papers/${previewQuestionPaper.id}/questions`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedQuestions)
        });

        if (!response.ok) {
          throw new Error('Failed to save edited questions to database');
        }

        console.log('Successfully saved edited questions to database');
        
        // Update the preview immediately
        setPreviewQuestionPaper({
          ...previewQuestionPaper,
          questions: updatedQuestions,
          updated_at: new Date().toISOString()
        });

        // Update the question paper in the local list
        const updatedPapers = questionPapers.map(paper => 
          paper.id === previewQuestionPaper.id 
            ? { ...paper, questions: updatedQuestions, updated_at: new Date().toISOString() }
            : paper
        );
        setQuestionPapers(updatedPapers);
        
      } else {
        // Update questions in backend for regular papers
        await questionPaperService.updateQuestionPaperQuestions(
          previewQuestionPaper.id, 
          updatedQuestions, 
          token
        );
        
        // Update the question paper in the local list
        const updatedPapers = questionPapers.map(paper => 
          paper.id === previewQuestionPaper.id 
            ? { ...paper, questions: updatedQuestions, updated_at: new Date().toISOString() }
            : paper
        );
        setQuestionPapers(updatedPapers);
        
        // Update the preview
        setPreviewQuestionPaper({
          ...previewQuestionPaper,
          questions: updatedQuestions,
          updated_at: new Date().toISOString()
        });
      }
      
      console.log('Successfully saved edited questions');
      
    } catch (err) {
      console.error('Error saving edited questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to save edited questions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add new method to handle template preview
  const handlePreviewTemplate = async (template: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Authentication removed

      console.log('Previewing template:', template.id);

      let completeTemplate;
      try {
        // Try to fetch complete template details from API
        completeTemplate = await templateService.getTemplate(template.id);
        console.log('Complete template from API:', completeTemplate);
      } catch (apiError) {
        console.warn('Failed to fetch complete template from API, using current template:', apiError);
        completeTemplate = template;
      }

      if (!completeTemplate) {
        throw new Error('Template not found');
      }
      
      // Set the preview template for the inline modal
      setPreviewTemplate(completeTemplate);
      setShowTemplatePreview(true);
      
    } catch (err) {
      console.error('Error loading template for preview:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template for preview');
    } finally {
      setLoading(false);
    }
  };

  // Add delete question paper handler
  const handleDeleteQuestionPaper = async (paperId: string, paperType: string) => {
    if (!confirm('Are you sure you want to delete this question paper? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Authentication removed
      
      if (paperType === 'generated') {
        // Delete generated paper
        const response = await fetch(getApiUrl(`/api/generated-papers/${paperId}`), {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to delete generated question paper');
        }
      } else {
        // Delete existing paper using existing service
        await questionPaperService.deleteQuestionPaper(paperId);
      }

      // Remove from local state
      setQuestionPapers(questionPapers.filter(paper => paper.id !== paperId));
      
      console.log(`Successfully deleted ${paperType} question paper:`, paperId);
      
    } catch (err) {
      console.error('Error deleting question paper:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete question paper');
    } finally {
      setLoading(false);
    }
  };

  // Show QuestionPaper component if in generation mode
  if (showQuestionPaperGeneration) {
    return (
      <QuestionPaper 
        onBack={handleBackFromQuestionPaper}
        onQuestionGenerated={handleQuestionPaperGenerated}
      />
    );
  }

  return (
    <>
      <div className={`min-h-screen bg-gray-50 transition-all duration-200 ${showPreview ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <span>ExamEval.ai</span>
                <span>/</span>
                <span className="text-gray-900">
                  {activeTab === 'papers' ? 'Question Papers' : 'Question Paper Templates'}
                </span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'papers' ? 'Question Papers' : 'Question Paper Templates'}
              </h1>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('papers');
                  setShowTemplateCreation(false);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'papers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Question Papers
              </button>
              <button
                onClick={() => {
                  setActiveTab('templates');
                  setShowTemplateCreation(false);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Templates
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'papers' && (
            <div>
              {/* Generate Button */}
              <div className="mb-8">
                <button
                  onClick={handleGenerateQuestionPaper}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3 text-lg font-medium shadow-lg"
                >
                  <Plus className="h-6 w-6" />
                  <span>Generate Question Paper</span>
                </button>
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search question papers..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing 0 to {questionPapers.length} of {questionPapers.length} entries
                  </div>
                </div>
              </div>

              {/* Question Papers Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                    <div className="col-span-1"></div>
                    <div className="col-span-4">Name</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-2">Last Modified</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                </div>
                
                {loading && activeTab === 'papers' ? (
                  <div className="text-center py-16">
                    <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500 text-lg mb-2">Loading question papers...</p>
                  </div>
                ) : questionPapers.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No question papers yet. Let's get started! 🚀</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {questionPapers.map((paper) => (
                      <div key={paper.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="col-span-4">
                            <div className="font-medium text-gray-900">{paper.name}</div>
                            <div className="text-sm text-gray-500">
                              {paper.btl_levels?.join(', ') || 'No BTL levels'}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              paper.has_questions 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {paper.has_questions ? 'Generated' : 'Draft'}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-sm text-gray-500">
                              {new Date(paper.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <div className="flex space-x-2">
                              {paper.has_questions && (
                                <button
                                  onClick={() => handlePreviewQuestionPaper(paper)}
                                  disabled={loading}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                                  title="Preview & Edit Question Paper"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteQuestionPaper(paper.id, paper.type)}
                                disabled={loading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                                title="Delete Question Paper"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {questionPapers.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing 1 to {questionPapers.length} of {questionPapers.length} entries
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'templates' && !showTemplateCreation && (
            <div>
              {/* Create Template Button */}
              <div className="mb-8">
                <button
                  onClick={handleCreateTemplate}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3 text-lg font-medium shadow-lg"
                >
                  <Plus className="h-6 w-6" />
                  <span>Create Question Paper Template</span>
                </button>
              </div>

              {/* Templates Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                    <div className="col-span-1">SL</div>
                    <div className="col-span-7">Name</div>
                    <div className="col-span-4">Last Modified</div>
                  </div>
                </div>
                
                {loading && activeTab === 'templates' ? (
                  <div className="text-center py-16">
                    <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500 text-lg mb-2">Loading templates...</p>
                  </div>
                ) : generatedTemplates.length === 0 ? (
                  <div className="text-center py-16">
                    <Layout className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No templates yet. Create your first template! 🚀</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {generatedTemplates.map((template, index) => (
                      <div key={template.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1">
                            <span className="text-sm text-gray-900">{index + 1}</span>
                          </div>
                          <div className="col-span-7">
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500">
                              <span className="text-blue-600">{template.duration}</span>
                              <span className="mx-2">•</span>
                              <span className="text-green-600">{template.maxMarks}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                          </div>
                          <div className="col-span-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">{template.lastModified}</span>
                              <div className="flex space-x-2">
                                <button className="p-1 hover:bg-gray-100 rounded"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Preview template button clicked for template:', template.id);
                                    handlePreviewTemplate(template);
                                  }}
                                  disabled={loading}
                                  title="Preview Template"
                                  >
                                  <FileText className="h-4 w-4 text-blue-600" />
                                </button>
                                <button 
                                  className="p-1 hover:bg-gray-100 rounded"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Edit button clicked for template:', template.id);
                                    handleEditTemplate(template.id);
                                  }}
                                  disabled={loading}
                                  title="Edit Template"
                                >
                                  <Edit3 className="h-4 w-4 text-blue-600" />
                                </button>
                                <button className="p-1 hover:bg-red-100 rounded" onClick={() => handleDeleteTemplate(template.id)} title="Delete Template">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {generatedTemplates.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing 1 to {generatedTemplates.length} of {generatedTemplates.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">
                        1
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'templates' && showTemplateCreation && (
            <div>
              {/* Template Creation/Edit Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingTemplate ? `Edit Template: ${editingTemplate.name || editingTemplate.template_name}` : 'Create New Template'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingTemplate ? 'Update the template details below' : 'Fill in the details to create a new question paper template'}
                  </p>
                  {editingTemplate && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      <strong>Editing:</strong> Template ID {editingTemplate.id}
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="templateName"
                      value={templateData.templateName}
                      onChange={handleTemplateInputChange}
                      placeholder="Eg: Internal Exam Template"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institute Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="instituteName"
                      value={templateData.instituteName}
                      onChange={handleTemplateInputChange}
                      placeholder="Eg: ABC University"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="courseName"
                      value={templateData.courseName}
                      onChange={handleTemplateInputChange}
                      placeholder="Eg: Computer Science"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Code<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="courseCode"
                      value={templateData.courseCode}
                      onChange={handleTemplateInputChange}
                      placeholder="Eg: CS101"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Duration, Date and Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={templateData.duration}
                      onChange={handleTemplateInputChange}
                      placeholder="Duration in Minutes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Date<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="examDate"
                      value={templateData.examDate}
                      onChange={handleTemplateInputChange}
                      placeholder="dd-mm-yyyy"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Time<span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <select
                        name="examTime.hour"
                        value={templateData.examTime.hour}
                        onChange={handleTemplateInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Hour</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={`hour-${i + 1}`} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      <select
                        name="examTime.minute"
                        value={templateData.examTime.minute}
                        onChange={handleTemplateInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Min</option>
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={`minute-${i}`} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                      <select
                        name="examTime.period"
                        value={templateData.examTime.period}
                        onChange={handleTemplateInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                {templateData.sections.map((section, index) => (
                  <div key={`section-${section.id}-${index}`} className="mb-8 p-6 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Section {section.id}</h3>
                      <div className="flex items-center space-x-3">
                        {section.totalQuestions && section.marksPerQuestion && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Total: {calculateTotalMarks(section)} marks
                          </span>
                        )}
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Section #{section.id}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={section.sectionName}
                          onChange={(e) => handleSectionInputChange(index, 'sectionName', e.target.value)}
                          placeholder="Eg: Section 1, Part A"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Type<span className="text-red-500">*</span>
                        </label>
                        <select
                          value={section.sectionType}
                          onChange={(e) => handleSectionInputChange(index, 'sectionType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Answer All Questions">Answer All Questions</option>
                          <option value="Choose Any">Choose Any</option>
                          <option value="Optional">Optional</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Questions Type<span className="text-red-500">*</span>
                        </label>
                        <select
                          value={section.questionsType}
                          onChange={(e) => handleSectionInputChange(index, 'questionsType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Select Question Type">Select Question Type</option>
                          <option value="Multiple Choice">Multiple Choice</option>
                          <option value="Short Answer">Short Answer</option>
                          <option value="Essay">Essay</option>
                          <option value="Fill in the Blank">Fill in the Blank</option>
                          <option value="True/False">True/False</option>
                          <option value="One Word">One Word</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Questions<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={section.totalQuestions}
                          onChange={(e) => handleSectionInputChange(index, 'totalQuestions', e.target.value)}
                          placeholder="Enter number of questions"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      {(section.sectionType === 'Choose Any' || section.sectionType === 'Optional') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Questions to be Answered<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={section.questionsToAnswer}
                            onChange={(e) => handleSectionInputChange(index, 'questionsToAnswer', e.target.value)}
                            placeholder="How many to answer"
                            max={section.totalQuestions}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Marks for Each Question<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={section.marksPerQuestion}
                          onChange={(e) => handleSectionInputChange(index, 'marksPerQuestion', e.target.value)}
                          placeholder="Enter marks per question"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Instruction
                      </label>
                      <textarea
                        value={section.customInstruction}
                        onChange={(e) => handleSectionInputChange(index, 'customInstruction', e.target.value)}
                        placeholder="Enter any custom instructions for this section"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}

                {/* Add Section Button */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={addSection}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Section</span>
                  </button>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Canceling template creation/edit');
                      setShowTemplateCreation(false);
                      setEditingTemplate(null);
                      // Reset form data
                      setTemplateData({
                        templateName: '',
                        instituteName: '',
                        courseName: '',
                        courseCode: '',
                        duration: '',
                        examDate: '',
                        examTime: { hour: '', minute: '', period: 'AM' },
                        sections: [{
                          id: 1,
                          sectionName: '',
                          sectionType: 'Answer All Questions',
                          questionsType: 'Select Question Type',
                          totalQuestions: '',
                          questionsToAnswer: '',
                          marksPerQuestion: '',
                          customInstruction: ''
                        }]
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    <span>{editingTemplate ? 'Update Template' : 'Save Template'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewQuestionPaper && (
        <QuestionPaperPreview
          questionPaper={previewQuestionPaper}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onSave={handleSaveQuestionEdits}
        />
      )}

      {/* Template Preview Modal - Inline Modal */}
      {showTemplatePreview && previewTemplate && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowTemplatePreview(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Template Preview</h2>
                  <p className="text-sm text-gray-500">{previewTemplate.name}</p>
                </div>
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content - Template Preview */}
              <div className="flex-1 overflow-y-auto p-6">
                <div>
                  {/* Question Paper Header */}
                  <div className="text-center mb-8 border-b border-gray-300 pb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {previewTemplate.institute_name || 'Institute Name'}
                    </h3>
                    <p className="text-gray-700 mb-1">
                      {previewTemplate.template_name || previewTemplate.name}
                    </p>
                    <p className="text-gray-700 mb-1">
                      Internal Examination {previewTemplate.exam_date ? 
                        new Date(previewTemplate.exam_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 
                        'August, 2025'}
                    </p>
                    <p className="text-gray-700 mb-4">
                      {previewTemplate.course_code ? 
                        `${previewTemplate.course_name} (${previewTemplate.course_code})` : 
                        previewTemplate.course_name || previewTemplate.name}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm font-medium max-w-md mx-auto">
                      <span>Max Mark: {calculateTotalMarks({ sections: previewTemplate.sections })}</span>
                      <span>Duration: {previewTemplate.duration_minutes || previewTemplate.duration?.replace(' Minutes', '') || '0'} Minutes</span>
                    </div>
                    
                    {previewTemplate.exam_date && previewTemplate.exam_time && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span>Date: {new Date(previewTemplate.exam_date).toLocaleDateString('en-GB')}</span>
                        <span className="mx-2">•</span>
                        <span>Time: {formatExamTime(previewTemplate.exam_time)}</span>
                      </div>
                    )}
                  </div>

                  {/* Question Paper Sections */}
                  <div className="space-y-8">
                    {previewTemplate.sections && previewTemplate.sections.length > 0 ? (
                      previewTemplate.sections.map((section: any, index: number) => (
                        <div key={index}>
                          <div className="text-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {section.section_name || `Section ${index + 1}`}
                            </h4>
                            <div className="text-sm text-gray-600 mb-2">
                              {section.section_type === 'Answer All Questions' ? (
                                <p>Answer all {section.total_questions} questions.</p>
                              ) : section.section_type === 'Choose Any' ? (
                                <p>Answer any {section.questions_to_answer} questions out of {section.total_questions}.</p>
                              ) : section.section_type === 'Optional' ? (
                                <p>This section is optional. Answer any {section.questions_to_answer} questions out of {section.total_questions}.</p>
                              ) : (
                                <p>Answer any {Math.min(section.total_questions || 5, 5)} Questions.</p>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Each question carries {section.marks_per_question} mark{section.marks_per_question > 1 ? 's' : ''}.
                            </p>
                          </div>
                          
                          {/* Sample Questions */}
                          <div className="space-y-4">
                            {Array.from({ length: section.total_questions || 0 }, (_, qIndex) => (
                              <div key={qIndex} className="flex">
                                <span className="mr-4 font-medium text-gray-900 flex-shrink-0">{qIndex + 1})</span>
                                <div className="flex-1 min-w-0">
                                  {section.question_type === 'Multiple Choice' ? (
                                    <div>
                                      <p className="text-gray-900 mb-2 break-words">Sample multiple choice question for {section.question_type}?</p>
                                      <div className="ml-4 space-y-1 text-sm text-gray-700">
                                        <p>a) Option A</p>
                                        <p>b) Option B</p>
                                        <p>c) Option C</p>
                                        <p>d) Option D</p>
                                      </div>
                                    </div>
                                  ) : section.question_type === 'True/False' ? (
                                    <p className="text-gray-900 break-words">Sample statement for true/false evaluation. (True/False)</p>
                                  ) : section.question_type === 'One Word' ? (
                                    <p className="text-gray-900 break-words">Fill in the blank: _____ is the capital of India.</p>
                                  ) : section.question_type === 'Short Answer' ? (
                                    <p className="text-gray-900 break-words">Explain the concept in 2-3 sentences.</p>
                                  ) : section.question_type === 'Essay' ? (
                                    <p className="text-gray-900 break-words">Write a detailed essay on the given topic (200-300 words).</p>
                                  ) : section.question_type === 'Fill in the Blank' ? (
                                    <p className="text-gray-900 break-words">Complete the sentence: The process of _____ is essential for _____.</p>
                                  ) : (
                                    <p className="text-gray-900 break-words">Sample {(section.question_type || 'general').toLowerCase()} question.</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Section Summary */}
                          <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-600">
                            <div className="flex justify-between items-center">
                              <span>Section Total:</span>
                              <span className="font-medium">
                                {section.section_type === 'Answer All Questions' 
                                  ? section.total_questions * section.marks_per_question
                                  : section.questions_to_answer * section.marks_per_question
                                } marks
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No sections defined for this template</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Paper Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
                    <p>--- End of Question Paper ---</p>
                    <p className="mt-2">
                      Total Duration: {previewTemplate.duration_minutes || previewTemplate.duration?.replace(' Minutes', '') || '0'} Minutes | 
                      Total Marks: {calculateTotalMarks({ sections: previewTemplate.sections })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionGeneration;
