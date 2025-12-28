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
              Question {question.question_number ?? (index + 1)} ({question.marks} marks)
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
            {question.question_number ?? (index + 1)})
          </span>
          <div className="flex-1">
            <p className="text-gray-900 mb-2">
              {String(question.question_text || '').replace(/^\d+[\)\.]\s*/, '').trim()}
            </p>
            
            {/* Enhanced MCQ rendering with better type checking and option display */}
            {/* Only show options if show_options is true (or undefined for backward compatibility) */}
            {(question.question_type?.toLowerCase().includes('mcq') || 
              question.question_type?.toLowerCase().includes('multiple') ||
              question.question_type?.toLowerCase() === 'multiple choice') && 
             question.options && Array.isArray(question.options) && question.options.length > 0 &&
             (question.show_options !== false) && ( // Show options only if show_options is not explicitly false
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
    // Create PDF and download
    try {
      generatePDF('save');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
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
      
      // Removed "Internal Examination" line
      // yPosition = addCenteredText(
      //   'Internal Examination',
      //   yPosition, 12, 'normal'
      // );
      // yPosition += 6;
      
      // Time and Max Marks (Left and Right aligned)
      const duration = parseInt(template?.duration_minutes || questionPaper.duration?.replace(' Minutes', '') || '0');
      const totalMarks = calculateTotalMarks();
      
      // Format time properly
      let timeText = '';
      if (duration >= 60) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        if (minutes > 0) {
          timeText = `Time: ${hours} hr ${minutes} min`;
        } else {
          timeText = `Time: ${hours} hr${hours > 1 ? 's' : ''}`;
        }
      } else {
        timeText = `Time: ${duration} min`;
      }
      
      yPosition = addAlignedText(
        timeText,
        `Max.Marks: ${totalMarks}`,
        yPosition, 12
      );
      yPosition += 6;
      
      // No global instructions at top; we will render per-section instructions below
      // Horizontal separator under header
      // doc.setLineWidth(0.5);
      // doc.line(margin, yPosition, pageWidth - margin, yPosition);
      // yPosition += 15;
      
      // Questions section - group by subject (section_name)
      if (questions && questions.length > 0) {
        // Group questions by subject (section_name)
        const questionsBySubject: Record<string, any[]> = questions.reduce((acc: any, q: any, index: number) => {
          const subject = q.section_name || q.sectionName || 'General';
          if (!acc[subject]) acc[subject] = [];
          acc[subject].push({ ...q, originalIndex: index });
          return acc;
        }, {});

        // Order subjects: Maths, Physics, Chemistry
        const subjectOrder = ['Maths', 'Physics', 'Chemistry'];
        const orderedSubjects = [
          ...subjectOrder.filter((s) => questionsBySubject[s] && questionsBySubject[s].length > 0),
          ...Object.keys(questionsBySubject).filter((s) => !subjectOrder.includes(s))
        ];

        orderedSubjects.forEach((subjectName) => {
          const subjectQuestions = questionsBySubject[subjectName] || [];

          // New page if needed for subject header
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 30;
          }

          // Subject header
          yPosition = addCenteredText(subjectName, yPosition, 13, 'bold');

          // Line at top of subject
          doc.setLineWidth(0.3);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 8;

          // Separator line after section instruction
          // doc.setLineWidth(0.3);
          // doc.line(margin, yPosition, pageWidth - margin, yPosition);
          // yPosition += 8;

          // Helper function to convert superscript notation (m^2 -> m²)
          const convertSuperscripts = (text: string): string => {
            // Map common superscripts
            const superscriptMap: { [key: string]: string } = {
              '^0': '⁰', '^1': '¹', '^2': '²', '^3': '³', '^4': '⁴', '^5': '⁵',
              '^6': '⁶', '^7': '⁷', '^8': '⁸', '^9': '⁹', '^+': '⁺', '^-': '⁻',
              '^(': '⁽', '^)': '⁾', '^n': 'ⁿ', '^x': 'ˣ', '^y': 'ʸ'
            };
            
            // Replace patterns like m^2, x^3, etc. with superscripts
            // Handle both single digit and multi-digit exponents
            return text.replace(/\^(\d+|[+\-()nxy])/g, (match, exp) => {
              const key = `^${exp}`;
              if (superscriptMap[key]) {
                return superscriptMap[key];
              }
              // For multi-digit exponents, convert each digit
              if (/^\d+$/.test(exp)) {
                return exp.split('').map(d => superscriptMap[`^${d}`] || d).join('');
              }
              return match;
            });
          };

          // Each question in this subject
          subjectQuestions.forEach((question: any, idx: number) => {
            if (yPosition > 260) {
              doc.addPage();
              yPosition = 30;
            }

            // Left: question number + text (no BTL or marks on right)
            // Always use question_number for sequential 1-75 numbering across all subjects
            const numberLabel = `${question.question_number ?? (idx + 1)})`;
            // Remove any trailing [xM] marks and BTL from text
            let cleanedText = String(question.question_text || '')
              .replace(/\s*\[[0-9]+\.?[0-9]*\s*M\]/gi, '')
              .replace(/\s*BTL\d+/gi, '')
              .trim();
            
            // Remove leading question numbers (e.g., "1) ", "1. ", "1) " at start)
            cleanedText = cleanedText.replace(/^\d+[\)\.]\s*/, '').trim();
            
            // Convert superscripts (m^2 -> m²)
            cleanedText = convertSuperscripts(cleanedText);
            
            const mainText = `${numberLabel} ${cleanedText}`;

            // Render main question text with full width (no right-side BTL/marks)
            yPosition = addWrappedText(mainText, margin, yPosition, contentWidth, 11, 'normal');
            yPosition += 6;

            // Handle MCQ options - display with proper spacing
            // Hide options for questions 21-25, 46-50, 71-75 (show_options === false)
            const shouldShowOptions = question.show_options !== false; // Show if true or undefined, hide if false
            
            if (shouldShowOptions && 
                (question.question_type?.toLowerCase().includes('mcq') || 
                 question.question_type?.toLowerCase().includes('multiple') ||
                 question.question_type?.toLowerCase() === 'multiple choice') && 
                question.options && Array.isArray(question.options) && question.options.length > 0) {
              
              // Format options with better spacing and alignment
              // Each option: A) text, with consistent spacing between options
              const formattedOptions = question.options.map((opt: string, index: number) => {
                // Extract option letter and text
                const letterMatch = opt.match(/^([A-D])\)/i);
                const letter = letterMatch ? letterMatch[1] : String.fromCharCode(65 + index);
                const cleanOpt = opt.replace(/^[A-D]\)\s*/i, '').trim();
                return { letter, text: cleanOpt };
              });
              
              // Calculate spacing for better alignment
              // Use tab-like spacing: each option gets consistent width
              const maxOptionWidth = Math.max(...formattedOptions.map(opt => opt.text.length));
              const spacing = '    '; // 4 spaces between options
              
              // Format options on same line with proper spacing
              const optionsText = formattedOptions
                .map(opt => `${opt.letter}) ${opt.text}`)
                .join(spacing);
              
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 30;
              }
              
              // Add indentation for options (align with question text)
              const optionIndent = margin + 8;
              yPosition = addWrappedText(optionsText, optionIndent, yPosition, contentWidth - 8, 10, 'normal');
              yPosition += 6;
            } else if (shouldShowOptions && question.question_text) {
              // Try to extract options from question text if not in options array
              const optionPattern = /([A-D])\)\s*([^A-D\)]+?)(?=\s+[A-D]\)|$)/gi;
              const matches = Array.from(question.question_text.matchAll(optionPattern));
              if (matches.length >= 2) {
                const optionsText = matches
                  .map((match) => `${match[1]}) ${match[2].trim()}`)
                  .join('    '); // 4 spaces between options
                
                if (yPosition > 270) {
                  doc.addPage();
                  yPosition = 30;
                }
                
                const optionIndent = margin + 8;
                yPosition = addWrappedText(optionsText, optionIndent, yPosition, contentWidth - 8, 10, 'normal');
                yPosition += 6;
              }
            }
            // If show_options === false, skip rendering options entirely
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
        // Download PDF
        const fileName = `${(questionPaper.name || 'Question Paper').replace(/[^a-z0-9]/gi, '_')}.pdf`;
        try {
          doc.save(fileName);
        } catch (error) {
          console.error('Error saving PDF:', error);
          // Fallback: use blob URL
          const blob = doc.output('blob');
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please check the console for details and ensure jsPDF is properly installed.');
      throw error; // Don't fallback to text
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
      const date = new Date(template.exam_date);
      const dateStr = isNaN(date.getTime()) ? template.exam_date : date.toLocaleDateString();
      content += `Date: ${dateStr} | Time: ${template.exam_time || 'TBA'}\n`;
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
    // First, try to calculate from actual questions if available
    const currentQuestions = isEditing ? editedQuestions : questionPaper.questions;
    if (currentQuestions && Array.isArray(currentQuestions) && currentQuestions.length > 0) {
      const total = currentQuestions.reduce((sum: number, q: any) => {
        const marks = q.marks || q.marksPerQuestion || 0;
        return sum + (typeof marks === 'number' ? marks : parseFloat(marks) || 0);
      }, 0);
      if (total > 0) return total;
    }
    
    // Fallback to template sections
    const template = questionPaper.template;
    if (!template?.sections) {
      // Try to get from questionPaper.totalMarks
      if (questionPaper.totalMarks) {
        const marks = typeof questionPaper.totalMarks === 'string' 
          ? questionPaper.totalMarks.replace(' Max Marks', '').replace(' marks', '')
          : questionPaper.totalMarks;
        return parseFloat(marks.toString()) || 0;
      }
      return 0;
    }
    
    return template.sections.reduce((total: number, section: any) => {
      const sectionType = section.sectionType || section.section_type;
      const totalQuestions = section.totalQuestions || section.total_questions || 0;
      const questionsToAnswer = section.questionsToAnswer || section.questions_to_answer || totalQuestions;
      const marksPerQuestion = section.marksPerQuestion || section.marks_per_question || 0;
      const totalMarks = section.totalMarks || (sectionType === 'Answer All Questions' 
        ? totalQuestions * marksPerQuestion
        : questionsToAnswer * marksPerQuestion
      );
      
      return total + (totalMarks || 0);
    }, 0);
  };
  
  const calculateSectionMarks = (section: any, sectionQuestions: any[] = []) => {
    // If we have actual questions for this section, calculate from them
    if (sectionQuestions && sectionQuestions.length > 0) {
      const total = sectionQuestions.reduce((sum: number, q: any) => {
        const marks = q.marks || q.marksPerQuestion || 0;
        const marksNum = typeof marks === 'number' ? marks : parseFloat(String(marks)) || 0;
        return sum + marksNum;
      }, 0);
      if (total > 0) return total;
    }
    
    // Otherwise calculate from section definition
    const sectionType = section.sectionType || section.section_type;
    const totalQuestions = parseInt(section.totalQuestions || section.total_questions || '0');
    const questionsToAnswer = parseInt(section.questionsToAnswer || section.questions_to_answer || String(totalQuestions));
    const marksPerQuestion = parseFloat(section.marksPerQuestion || section.marks_per_question || '0');
    
    // Check if section has totalMarks already calculated
    if (section.totalMarks) {
      const totalMarks = typeof section.totalMarks === 'number' ? section.totalMarks : parseFloat(String(section.totalMarks)) || 0;
      if (totalMarks > 0) return totalMarks;
    }
    
    // Calculate based on section type
    if (sectionType === 'Answer All Questions') {
      return totalQuestions * marksPerQuestion;
    } else {
      return questionsToAnswer * marksPerQuestion;
    }
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

                {/* Question Paper Sections - Show questions grouped by subject */}
                <div className="space-y-8">
                  {(() => {
                    // Group questions by section_name (subject)
                    const questionsBySubject: Record<string, any[]> = {};
                    currentQuestions.forEach((q: any) => {
                      const subject = q.section_name || q.sectionName || 'General';
                      if (!questionsBySubject[subject]) {
                        questionsBySubject[subject] = [];
                      }
                      questionsBySubject[subject].push(q);
                    });
                    
                    // Order subjects: Maths, Physics, Chemistry
                    const subjectOrder = ['Maths', 'Physics', 'Chemistry'];
                    const subjects = [
                      ...subjectOrder.filter((s) => questionsBySubject[s] && questionsBySubject[s].length > 0),
                      ...Object.keys(questionsBySubject).filter((s) => !subjectOrder.includes(s))
                    ];
                    
                    if (subjects.length > 0) {
                      return subjects.map((subject, subjectIndex: number) => {
                        const subjectQuestions = questionsBySubject[subject];
                        const subjectMarks = subjectQuestions.reduce((sum: number, q: any) => {
                          return sum + (q.marks || 0);
                        }, 0);
                        
                        return (
                          <div key={subjectIndex} className="print-section">
                            <div className="text-center mb-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {subject}
                              </h4>
                            </div>
                            
                            {/* Generated Questions */}
                            <div className="space-y-4">
                              {subjectQuestions.map((question: any, qIndex: number) => (
                                <div key={qIndex} className="flex">
                                  <span className="mr-4 font-medium text-gray-900 flex-shrink-0">
                                    {question.question_number ?? (qIndex + 1)})
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    {(() => {
                                      // Extract question text and options
                                      let questionText = question.question_text || '';
                                      // Remove leading question numbers (e.g., "1) ", "1. " at start)
                                      questionText = questionText.replace(/^\d+[\)\.]\s*/, '').trim();
                                      let options: string[] = [];
                                      
                                      // First, check if options are in the options array
                                      if (question.options && Array.isArray(question.options) && question.options.length > 0) {
                                        options = question.options;
                                      } else {
                                        // Try to extract options from question text
                                        const optionPattern = /([A-D])\)\s*([^A-D\)]+?)(?=\s+[A-D]\)|$)/gi;
                                        const matches = Array.from(questionText.matchAll(optionPattern));
                                        if (matches.length >= 2) {
                                          options = matches.map(match => `${match[1]}) ${match[2].trim()}`);
                                          // Remove options from question text
                                          matches.forEach(match => {
                                            questionText = questionText.replace(match[0], '').trim();
                                          });
                                        }
                                      }
                                      
                                      // Clean up question text - remove any remaining option patterns
                                      questionText = questionText.replace(/\s*[A-D]\)\s*[^\n]+/gi, '').trim();
                                      
                                      // Remove introductory text patterns
                                      questionText = questionText.replace(/^(here are|questions|part \d+|###|additional).*?$/gmi, '').trim();
                                      
                                      return (
                                        <>
                                          <p className="text-gray-900 mb-2 break-words">{questionText}</p>
                                          
                                          {/* MCQ Options - Display on same line with proper spacing */}
                                          {/* Only show options if show_options is not false */}
                                          {(question.question_type?.toLowerCase().includes('mcq') || 
                                            question.question_type?.toLowerCase().includes('multiple') ||
                                            question.question_type?.toLowerCase() === 'multiple choice') && 
                                           options.length > 0 && 
                                           (question.show_options !== false) && (
                                            <div className="ml-4 mt-2 text-sm text-gray-700">
                                              <div className="flex flex-wrap gap-x-8 gap-y-2">
                                                {options.map((option: string, optionIndex: number) => (
                                                  <span key={optionIndex} className="whitespace-nowrap font-medium">
                                                    {option}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Subject Summary */}
                            <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-600 print:bg-white print:border print:border-gray-300">
                              <div className="flex justify-between items-center">
                                <span>{subject} Total:</span>
                                <span className="font-medium">
                                  {subjectMarks} marks
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    } else {
                      return (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No questions generated yet</p>
                        </div>
                      );
                    }
                  })()}
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
                    {template.sections.map((section: any, index: number) => {
                      const sectionName = section.sectionName || section.section_name;
                      const sectionQuestions = currentQuestions.filter((q: any) => 
                        (q.section_name === sectionName || q.sectionName === sectionName) && 
                        (q.section_number === index + 1 || q.sectionNumber === index + 1)
                      );
                      return (
                        <div key={index} className="flex justify-between">
                          <span>{sectionName || `Section ${index + 1}`}:</span>
                          <span className="font-medium">
                            {calculateSectionMarks(section, sectionQuestions)} marks
                          </span>
                        </div>
                      );
                    })}
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




