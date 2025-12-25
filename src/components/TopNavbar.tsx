import React from 'react';
import { Bell, User, Menu, Search, LogOut, Sidebar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from './assets/elogo.png';

interface TopNavbarProps {
  onMenuClick: () => void;
  onToggleSidebar?: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuClick, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center">
          {/* Logo - positioned first for left alignment */}
          <div className="flex items-center">
            {/* <img 
              src={logo} 
              alt="ExamEval.ai Logo" 
              className="h-12 w-auto object-contain mr-2"
            />*/}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <Sidebar className="h-5 w-5" />
          </button>
          
          <div className="hidden md:flex items-center max-w-xs lg:max-w-sm">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search papers, students..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-sm text-right">
              <div className="font-medium text-gray-900">{user?.name}</div>
              <div className="text-gray-500">{user?.role}</div>
            </div>
            <div className="relative group">
              <button className="flex items-center justify-center h-8 w-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200">
                <User className="h-4 w-4" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;