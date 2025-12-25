import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useUser, SignUp } from '@clerk/clerk-react';
import { BookOpen } from 'lucide-react';

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');

  // Redirect if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-2">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EduAI</h1>
            <p className="text-gray-600 mt-1">Create your account</p>
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
              <SignUp 
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
            <div className="text-center py-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Student Registration
                </h4>
                <p className="text-gray-600 text-xs">
                  Student accounts are created by your institution's administrators. 
                  Please contact your teacher or school admin for account setup.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-600">
                  Already have a student account?
                </p>
                <Link 
                  to="/login" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In as Student
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}