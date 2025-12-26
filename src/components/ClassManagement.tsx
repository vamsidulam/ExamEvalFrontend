import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import { 
  Users, 
  UserPlus, 
  FileDown, 
  FileUp, 
  Calendar,
  ClipboardCheck,
  BarChart3,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import AddStudentModal from './AddStudentModal';

interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  phone_no: string;
  branch: string;
  password?: string;
  created_at?: string;
  status: 'active' | 'inactive';
}

interface ClassStats {
  totalStudents: number;
  attendancePercentage: number;
  latestMarksPosted: string;
  activeClasses: number;
}

interface Timetable {
  id: number;
  timetable_id: string;
  class_name: string;
  filename: string;
  file_url: string;
  file_type: 'image' | 'pdf';
  file_size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
}

export default function ClassManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedTimetableClass, setSelectedTimetableClass] = useState('');
  const [stats, setStats] = useState<ClassStats>({
    totalStudents: 0,
    attendancePercentage: 0,
    latestMarksPosted: 'No marks posted yet',
    activeClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  useEffect(() => {
    fetchClassData();
    fetchTimetableData();
  }, []);

  const fetchTimetableData = async () => {
    try {
      console.log('Fetching timetable data...'); // Debug log
      
      // Fetch timetables
      const timetablesResponse = await fetch(getApiUrl('/api/timetables'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        }
      });
      
      if (timetablesResponse.ok) {
        const timetablesData = await timetablesResponse.json();
        console.log('Timetables data received:', timetablesData); // Debug log
        
        // Debug: Log each timetable URL
        timetablesData.timetables?.forEach((timetable: Timetable) => {
          console.log(`Timetable ${timetable.class_name}: ${timetable.file_url}`);
        });
        
        setTimetables(timetablesData.timetables || []);
      } else {
        console.error('Failed to fetch timetables:', timetablesResponse.status);
      }
      
      // Fetch available classes
      const classesResponse = await fetch(getApiUrl('/api/timetables/classes'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        }
      });
      
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        console.log('Classes data received:', classesData); // Debug log
        setAvailableClasses(classesData.classes || []);
      }
      
    } catch (error) {
      console.error('Error fetching timetable data:', error);
    }
  };

  const fetchClassData = async () => {
    try {
      setLoading(true);
      console.log('Fetching class data...'); // Debug log
      
      // Fetch students from backend
      const studentsResponse = await fetch(getApiUrl('/api/students'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        }
      });
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        console.log('Students data received:', studentsData); // Debug log
        setStudents(studentsData.students || []);
      } else {
        console.error('Failed to fetch students:', studentsResponse.status); // Debug log
      }
      
      // Fetch stats from backend
      const statsResponse = await fetch(getApiUrl('/api/students/stats'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Stats data received:', statsData); // Debug log
        setStats({
          totalStudents: statsData.total_students || 0,
          attendancePercentage: 92, // Keep mock data for now
          latestMarksPosted: 'Mathematics - Unit Test 1', // Keep mock data for now
          activeClasses: statsData.active_classes || 0
        });
      } else {
        console.error('Failed to fetch stats:', statsResponse.status); // Debug log
      }
      
    } catch (error) {
      console.error('Error fetching class data:', error);
      // Fallback to mock data
      setStats({
        totalStudents: 150,
        attendancePercentage: 92,
        latestMarksPosted: 'Mathematics - Unit Test 1',
        activeClasses: 5
      });

      setStudents([
        {
          id: '1',
          student_id: 'STU001',
          name: 'John Doe',
          email: 'john@school.edu',
          phone_no: '+1234567890',
          branch: 'Computer Science',
          status: 'active'
        },
        {
          id: '2',
          student_id: 'STU002',
          name: 'Jane Smith',
          email: 'jane@school.edu',
          phone_no: '+1234567892',
          branch: 'Electronics',
          status: 'active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setShowAddStudentModal(true);
  };

  const handleStudentAdded = async (_studentData: any) => {
    // Refresh the student list after adding a new student
    console.log('Student added, refreshing data...'); // Debug log
    await fetchClassData();
    console.log('Data refresh completed'); // Debug log
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('CSV file selected:', file); // Debug log
    
    if (file) {
      try {
        console.log('Starting CSV upload...'); // Debug log
        
        const formData = new FormData();
        formData.append('file', file);
        
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
          const resultMessage = `CSV upload completed!\n` +
            `✅ ${result.successful_inserts} students added successfully\n` +
            `❌ ${result.failed_inserts} students failed\n` +
            `📊 Total rows processed: ${result.total_rows}`;
          
          alert(resultMessage);
          console.log('CSV upload completed, refreshing data...'); // Debug log
          await fetchClassData(); // Refresh the student list
          console.log('Data refresh after CSV completed'); // Debug log
        } else {
          alert(`Error: ${result.detail || 'Upload failed'}`);
        }
      } catch (error) {
        console.error('CSV upload error:', error);
        alert('Failed to upload CSV file');
      }
    } else {
      console.log('No file selected'); // Debug log
    }
  };

  const handleImportCSV = () => {
    console.log('Import CSV button clicked'); // Debug log
    
    // Trigger file input click
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.multiple = false;
    
    fileInput.onchange = (event) => {
      console.log('File input changed', event); // Debug log
      const target = event.target as HTMLInputElement;
      
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        console.log('Selected file:', file.name, file.type, file.size); // Debug log
        
        // Create a proper ChangeEvent-like object
        const mockEvent = {
          target: {
            files: target.files
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleCSVUpload(mockEvent);
      } else {
        console.log('No files selected'); // Debug log
      }
    };
    
    // Trigger the file dialog
    fileInput.click();
  };

  const handleExportCSV = () => {
    // TODO: Export students to CSV
    console.log('Export CSV clicked');
  };

  // === TIMETABLE FUNCTIONS ===
  const getImageWithFallback = (url: string, alt: string, className: string, onClick: () => void) => {
    return (
      <img
        src={url}
        alt={alt}
        className={className}
        crossOrigin="anonymous"
        onClick={onClick}
        onError={(e) => {
          console.error('Image failed to load:', url);
          const target = e.target as HTMLImageElement;
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="flex flex-col items-center justify-center h-32 text-center">
                <svg class="h-12 w-12 text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-gray-600 mb-1">Image preview unavailable</p>
                <button onclick="window.open('${url}', '_blank')" class="text-blue-600 hover:text-blue-800 text-sm">
                  Click to view original
                </button>
              </div>
            `;
          }
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', url);
        }}
      />
    );
  };

  const handleTimetableUpload = async (file: File, className: string) => {
    try {
      console.log('Uploading timetable:', file.name, 'for class:', className);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('class_name', className);
      
      const response = await fetch(getApiUrl('/api/timetables/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        },
        body: formData
      });
      
      console.log('Timetable upload response status:', response.status);
      const result = await response.json();
      console.log('Timetable upload response data:', result);
      
      if (response.ok) {
        alert(`Timetable uploaded successfully for ${className}!`);
        await fetchTimetableData(); // Refresh timetable data
      } else {
        alert(`Error: ${result.detail || 'Upload failed'}`);
      }
    } catch (error) {
      console.error('Timetable upload error:', error);
      alert('Failed to upload timetable');
    }
  };

  const handleDeleteTimetable = async (timetableId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete the timetable for ${className}?`)) {
      return;
    }
    
    try {
      const response = await fetch(getApiUrl(`/api/timetables/${timetableId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Timetable deleted successfully!');
        await fetchTimetableData(); // Refresh timetable data
      } else {
        alert(`Error: ${result.detail || 'Delete failed'}`);
      }
    } catch (error) {
      console.error('Timetable delete error:', error);
      alert('Failed to delete timetable');
    }
  };

  const handleUpdateTimetable = async (timetableId: string, newClassName: string) => {
    try {
      const formData = new FormData();
      formData.append('class_name', newClassName);
      
      const response = await fetch(getApiUrl(`/api/timetables/${timetableId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'dummy-token'}`,
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Timetable updated successfully!');
        await fetchTimetableData(); // Refresh timetable data
      } else {
        alert(`Error: ${result.detail || 'Update failed'}`);
      }
    } catch (error) {
      console.error('Timetable update error:', error);
      alert('Failed to update timetable');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.branch === selectedClass;
    return matchesSearch && matchesClass;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance %</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendancePercentage}%</p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeClasses}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Latest Marks</p>
              <p className="text-sm font-bold text-gray-900">{stats.latestMarksPosted}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Mathematics marks updated for Class 10A</span>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Attendance marked for today</span>
            <span className="text-xs text-gray-500">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">New student added to Class 10B</span>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentList = () => (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">Student List</h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="CST">CST</option>
              <option value="Electronics">ECE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleAddStudent}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </button>
          
          <button
            onClick={handleImportCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FileUp className="h-4 w-4 mr-2" />
            Import CSV
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">ID: {student.student_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.branch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{student.email}</div>
                    <div>{student.phone_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTimetable = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Class Timetable Management</h2>
            <p className="text-gray-600">Upload and manage timetable images/PDFs for different classes</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Upload New Timetable</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name *
              </label>
              <input
                type="text"
                value={selectedTimetableClass}
                onChange={(e) => setSelectedTimetableClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Computer Science A, 10th Grade, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File *
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && selectedTimetableClass.trim()) {
                    handleTimetableUpload(file, selectedTimetableClass.trim());
                    setSelectedTimetableClass(''); // Reset after upload
                    e.target.value = ''; // Reset file input
                  } else if (file && !selectedTimetableClass.trim()) {
                    alert('Please enter a class name first');
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="text-sm text-blue-700">
            <p><strong>Supported formats:</strong> JPG, PNG, PDF (Max 10MB)</p>
            <p><strong>Tip:</strong> Use clear, high-resolution images for better readability</p>
          </div>
        </div>

        {/* Existing Timetables */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Timetables ({timetables.length})</h3>
            <button
              onClick={fetchTimetableData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>

          {timetables.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Timetables Uploaded</h3>
              <p className="text-gray-600">Upload your first timetable using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timetables.map((timetable) => (
                <div key={timetable.timetable_id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{timetable.class_name}</h4>
                      <p className="text-sm text-gray-500">{timetable.filename}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => window.open(timetable.file_url, '_blank')}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View timetable"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const newClassName = prompt('Enter new class name:', timetable.class_name);
                          if (newClassName && newClassName.trim() !== timetable.class_name) {
                            handleUpdateTimetable(timetable.timetable_id, newClassName.trim());
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-yellow-600"
                        title="Edit class name"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTimetable(timetable.timetable_id, timetable.class_name)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete timetable"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Timetable Preview */}
                  <div className="bg-gray-50 rounded border-2 border-dashed border-gray-200 p-4 mb-3">
                    {timetable.file_type === 'pdf' ? (
                      <div className="text-center">
                        <FileDown className="h-12 w-12 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">PDF Timetable</p>
                        <button
                          onClick={() => window.open(timetable.file_url, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Click to View
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        {getImageWithFallback(
                          timetable.file_url,
                          `${timetable.class_name} Timetable`,
                          "w-full h-32 object-cover rounded cursor-pointer",
                          () => window.open(timetable.file_url, '_blank')
                        )}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{new Date(timetable.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{(timetable.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="uppercase">{timetable.file_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Attendance Management</h2>
          <div className="flex space-x-2">
            <select className="px-4 py-2 border border-gray-300 rounded-md">
              <option>This Week</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Export Report
            </button>
          </div>
        </div>

        {/* Attendance Grid */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-900">Student</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Mon</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Tue</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Wed</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Thu</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Fri</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Sat</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">%</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="border border-gray-200 px-4 py-2">
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.student_id}</div>
                    </div>
                  </td>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <td key={day} className="border border-gray-200 px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        defaultChecked={Math.random() > 0.2}
                      />
                    </td>
                  ))}
                  <td className="border border-gray-200 px-4 py-2 text-center font-medium">
                    {Math.floor(Math.random() * 20 + 80)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMarks = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Marks Management</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            + Add New Exam
          </button>
        </div>

        {/* Exam Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-md">
            <option>Select Subject</option>
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>English</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-300 rounded-md">
            <option>Select Exam Type</option>
            <option>Unit Test 1</option>
            <option>Unit Test 2</option>
            <option>Mid Term</option>
            <option>Final Exam</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-300 rounded-md">
            <option>Select Class</option>
            <option>Class 10A</option>
            <option>Class 10B</option>
            <option>Class 11A</option>
            <option>Class 11B</option>
          </select>
        </div>

        {/* Marks Entry Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-900">Student</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Roll No</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Marks Obtained</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Total Marks</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Percentage</th>
                <th className="border border-gray-200 px-4 py-2 text-center font-medium text-gray-900">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="border border-gray-200 px-4 py-2 font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {student.student_id}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <input
                      type="number"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    100
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <span className="font-medium">--</span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <span className="font-medium">--</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6">
          <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Save Marks
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return renderStudentList();
      case 'timetable':
        return renderTimetable();
      case 'attendance':
        return renderAttendance();
      case 'marks':
        return renderMarks();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading class data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'list', label: 'List', icon: Users },
              { id: 'timetable', label: 'Timetable', icon: Calendar },
              { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
              { id: 'marks', label: 'Marks', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderContent()}

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onAddStudent={handleStudentAdded}
      />
    </div>
  );
}