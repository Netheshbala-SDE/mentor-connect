import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">MentorConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {user.role === 'engineer' ? (
                  <>
                    <Link to="/projects" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                      Browse Projects
                    </Link>
                    <Link to="/my-projects" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                      My Projects
                    </Link>
                    <Link to="/students" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                      Browse Students
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/projects" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                      Projects
                    </Link>
                    <Link to="/my-applications" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                      My Applications
                    </Link>
                    <Link to="/mentors" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                      Mentors
                    </Link>
                  </>
                )}
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/projects" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Projects
                </Link>
                <Link to="/mentors" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Mentors
                </Link>
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                {user ? (
                  <>
                    {user.role === 'engineer' ? (
                      <>
                        <Link
                          to="/projects"
                          className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Browse Projects
                        </Link>
                        <Link
                          to="/my-projects"
                          className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          My Projects
                        </Link>
                        <Link
                          to="/students"
                          className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Browse Students
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/projects"
                          className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Projects
                        </Link>
                        <Link
                          to="/my-applications"
                          className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          My Applications
                        </Link>
                        <Link
                          to="/mentors"
                          className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Mentors
                        </Link>
                      </>
                    )}
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium w-full text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/projects"
                      className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Projects
                    </Link>
                    <Link
                      to="/mentors"
                      className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Mentors
                    </Link>
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary block text-center mx-3"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
    </nav>
  );
};

export default Navbar;
