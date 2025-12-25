import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  BarChart3,
  Settings,
  Target,
  X,
  Users,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';
import elogo from './assets/elogo.png';
import logo2 from './assets/logo2.png';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Question Generation', href: '/dashboard/question-generation', icon: FileText },
    { name: 'Evaluation', href: '/dashboard/evaluation', icon: ClipboardCheck },
    { name: 'Class Management', href: '/dashboard/class-management/ClassDashboard', icon: Users },
    { name: 'Results', href: '/dashboard/results', icon: Target },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay with glassmorphic effect */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Futuristic Glassmorphic Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col h-full ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        } ${
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(248, 251, 255, 0.8) 0%, rgba(238, 243, 255, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header with glowing logo */}
        <div className={`flex items-center justify-between h-16 border-b border-white/20 transition-all duration-500 ${
          isCollapsed ? 'px-2' : 'px-4'
        }`}>
          <div className={`flex items-center transition-all duration-500 ${
            isCollapsed ? 'justify-center w-full' : 'space-x-3'
          }`}>
                    <div className="relative group">
                      <img 
                        src={logo2} 
                        alt="ExamEval Logo" 
                        className={`object-contain transition-all duration-500 group-hover:scale-110 ${
                          isCollapsed ? 'h-8 w-8' : 'h-8 w-8'
                        }`}
                      />
                    </div>
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold">
                  <span className="text-black">Exam</span>
                  <span className="text-blue-600">Eval</span>
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile close button with glow effect */}
          {!isCollapsed && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/20 transition-all duration-300 hover:shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation with futuristic styling */}
        <nav className={`flex-1 transition-all duration-500 ${isCollapsed ? 'px-1' : 'px-3'}`}>
          <div className="mt-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    onClose();
                    onToggleCollapse();
                  }}
                  className={`group flex items-center text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                    isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 rounded-md'
                      : 'text-gray-600 hover:bg-gray-100 rounded-2xl'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                  style={{
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)'
                  }}
                >
                  
                  <item.icon
                    className={`h-5 w-5 transition-all duration-300 ${
                      isCollapsed ? 'mr-0' : 'mr-3'
                    } ${
                      isActive 
                        ? 'text-blue-600' 
                        : 'text-gray-400 group-hover:text-blue-500 group-hover:scale-110'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="relative transition-all duration-300 group-hover:translate-x-1">
                      {item.name}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state with glassmorphic effect */}
                  {isCollapsed && (
                    <div 
                      className="absolute left-full ml-3 px-3 py-2 text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50"
                      style={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Details Section with glassmorphic card */}
        {user && (
          <div className={`border-t border-white/20 transition-all duration-500 ${
            isCollapsed ? 'p-3' : 'p-4'
          }`}>
            {isCollapsed ? (
              // Collapsed user section with glow effects
              <div className="flex flex-col items-center space-y-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-600/30 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  {/* Tooltip for collapsed state */}
                  <div 
                    className="absolute left-full ml-3 px-3 py-2 text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50"
                    style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {user.name}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              // Expanded user section with glassmorphic card
              <div 
                className="space-y-3 p-4 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/20 transition-all duration-300 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-600/30 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.role}
                    </p>
            </div>
                </div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;