import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser, SignIn } from '@clerk/clerk-react';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already signed in as teacher
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting student login with:', { studentId });
      
      const formData = new FormData();
      formData.append('student_id', studentId);
      formData.append('password', password);

      console.log('Making request to: http://localhost:8000/student-login');
      
      const response = await fetch('http://localhost:8000/student-login', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        localStorage.setItem('studentToken', data.token);
        localStorage.setItem('studentInfo', JSON.stringify(data.student));
        navigate('/student-dashboard');
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        setError(errorData.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Please check if backend server is running on port 8000'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">EduAI</h1>
            <p className="text-gray-600 mt-2">AI-Powered Exam Evaluation System</p>
          </div>

          {/* Tab Selection - preserving original style */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('teacher')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'teacher'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:text-blue-600'
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'student'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:text-blue-600'
              }`}
            >
              Student
            </button>
          </div>

          {activeTab === 'teacher' ? (
            <div className="space-y-6">
              <SignIn 
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "w-full border border-gray-300 hover:bg-gray-50",
                    formButtonPrimary: "w-full bg-blue-600 hover:bg-blue-700",
                    footerAction: "hidden"
                  }
                }}
              />
            </div>
          ) : (
            <form onSubmit={handleStudentLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your student ID"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}