import React, { useState } from 'react';
import useEvaluationService from '../services/useEvaluationService';
import Toast from '../components/Toast';
import {
  FileImage,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Users,
  BarChart3,
  Sparkles,
  X,
  FileText,
  BookOpen
} from 'lucide-react';
import type { KeySheet, KeyMetadata } from '../types';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
}

interface ExamDetails {
  subjectName: string;
  numberOfQuestions: string;
  marksPerQuestion: string;
  totalMarks: string;
  classGrade: string;
}

interface EvaluationResultDisplay {
  id: string;
  studentId: string; // Original student ID from backend
  studentName: string; // Display name for UI
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'evaluated' | 'failed' | 'pending';
  evaluatedAt: string;
  grade?: string;
  feedback?: string;
}

const Evaluation = () => {
  const evaluationService = useEvaluationService();
  const [currentStep, setCurrentStep] = useState(1);
  const [keyAnswerSheet, setKeyAnswerSheet] = useState<UploadedFile | null>(null);
  const [studentAnswerSheets, setStudentAnswerSheets] = useState<UploadedFile[]>([]);
  const [examDetails, setExamDetails] = useState<ExamDetails>({
    subjectName: '',
    numberOfQuestions: '',
    marksPerQuestion: '',
    totalMarks: '',
    classGrade: ''
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResultDisplay[]>([]);
  const [errors, setErrors] = useState<Partial<ExamDetails>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [keySheetData, setKeySheetData] = useState<{ keySheet: KeySheet; keyMetadata: KeyMetadata } | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [selectedResult, setSelectedResult] = useState<EvaluationResultDisplay | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [studentSheetData, setStudentSheetData] = useState<{
    student_id: string;
    filename: string;
    pdf_url: string;
    pdf_base64: string;
    uploaded_at: string;
    file_size: number;
  } | null>(null);
  const [loadingSheet, setLoadingSheet] = useState(false);

  const grades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  // Check backend health on component mount
  React.useEffect(() => {
    const checkBackend = async () => {
      // TODO: Add health check to new service
      // const healthy = await EvaluationService.checkBackendHealth();
      const healthy = true; // Temporary - assume healthy
      setBackendHealthy(healthy);
      if (!healthy) {
        setToast({ 
          type: 'error', 
          message: 'Backend API is not available. Please ensure the Python server is running on port 8000.' 
        });
      }
    };
    checkBackend();
  }, []);

  // Handle key answer sheet upload
  const handleKeySheetUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Show loading state
        setToast({ type: 'success', message: 'Uploading key sheet to backend...' });

        // Step 1: Just upload the key sheet file to backend (no metadata yet)
        const keySheetId = await evaluationService.uploadKeySheetFile(file);

        // Store the uploaded file locally for UI purposes with backend ID
        const uploadedFile: UploadedFile = {
          id: keySheetId, // Use the backend ID
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        };
        
        setKeyAnswerSheet(uploadedFile);
        setToast({ 
          type: 'success', 
          message: `Key sheet uploaded successfully! Backend ID: ${keySheetId.slice(0, 8)}...` 
        });
      } catch (error) {
        console.error('Error uploading key sheet:', error);
        setToast({ 
          type: 'error', 
          message: `Failed to upload key answer sheet: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    }
  };

  // Handle student answer sheets upload
  const handleStudentSheetsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!keyAnswerSheet || !keySheetData) {
      setToast({ type: 'error', message: 'Please complete key sheet upload and metadata setup first' });
      return;
    }

    const keySheetId = keyAnswerSheet.id;
    const filesArray = Array.from(files);

    setToast({ type: 'success', message: `Uploading ${filesArray.length} student files...` });

    try {
      // Upload all files at once using the authenticated service
      await evaluationService.uploadStudentScripts(filesArray, keySheetId);

      // Add to local state for UI purposes
      const newFiles: UploadedFile[] = filesArray.map((file, i) => ({
        id: `${keySheetId}_${file.name}_${Date.now() + i}`, // Unique ID
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));

      setStudentAnswerSheets(prev => [...prev, ...newFiles]);
      
      setToast({ 
        type: 'success', 
        message: `Successfully uploaded ${filesArray.length} student files to backend!` 
      });
    } catch (error) {
      console.error('Error uploading student files:', error);
      setToast({ 
        type: 'error', 
        message: `Failed to upload student files: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }

    // Clear the input
    event.target.value = '';
  };

  // Handle exam details input change
  const handleExamDetailsChange = (field: keyof ExamDetails, value: string) => {
    setExamDetails(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate total marks
    if (field === 'numberOfQuestions' || field === 'marksPerQuestion') {
      const questions = field === 'numberOfQuestions' ? parseInt(value) : parseInt(examDetails.numberOfQuestions);
      const marksPerQ = field === 'marksPerQuestion' ? parseInt(value) : parseInt(examDetails.marksPerQuestion);
      
      if (!isNaN(questions) && !isNaN(marksPerQ)) {
        setExamDetails(prev => ({
          ...prev,
          totalMarks: (questions * marksPerQ).toString()
        }));
      }
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Set metadata when exam details are complete
  const setExamMetadata = async () => {
    if (!keyAnswerSheet) {
      setToast({ type: 'error', message: 'Please upload key sheet first' });
      return;
    }

    if (!validateExamDetails()) return;

    try {
      setToast({ type: 'success', message: 'Setting exam metadata...' });

      // Step 2: Set metadata using the authenticated service
      await evaluationService.setKeyMetadata({
        keySheetId: keyAnswerSheet.id,
        subjectName: examDetails.subjectName,
        totalQuestions: parseInt(examDetails.numberOfQuestions),
        totalScore: parseInt(examDetails.totalMarks),
        gradeSystem: examDetails.classGrade || 'A/B/C',
      });

      // Create mock keySheetData structure for UI compatibility
      const keySheetData = {
        keySheet: { 
          id: keyAnswerSheet.id,
          filename: keyAnswerSheet.name,
          pdf_url: '', // This will be set by the backend
          uploaded_at: new Date().toISOString()
        },
        keyMetadata: {
          id: '', // Will be set by backend
          key_sheet_id: keyAnswerSheet.id,
          subject_name: examDetails.subjectName,
          total_questions: parseInt(examDetails.numberOfQuestions),
          total_score: parseInt(examDetails.totalMarks),
          grade_system: examDetails.classGrade || 'A/B/C',
          created_at: new Date().toISOString()
        }
      };

      setKeySheetData(keySheetData);
      setToast({ 
        type: 'success', 
        message: 'Exam metadata set successfully!' 
      });
    } catch (error) {
      console.error('Error setting metadata:', error);
      
      // More detailed error messages
      let errorMessage = 'Failed to set exam metadata';
      if (error instanceof Error) {
        if (error.message.includes('406')) {
          errorMessage = 'Database error: Please check if the key sheet exists and try again';
        } else if (error.message.includes('Backend API')) {
          errorMessage = error.message;
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      }
      
      setToast({ 
        type: 'error', 
        message: errorMessage
      });
    }
  };

  // Validate exam details
  const validateExamDetails = (): boolean => {
    const newErrors: Partial<ExamDetails> = {};

    if (!examDetails.subjectName.trim()) {
      newErrors.subjectName = 'Subject name is required';
    }
    if (!examDetails.numberOfQuestions || parseInt(examDetails.numberOfQuestions) <= 0) {
      newErrors.numberOfQuestions = 'Number of questions must be greater than 0';
    }
    if (!examDetails.marksPerQuestion || parseInt(examDetails.marksPerQuestion) <= 0) {
      newErrors.marksPerQuestion = 'Marks per question must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Remove uploaded file
  const removeFile = (id: string, type: 'key' | 'student') => {
    if (type === 'key') {
      setKeyAnswerSheet(null);
      setKeySheetData(null); // Clear backend data as well
      setToast({ type: 'success', message: 'Key sheet removed successfully' });
    } else {
      setStudentAnswerSheets(prev => prev.filter(file => file.id !== id));
      setToast({ 
        type: 'success', 
        message: 'File removed from list (Note: File is already uploaded to backend)' 
      });
    }
  };

  // Check if evaluation can start
  const canStartEvaluation = () => {
    return keyAnswerSheet && 
           keySheetData && // Metadata must be set
           studentAnswerSheets.length > 0 && 
           examDetails.subjectName.trim() && 
           examDetails.numberOfQuestions && 
           examDetails.marksPerQuestion;
  };

  // Start evaluation process
  const startEvaluation = async () => {
    if (!validateExamDetails()) return;
    if (!keyAnswerSheet || !keySheetData) {
      setToast({ type: 'error', message: 'Please complete key sheet upload and metadata setup first' });
      return;
    }

    if (studentAnswerSheets.length === 0) {
      setToast({ type: 'error', message: 'Please upload student answer sheets first' });
      return;
    }

    setIsEvaluating(true);
    setCurrentStep(5);

    try {
      // Use the already uploaded key sheet ID from Step 1
      const keySheetId = keyAnswerSheet.id;

      setToast({ type: 'success', message: 'Starting AI evaluation process...' });

      // Student scripts are already uploaded in Step 3
      // Start AI evaluation using the authenticated backend service
      await evaluationService.startEvaluation(keySheetId);

      setToast({ type: 'success', message: 'Evaluation completed! Getting results...' });

      // Wait a moment for backend processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get comprehensive results from backend
      const evaluationSummary = await evaluationService.getResults(keySheetId);

      // Transform results for display
      const displayResults: EvaluationResultDisplay[] = evaluationSummary.results.map((result: any, index: number) => {
        const totalMarks = parseInt(examDetails.totalMarks);
        const percentage = Math.round((result.score / totalMarks) * 100);
        
        return {
          id: result.id || `result_${index}`,
          studentId: result.student_id || `student_${index}`, // Preserve original backend ID
          studentName: result.student_id || result.studentName || `Student ${index + 1}`, // Display name
          score: result.score || 0,
          totalMarks: totalMarks,
          percentage: percentage,
          status: 'evaluated' as const,
          evaluatedAt: result.evaluated_at 
            ? new Date(result.evaluated_at).toLocaleString() 
            : new Date().toLocaleString(),
          grade: result.grade || (percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F'),
          feedback: result.feedback || 'No detailed feedback available.'
        };
      });

      setEvaluationResults(displayResults);
      setToast({ 
        type: 'success', 
        message: `Successfully evaluated ${displayResults.length} student papers! Average score: ${evaluationSummary.summary.averageScore.toFixed(1)}` 
      });
    } catch (error) {
      console.error('Evaluation error:', error);
      setToast({ 
        type: 'error', 
        message: `Failed to evaluate papers: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.` 
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Update current step based on form completion
  React.useEffect(() => {
    // Step 1: Key sheet uploaded first
    if (keyAnswerSheet && currentStep < 2) {
      setCurrentStep(2);
    }
    // Step 2: Exam details filled and metadata set
    if (keyAnswerSheet && keySheetData && examDetails.subjectName && examDetails.numberOfQuestions && examDetails.marksPerQuestion && currentStep < 3) {
      setCurrentStep(3);
    }
    // Step 3: Student sheets uploaded after metadata is complete
    if (keyAnswerSheet && keySheetData && examDetails.subjectName && examDetails.numberOfQuestions && examDetails.marksPerQuestion && studentAnswerSheets.length > 0 && currentStep < 4) {
      setCurrentStep(4);
    }
  }, [keyAnswerSheet, keySheetData, examDetails, studentAnswerSheets, currentStep]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'evaluated':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evaluated':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Handle viewing detailed results
  const handleViewResult = (result: EvaluationResultDisplay) => {
    setSelectedResult(result);
    setShowDetailModal(true);
    // Fetch student sheet when opening modal using the backend student ID
    fetchStudentSheet(result.studentId);
  };

  // Fetch student sheet data
  const fetchStudentSheet = async (studentId: string) => {
    setLoadingSheet(true);
    setStudentSheetData(null);
    try {
      const sheetData = await evaluationService.getStudentSheet(studentId);
      setStudentSheetData(sheetData);
    } catch (error) {
      console.error('Error fetching student sheet:', error);
      
      setToast({
        type: 'error',
        message: `Failed to load answer sheet for student ID "${studentId}". Please check the console for details.`
      });
    } finally {
      setLoadingSheet(false);
    }
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
    setStudentSheetData(null);
  };

  // Generate and download result report
  const downloadResult = (result: EvaluationResultDisplay) => {
    const reportContent = generateReportContent(result);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.studentName}_evaluation_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setToast({
      type: 'success',
      message: `Downloaded evaluation report for ${result.studentName}`
    });
  };

  // Download all results as a summary report
  const downloadAllResults = () => {
    const reportContent = generateSummaryReport();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam_evaluation_summary_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setToast({
      type: 'success',
      message: `Downloaded comprehensive evaluation summary for ${evaluationResults.length} students`
    });
  };

  // Download results as CSV for data analysis
  const downloadCSV = () => {
    const csvHeader = 'Student Name,Student ID,Score,Total Marks,Percentage,Grade,Status,Evaluated At\n';
    const csvContent = evaluationResults.map(result => 
      `"${result.studentName}","${result.studentId}",${result.score},${result.totalMarks},${result.percentage},"${result.grade || (result.percentage >= 80 ? 'A' : result.percentage >= 70 ? 'B' : result.percentage >= 60 ? 'C' : 'F')}","${result.status}","${result.evaluatedAt}"`
    ).join('\n');
    
    const fullCsv = csvHeader + csvContent;
    const blob = new Blob([fullCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setToast({
      type: 'success',
      message: `Downloaded results as CSV file for data analysis`
    });
  };

  // Generate individual student report content
  const generateReportContent = (result: EvaluationResultDisplay): string => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    return `
=================================================================
                    STUDENT EVALUATION REPORT
=================================================================

Generated on: ${date} at ${time}

STUDENT INFORMATION
-------------------
Student Name: ${result.studentName}
Student ID: ${result.studentId}
Evaluation Date: ${result.evaluatedAt}

EXAM DETAILS
------------
Subject: ${examDetails.subjectName}
Class/Grade: ${examDetails.classGrade}
Total Questions: ${examDetails.numberOfQuestions}
Marks per Question: ${examDetails.marksPerQuestion}
Total Marks: ${examDetails.totalMarks}

PERFORMANCE SUMMARY
-------------------
Score Achieved: ${result.score} out of ${result.totalMarks}
Percentage: ${result.percentage}%
Grade: ${result.grade || (result.percentage >= 80 ? 'A' : result.percentage >= 70 ? 'B' : result.percentage >= 60 ? 'C' : 'F')}
Status: ${result.status}

PERFORMANCE ANALYSIS
--------------------
Overall Performance: ${result.percentage >= 90 ? 'Outstanding' : 
                     result.percentage >= 80 ? 'Excellent' : 
                     result.percentage >= 70 ? 'Good' : 
                     result.percentage >= 60 ? 'Satisfactory' : 'Needs Improvement'}

Grade Category: ${result.percentage >= 80 ? 'High Achiever' : 
                 result.percentage >= 60 ? 'Average Performer' : 'Below Average'}

DETAILED FEEDBACK
-----------------
${result.feedback || 'No detailed feedback available.'}

RECOMMENDATIONS
---------------
${result.percentage >= 80 ? 
  '• Excellent work! Continue with the same approach.\n• Consider helping peers who might need assistance.\n• Challenge yourself with advanced topics.' :
  result.percentage >= 60 ?
  '• Good effort! Focus on areas where marks were lost.\n• Review the feedback carefully.\n• Practice similar questions for improvement.' :
  '• Requires significant improvement.\n• Review the course material thoroughly.\n• Seek additional help from teachers or tutors.\n• Practice more questions to strengthen understanding.'
}

=================================================================
                    END OF REPORT
=================================================================
`;
  };

  // Generate summary report for all students
  const generateSummaryReport = (): string => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const totalStudents = evaluationResults.length;
    const evaluatedCount = evaluationResults.filter(r => r.status === 'evaluated').length;
    const averageScore = evaluationResults.reduce((sum, r) => sum + r.score, 0) / totalStudents;
    const averagePercentage = evaluationResults.reduce((sum, r) => sum + r.percentage, 0) / totalStudents;
    const highPerformers = evaluationResults.filter(r => r.percentage >= 80).length;
    const failedStudents = evaluationResults.filter(r => r.percentage < 60).length;
    
    let summaryContent = `
=================================================================
                    EXAM EVALUATION SUMMARY REPORT
=================================================================

Generated on: ${date} at ${time}

EXAM INFORMATION
----------------
Subject: ${examDetails.subjectName}
Class/Grade: ${examDetails.classGrade}
Total Questions: ${examDetails.numberOfQuestions}
Marks per Question: ${examDetails.marksPerQuestion}
Total Marks: ${examDetails.totalMarks}

OVERALL STATISTICS
------------------
Total Students: ${totalStudents}
Students Evaluated: ${evaluatedCount}
Average Score: ${averageScore.toFixed(2)} out of ${examDetails.totalMarks}
Average Percentage: ${averagePercentage.toFixed(2)}%
High Performers (≥80%): ${highPerformers} (${((highPerformers/totalStudents)*100).toFixed(1)}%)
Students Below 60%: ${failedStudents} (${((failedStudents/totalStudents)*100).toFixed(1)}%)

GRADE DISTRIBUTION
------------------
`;

    const gradeA = evaluationResults.filter(r => r.percentage >= 80).length;
    const gradeB = evaluationResults.filter(r => r.percentage >= 70 && r.percentage < 80).length;
    const gradeC = evaluationResults.filter(r => r.percentage >= 60 && r.percentage < 70).length;
    const gradeF = evaluationResults.filter(r => r.percentage < 60).length;

    summaryContent += `Grade A (80-100%): ${gradeA} students (${((gradeA/totalStudents)*100).toFixed(1)}%)
Grade B (70-79%): ${gradeB} students (${((gradeB/totalStudents)*100).toFixed(1)}%)
Grade C (60-69%): ${gradeC} students (${((gradeC/totalStudents)*100).toFixed(1)}%)
Grade F (<60%): ${gradeF} students (${((gradeF/totalStudents)*100).toFixed(1)}%)

INDIVIDUAL STUDENT RESULTS
---------------------------
`;

    evaluationResults.forEach((result, index) => {
      summaryContent += `
${index + 1}. ${result.studentName}
   Score: ${result.score}/${result.totalMarks} (${result.percentage}%)
   Grade: ${result.grade || (result.percentage >= 80 ? 'A' : result.percentage >= 70 ? 'B' : result.percentage >= 60 ? 'C' : 'F')}
   Status: ${result.status}
   Evaluated: ${result.evaluatedAt}
`;
    });

    summaryContent += `

CLASS PERFORMANCE ANALYSIS
---------------------------
${gradeA >= totalStudents * 0.6 ? '• Excellent class performance with majority achieving high grades.' :
  gradeA + gradeB >= totalStudents * 0.7 ? '• Good class performance with most students passing well.' :
  gradeF <= totalStudents * 0.2 ? '• Average class performance with room for improvement.' :
  '• Class needs significant attention and support.'}

${averagePercentage >= 75 ? '• Class average is above satisfactory level.' :
  averagePercentage >= 60 ? '• Class average is at satisfactory level.' :
  '• Class average is below satisfactory level.'}

RECOMMENDATIONS FOR CLASS
--------------------------
${averagePercentage >= 75 ? 
  '• Continue with current teaching methods\n• Challenge high performers with advanced topics\n• Provide enrichment activities' :
  averagePercentage >= 60 ?
  '• Review teaching methods for better engagement\n• Provide additional support for struggling students\n• Focus on weak areas identified in the evaluation' :
  '• Comprehensive review of curriculum delivery needed\n• Individual attention for most students\n• Consider remedial classes\n• Parent-teacher consultation recommended'
}

=================================================================
                    END OF SUMMARY REPORT
=================================================================
`;

    return summaryContent;
  };

  return (
    <div>
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Progress Steps */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="w-full px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Upload Key Sheet', icon: FileText },
              { step: 2, title: 'Exam Details', icon: BookOpen },
              { step: 3, title: 'Student Sheets', icon: Users },
              { step: 4, title: 'Start Evaluation', icon: Sparkles },
              { step: 5, title: 'View Results', icon: BarChart3 }
            ].map((item, index) => {
              const isActive = currentStep === item.step;
              const isCompleted = currentStep > item.step;
              
              return (
                <div key={item.step} className="flex items-center flex-1">
                  <div className="flex items-center justify-center relative">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                        : isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                        : 'border-gray-300 text-gray-400 bg-white'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <item.icon className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium transition-colors duration-300 ${
                        isCompleted ? 'text-green-700' 
                        : isActive ? 'text-blue-700 font-semibold' 
                        : 'text-gray-500'
                      }`}>
                        {item.title}
                      </p>
                      {isActive && (
                        <p className="text-xs text-blue-600 font-medium">Current Step</p>
                      )}
                      {isCompleted && (
                        <p className="text-xs text-green-600 font-medium">Completed</p>
                      )}
                    </div>
                  </div>
                  
                  {index < 4 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                      isCompleted ? 'bg-green-600' 
                      : isActive ? 'bg-blue-600' 
                      : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Mobile Step Indicator */}
          <div className="sm:hidden mt-4 text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep} of 5: {
                currentStep === 1 ? 'Upload Key Sheet' :
                currentStep === 2 ? 'Exam Details' :
                currentStep === 3 ? 'Student Sheets' :
                currentStep === 4 ? 'Start Evaluation' :
                'View Results'
              }
            </p>
            <div className="flex justify-center mt-2 space-x-1">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  currentStep > step 
                    ? 'bg-green-600' 
                    : currentStep === step
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Upload Key Answer Sheet */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              Step 1: Upload Key Answer Sheet
            </h3>
          </div>
          
          <div className="p-6">
            {!keyAnswerSheet ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleKeySheetUpload}
                  className="hidden"
                  id="key-sheet-upload"
                />
                <label htmlFor="key-sheet-upload" className="cursor-pointer">
                  <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Upload Key Answer Sheet
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, JPG, PNG files up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <FileImage className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{keyAnswerSheet.name}</p>
                    <p className="text-xs text-gray-500">
                      {(keyAnswerSheet.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-green-600">
                      Backend ID: {keyAnswerSheet.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <button
                    onClick={() => removeFile(keyAnswerSheet.id, 'key')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Enter Exam Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 text-green-600 mr-2" />
              Step 2: Enter Exam Details
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Name *
              </label>
              <input
                type="text"
                value={examDetails.subjectName}
                onChange={(e) => handleExamDetailsChange('subjectName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subjectName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Mathematics"
                disabled={!keyAnswerSheet}
              />
              {errors.subjectName && (
                <p className="mt-1 text-sm text-red-600">{errors.subjectName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions *
                </label>
                <input
                  type="number"
                  value={examDetails.numberOfQuestions}
                  onChange={(e) => handleExamDetailsChange('numberOfQuestions', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.numberOfQuestions ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="20"
                  min="1"
                  disabled={!keyAnswerSheet}
                />
                {errors.numberOfQuestions && (
                  <p className="mt-1 text-sm text-red-600">{errors.numberOfQuestions}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks per Question *
                </label>
                <input
                  type="number"
                  value={examDetails.marksPerQuestion}
                  onChange={(e) => handleExamDetailsChange('marksPerQuestion', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.marksPerQuestion ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="5"
                  min="1"
                  disabled={!keyAnswerSheet}
                />
                {errors.marksPerQuestion && (
                  <p className="mt-1 text-sm text-red-600">{errors.marksPerQuestion}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={examDetails.totalMarks}
                  onChange={(e) => handleExamDetailsChange('totalMarks', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Auto-calculated"
                  disabled={!keyAnswerSheet}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class/Grade
                </label>
                <select
                  value={examDetails.classGrade}
                  onChange={(e) => handleExamDetailsChange('classGrade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!keyAnswerSheet}
                >
                  <option value="">Select Grade</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>

            {!keyAnswerSheet && (
              <div className="text-sm text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
                Please upload key sheet first to enable exam details entry
              </div>
            )}

            {keyAnswerSheet && !keySheetData && (
              <button
                onClick={setExamMetadata}
                disabled={!examDetails.subjectName.trim() || !examDetails.numberOfQuestions || !examDetails.marksPerQuestion}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Set Exam Metadata
              </button>
            )}

            {keySheetData && (
              <div className="text-sm text-green-600 text-center p-3 bg-green-50 rounded-lg">
                ✅ Exam metadata set successfully!
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Upload Student Answer Sheets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              Step 3: Upload Student Answer Sheets
            </h3>
          </div>
          
          <div className="p-6">
            {!keySheetData ? (
              <div className="text-sm text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
                Please complete Steps 1 & 2 first to enable student sheet upload
              </div>
            ) : (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200 mb-4">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleStudentSheetsUpload}
                    className="hidden"
                    id="student-sheets-upload"
                    disabled={!keySheetData}
                  />
                  <label htmlFor="student-sheets-upload" className={`cursor-pointer ${!keySheetData ? 'cursor-not-allowed opacity-50' : ''}`}>
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Upload Student Answer Sheets
                    </p>
                    <p className="text-sm text-gray-500">
                      Multiple PDF/Image files supported - uploads to backend immediately
                    </p>
                    {keySheetData && (
                      <p className="text-xs text-green-600 mt-2">
                        ✅ Backend ready - Key Sheet ID: {keyAnswerSheet?.id.slice(0, 8)}...
                      </p>
                    )}
                  </label>
                </div>
              </>
            )}

            {studentAnswerSheets.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-900 flex items-center justify-between">
                  <span>Uploaded Files ({studentAnswerSheets.length})</span>
                  <span className="text-xs text-green-600">✅ All uploaded to backend</span>
                </h4>
                {studentAnswerSheets.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <FileImage className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-green-600">
                          ✅ Uploaded to backend
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <button
                        onClick={() => removeFile(file.id, 'student')}
                        className="text-red-600 hover:text-red-800"
                        title="Remove from list (file already uploaded to backend)"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Start Evaluation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 text-orange-600 mr-2" />
              Step 4: Start Evaluation
            </h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Evaluation Summary</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Key Sheet:</span>
                    <span className="font-medium">
                      {keyAnswerSheet ? '✅ Uploaded' : '❌ Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Student Sheets:</span>
                    <span className="font-medium">{studentAnswerSheets.length} files</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subject:</span>
                    <span className="font-medium">{examDetails.subjectName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Marks:</span>
                    <span className="font-medium">{examDetails.totalMarks || 'Not calculated'}</span>
                  </div>
                  {keySheetData && (
                    <div className="flex justify-between">
                      <span>Database ID:</span>
                      <span className="font-medium text-xs">{keySheetData.keySheet.id.slice(0, 8)}...</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={startEvaluation}
                disabled={!canStartEvaluation() || isEvaluating || !backendHealthy}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>AI Evaluating {studentAnswerSheets.length} Papers...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Start AI Evaluation</span>
                  </>
                )}
              </button>

              {(!canStartEvaluation() || !backendHealthy) && (
                <p className="text-sm text-red-600 text-center">
                  {!backendHealthy 
                    ? 'Backend API is not available. Please start the Python server.' 
                    : 'Please complete all previous steps before starting evaluation'
                  }
                </p>
              )}

              {isEvaluating && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-yellow-600 animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Evaluation in Progress</p>
                      <p className="text-xs text-yellow-700">
                        AI is analyzing {studentAnswerSheets.length} student papers using key sheet {keyAnswerSheet?.id.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        This may take a few moments depending on the number of papers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Backend Status Indicator */}
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  backendHealthy === null ? 'bg-gray-400' :
                  backendHealthy ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-gray-600">
                  Backend API: {
                    backendHealthy === null ? 'Checking...' :
                    backendHealthy ? 'Connected' : 'Disconnected'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 5: Evaluation Results */}
      {(isEvaluating || evaluationResults.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
              Step 5: Evaluation Results
            </h3>
            <div className="flex items-center space-x-4">
              {evaluationResults.length > 0 && (
                <>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={downloadAllResults}
                      className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors duration-200"
                      title="Download comprehensive summary report"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Summary Report
                    </button>
                    <button
                      onClick={downloadCSV}
                      className="flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors duration-200"
                      title="Download results as CSV for data analysis"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV Export
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Evaluated ({evaluationResults.filter(r => r.status === 'evaluated').length})
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      Failed ({evaluationResults.filter(r => r.status === 'failed').length})
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {isEvaluating ? (
              <div className="text-center py-12">
                <div className="animate-pulse space-y-4">
                  <Sparkles className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
                <p className="text-gray-600 mt-4 font-medium">AI is evaluating answer sheets...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Processing {studentAnswerSheets.length} student papers against key sheet {keyAnswerSheet?.id.slice(0, 8)}...
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Using backend AI evaluation engine
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evaluated At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {evaluationResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {result.studentName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{result.studentName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">{result.score}</span>
                            <span className="text-gray-500">/{result.totalMarks}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getPerformanceColor(result.percentage)}`}>
                            {result.percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(result.status)}
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                              {result.status.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.evaluatedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            onClick={() => handleViewResult(result)}
                            title="View detailed results"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900 transition-colors duration-200"
                            onClick={() => downloadResult(result)}
                            title="Download individual report"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Result Modal */}
      {showDetailModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {selectedResult.studentName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedResult.studentName} - Detailed Results
                  </h2>
                  <p className="text-sm text-gray-500">
                    Evaluated on {selectedResult.evaluatedAt}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                    Score Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Score:</span>
                      <span className="font-semibold text-lg">
                        {selectedResult.score}/{selectedResult.totalMarks}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Percentage:</span>
                      <span className={`font-semibold text-lg ${getPerformanceColor(selectedResult.percentage)}`}>
                        {selectedResult.percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Grade:</span>
                      <span className="font-semibold text-lg">
                        {selectedResult.grade || (selectedResult.percentage >= 80 ? 'A' : 
                         selectedResult.percentage >= 70 ? 'B' : 
                         selectedResult.percentage >= 60 ? 'C' : 'F')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedResult.status)}`}>
                        {selectedResult.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Performance</span>
                      <span>{selectedResult.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selectedResult.percentage >= 80 ? 'bg-green-500' :
                          selectedResult.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(selectedResult.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Exam Details */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    Exam Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subject:</span>
                      <span className="font-medium">{examDetails.subjectName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Grade/Class:</span>
                      <span className="font-medium">{examDetails.classGrade}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Questions:</span>
                      <span className="font-medium">{examDetails.numberOfQuestions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Marks per Question:</span>
                      <span className="font-medium">{examDetails.marksPerQuestion}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Answer Sheet Display */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileImage className="h-5 w-5 text-blue-600 mr-2" />
                  Student Answer Sheet
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  {loadingSheet ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-lg font-medium text-gray-600 mb-2">Loading Answer Sheet...</p>
                      <p className="text-sm text-gray-500">Please wait while we fetch the student's answer sheet</p>
                    </div>
                  ) : studentSheetData ? (
                    <div className="space-y-4">
                      {/* PDF Viewer */}
                      <div className="bg-gray-50 rounded-lg border-2 border-gray-300 min-h-[500px] max-h-[600px] overflow-auto">
                        <iframe
                          src={`data:application/pdf;base64,${studentSheetData.pdf_base64}`}
                          className="w-full h-[500px] border-none"
                          title={`Answer sheet for ${selectedResult?.studentName}`}
                        />
                      </div>
                      
                      {/* Sheet Information */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Student:</span>
                            <span className="ml-2 text-gray-600">{studentSheetData.student_id}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">File Size:</span>
                            <span className="ml-2 text-gray-600">{(studentSheetData.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Uploaded:</span>
                            <span className="ml-2 text-gray-600">{new Date(studentSheetData.uploaded_at).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Filename:</span>
                            <span className="ml-2 text-gray-600">{studentSheetData.filename}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <FileImage className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-600 mb-2">Answer Sheet Preview</p>
                      <p className="text-sm text-gray-500 text-center mb-4">
                        Student: {selectedResult?.studentName}
                      </p>
                      <div className="text-center text-sm text-gray-500">
                        <p>Failed to load answer sheet</p>
                        <button 
                          onClick={() => selectedResult && fetchStudentSheet(selectedResult.studentName)}
                          className="mt-2 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors duration-200"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Answer Sheet Controls */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Student ID: {selectedResult?.id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {studentSheetData && (
                        <>
                          <a
                            href={studentSheetData.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors duration-200"
                          >
                            Full Screen
                          </a>
                          <a
                            href={studentSheetData.pdf_url}
                            download={studentSheetData.filename}
                            className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors duration-200"
                          >
                            Download
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
              <button 
                onClick={() => selectedResult && downloadResult(selectedResult)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Evaluation;