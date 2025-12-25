import React, { useState } from 'react';
import { useEvaluationService } from '../services/useEvaluationService';
import {
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  Calendar,
  Users,
  Award,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Results = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [selectedScoreRange, setSelectedScoreRange] = useState('');
  const [evaluationResults, setEvaluationResults] = useState<any[]>([]);
  const [keySheets, setKeySheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({});

  const { getUserResults, getUserKeySheets } = useEvaluationService();

  // Load user's evaluation results and key sheets on component mount
  React.useEffect(() => {
    const loadResults = async () => {
      try {
        // Load both evaluation results and key sheets
        const [resultsData, sheetsData] = await Promise.all([
          getUserResults(),
          getUserKeySheets()
        ]);
        
        setEvaluationResults(resultsData.results || []);
        setSummary(resultsData.summary || {});
        setKeySheets(sheetsData.keySheets || []);
        
      } catch (error) {
        console.error('Error loading results:', error);
        setEvaluationResults([]);
        setKeySheets([]);
        setSummary({});
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [getUserResults, getUserKeySheets]);

  const subjects = ['All Subjects', ...Array.from(new Set(evaluationResults.map(r => r.subject)))];
  const dateRanges = ['All Time', 'Last 7 days', 'Last 30 days', 'Last 3 months'];
  const scoreRanges = ['All Scores', '90-100%', '80-89%', '70-79%', '60-69%', 'Below 60%'];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-green-100 text-green-800';
      case 'A':
        return 'bg-blue-100 text-blue-800';
      case 'B+':
        return 'bg-yellow-100 text-yellow-800';
      case 'B':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 85) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (percentage >= 70) {
      return <BarChart3 className="h-4 w-4 text-yellow-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const filteredResults = evaluationResults.filter(result => {
    const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.paperTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || selectedSubject === 'All Subjects' || result.subject === selectedSubject;
    
    // Score range filtering
    let matchesScore = true;
    if (selectedScoreRange && selectedScoreRange !== 'All Scores') {
      const percentage = result.percentage;
      switch (selectedScoreRange) {
        case '90-100%':
          matchesScore = percentage >= 90;
          break;
        case '80-89%':
          matchesScore = percentage >= 80 && percentage < 90;
          break;
        case '70-79%':
          matchesScore = percentage >= 70 && percentage < 80;
          break;
        case '60-69%':
          matchesScore = percentage >= 60 && percentage < 70;
          break;
        case 'Below 60%':
          matchesScore = percentage < 60;
          break;
      }
    }
    
    // Date range filtering (simplified - you could add more complex date filtering)
    let matchesDate = true;
    if (selectedDateRange && selectedDateRange !== 'All Time') {
      const evaluationDate = new Date(result.evaluationDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - evaluationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (selectedDateRange) {
        case 'Last 7 days':
          matchesDate = daysDiff <= 7;
          break;
        case 'Last 30 days':
          matchesDate = daysDiff <= 30;
          break;
        case 'Last 3 months':
          matchesDate = daysDiff <= 90;
          break;
      }
    }
    
    return matchesSearch && matchesSubject && matchesScore && matchesDate;
  });

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <p className="mt-1 text-gray-600">View and analyze student performance and exam results</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Results</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Key Sheets</p>
              <p className="text-2xl font-semibold text-gray-900">{keySheets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalEvaluations || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Performers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary.highPerformers || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.averagePercentage || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students or papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            
            <select
              value={selectedScoreRange}
              onChange={(e) => setSelectedScoreRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {scoreRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Evaluation Results</h3>
          <p className="text-sm text-gray-600 mt-1">
            {evaluationResults.length === 0 ? 'No evaluation results found. Complete evaluations to see results here.' : 
             `Showing ${filteredResults.length} of ${evaluationResults.length} evaluation result${evaluationResults.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="overflow-x-auto">
          {evaluationResults.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
              <p className="text-gray-600 mb-6">Upload key sheets, student papers, and complete evaluations to see results here.</p>
              <a
                href="/dashboard/evaluation"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Start Evaluation
              </a>
            </div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {result.studentName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{result.studentName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {result.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result.score} / {result.totalMarks}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {result.percentage}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            result.percentage >= 85 ? 'bg-green-500' :
                            result.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(result.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(result.grade)}`}>
                      {result.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPerformanceIcon(result.percentage)}
                      <span className="ml-2 text-sm text-gray-600">
                        {result.percentage >= 85 ? 'Excellent' :
                         result.percentage >= 70 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {new Date(result.evaluationDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View Details"
                        onClick={() => {
                          // TODO: Implement view details functionality
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        title="Download Results"
                        onClick={() => {
                          // TODO: Implement download functionality
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {evaluationResults.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredResults.length}</span> of{' '}
                <span className="font-medium">{filteredResults.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;