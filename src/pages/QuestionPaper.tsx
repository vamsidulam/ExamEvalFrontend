import React, { useState, useEffect } from 'react';
import { templateService } from '../services/templateService';
import { questionPaperService, QuestionPaperCreate, GenerationResult } from '../services/questionPaperService';
import { getApiUrl } from '../config/api';
import {
  RefreshCw,
  Sparkles,
  CheckCircle,
  Layout,
  ArrowLeft,
  Upload,
  FileText,
  AlertCircle
} from 'lucide-react';
import QuestionPaperPreview from '../components/QuestionPaperPreview';

interface QuestionPaperProps {
  onBack: () => void;
  onQuestionGenerated: (questionPaper: any) => void;
}

const QuestionPaper: React.FC<QuestionPaperProps> = ({ onBack, onQuestionGenerated }) => {
  const [currentGenerationStep, setCurrentGenerationStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTemplates, setGeneratedTemplates] = useState<any[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [createdQuestionPaperId, setCreatedQuestionPaperId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestionPaper, setPreviewQuestionPaper] = useState<any>(null);
  
  // Question generation form data
  const [questionData, setQuestionData] = useState({
    name: '',
    additionalInstructions: '',
    // Step 2 data
    btlLevels: {
      remember: { enabled: false, percentage: 0 },
      understand: { enabled: false, percentage: 0 },
      apply: { enabled: false, percentage: 0 },
      analyze: { enabled: false, percentage: 0 },
      evaluate: { enabled: false, percentage: 0 },
      create: { enabled: false, percentage: 0 }
    },
    syllabus: '',
    syllabusFile: null as File | null
  });

  // Load templates when component mounts
  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await templateService.getTemplates();
      const templates = Array.isArray(response) ? response : (response.templates || []);
      setGeneratedTemplates(templates);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleQuestionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setQuestionData({
      ...questionData,
      [e.target.name]: e.target.value
    });
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    // Auto-generate question paper name based on template
    if (!questionData.name) {
      setQuestionData({
        ...questionData,
        name: `${template.course_name || template.name} - ${template.institute_name || 'Exam'}`
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await questionPaperService.uploadSyllabus(file);
      
      setQuestionData({
        ...questionData,
        syllabus: result.syllabus,
        syllabusFile: file
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentGenerationStep === 2) {
      // Validate step 2 before proceeding
      if (!questionData.syllabus.trim()) {
        setError('Please provide syllabus content');
        return;
      }
      
      // No need to create question paper separately - it will be created during generation
    }
    
    if (currentGenerationStep < 3) {
      setError(null);
      setCurrentGenerationStep(currentGenerationStep + 1);
    }
  };

  const handleBackStep = () => {
    if (currentGenerationStep > 1) {
      setError(null);
      setCurrentGenerationStep(currentGenerationStep - 1);
    }
  };

  const handleBTLChange = (level: string, field: string, value: any) => {
    setQuestionData({
      ...questionData,
      btlLevels: {
        ...questionData.btlLevels,
        [level]: {
          ...questionData.btlLevels[level],
          [field]: value
        }
      }
    });
  };

  const createQuestionPaper = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedTemplate) {
        throw new Error('Please select a template');
      }

      const btlLevels = questionPaperService.formatBTLLevels(questionData.btlLevels);
      
      const questionPaperData: QuestionPaperCreate = {
        template_id: selectedTemplate.id,
        name: questionData.name || `${selectedTemplate.name} - Question Paper`,
        syllabus: questionData.syllabus,
        additional_instructions: questionData.additionalInstructions || '',
        btl_levels: btlLevels
      };

      // Validate data
      const validationErrors = questionPaperService.validateQuestionPaperData(questionPaperData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const result = await questionPaperService.createQuestionPaper(questionPaperData);
      setCreatedQuestionPaperId(result.id);
      
    } catch (err) {
      console.error('Error creating question paper:', err);
      setError(err instanceof Error ? err.message : 'Failed to create question paper');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    if (!questionData.syllabus.trim()) {
      setError('Please provide syllabus content');
      return;
    }

    try {
      setIsGeneratingQuestions(true);
      setError(null);
      
      // Get total questions from template (new structure)
      const totalQuestions = selectedTemplate.totalQuestions || selectedTemplate.total_questions || 75;

      // Generate questions using the new API
      const result = await questionPaperService.generateQuestions({
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.templateName || selectedTemplate.template_name || selectedTemplate.name,
        syllabus: questionData.syllabus,
        additionalInstructions: questionData.additionalInstructions || '',
        numQuestions: totalQuestions,
        level: 'hard'
      });

      // Format result for compatibility
      const formattedResult = {
        success: result.success,
        id: result.id,
        question_paper_id: result.question_paper_id,
        questions: result.questions.map((q: any) => ({
          section_number: q.section_number,
          section_name: q.section_name,
          content: `${q.question_number}. ${q.question_text}`,
          raw_content: q.question_text
        })),
        template_name: result.template_name
      };
      
      setGenerationResult(formattedResult);
      
      // Fetch complete template details to ensure we have all information
      let completeTemplate = selectedTemplate;
      try {
        const templateDetails = await templateService.getTemplate(selectedTemplate.id);
        completeTemplate = templateDetails;
      } catch (err) {
        console.error('Error fetching template details:', err);
      }
      
      // Get the generated question paper details
      const questionPaperDetails = await questionPaperService.getQuestionPaper(result.id);
      
      // Create formatted question paper with complete template details
      const formattedQuestionPaper = {
        id: result.id,
        template_id: selectedTemplate.id,
        name: questionPaperDetails.name,
        template_name: completeTemplate.templateName || completeTemplate.template_name || completeTemplate.name,
        subject: 'General',
        grade: 'N/A',
        totalMarks: `${questionPaperDetails.totalMarks} Max Marks`,
        duration: `${completeTemplate.duration || completeTemplate.duration_minutes || '0'} Minutes`,
        createdAt: (() => {
          const dateStr = questionPaperDetails.createdAt;
          if (!dateStr) return new Date().toLocaleDateString();
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? new Date().toLocaleDateString() : date.toLocaleDateString();
        })(),
        status: 'Generated',
        questions: questionPaperDetails.questions,
        has_questions: true,
        template: {
          template_name: completeTemplate.templateName || completeTemplate.template_name || completeTemplate.name,
          institute_name: completeTemplate.instituteName || completeTemplate.institute_name,
          duration_minutes: completeTemplate.duration || completeTemplate.duration_minutes,
          exam_date: completeTemplate.examDate || completeTemplate.exam_date,
          exam_time: formatExamTime(completeTemplate.examTime || completeTemplate.exam_time),
          sections: completeTemplate.sections || []
        }
      };
      
      onQuestionGenerated(formattedQuestionPaper);
      
      // Show preview with complete template details
      setPreviewQuestionPaper(formattedQuestionPaper);
      setShowPreview(true);
      
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Helper function to calculate total marks from template
  const calculateTemplateMarks = (template: any) => {
    // New structure: use totalMarks directly
    if (template?.totalMarks) {
      return template.totalMarks;
    }
    if (template?.total_marks) {
      return template.total_marks;
    }
    
    // Legacy: calculate from sections (for backward compatibility)
    if (template?.sections && template.sections.length > 0) {
      return template.sections.reduce((total: number, section: any) => {
        const sectionType = section.sectionType || section.section_type;
        const totalQuestions = section.totalQuestions || section.total_questions || 0;
        const questionsToAnswer = section.questionsToAnswer || section.questions_to_answer || totalQuestions;
        const marksPerQuestion = section.marksPerQuestion || section.marks_per_question || 0;
        const totalMarks = section.totalMarks || (sectionType === 'Answer All Questions' 
          ? totalQuestions * marksPerQuestion
          : questionsToAnswer * marksPerQuestion
        );
        return total + totalMarks;
      }, 0);
    }
    
    return 0;
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
      // Authentication removed

      // Save structured questions to the database
      const response = await fetch(getApiUrl(`/api/generated-papers/${previewQuestionPaper.id}/questions`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestions)
      });

      if (!response.ok) {
        throw new Error('Failed to save edited questions to database');
      }

      console.log('Successfully saved structured questions to database');
      
      // Update the preview with saved questions
      setPreviewQuestionPaper({
        ...previewQuestionPaper,
        questions: updatedQuestions,
        updated_at: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('Error saving edited questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to save edited questions');
      throw err;
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewQuestionPaper(null);
    // Navigate back after closing preview
    setTimeout(() => {
      onBack();
    }, 500);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <span>ExamEval.ai</span>
                <span>/</span>
                <span>Question Papers</span>
                <span>/</span>
                <span className="text-gray-900">Generate Question Paper</span>
              </nav>
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  disabled={isGeneratingQuestions}
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Generate Question Paper (Step {currentGenerationStep}/3)
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Step 1: Choose Template */}
          {currentGenerationStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Template Selection */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Choose Template</h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">Loading templates...</p>
                  </div>
                ) : generatedTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <Layout className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No templates available. Please create a template first.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {selectedTemplate?.id === template.id && (
                          <div className="flex justify-end mb-2">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        
                        <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-b-lg flex items-center justify-between text-sm">
                          <span>{template.duration}</span>
                          <span>{template.maxMarks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedTemplate}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-12rem)] flex flex-col">
                  {/* Preview Header */}
                  <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-medium text-gray-900">Template Preview</h3>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {selectedTemplate ? (
                      <div>
                        {/* Question Paper Header */}
                        <div className="text-center mb-8 border-b border-gray-300 pb-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {selectedTemplate.instituteName || selectedTemplate.institute_name || 'Institute Name'}
                          </h3>
                          <p className="text-gray-700 mb-1">
                            {selectedTemplate.templateName || selectedTemplate.template_name || 'Template Name'}
                          </p>
                          {/* Removed "Internal Examination" line */}
                          {/* <p className="text-gray-700 mb-1">
                            Internal Examination {(selectedTemplate.examDate || selectedTemplate.exam_date) ? 
                              new Date(selectedTemplate.examDate || selectedTemplate.exam_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 
                              'August, 2025'}
                          </p> */}
                          
                          <div className="flex justify-between items-center text-sm font-medium">
                            <span>Max Mark: {(() => {
                              if (selectedTemplate.maxMarks) {
                                return selectedTemplate.maxMarks.replace(' Max Marks', '');
                              }
                              const totalMarks = calculateTemplateMarks(selectedTemplate);
                              return totalMarks > 0 ? totalMarks.toString() : '0';
                            })()}</span>
                            <span>Duration: {selectedTemplate.duration || selectedTemplate.duration_minutes || selectedTemplate.duration?.replace(' Minutes', '') || '0'} Minutes</span>
                          </div>
                          
                          {(selectedTemplate.examDate || selectedTemplate.exam_date) && (selectedTemplate.examTime || selectedTemplate.exam_time) && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span>Date: {(() => {
                                const dateStr = selectedTemplate.examDate || selectedTemplate.exam_date;
                                if (!dateStr) return 'N/A';
                                const date = new Date(dateStr);
                                return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-GB');
                              })()}</span>
                              <span className="mx-2">•</span>
                              <span>Time: {formatExamTime(selectedTemplate.examTime || selectedTemplate.exam_time)}</span>
                            </div>
                          )}
                        </div>

                        {/* Question Paper Sections */}
                        <div className="space-y-8">
                          {selectedTemplate.sections && selectedTemplate.sections.length > 0 ? (
                            selectedTemplate.sections.map((section: any, index: number) => (
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
                            Total Duration: {selectedTemplate.duration || selectedTemplate.duration_minutes || selectedTemplate.duration?.replace(' Minutes', '') || '0'} Minutes | 
                            Total Marks: {(() => {
                              if (selectedTemplate.maxMarks) {
                                return selectedTemplate.maxMarks.replace(' Max Marks', '');
                              }
                              const totalMarks = calculateTemplateMarks(selectedTemplate);
                              return totalMarks > 0 ? totalMarks.toString() : '0';
                            })()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Layout className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Template Preview</h4>
                        <p className="text-gray-500">Select a template from the left to see detailed preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Configure Question Parameters */}
          {currentGenerationStep === 2 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Configure Question Parameters</h2>
                
                {/* Question Paper Name */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Paper Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={questionData.name}
                    onChange={handleQuestionInputChange}
                    placeholder="Enter question paper name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* BTL Levels Section */}
                {/* <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Bloom's Taxonomy Levels (BTL)</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the cognitive levels you want to include in your question paper.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      key: 'remember', label: 'Remember (BTL-1)', desc: 'Recall facts, terms, concepts' },
                      { key: 'understand', label: 'Understand (BTL-2)', desc: 'Explain ideas or concepts' },
                      { key: 'apply', label: 'Apply (BTL-3)', desc: 'Use information in new situations' },
                      { key: 'analyze', label: 'Analyze (BTL-4)', desc: 'Draw connections among ideas' },
                      { key: 'evaluate', label: 'Evaluate (BTL-5)', desc: 'Justify decisions or courses of action' },
                      { key: 'create', label: 'Create (BTL-6)', desc: 'Produce new or original work' },
                    ].map((btl) => (
                      <div key={btl.key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            checked={questionData.btlLevels[btl.key].enabled}
                            onChange={(e) => handleBTLChange(btl.key, 'enabled', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                          />
                          <label className="text-sm font-medium text-gray-900">{btl.label}</label>
                        </div>
                        <p className="text-xs text-gray-500">{btl.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'remember', label: 'Remember (BTL-1)', desc: 'Recall facts, terms, concepts' },
                      { key: 'understand', label: 'Understand (BTL-2)', desc: 'Explain ideas or concepts' },
                      { key: 'apply', label: 'Apply (BTL-3)', desc: 'Use information in new situations' },
                      { key: 'analyze', label: 'Analyze (BTL-4)', desc: 'Draw connections among ideas' },
                      { key: 'evaluate', label: 'Evaluate (BTL-5)', desc: 'Justify decisions or courses of action' },
                      { key: 'create', label: 'Create (BTL-6)', desc: 'Produce new or original work' },
                    ].map((btl) => (
                      <div key={btl.key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            checked={questionData.btlLevels[btl.key].enabled}
                            onChange={(e) => handleBTLChange(btl.key, 'enabled', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                          />
                          <label className="text-sm font-medium text-gray-900">{btl.label}</label>
                        </div>
                        <p className="text-xs text-gray-500">{btl.desc}</p>
                      </div>
                    ))}
                  </div>

                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Selected Levels:</strong> {
                        Object.entries(questionData.btlLevels)
                          .filter(([_, level]) => level.enabled)
                          .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1))
                          .join(', ') || 'None selected'
                      }
                    </p>
                  </div>
                </div> */}

                {/* Syllabus Content */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Syllabus Content</h3>
                  
                  {/* File Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Syllabus File (PDF/TXT)
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept=".pdf,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                      {questionData.syllabusFile && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>{questionData.syllabusFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or Enter Syllabus Manually<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="syllabus"
                      value={questionData.syllabus}
                      onChange={handleQuestionInputChange}
                      rows={8}
                      placeholder="Paste or type the relevant syllabus content, chapters, or topics that questions should be based on..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Include chapter names, topics, subtopics, or specific content areas you want questions from.
                    </p>
                  </div>
                </div>

                {/* Additional Instructions */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Instructions</h3>
                  <textarea
                    name="additionalInstructions"
                    value={questionData.additionalInstructions}
                    onChange={handleQuestionInputChange}
                    rows={4}
                    placeholder="Any specific requirements, question formats, or special instructions for question generation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={handleBackStep}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <span>← Back</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={loading || !questionData.syllabus.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Next →</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review and Generate */}
          {currentGenerationStep === 3 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Generate</h2>
                
                {/* Summary of selections */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Selected Template</h3>
                    <p className="text-gray-700">{selectedTemplate?.name}</p>
                    <p className="text-sm text-gray-600">{selectedTemplate?.description}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Question Paper Details</h3>
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span> {questionData.name}
                      </div>
                      <div>
                        <span className="text-gray-600">Syllabus:</span> {
                          questionData.syllabus.length > 100 
                            ? `${questionData.syllabus.substring(0, 100)}...` 
                            : questionData.syllabus
                        }
                      </div>
                    </div>
                  </div>

                  {generationResult && (
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                      <h3 className="font-medium text-green-900 mb-2">✅ Questions Generated Successfully!</h3>
                      <p className="text-sm text-green-700 mb-3">
                        Generated {generationResult.questions.length} questions for "{generationResult.template_name}"
                      </p>
                      <div className="text-sm text-green-700 mb-3">
                        <strong>Total Marks:</strong> {generationResult.total_marks || calculateTemplateMarks(selectedTemplate)} | 
                        <strong> Duration:</strong> {selectedTemplate.duration_minutes || selectedTemplate.duration?.replace(' Minutes', '') || '0'} minutes
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            // Authentication removed
                            
                            // Fetch complete template details for preview
                            const templateResponse = await fetch(getApiUrl(`/api/templates/${selectedTemplate.id}`), {
                              method: 'GET',
                              headers: {}
                            });
                            
                            let completeTemplate = selectedTemplate;
                            if (templateResponse.ok) {
                              completeTemplate = await templateResponse.json();
                            }
                            
                            setPreviewQuestionPaper({
                              id: generationResult.id,
                              name: questionData.name,
                              template_name: completeTemplate.name || completeTemplate.template_name,
                              subject: completeTemplate.course_name || 'General',
                              grade: completeTemplate.course_code || 'N/A',
                              totalMarks: `${generationResult.total_marks || calculateTemplateMarks(completeTemplate)} Max Marks`,
                              duration: `${completeTemplate.duration_minutes || completeTemplate.duration?.replace(' Minutes', '') || '0'} Minutes`,
                              createdAt: new Date().toLocaleDateString(),
                              questions: generationResult.questions,
                              template: {
                                template_name: completeTemplate.name || completeTemplate.template_name,
                                institute_name: completeTemplate.institute_name,
                                course_name: completeTemplate.course_name,
                                course_code: completeTemplate.course_code,
                                duration_minutes: completeTemplate.duration_minutes || completeTemplate.duration?.replace(' Minutes', ''),
                                exam_date: completeTemplate.exam_date,
                                exam_time: formatExamTime(completeTemplate.exam_time || completeTemplate.examTime),
                                sections: completeTemplate.sections || []
                              }
                            });
                            setShowPreview(true);
                          } catch (err) {
                            console.error('Error preparing preview:', err);
                            setError('Failed to prepare preview');
                          }
                        }}
                        className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Preview Generated Questions
                      </button>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                  <button
                    onClick={handleBackStep}
                    disabled={isGeneratingQuestions}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleGenerateQuestions}
                    disabled={isGeneratingQuestions || !selectedTemplate || !questionData.syllabus.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Generating Questions...</span>
                      </>
                    ) : generationResult ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Questions Generated!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Generate Question Paper</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Paper Preview Modal */}
      <QuestionPaperPreview
        questionPaper={previewQuestionPaper}
        isOpen={showPreview}
        onClose={handleClosePreview}
        onSave={handleSaveQuestionEdits}
      />
    </>
  );
};

export default QuestionPaper;