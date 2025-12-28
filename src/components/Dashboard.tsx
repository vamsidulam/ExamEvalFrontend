import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Home,
  LogOut,
  Book,
  Upload,
  Calendar
} from 'lucide-react';
import ClassManagement from './ClassManagement';

interface DashboardStats {
  totalEvaluations: number;
  totalPapersGraded: number;
  totalStudentsEvaluated: number;
  lastEvaluation: string | null;
}

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState<DashboardStats>({
    totalEvaluations: 0,
    totalPapersGraded: 0,
    totalStudentsEvaluated: 0,
    lastEvaluation: null
  });
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('Dashboard activeTab:', activeTab);
  console.log('ClassManagement component loaded:', !!ClassManagement);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Mock: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock stats data
      const mockStats: DashboardStats = {
        totalEvaluations: 45,
        totalPapersGraded: 120,
        totalStudentsEvaluated: 85,
        lastEvaluation: '2 hours ago'
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const renderHomeContent = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || 'Teacher'}!
        </h2>
        <p className="text-gray-600">
          Here's an overview of your teaching dashboard and recent activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Papers Graded</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPapersGraded}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students Evaluated</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudentsEvaluated}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Evaluation</p>
              <p className="text-sm font-bold text-gray-900">
                {stats.lastEvaluation || 'No evaluations yet'}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('evaluation')}
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Upload className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Start Evaluation</p>
              <p className="text-sm text-gray-600">Upload and grade papers</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('classmanagement')}
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Classes</p>
              <p className="text-sm text-gray-600">Students & attendance</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Performance reports</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('generation')}
            className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <FileText className="h-6 w-6 text-yellow-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Generate Questions</p>
              <p className="text-sm text-gray-600">AI-powered content</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Mathematics papers evaluated for Class 10A</span>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">New question template created</span>
            <span className="text-xs text-gray-500">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Attendance marked for today</span>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'classmanagement':
        return <ClassManagement />;
      case 'evaluation':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Center</h2>
            <p className="text-gray-600">Upload answer keys and student scripts to start evaluation.</p>
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p className="text-blue-800">This is where your existing evaluation components will go.</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600">View detailed performance analytics and reports.</p>
            <div className="mt-4 p-4 bg-green-50 rounded">
              <p className="text-green-800">This is where your existing analytics components will go.</p>
            </div>
          </div>
        );
      case 'generation':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Generation</h2>
            <p className="text-gray-600">Generate AI-powered questions and templates.</p>
            <div className="mt-4 p-4 bg-purple-50 rounded">
              <p className="text-purple-800">This is where your existing generation components will go.</p>
            </div>
          </div>
        );
      default:
        return renderHomeContent();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Book className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">EduAI Teacher</span>
            </div>

            <div className="flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'home'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </button>

              <button
                onClick={() => setActiveTab('evaluation')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'evaluation'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Evaluation
              </button>

              <button
                onClick={() => setActiveTab('classmanagement')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'classmanagement'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Class Management
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'analytics'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </button>

              <button
                onClick={() => setActiveTab('generation')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'generation'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generation
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}