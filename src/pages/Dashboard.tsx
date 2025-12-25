import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
  User,
  ChevronRight,
  ChevronLeft,
  Activity,
  Award,
  Target,
  Plus
} from 'lucide-react';

const timetableData = [
  { subject: 'Mathematics', time: '09:00-10:00', room: 'Room 101', faculty: 'Dr. Smith' },
  { subject: 'Physics', time: '10:15-11:15', room: 'Room 102', faculty: 'Prof. Johnson' },
  { subject: 'Chemistry', time: '11:30-12:30', room: 'Room 103', faculty: 'Dr. Brown' },
  { subject: 'Biology', time: '02:00-03:00', room: 'Room 104', faculty: 'Prof. Davis' },
  { subject: 'English', time: '03:15-04:15', room: 'Room 105', faculty: 'Dr. Wilson' }
];

interface ExamEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  room: string;
  status: 'upcoming' | 'active' | 'completed';
  type: 'exam' | 'class' | 'meeting';
}

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [events, setEvents] = useState<ExamEvent[]>([]);

  // Mock data for events
  useEffect(() => {
    const mockEvents: ExamEvent[] = [
      {
        id: '1',
        title: 'Mathematics',
        date: '2024-01-30',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        duration: '3 hours',
        room: 'Room 101',
        status: 'upcoming',
        type: 'exam'
      },
      {
        id: '2',
        title: 'Physics',
        date: '2024-01-30',
        startTime: '02:00 PM',
        endTime: '04:00 PM',
        duration: '2 hours',
        room: 'Room 102',
        status: 'upcoming',
        type: 'exam'
      },
      {
        id: '3',
        title: 'Farmers',
        date: '2024-01-31',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        duration: '3 hours',
        room: 'Room 103',
        status: 'upcoming',
        type: 'class'
      },
      {
        id: '4',
        title: 'Chemistry',
        date: '2024-02-01',
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        duration: '1.5 hours',
        room: 'Room 104',
        status: 'upcoming',
        type: 'exam'
      },
      {
        id: '5',
        title: 'Biology',
        date: '2024-02-02',
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        duration: '2 hours',
        room: 'Room 105',
        status: 'upcoming',
        type: 'exam'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const metricsCards = [
    {
      title: 'Total Students',
      value: '1,250',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12% from last month'
    },
    {
      title: 'Paper Generated',
      value: '89',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12% from last month'
    },
    {
      title: 'Total Evaluation',
      value: '456',
      icon: ClipboardCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+12% from last month'
    },
    {
      title: 'AI Accuracy',
      value: '95%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+12% from last month'
    }
  ];

  // Get the week dates for the current week
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }
    return weekDates;
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Get day abbreviation
  const getDayAbbr = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'upcoming': return '#2563EB';
      case 'completed': return '#6B7280';
      default: return '#2563EB';
    }
  };

  // Get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return BookOpen;
      case 'class': return Users;
      case 'meeting': return Target;
      default: return BookOpen;
    }
  };


  const weekDates = getWeekDates(currentWeek);
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="w-full">
        {/* Top Bar - Tabname Section */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your comprehensive education management dashboard</p>
        </div>

        {/* Main Content Grid - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Section - Main Content Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Welcome Section - Large Banner Card */}
        <div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-4">
                      <h2 className="text-3xl font-bold">
                        Welcome back, User!
                      </h2>
                      <p className="text-blue-100 text-lg mt-2">
                        Let's review today's performance insights and evaluation data.
          </p>
        </div>
                    <div className="flex items-center space-x-6 text-blue-100">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Active Sessions: 12</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5" />
                        <span>Performance Score: 94%</span>
                      </div>
        </div>
      </div>
                  <div className="hidden lg:block">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-white" />
              </div>
                </div>
              </div>
        </div>
      </div>

            {/* Metrics Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {metricsCards.map((card, index) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${card.bgColor}`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {card.value}
                      </div>
                      <div className="text-sm text-gray-500">{card.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{card.change}</span>
            </div>
          </div>
        ))}
      </div>

            {/* Timetable Section */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Timetable</h3>
              <div className="space-y-3">
                {timetableData.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-colors ${
                      index % 2 === 0 ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.subject}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{item.time}</span>
                          <span>•</span>
                          <span>{item.room}</span>
                          </div>
                        </div>
                      <div className="text-sm text-gray-500">
                        {item.faculty}
                            </div>
                          </div>
                        </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Section - Side Column */}
          <div className="space-y-4">
            {/* Combined Calendar & Schedule */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Calendar & Schedule</h3>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Calendar Section */}
              <div className="mb-6">
                {/* Navigation with Month Display */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  {/* Month Display - Centered between arrows */}
                  <h4 className="text-lg font-medium text-gray-900">
                    {formatDate(currentWeek)}
                  </h4>
                  
                  <button
                    onClick={goToNextWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDates.map((date, index) => (
                    <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
                      {getDayAbbr(date)}
          </div>
        ))}
      </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {weekDates.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`text-center py-3 text-sm rounded-lg transition-all duration-200 ${
                        isSelected(date)
                          ? 'bg-blue-600 text-white font-medium'
                          : isToday(date)
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  {selectedDateEvents.length > 0 
                    ? `Events for ${selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}`
                    : 'No events scheduled'
                  }
                </h4>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedDateEvents.map((event) => {
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <EventIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 mb-1">
                                {event.title}
                              </h5>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Time: {event.startTime} - {event.endTime}</span>
                          </div>
                        </div>
                              <div className="text-sm text-gray-500">
                                Duration: {event.duration} • {event.room}
                        </div>
                      </div>
                    </div>
                          <div className="ml-4 flex-shrink-0">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getStatusColor(event.status) }}
                            ></div>
            </div>
          </div>
                    </div>
                    );
                  })}
        </div>

                {/* Empty State */}
                {selectedDateEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No events scheduled for this date</p>
                    <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Add Event
                    </button>
          </div>
                )}
                  </div>
                </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;