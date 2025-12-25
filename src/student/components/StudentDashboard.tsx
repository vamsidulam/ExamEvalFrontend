import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Book, 
  ClipboardList, 
  BarChart3, 
  Calendar, 
  User, 
  LogOut,
  Home,
  Trophy,
  Clock,
  BookOpen,
  Menu
} from 'lucide-react'
import StudentQuizzes from './StudentQuizzes'
import StudentReports from './StudentReports'
import StudentTimetable from './StudentTimetable';
import StudentProfile from './StudentProfile';
import StudentSidebar from './StudentSidebar';

interface StudentInfo {
  student_id: string
  name?: string
  email?: string
}

interface Stats {
  totalExams: number
  averageScore: number
  averagePercentage: number
  bestGrade: string
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalExams: 0,
    averageScore: 0,
    averagePercentage: 0,
    bestGrade: 'N/A'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('studentToken')
    const info = localStorage.getItem('studentInfo')
    
    if (!token || !info) {
      navigate('/student-login')
      return
    }

    setStudentInfo(JSON.parse(info))
    fetchStudentStats()
  }, [navigate])

  const fetchStudentStats = async () => {
    try {
      const token = localStorage.getItem('studentToken')
      const response = await fetch('http://localhost:8000/student-results', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.summary)
      }
    } catch (error) {
      console.error('Error fetching student stats:', error)
    }
  }

  const handleLogout = () => {
    // Clear student data
    localStorage.removeItem('studentToken')
    localStorage.removeItem('studentInfo')
    
    // Redirect to login page (prevents empty screen)
    window.location.replace('/login');
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'quizzes':
        return <StudentQuizzes />
      case 'reports':
        return <StudentReports />
      case 'timetable':
        return <StudentTimetable />
      case 'profile':
        return <StudentProfile />
      default:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome back, {studentInfo?.name || studentInfo?.student_id}!
              </h2>
              <p className="text-gray-600">
                Here's your academic overview and recent activity.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Exams</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average %</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averagePercentage}%</p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Best Grade</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.bestGrade}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ClipboardList className="h-6 w-6 text-blue-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Take Quiz</p>
                    <p className="text-sm text-gray-600">View available exams</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <BarChart3 className="h-6 w-6 text-green-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-600">Check your results</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('timetable')}
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Calendar className="h-6 w-6 text-purple-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Timetable</p>
                    <p className="text-sm text-gray-600">View schedule</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <StudentSidebar 
        isOpen={sidebarOpen} 
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}