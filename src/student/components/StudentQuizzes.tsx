import { useState, useEffect } from 'react'
import { ClipboardList, Clock, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { getApiUrl } from '../../config/api'

interface Quiz {
  id: string
  title: string
  filename: string
  totalQuestions: number
  totalMarks: number
  gradeSystem: string
  createdAt: string
  status: 'available' | 'completed'
}

interface QuizzesResponse {
  quizzes: Quiz[]
  totalAvailable: number
  totalCompleted: number
}

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('studentToken')
      const response = await fetch(getApiUrl('/student-quizzes'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: QuizzesResponse = await response.json()
        setQuizzes(data.quizzes)
      } else {
        setError('Failed to fetch quizzes')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'available':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'available':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ClipboardList className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Available Quizzes</h2>
          </div>
          <div className="text-sm text-gray-600">
            {quizzes.filter(q => q.status === 'available').length} available, {' '}
            {quizzes.filter(q => q.status === 'completed').length} completed
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No quizzes available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getStatusIcon(quiz.status)}
                      <h3 className="text-lg font-semibold text-gray-900 ml-2">
                        {quiz.title}
                      </h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quiz.status)}`}>
                        {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Questions: {quiz.totalQuestions}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Total Marks: {quiz.totalMarks}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Grade System: {quiz.gradeSystem}
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      Created: {new Date(quiz.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="ml-4">
                    {quiz.status === 'available' ? (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Start Quiz
                      </button>
                    ) : (
                      <button 
                        className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}