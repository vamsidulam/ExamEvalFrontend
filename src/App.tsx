import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClassDashboard from './components/ClassDashboardClean';
import QuestionGeneration from './pages/QuestionGeneration';
import Evaluation from './pages/Evaluation';
import Results from './pages/Results';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { AuthProvider } from './contexts/AuthContext';
import StudentDashboard from './student/components/StudentDashboard';

// Dashboard Routes Component
const DashboardRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/question-generation" element={<QuestionGeneration />} />
      <Route path="/evaluation" element={<Evaluation />} />
      <Route path="/class-management/ClassDashboard" element={<ClassDashboard />} />
      <Route path="/results" element={<Results />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </Layout>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Student Routes */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            
            {/* Redirect auth routes (authentication disabled) */}
            <Route path="/sign-up" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard Routes - Now Public */}
            <Route path="/dashboard/*" element={
              <div className="bg-gray-50">
                <DashboardRoutes />
              </div>
            } />
            
            {/* Redirect old routes to new structure */}
            <Route path="/generate" element={<Navigate to="/dashboard/question-generation" />} />
            <Route path="/evaluate" element={<Navigate to="/dashboard/evaluation" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;