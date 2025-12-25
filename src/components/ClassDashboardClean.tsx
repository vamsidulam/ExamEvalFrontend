import { useState } from 'react';
import ClassManagement from './ClassManagement';

export default function ClassDashboard() {
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
        <p className="text-gray-600">Manage students, attendance, timetables, and marks</p>
      </div>
      
      <ClassManagement />
    </div>
  );
}