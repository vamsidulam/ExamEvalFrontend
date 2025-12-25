import { useState } from 'react'
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react'

interface ClassSchedule {
  time: string
  subject: string
  teacher: string
  room: string
}

interface TimetableData {
  [key: string]: ClassSchedule[]
}

export default function StudentTimetable() {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  // Sample timetable data - in a real app, this would come from an API
  const timetableData: TimetableData = {
    'Monday': [
      { time: '09:00-10:30', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'Room 101' },
      { time: '11:00-12:30', subject: 'Physics', teacher: 'Prof. Johnson', room: 'Lab 201' },
      { time: '14:00-15:30', subject: 'Chemistry', teacher: 'Dr. Williams', room: 'Lab 301' },
    ],
    'Tuesday': [
      { time: '09:00-10:30', subject: 'English Literature', teacher: 'Ms. Brown', room: 'Room 205' },
      { time: '11:00-12:30', subject: 'Computer Science', teacher: 'Prof. Davis', room: 'Lab 401' },
      { time: '14:00-15:30', subject: 'History', teacher: 'Dr. Wilson', room: 'Room 301' },
    ],
    'Wednesday': [
      { time: '09:00-10:30', subject: 'Biology', teacher: 'Dr. Taylor', room: 'Lab 501' },
      { time: '11:00-12:30', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'Room 101' },
      { time: '14:00-15:30', subject: 'Physical Education', teacher: 'Coach Miller', room: 'Gymnasium' },
    ],
    'Thursday': [
      { time: '09:00-10:30', subject: 'Physics', teacher: 'Prof. Johnson', room: 'Lab 201' },
      { time: '11:00-12:30', subject: 'English Literature', teacher: 'Ms. Brown', room: 'Room 205' },
      { time: '14:00-15:30', subject: 'Art', teacher: 'Ms. Anderson', room: 'Art Studio' },
    ],
    'Friday': [
      { time: '09:00-10:30', subject: 'Chemistry', teacher: 'Dr. Williams', room: 'Lab 301' },
      { time: '11:00-12:30', subject: 'Computer Science', teacher: 'Prof. Davis', room: 'Lab 401' },
      { time: '14:00-15:30', subject: 'Study Hall', teacher: 'Various', room: 'Library' },
    ],
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const getWeekDates = (date: Date): Date[] => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)

    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(startOfWeek)
      currentDate.setDate(startOfWeek.getDate() + i)
      week.push(currentDate)
    }
    return week
  }

  const weekDates = getWeekDates(currentWeek)

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction * 7))
    setCurrentWeek(newDate)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Mathematics': 'bg-blue-100 text-blue-800',
      'Physics': 'bg-green-100 text-green-800',
      'Chemistry': 'bg-yellow-100 text-yellow-800',
      'English Literature': 'bg-purple-100 text-purple-800',
      'Computer Science': 'bg-indigo-100 text-indigo-800',
      'History': 'bg-red-100 text-red-800',
      'Biology': 'bg-emerald-100 text-emerald-800',
      'Physical Education': 'bg-orange-100 text-orange-800',
      'Art': 'bg-pink-100 text-pink-800',
      'Study Hall': 'bg-gray-100 text-gray-800',
    }
    return colors[subject] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Class Timetable</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="text-sm font-medium text-gray-900">
              Week of {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
              {weekDates[4].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {days.map((day, index) => (
            <div key={day} className="space-y-4">
              <div className={`text-center p-3 rounded-lg ${isToday(weekDates[index]) ? 'bg-blue-100 text-blue-900' : 'bg-gray-50'}`}>
                <div className="font-semibold">{day}</div>
                <div className="text-sm text-gray-600">
                  {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div className="space-y-3">
                {timetableData[day]?.map((class_, classIndex) => (
                  <div
                    key={classIndex}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className={`inline-block px-2 py-1 text-xs font-medium rounded-full mb-2 ${getSubjectColor(class_.subject)}`}>
                      {class_.subject}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {class_.time}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        {class_.teacher}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {class_.room}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No classes scheduled</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Classes This Week</p>
                <p className="text-lg font-semibold text-blue-900">
                  {Object.values(timetableData).flat().length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Hours Per Week</p>
                <p className="text-lg font-semibold text-green-900">
                  {Object.values(timetableData).flat().length * 1.5}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Subjects</p>
                <p className="text-lg font-semibold text-purple-900">
                  {new Set(Object.values(timetableData).flat().map(c => c.subject)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}