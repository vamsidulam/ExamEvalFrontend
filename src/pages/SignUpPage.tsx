import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Book } from 'lucide-react';
import { SignUp, useUser } from '@clerk/clerk-react';

const SignUpPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');

  // If user is already signed in, redirect to dashboard
  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Book className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EduAI</h1>
          <h2 className="text-xl text-gray-700 mt-2">Create Account</h2>
          <p className="text-gray-600 mt-2">Sign up to get started</p>
        </div>

        {/* Tab Selection */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'teacher'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Teacher
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'student'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Student
          </button>
        </div>

        {activeTab === 'teacher' ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Create Teacher Account
            </h3>
            
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
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Student Registration
            </h3>

            <div className="text-center py-12">
              <div className="bg-blue-50 rounded-lg p-6 mb-4">
                <Book className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Student Registration
                </h4>
                <p className="text-gray-600 text-sm">
                  Student accounts are created by your institution's administrators. 
                  Please contact your teacher or school admin for account setup.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Already have a student account?
                </p>
                <a 
                  href="/login" 
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In as Student
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            Secured by 
            <span className="ml-1 text-gray-400">🔒</span>
            clerk
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
