import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Save,
  XCircle,
  FileText,
  Download,
  Printer
} from 'lucide-react';

interface QuestionPaperPreviewProps {
  questionPaper: any;
  onClose: () => void;
  onSave: (updatedQuestions: any[]) => void;
}

const QuestionPaperPreview: React.FC<QuestionPaperPreviewProps> = ({
  questionPaper,
  onClose,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState(questionPaper?.questions || []);
  const [saving, setSaving] = useState(false);

  // Update local state when questionPaper changes
  useEffect(() => {
    if (questionPaper?.questions) {
      setEditedQuestions([...questionPaper.questions]);
    }
  }, [questionPaper]);

  if (!questionPaper) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedQuestions([...questionPaper.questions]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedQuestions([...questionPaper.questions]);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      setIsEditing(false);
      if (onSave) {
        await onSave(editedQuestions);
      }
    } catch (error) {
      console.error('Error saving edits:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionEdit = (questionIndex: number, field: string, value: string | any[]) => {
    const updatedQuestions = [...editedQuestions];
    if (updatedQuestions[questionIndex]) {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value
      };
      setEditedQuestions(updatedQuestions);
    }
  };

  const renderStructuredQuestion = (question: any, index: number, isEditing: boolean = false) => {
    console.log(`🔍 Rendering question ${index + 1}:`, {
      question_type: question.question_type,
      options: question.options,
      correct_answer: question.correct_answer,
      question_text: question.question_text
    });

    if (isEditing) {
      return (
        <div key={question.id || index} className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question {question.question_number || index + 1} ({question.marks} marks)
            </label>
            <textarea
              value={question.question_text || ''}
              onChange={(e) => handleQuestionEdit(index, 'question_text', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Edit question text..."
            />
          </div>
          
          {/* Check for MCQ type with multiple variations */}
          {(question.question_type?.toLowerCase().includes('mcq') || 
            question.question_type?.toLowerCase().includes('multiple') ||
            question.question_type?.toLowerCase() === 'multiple choice') && 
           question.options && Array.isArray(question.options) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Options:</label>
              {question.options.map((option: string, optionIndex: number) => (
                <div key={optionIndex} className="mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const updatedOptions = [...(question.options || [])];
                      updatedOptions[optionIndex] = e.target.value;
                      handleQuestionEdit(index, 'options', updatedOptions);
                    }}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                </div>
              ))}
              
              {question.correct_answer && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer:</label>
                  <select
                    value={question.correct_answer}
                    onChange={(e) => handleQuestionEdit(index, 'correct_answer', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select correct answer</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={question.id || index} className="mb-6">
        <div className="flex items-start">
          <span className="mr-4 font-medium text-gray-900 flex-shrink-0">
            {question.question_number || index + 1})
          </span>
          <div className="flex-1">
            <p className="text-gray-900 mb-2">{question.question_text}</p>
            
            {/* Enhanced MCQ rendering with better type checking and option display */}
            {(question.question_type?.toLowerCase().includes('mcq') || 
              question.question_type?.toLowerCase().includes('multiple') ||
              question.question_type?.toLowerCase() === 'multiple choice') && 
             question.options && Array.isArray(question.options) && question.options.length > 0 && (
              <div className="ml-4 space-y-1 text-sm text-gray-700">
                {question.options.map((option: string, optionIndex: number) => {
                  // Extract the option letter from the option text (e.g., "A) Text" -> "A")
                  const optionLetter = option.match(/^([A-D])\)/)?.[1];
                  // Check if this option is the correct answer
                  const isCorrect = question.correct_answer && 
                    (question.correct_answer.toUpperCase() === optionLetter?.toUpperCase() ||
                     option.toLowerCase().includes('correct answer'));
                  
                  console.log(`Option ${optionIndex}:`, {
                    option,
                    optionLetter,
                    correct_answer: question.correct_answer,
                    isCorrect
                  });
                  
                  return (
                    <p key={optionIndex} className={
                      isCorrect 
                        ? 'font-medium text-green-700 bg-green-50 px-2 py-1 rounded' 
                        : 'text-gray-700'
                    }>
                      {option}
                      {isCorrect && <span className="ml-2 text-xs text-green-600">(Correct)</span>}
                    </p>
                  );
                })}
              </div>
            )}
            
            {/* Debug info for development */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-blue-500 bg-blue-50 p-2 rounded">
                Debug: Type: {question.question_type} | Options: {question.options?.length || 0} | Correct: {question.correct_answer}
              </div>
            )} */}
            
            <div className="mt-2 text-xs text-gray-500">
              {question.marks} mark{question.marks > 1 ? 's' : ''} • {question.question_type}
              {question.section_name && ` • ${question.section_name}`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionsBySection = (questions: any[], isEditing: boolean = false) => {
    if (!questions || questions.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No questions available</p>
        </div>
      );
    }

    // Group questions by section if they have section_name
    const questionsBySections = questions.reduce((acc: any, question: any, index: number) => {
      const sectionName = question.section_name || 'General Questions';
      if (!acc[sectionName]) {
        acc[sectionName] = [];
      }
      acc[sectionName].push({ ...question, originalIndex: index });
      return acc;
    }, {});

    return (
      <div className="space-y-8">
        {Object.entries(questionsBySections).map(([sectionName, sectionQuestions]: [string, any]) => (
          <div key={sectionName} className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{sectionName}</h3>
            {/* If section_type is Optional, print message instead of questions */}
            {sectionQuestions[0]?.section_type?.toLowerCase() === 'optional' ? (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-base text-gray-700">
              hi this is optional questions type
              </div>
            ) : (
              <div className="space-y-4">
                {sectionQuestions.map((question: any) => 
                  renderStructuredQuestion(question, question.originalIndex, isEditing)
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handlePrint = () => {
    generatePDF('print');
  };

  const handleDownload = () => {
    // Create PDF instead of text file
    generatePDF('save');
  };

  const generatePDF = async (mode: 'save' | 'print' = 'save') => {
    try {
      // Dynamic import of jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const template = questionPaper.template;
      const questions = isEditing ? editedQuestions : questionPaper.questions;
      
      // Start content slightly lower to avoid overlap with H.T.No boxes
      let yPosition = 34;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Helper function to add centered text
      const addCenteredText = (text: string, y: number, fontSize: number = 12, fontStyle: string = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
        return y + (fontSize * 0.5);
      };
      
      // Helper function to add text aligned left/right
      const addAlignedText = (leftText: string, rightText: string, y: number, fontSize: number = 12) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        doc.text(leftText, margin, y);
        const rightTextWidth = doc.getTextWidth(rightText);
        doc.text(rightText, pageWidth - margin - rightTextWidth, y);
        return y + (fontSize * 0.5);
      };
      
      // Helper function to add wrapped text
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, fontStyle: string = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * (fontSize * 0.4));
      };
      
      // Top-right H.T.No boxes
      (function drawHTNo() {
        const label = 'H.T.No:';
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const labelWidth = doc.getTextWidth(label);
        const y = 18; // fixed near top
        const totalBoxes = 10;
        const boxSize = 6.5;
        const gap = 2;
        const totalBoxesWidth = totalBoxes * boxSize + (totalBoxes - 1) * gap;
        const startX = pageWidth - margin - (labelWidth + 4 + totalBoxesWidth);
        doc.text(label, startX, y);
        let x = startX + labelWidth + 4;
        for (let i = 0; i < totalBoxes; i++) {
          doc.rect(x, y - boxSize + 2, boxSize, boxSize);
          x += boxSize + gap;
        }
      })();

      // Institute Name (Center, Bold, Large)
      yPosition = addCenteredText(
        template?.institute_name || 'Sasi Institute of technology and Engineering',
        yPosition, 16, 'bold'
      );
      yPosition += 2;
      
      // Template/Course Name (Center, Bold)
      yPosition = addCenteredText(
        template?.template_name || questionPaper.name || 'MID EXAM4',
        yPosition, 14, 'bold'
      );
      yPosition += 2;
      
      // Internal Examination (Center)
      yPosition = addCenteredText(
        'Internal Examination',
        yPosition, 12, 'normal'
      );
      yPosition += 2;
      
      // Course Code (Center)
      const courseInfo = template?.course_code || 'CN2 (CN002)';
      yPosition = addCenteredText(
        courseInfo,
        yPosition, 12, 'normal'
      );
      yPosition += 6;
      
      // Time and Max Marks (Left and Right aligned)
      const duration = template?.duration_minutes || questionPaper.duration?.replace(' Minutes', '') || '0';
      const totalMarks = calculateTotalMarks();
      yPosition = addAlignedText(
        `Time:${duration === '120' ? '2hrs' : Math.floor(parseInt(duration)/60) + 'hrs'}`,
        `Max.Marks:${totalMarks}m`,
        yPosition, 12
      );
      yPosition += 6;
      
      // No global instructions at top; we will render per-section instructions below
      // Horizontal separator under header
      // doc.setLineWidth(0.5);
      // doc.line(margin, yPosition, pageWidth - margin, yPosition);
      // yPosition += 15;
      
      // Questions section (mirror the preview: group by section with headers and instructions)
      if (questions && questions.length > 0) {
        // Build section order from template to preserve preview ordering
        const sectionOrder: string[] = (template?.sections || [])
          .map((s: any) => s.section_name)
          .filter(Boolean);

        // Group questions by section name
        const questionsBySections: Record<string, any[]> = questions.reduce((acc: any, q: any, index: number) => {
          const name = q.section_name || 'Questions';
          if (!acc[name]) acc[name] = [];
          acc[name].push({ ...q, originalIndex: index });
          return acc;
        }, {});

        // Determine final ordered sections: template order first, then any remaining
        const orderedSectionNames = [
          ...sectionOrder.filter((n) => questionsBySections[n] && questionsBySections[n].length > 0),
          ...Object.keys(questionsBySections).filter((n) => !sectionOrder.includes(n))
        ];

        orderedSectionNames.forEach((sectionName) => {
          const sectionMeta = (template?.sections || []).find((s: any) => s.section_name === sectionName) || {};
          const sectionQuestions = questionsBySections[sectionName] || [];

          // New page if needed for section header
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 30;
          }

          

          // Section header
          yPosition = addCenteredText(sectionName, yPosition, 13, 'bold');
          // yPosition += 0.2;

          // Line at top of section
          doc.setLineWidth(0.3);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 6;

          // Section instruction (centered under section title)
          let sectionInstruction = '';
          if (sectionMeta.section_type === 'Answer All Questions') {
            sectionInstruction = `Answer all ${sectionMeta.total_questions} questions.`;
          } else if (sectionMeta.section_type === 'Choose Any') {
            sectionInstruction = `Answer any ${sectionMeta.questions_to_answer} questions out of ${sectionMeta.total_questions}.`;
          } else if (sectionMeta.section_type === 'Optional') {
            sectionInstruction = `Answer any ${sectionMeta.questions_to_answer || sectionMeta.total_questions} questions out of ${sectionMeta.total_questions}.`;
          } else if (sectionMeta.total_questions) {
            sectionInstruction = `Answer any ${Math.min(sectionMeta.total_questions, 5)} Questions.`;
          }

          if (sectionInstruction) {
            // Centered instruction
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const tw = doc.getTextWidth(sectionInstruction);
            const x = (pageWidth - tw) / 2;
            doc.text(sectionInstruction, x, yPosition);
            yPosition += 16;
          }

          // Separator line after section instruction
          // doc.setLineWidth(0.3);
          // doc.line(margin, yPosition, pageWidth - margin, yPosition);
          // yPosition += 8;

          // Each question in this section
          sectionQuestions.forEach((question: any, idx: number) => {
            if (yPosition > 260) {
              doc.addPage();
              yPosition = 30;
            }

            // Left: question number + text
            const numberLabel = `${question.question_number || idx + 1})`;
            // Remove any trailing [xM] marks from text since we show them on the right
            const cleanedText = String(question.question_text || '').replace(/\s*\[[0-9]+\.?[0-9]*\s*M\]/gi, '').trim();
            const mainText = `${numberLabel} ${cleanedText}`;
            // Right: BTL and Marks
            const btl = (question.btl_level ? `BTL${String(question.btl_level).replace(/[^0-9]/g, '')}` : 'BTL3');
            const marksStr = `[${question.marks || 0}M]`;
            const rightText = `${btl}   ${marksStr}`;

            // Render right-aligned BTL/Marks at current y
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const rtw = doc.getTextWidth(rightText);
            doc.text(rightText, pageWidth - margin - rtw, yPosition);

            // Render main question text with wrapping, leaving space for right text
            const effectiveWidth = Math.max(80, contentWidth - (rtw + 8));
            yPosition = addWrappedText(mainText, margin, yPosition, effectiveWidth, 11, 'normal');
            yPosition += 6;

            if (question.question_type === 'MCQ' && question.options) {
              question.options.forEach((option: string, optionIndex: number) => {
                if (yPosition > 270) {
                  doc.addPage();
                  yPosition = 30;
                }
                const optionLetter = String.fromCharCode(97 + optionIndex);
                yPosition = addWrappedText(`${optionLetter}) ${option}`, margin + 8, yPosition, contentWidth - 8, 10, 'normal');
                yPosition += 4;
              });
              yPosition += 3;
            }
          });

          // Section footer line
          // yPosition += 4;
          // doc.setLineWidth(0.2);
          // doc.line(margin, yPosition, pageWidth - margin, yPosition);
          // yPosition += 8;
        });
      } else {
        // If no questions, show placeholder text
        yPosition = addWrappedText(
          'Questions will be displayed here once generated.',
          margin, yPosition, contentWidth, 11, 'normal'
        );
      }
      
      // Save or Print
      if (mode === 'print') {
        // Open native print dialog without downloading
        // Some browsers require autoPrint + blob URL
        // Using blob URL ensures no download prompt
        // @ts-ignore
        if (doc.autoPrint) doc.autoPrint();
        const blobUrl = doc.output('bloburl');
        const win = window.open(blobUrl.toString(), '_blank');
        if (!win) {
          // Fallback: create iframe and print
          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          document.body.appendChild(iframe);
          iframe.src = blobUrl.toString();
          iframe.onload = () => {
            // @ts-ignore
            iframe.contentWindow?.print();
          };
        }
      } else {
        const fileName = `${questionPaper.name || 'Question Paper'}.pdf`;
        doc.save(fileName);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download if PDF generation fails
      generateTextDownload();
    }
  };

  const generateTextDownload = () => {
    const content = generateTextContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${questionPaper.name || 'Question Paper'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateTextContent = () => {
    const questions = isEditing ? editedQuestions : questionPaper.questions;
    const template = questionPaper.template;
    
    let content = `${template?.institute_name || questionPaper.template_name || questionPaper.name}\n`;
    content += `${template?.template_name || questionPaper.name}\n`;
    content += `Internal Examination\n`;
    content += `${template?.course_name || 'Course'} (${template?.course_code || 'Code'})\n\n`;
    content += `Max Marks: ${calculateTotalMarks()} | Duration: ${template?.duration_minutes || 0} Minutes\n`;
    if (template?.exam_date) {
      content += `Date: ${new Date(template.exam_date).toLocaleDateString()} | Time: ${template.exam_time || 'TBA'}\n`;
    }
    content += `\n${'='.repeat(60)}\n\n`;
    
    // Add instructions
    content += `Instructions:\n`;
    content += `• Read all questions carefully before attempting.\n`;
    content += `• Write your answers in the space provided.\n`;
    content += `• All questions are compulsory unless otherwise mentioned.\n`;
    content += `• Use clear and legible handwriting.\n\n`;
    
    questions.forEach((section: any, index: number) => {
      content += `${section.content || section.question_text}\n\n`;
    });
    
    content += `${'='.repeat(60)}\n`;
    content += `--- End of Question Paper ---\n`;
    content += `Total Duration: ${template?.duration_minutes || 0} Minutes | Total Marks: ${calculateTotalMarks()}`;
    
    return content;
  };

  const calculateTotalMarks = () => {
    const template = questionPaper.template;
    if (!template?.sections) return questionPaper.totalMarks?.replace(' Max Marks', '') || '0';
    
    return template.sections.reduce((total: number, section: any) => {
      if (section.section_type === 'Answer All Questions') {
        return total + (section.total_questions * section.marks_per_question);
      } else {
        return total + (section.questions_to_answer * section.marks_per_question);
      }
    }, 0);
  };

  const currentQuestions = isEditing ? editedQuestions : questionPaper.questions;
  const template = questionPaper.template;

  // Template Preview UI (matches step 1 format exactly)
  if (showTemplatePreview) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50 print:hidden" onClick={() => setShowTemplatePreview(false)}></div>
        <div className="relative flex items-center justify-center min-h-screen p-4 print:p-0 print:min-h-0">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col print:rounded-none print:shadow-none print:max-w-none print:max-h-none">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Question Paper Preview</h2>
                <p className="text-sm text-gray-500">{questionPaper.name}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Content - Match step 1 format exactly */}
            <div className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-8">
              <div className="print-content">
                {/* Question Paper Header - matches step 1 format exactly */}
                <div className="text-center mb-8 border-b border-gray-300 pb-6 print:border-black">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 print:text-2xl">
                    {template?.institute_name || questionPaper.template_name || 'Institute Name'}
                  </h3>
                  <p className="text-gray-700 mb-1">
                    {template?.template_name || questionPaper.name}
                  </p>
                  <p className="text-gray-700 mb-1">
                    Internal Examination {template?.exam_date ? 
                      new Date(template.exam_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 
                      'August, 2025'}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {template?.course_code ? 
                      `${template.course_name} (${template.course_code})` : 
                      template?.course_name || questionPaper.subject}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm font-medium max-w-md mx-auto">
                    <span>Max Mark: {calculateTotalMarks()}</span>
                    <span>Duration: {template?.duration_minutes || questionPaper.duration?.replace(' Minutes', '') || '0'} Minutes</span>
                  </div>
                  
                  {template?.exam_date && template?.exam_time && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span>Date: {new Date(template.exam_date).toLocaleDateString('en-GB')}</span>
                      <span className="mx-2">•</span>
                      <span>Time: {template.exam_time}</span>
                    </div>
                  )}
                </div>

                {/* Question Paper Sections - matches step 1 format exactly */}
                <div className="space-y-8">
                  {template?.sections && template.sections.length > 0 ? (
                    template.sections.map((section: any, index: number) => (
                      <div key={index} className="print-section">
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
                        
                        {/* Generated Questions or Sample Questions */}
                        <div className="space-y-4">
                          {/* If we have actual generated questions for this section, show them */}
                          {currentQuestions.filter((q: any) => q.section_name === section.section_name).length > 0 ? (
                            currentQuestions
                              .filter((q: any) => q.section_name === section.section_name)
                              .map((question: any, qIndex: number) => (
                                <div key={qIndex} className="flex">
                                  <span className="mr-4 font-medium text-gray-900 flex-shrink-0">
                                    {question.question_number || qIndex + 1})
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 mb-2 break-words">{question.question_text}</p>
                                    
                                    {/* Enhanced MCQ rendering in template preview */}
                                    {(question.question_type?.toLowerCase().includes('mcq') || 
                                      question.question_type?.toLowerCase().includes('multiple') ||
                                      question.question_type?.toLowerCase() === 'multiple choice') && 
                                     question.options && Array.isArray(question.options) && question.options.length > 0 && (
                                      <div className="ml-4 space-y-1 text-sm text-gray-700">
                                        {question.options.map((option: string, optionIndex: number) => {
                                          const optionLetter = option.match(/^([A-D])\)/)?.[1];
                                          const isCorrect = question.correct_answer && 
                                            (question.correct_answer.toUpperCase() === optionLetter?.toUpperCase() ||
                                             option.toLowerCase().includes('correct answer'));
                                          
                                          return (
                                            <p key={optionIndex} className={
                                              isCorrect 
                                                ? 'font-medium text-green-700' 
                                                : ''
                                            }>
                                              {option}
                                            </p>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                          ) : (
                            /* Show sample questions if no generated questions */
                            Array.from({ length: section.total_questions || 0 }, (_, qIndex) => (
                              <div key={qIndex} className="flex">
                                <span className="mr-4 font-medium text-gray-900 flex-shrink-0">{qIndex + 1})</span>
                                <div className="flex-1 min-w-0">
                                  {(section.question_type?.toLowerCase().includes('multiple') || 
                                    section.question_type?.toLowerCase() === 'multiple choice') ? (
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
                            ))
                          )}
                        </div>
                        
                        {/* Section Summary - matches step 1 format */}
                        <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-600 print:bg-white print:border print:border-gray-300">
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

                
                {/* Paper Footer - matches step 1 format */}
                <div className="mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-500 print:border-black">
                  <p>--- End of Question Paper ---</p>
                  <p className="mt-2">
                    Total Duration: {template?.duration_minutes || questionPaper.duration?.replace(' Minutes', '') || '0'} Minutes | 
                    Total Marks: {calculateTotalMarks()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Print Styles for Template Preview */}
        <style>{`
          @media print {
            /* Hide all UI elements */
            .print\\:hidden { display: none !important; }
            button { display: none !important; }
            
            /* Reset modal styles for print */
            .fixed.inset-0.z-50.overflow-hidden {
              position: static !important;
              overflow: visible !important;
            }
            
            .relative.flex.items-center.justify-center {
              display: block !important;
            }
            
            .print\\:rounded-none { border-radius: 0 !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:max-w-none { max-width: none !important; }
            .print\\:max-h-none { max-height: none !important; }
            .print\\:p-0 { padding: 0 !important; }
            .print\\:min-h-0 { min-height: 0 !important; }
            .print\\:overflow-visible { overflow: visible !important; }
            .print\\:p-8 { padding: 2rem !important; }
            
            /* Content styling */
            .print-content {
              width: 100% !important;
              max-width: none !important;
            }
            
            .print-section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Preserve all colors and backgrounds */
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
            }
            
            .print\\:bg-white,
            .bg-gray-100 { 
              background-color: #f3f4f6 !important; 
              -webkit-print-color-adjust: exact !important;
            }
            
            .print\\:border { border: 1px solid !important; }
            .print\\:border-gray-300 { border-color: #d1d5db !important; }
            .print\\:border-black { border-color: black !important; }
            .print\\:text-2xl { font-size: 1.5rem !important; }
            
            /* Typography for print */
            body { font-size: 11pt !important; line-height: 1.4 !important; }
            h1 { font-size: 16pt !important; }
            h2 { font-size: 14pt !important; }
            h3 { font-size: 13pt !important; }
            .text-lg { font-size: 12pt !important; }
            .text-base { font-size: 11pt !important; }
            .text-sm { font-size: 10pt !important; }
            .text-xs { font-size: 9pt !important; }
          }
        `}</style>
      </div>
    );
  }

  // Main preview UI
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Question Paper Preview</h2>
                <p className="text-sm text-gray-500">{questionPaper.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEdit}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Questions</span>
                  </button>
                  {/* Preview button to show template preview */}
                  <button
                    onClick={() => setShowTemplatePreview(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <span>Preview</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              )}
              
              <button
                onClick={onClose}
                disabled={isEditing}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-none print:max-w-none">
              {/* Question Paper Header */}
              <div className="text-center mb-8 border-b border-gray-300 pb-6 print:border-black">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {template?.institute_name || questionPaper.template_name || 'Institution Name'}
                </h1>
                <p className="text-gray-700 mb-2">
                  {template?.template_name || questionPaper.name}
                </p>
                <p className="text-gray-700 mb-2">
                  Internal Examination {template?.exam_date ? 
                    new Date(template.exam_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 
                    'Session 2024-25'}
                </p>
                <p className="text-gray-700 mb-4">
                  {template?.course_name || questionPaper.subject || 'Course'} ({template?.course_code || questionPaper.grade || 'Code'})
                </p>
                
                <div className="flex justify-between items-center text-sm font-medium max-w-md mx-auto mb-2">
                  <span>Max Marks: {calculateTotalMarks()}</span>
                  <span>Duration: {template?.duration_minutes || questionPaper.duration?.replace(' Minutes', '') || '0'} Minutes</span>
                </div>
                
                {template?.exam_date && (
                  <div className="mt-4 text-sm text-gray-600">
                    <span>Date: {new Date(template.exam_date).toLocaleDateString('en-GB')}</span>
                    {template.exam_time && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Time: {template.exam_time}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md print:bg-white print:border-gray-300">
                <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Read all questions carefully before attempting.</li>
                  <li>• Write your answers in the space provided.</li>
                  <li>• All questions are compulsory unless otherwise mentioned.</li>
                  <li>• Use clear and legible handwriting.</li>
                  {questionPaper.additional_instructions && (
                    <li>• {questionPaper.additional_instructions}</li>
                  )}
                </ul>
              </div>

              {/* Questions - Updated to handle structured format */}
              <div className="space-y-8">
                {isEditing ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Edit Questions</h3>
                    {renderQuestionsBySection(editedQuestions, true)}
                  </div>
                ) : (
                  renderQuestionsBySection(currentQuestions, false)
                )}
              </div>

              {/* Paper Summary */}
              {template?.sections && (
                <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-3">Paper Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {template.sections.map((section: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{section.section_name || `Section ${index + 1}`}:</span>
                        <span className="font-medium">
                          {section.section_type === 'Answer All Questions' 
                            ? section.total_questions * section.marks_per_question
                            : section.questions_to_answer * section.marks_per_question
                          } marks
                        </span>
                      </div>
                    ))}
                    <div className="col-span-full border-t pt-2 flex justify-between font-medium">
                      <span>Total Marks:</span>
                      <span>{calculateTotalMarks()} marks</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500 print:border-black">
                <p>--- End of Question Paper ---</p>
                <p className="mt-2">
                  Total Duration: {template?.duration_minutes || questionPaper.duration?.replace(' Minutes', '') || '0'} Minutes | 
                  Total Marks: {calculateTotalMarks()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          {!isEditing && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 print:hidden">
              <div className="text-sm text-gray-500">
                <div>Generated on {questionPaper.createdAt || new Date().toLocaleDateString()}</div>
                {questionPaper.btl_levels?.length > 0 && (
                  <div className="mt-1">BTL Levels: {questionPaper.btl_levels.join(', ')}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:border-black { border-color: black !important; }
          .print\\:border-gray-300 { border-color: #d1d5db !important; }
          .print\\:border-gray-400 { border-color: #9ca3af !important; }
          .print\\:max-w-none { max-width: none !important; }
          
          body { -webkit-print-color-adjust: exact; }
          .bg-yellow-50 { background-color: #fffbeb !important; }
          .border-yellow-200 { border-color: #fde68a !important; }
        }
      `}</style>
    </div>
  );
};

export default QuestionPaperPreview;




