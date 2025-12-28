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
    duration: '',
    examDate: '',
    examTime: {
      hour: '',
      minute: '',
      period: 'AM'
    },
    totalQuestions: '75',  // Default for JEE Mains
    totalMarks: '300',  // Default for JEE Mains
    // sections: [  // Commented out for now
    //   {
    //     id: 1,
    //     sectionName: '',
    //     sectionType: 'Answer All Questions',
    //     questionsType: 'Select Question Type',
    //     totalQuestions: '',
    //     questionsToAnswer: '',
    //     marksPerQuestion: '',
    //     customInstruction: ''
    //   }
    // ]
  });
  
  const [generatedTemplates, setGeneratedTemplates] = useState<any[]>([]);
  const [questionPapers, setQuestionPapers] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestionPaper, setPreviewQuestionPaper] = useState<any>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, type: 'paper' | 'template', name: string} | null>(null);

  // Delete template handler (now uses modal)
  const handleDeleteTemplate = (templateId: string) => {
    const template = generatedTemplates.find(t => t.id === templateId);
    const templateName = template?.name || template?.template_name || 'this template';
    showDeleteConfirmation(templateId, 'template', templateName);
  };

  // Load templates when component mounts or when switching to templates tab
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateService.getTemplates();
      // Handle both array and object responses
      const templates = Array.isArray(response) ? response : [];
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
      
      // Load question papers from the service
      const questionPapersResponse = await questionPaperService.getQuestionPapers().catch(() => ({ question_papers: [] }));

      const existingPapers = questionPapersResponse.question_papers || [];

      // Format existing papers
      const formattedExistingPapers = existingPapers.map((paper: any) => ({
        ...paper,
        type: 'existing' // Mark as existing paper
      }));

      // Set question papers
      setQuestionPapers(formattedExistingPapers);
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

  // const handleSectionInputChange = (index: number, field: string, value: string) => {  // Commented out for now
  //   const updatedSections = [...templateData.sections];
  //   updatedSections[index] = { ...updatedSections[index], [field]: value };
  //   
  //   // Reset questionsToAnswer when sectionType changes
  //   if (field === 'sectionType') {
  //     if (value === 'Answer All Questions') {
  //       updatedSections[index].questionsToAnswer = '';
  //     } else {
  //       updatedSections[index].questionsToAnswer = updatedSections[index].questionsToAnswer || updatedSections[index].totalQuestions;
  //     }
  //   }
  //   
  //   // Auto-calculate and update custom instruction when relevant fields change
  //   if (['totalQuestions', 'questionsToAnswer', 'marksPerQuestion', 'sectionType'].includes(field)) {
  //     updatedSections[index].customInstruction = generateCustomInstruction(updatedSections[index]);
  //   }
  //   
  //   setTemplateData({ ...templateData, sections: updatedSections });
  // };

  // // Add section button with proper key  // Commented out for now
  // const addSection = () => {
  //   setTemplateData({
  //     ...templateData,
  //     sections: [
  //       ...templateData.sections,
  //       {
  //         id: templateData.sections.length + 1,
  //         sectionName: '',
  //         sectionType: 'Answer All Questions',
  //         questionsType: 'Select Question Type',
  //         totalQuestions: '',
  //         questionsToAnswer: '',
  //         marksPerQuestion: '',
  //         customInstruction: ''
  //       }
  //     ]
  //   });
  // };

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
        duration: (template.duration_minutes || template.duration || '').toString().replace(' Minutes', ''),
        examDate: template.exam_date || template.examDate || '',
        examTime: {
          hour: template.exam_time?.hour || template.examTime?.hour || '',
          minute: template.exam_time?.minute || template.examTime?.minute || '',
          period: template.exam_time?.period || template.examTime?.period || 'AM'
        },
        totalQuestions: (template.totalQuestions || template.total_questions || '75').toString(),
        totalMarks: (template.totalMarks || template.total_marks || '300').toString(),
        // sections: template.sections?.map((section: any, index: number) => ({  // Commented out for now
        //   id: index + 1,
        //   sectionName: section.section_name || section.sectionName || `Section ${index + 1}`,
        //   sectionType: section.section_type || section.sectionType || 'Answer All Questions',
        //   questionsType: section.questionType || section.question_type || section.questionsType || section.questions_type || 'Multiple Choice',
        //   totalQuestions: (section.total_questions || section.totalQuestions || '').toString(),
        //   questionsToAnswer: (section.questions_to_answer || section.questionsToAnswer || '').toString(),
        //   marksPerQuestion: (section.marks_per_question || section.marksPerQuestion || '').toString(),
        //   customInstruction: section.custom_instruction || section.customInstruction || ''
        // })) || []
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
      duration: '',
      examDate: '',
      examTime: { hour: '', minute: '', period: 'AM' },
      totalQuestions: '75',  // Default for JEE Mains
      totalMarks: '300',  // Default for JEE Mains
      // sections: [{  // Commented out for now
      //   id: 1,
      //   sectionName: '',
      //   sectionType: 'Answer All Questions',
      //   questionsType: 'Select Question Type',
      //   totalQuestions: '',
      //   questionsToAnswer: '',
      //   marksPerQuestion: '',
      //   customInstruction: ''
      // }]
    });
    setShowTemplateCreation(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!templateData.templateName || !templateData.instituteName) {
        throw new Error('Please fill in all required fields');
      }

      if (!templateData.duration || !templateData.examDate) {
        throw new Error('Please fill in duration and exam date');
      }

      if (!templateData.examTime.hour || !templateData.examTime.minute) {
        throw new Error('Please select exam time');
      }

      if (!templateData.totalQuestions || !templateData.totalMarks) {
        throw new Error('Please fill in total questions and total marks');
      }

      const totalQuestions = parseInt(templateData.totalQuestions);
      const totalMarks = parseInt(templateData.totalMarks);

      if (isNaN(totalQuestions) || totalQuestions <= 0) {
        throw new Error('Total questions must be a positive number');
      }

      if (isNaN(totalMarks) || totalMarks <= 0) {
        throw new Error('Total marks must be a positive number');
      }

      // for (const section of templateData.sections) {  // Commented out for now
      //   if (!section.sectionName || !section.questionsType || section.questionsType === 'Select Question Type') {
      //     throw new Error(`Please complete all section details for Section ${section.id}`);
      //   }
      //   if (!section.totalQuestions || !section.marksPerQuestion) {
      //     throw new Error(`Please fill in total questions and marks per question for Section ${section.id}`);
      //   }
      //   if ((section.sectionType === 'Choose Any' || section.sectionType === 'Optional') && !section.questionsToAnswer) {
      //     throw new Error(`Please specify questions to be answered for Section ${section.id}`);
      //   }
      // }

      // Format template data for API
      const formattedData = {
        templateName: templateData.templateName.trim(),
        instituteName: templateData.instituteName.trim(),
        duration: parseInt(templateData.duration),
        examDate: templateData.examDate.trim(),
        examTime: {
          hour: templateData.examTime.hour,
          minute: templateData.examTime.minute,
          period: templateData.examTime.period
        },
        totalQuestions: totalQuestions,
        totalMarks: totalMarks,
        // sections: templateData.sections.map(section => {  // Commented out for now
        //   const totalQuestions = parseInt(section.totalQuestions);
        //   const questionsToAnswer = section.sectionType === 'Answer All Questions' 
        //     ? totalQuestions 
        //     : parseInt(section.questionsToAnswer || section.totalQuestions);
        //   const marksPerQuestion = parseFloat(section.marksPerQuestion);
        //   const totalMarks = questionsToAnswer * marksPerQuestion;
        //   
        //   return {
        //     sectionName: section.sectionName.trim(),
        //     sectionType: section.sectionType,
        //     questionType: section.questionsType || 'Multiple Choice',
        //     totalQuestions: totalQuestions,
        //     questionsToAnswer: questionsToAnswer,
        //     marksPerQuestion: marksPerQuestion,
        //     totalMarks: totalMarks,
        //     customInstruction: section.customInstruction.trim()
        //   };
        // })
      };

      let savedTemplate: any;
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
        duration: '',
        examDate: '',
        examTime: { hour: '', minute: '', period: 'AM' },
        totalQuestions: '75',
        totalMarks: '300',
        // sections: [{  // Commented out for now
        //   id: 1,
        //   sectionName: '',
        //   sectionType: 'Answer All Questions',
        //   questionsType: 'Select Question Type',
        //   totalQuestions: '',
        //   questionsToAnswer: '',
        //   marksPerQuestion: '',
        //   customInstruction: ''
        // }]
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
        // Support both camelCase (from backend) and snake_case (legacy)
        const sectionType = sect.sectionType || sect.section_type;
        const totalQuestions = sect.totalQuestions || sect.total_questions || 0;
        const questionsToAnswer = sect.questionsToAnswer || sect.questions_to_answer || totalQuestions;
        const marksPerQuestion = sect.marksPerQuestion || sect.marks_per_question || 0;
        const totalMarks = sect.totalMarks || (questionsToAnswer * marksPerQuestion);
        
        if (sectionType === 'Answer All Questions') {
          return total + (totalMarks || (totalQuestions * marksPerQuestion));
        } else {
          return total + (totalMarks || (questionsToAnswer * marksPerQuestion));
        }
      }, 0);
    } else {
      // This is an individual section
      const totalQuestions = parseInt(section.totalQuestions || section.total_questions) || 0;
      const questionsToAnswer = parseInt(section.questionsToAnswer || section.questions_to_answer) || totalQuestions;
      const marksPerQuestion = parseFloat(section.marksPerQuestion || section.marks_per_question) || 0;
      
      const sectionType = section.sectionType || section.section_type;
      if (sectionType === 'Answer All Questions') {
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
      
      // This function is deprecated - question generation is handled in QuestionPaper component
      throw new Error('This function is deprecated. Please use the question generation flow in Question Paper page.');
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

      // Fetch question paper details using the service
      const fullDetails = await questionPaperService.getQuestionPaper(paper.id);
      
      // Fetch complete template details to ensure we have all information
      let templateDetails: any = null;
      if (fullDetails.templateId) {
        try {
          templateDetails = await templateService.getTemplate(fullDetails.templateId);
        } catch (templateErr) {
          console.warn('Could not fetch complete template details:', templateErr);
        }
      }
      
      // Format for preview component with complete template details
      const formattedPaper = {
        id: fullDetails.id,
        name: fullDetails.name || fullDetails.templateName,
        template_name: fullDetails.templateName || (fullDetails as any).template_name || fullDetails.name,
        subject: 'General',
        grade: 'N/A',
        totalMarks: fullDetails.totalMarks ? `${fullDetails.totalMarks} Max Marks` : '0 Max Marks',
        duration: templateDetails ? `${templateDetails.duration || templateDetails.duration_minutes || '0'} Minutes` : '0 Minutes',
        createdAt: (() => {
          const dateStr = fullDetails.createdAt || (fullDetails as any).created_at;
          if (dateStr) {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? new Date().toLocaleDateString() : date.toLocaleDateString();
          }
          return new Date().toLocaleDateString();
        })(),
        questions: fullDetails.questions || [], // Structured question objects
        has_questions: fullDetails.questions && fullDetails.questions.length > 0,
        type: 'existing', // All papers are now from the same source
        template: templateDetails ? {
          template_name: templateDetails.templateName || templateDetails.template_name || templateDetails.name,
          institute_name: templateDetails.instituteName || templateDetails.institute_name,
          duration_minutes: templateDetails.duration || templateDetails.duration_minutes,
          exam_date: templateDetails.examDate || templateDetails.exam_date,
          exam_time: formatExamTime(templateDetails.examTime || templateDetails.exam_time),
          sections: templateDetails.sections || []
        } : {}
      };
        
      console.log('Formatted paper for preview with complete template details:', formattedPaper);
      setPreviewQuestionPaper(formattedPaper);
      setShowPreview(true);

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

      // Update questions in backend using the service
      await questionPaperService.updateQuestionPaperQuestions(
        previewQuestionPaper.id, 
        updatedQuestions
      );
      
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

  // Show delete confirmation modal
  const showDeleteConfirmation = (id: string, type: 'paper' | 'template', name: string) => {
    setDeleteTarget({ id, type, name });
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      setError(null);
      
      if (deleteTarget.type === 'paper') {
        // Delete question paper using the service
        await questionPaperService.deleteQuestionPaper(deleteTarget.id);
        // Remove from local state
        setQuestionPapers(questionPapers.filter(paper => paper.id !== deleteTarget.id));
        console.log(`Successfully deleted question paper:`, deleteTarget.id);
      } else {
        // Delete template
        await templateService.deleteTemplate(deleteTarget.id);
        setGeneratedTemplates(generatedTemplates.filter(t => t.id !== deleteTarget.id));
        console.log(`Successfully deleted template:`, deleteTarget.id);
      }
      
      // Close modal
      setShowDeleteModal(false);
      setDeleteTarget(null);
      
    } catch (err) {
      console.error('Error deleting:', err);
      setError(err instanceof Error ? err.message : `Failed to delete ${deleteTarget.type}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
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
                              {(() => {
                                if (!paper.created_at) return 'N/A';
                                const date = new Date(paper.created_at);
                                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                              })()}
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
                                onClick={() => showDeleteConfirmation(paper.id, 'paper', paper.name || 'this question paper')}
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
                    <div className="col-span-1">S.No</div>
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

                {/* Total Questions and Total Marks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Questions<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalQuestions"
                      value={templateData.totalQuestions}
                      onChange={handleTemplateInputChange}
                      placeholder="Eg: 75"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Total number of questions in the paper (e.g., 75 for JEE Mains)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Marks<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={templateData.totalMarks}
                      onChange={handleTemplateInputChange}
                      placeholder="Eg: 300"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Total marks for the paper (e.g., 300 for JEE Mains)</p>
                  </div>
                </div>

                {/* Sections - Commented out for now */}
                {/* {templateData.sections.map((section, index) => (
                  <div key={`section-${section.id}-${index}`} className="mb-8 p-6 bg-gray-50 rounded-lg border">
                    ... section form fields ...
                  </div>
                ))} */}

                {/* Add Section Button - Commented out for now */}
                {/* <div className="mb-6">
                  <button
                    type="button"
                    onClick={addSection}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Section</span>
                  </button>
                </div> */}

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
                        duration: '',
                        examDate: '',
                        examTime: { hour: '', minute: '', period: 'AM' },
                        totalQuestions: '75',
                        totalMarks: '300',
                        // sections: [{  // Commented out for now
                        //   id: 1,
                        //   sectionName: '',
                        //   sectionType: 'Answer All Questions',
                        //   questionsType: 'Select Question Type',
                        //   totalQuestions: '',
                        //   questionsToAnswer: '',
                        //   marksPerQuestion: '',
                        //   customInstruction: ''
                        // }]
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
                  <p className="text-sm text-gray-500">{previewTemplate.templateName || previewTemplate.template_name || previewTemplate.name}</p>
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
                      {previewTemplate.instituteName || previewTemplate.institute_name || 'Institute Name'}
                    </h3>
                    <p className="text-gray-700 mb-1">
                      {previewTemplate.templateName || previewTemplate.template_name || previewTemplate.name}
                    </p>
                    {/* Removed "Internal Examination" line */}
                    {/* <p className="text-gray-700 mb-1">
                      Internal Examination {(previewTemplate.examDate || previewTemplate.exam_date) ? 
                        new Date(previewTemplate.examDate || previewTemplate.exam_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 
                        'August, 2025'}
                    </p> */}
                    
                    <div className="flex justify-between items-center text-sm font-medium max-w-md mx-auto">
                      <span>Total Marks: {calculateTotalMarks({ sections: previewTemplate.sections })}</span>
                      <span>Duration: {previewTemplate.duration || previewTemplate.duration_minutes || '0'} Minutes</span>
                    </div>
                    
                    {(previewTemplate.examDate || previewTemplate.exam_date) && (previewTemplate.examTime || previewTemplate.exam_time) && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span>Date: {(() => {
                          const dateStr = previewTemplate.examDate || previewTemplate.exam_date;
                          if (!dateStr) return 'N/A';
                          const date = new Date(dateStr);
                          return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-GB');
                        })()}</span>
                        <span className="mx-2">•</span>
                        <span>Time: {formatExamTime(previewTemplate.examTime || previewTemplate.exam_time)}</span>
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
                              {section.sectionName || section.section_name || `Section ${index + 1}`}
                            </h4>
                            <div className="text-sm text-gray-600 mb-2">
                              {(() => {
                                const sectionType = section.sectionType || section.section_type;
                                const totalQuestions = section.totalQuestions || section.total_questions || 0;
                                const questionsToAnswer = section.questionsToAnswer || section.questions_to_answer || totalQuestions;
                                
                                if (sectionType === 'Answer All Questions') {
                                  return <p>Answer all {totalQuestions} questions.</p>;
                                } else if (sectionType === 'Choose Any') {
                                  return <p>Answer any {questionsToAnswer} questions out of {totalQuestions}.</p>;
                                } else if (sectionType === 'Optional') {
                                  return <p>This section is optional. Answer any {questionsToAnswer} questions out of {totalQuestions}.</p>;
                                } else {
                                  return <p>Answer any {Math.min(totalQuestions || 5, 5)} Questions.</p>;
                                }
                              })()}
                            </div>
                            <p className="text-sm text-gray-600">
                              Each question carries {section.marksPerQuestion || section.marks_per_question || 0} mark{(section.marksPerQuestion || section.marks_per_question || 0) > 1 ? 's' : ''}.
                            </p>
                          </div>
                          
                          {/* Sample Questions */}
                          {/* <div className="space-y-4">
                            {Array.from({ length: section.totalQuestions || section.total_questions || 0 }, (_, qIndex) => (
                              <div key={qIndex} className="flex">
                                <span className="mr-4 font-medium text-gray-900 flex-shrink-0">{qIndex + 1})</span>
                                <div className="flex-1 min-w-0">
                                  {(() => {
                                    const questionType = section.questionType || section.question_type || 'Multiple Choice';
                                    if (questionType === 'Multiple Choice') {
                                      return (
                                        <div>
                                          <p className="text-gray-900 mb-2 break-words">Sample multiple choice question for {questionType}?</p>
                                          <div className="ml-4 space-y-1 text-sm text-gray-700">
                                            <p>a) Option A</p>
                                            <p>b) Option B</p>
                                            <p>c) Option C</p>
                                            <p>d) Option D</p>
                                          </div>
                                        </div>
                                      );
                                    } else if (questionType === 'True/False') {
                                      return <p className="text-gray-900 break-words">Sample statement for true/false evaluation. (True/False)</p>;
                                    } else if (questionType === 'One Word') {
                                      return <p className="text-gray-900 break-words">Fill in the blank: _____ is the capital of India.</p>;
                                    } else if (questionType === 'Short Answer') {
                                      return <p className="text-gray-900 break-words">Explain the concept in 2-3 sentences.</p>;
                                    } else if (questionType === 'Essay') {
                                      return <p className="text-gray-900 break-words">Write a detailed essay on the given topic (200-300 words).</p>;
                                    } else if (questionType === 'Fill in the Blank') {
                                      return <p className="text-gray-900 break-words">Complete the sentence: The process of _____ is essential for _____.</p>;
                                    } else {
                                      return <p className="text-gray-900 break-words">Sample {questionType.toLowerCase()} question.</p>;
                                    }
                                  })()}
                                </div>
                              </div>
                            ))}
                          </div> */}
                          
                          {/* Section Summary */}
                          <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-600">
                            <div className="flex justify-between items-center">
                              <span>Section Total:</span>
                              <span className="font-medium">
                                {(() => {
                                  const sectionType = section.sectionType || section.section_type;
                                  const totalQuestions = section.totalQuestions || section.total_questions || 0;
                                  const questionsToAnswer = section.questionsToAnswer || section.questions_to_answer || totalQuestions;
                                  const marksPerQuestion = section.marksPerQuestion || section.marks_per_question || 0;
                                  const totalMarks = section.totalMarks || (sectionType === 'Answer All Questions' 
                                    ? totalQuestions * marksPerQuestion
                                    : questionsToAnswer * marksPerQuestion
                                  );
                                  return `${totalMarks} marks`;
                                })()}
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
                      Total Duration: {previewTemplate.duration || previewTemplate.duration_minutes || '0'} Minutes | 
                      Total Marks: {calculateTotalMarks({ sections: previewTemplate.sections })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete {deleteTarget.type === 'paper' ? 'Question Paper' : 'Template'}?
              </h3>
              
              {/* Message */}
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900">"{deleteTarget.name}"</span>? 
                This action cannot be undone.
              </p>
              
              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionGeneration;
