import React, { useState } from 'react';
import { X, Upload, UserPlus } from 'lucide-react';
import { getApiUrl } from '../config/api';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (studentData: any) => void;
}

export default function AddStudentModal({ isOpen, onClose, onAddStudent }: AddStudentModalProps) {
  const [activeMethod, setActiveMethod] = useState<'manual' | 'csv'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    phone_no: '',
    branch: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submitting student data:', formData);
      
      const response = await fetch(getApiUrl('/api/students'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (response.ok) {
        onAddStudent(result.student);
        setFormData({
          student_id: '',
          name: '',
          email: '',
          phone_no: '',
          branch: ''
        });
        onClose();
        alert('Student added successfully!');
      } else {
        console.error('Error response:', result);
        alert(`Error: ${result.detail || 'Failed to add student'}`);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student: ' + error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('CSV file selected:', file.name);
    }
  };

  const handleCSVSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file first');
      return;
    }

    try {
      console.log('Starting CSV upload...', selectedFile.name);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch(getApiUrl('/api/students/upload-csv'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        },
        body: formData
      });
      
      console.log('CSV Upload Response status:', response.status);
      const result = await response.json();
      console.log('CSV Upload Response data:', result);
      
      if (response.ok) {
        console.log('Failed records:', result.failed_records); // Debug failed records
        
        let resultMessage = `CSV upload completed!\n` +
          `✅ ${result.successful_inserts} students added successfully\n` +
          `❌ ${result.failed_inserts} students failed\n` +
          `📊 Total rows processed: ${result.total_rows}`;
        
        // Show details of failed records if any
        if (result.failed_records && result.failed_records.length > 0) {
          resultMessage += '\n\nFailed records:\n';
          result.failed_records.forEach((record: any) => {
            resultMessage += `Row ${record.row}: ${record.error}\n`;
            if (record.data) {
              resultMessage += `  Data: ${JSON.stringify(record.data)}\n`;
            }
          });
        }
        
        alert(resultMessage);
        onAddStudent({}); // Trigger parent to refresh data - pass empty object instead of null
        setSelectedFile(null);
        onClose();
      } else {
        alert(`Error: ${result.detail || 'Upload failed'}`);
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      alert('Failed to upload CSV file');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Students</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Method Selection */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveMethod('manual')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeMethod === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Manual Entry
            </button>
            <button
              onClick={() => setActiveMethod('csv')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeMethod === 'csv'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              CSV Upload
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeMethod === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., STU001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="student@school.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_no"
                    value={formData.phone_no}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch *
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Computer Science, Electronics, etc."
                  />
                </div>
              </div>

              {/* Auto-generated fields info */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Auto-generated fields:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">ID:</span> Automatically generated unique identifier</p>
                  <p><span className="font-medium">Password:</span> Same as ID (can be changed later)</p>
                  <p><span className="font-medium">Created At:</span> Current timestamp</p>
                  <p><span className="font-medium">Status:</span> Active (default)</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Student
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Upload CSV File</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload a CSV file with student data to add multiple students at once
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="w-full"
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Selected: {selectedFile.name}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
                <p className="text-sm text-blue-700 mb-2">Your CSV file should have the following columns:</p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded">
                  student_id,name,email,phone_no,branch
                </code>
                <p className="text-sm text-blue-700 mt-2">
                  Example: STU001,John Doe,john@school.edu,+1234567890,Computer Science
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleCSVSubmit}
                  disabled={!selectedFile}
                >
                  Upload Students
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}