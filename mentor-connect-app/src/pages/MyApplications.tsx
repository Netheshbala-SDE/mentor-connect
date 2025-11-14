import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CodeBracketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import apiService, { Project } from '../services/api';

const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/');
      return;
    }
    fetchMyApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  useEffect(() => {
    // Re-fetch when filter changes to get fresh data
    if (user && user.role === 'student') {
      fetchMyApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      // Get all projects and filter by applications
      const response = await apiService.getProjects({ page: 1, limit: 100 });
      if (response.success && response.data) {
        // Filter projects where user has applied
        const allProjects = response.data.data || [];
        const projectsWithMyApplications = allProjects.filter(project => 
          project.applications?.some(app => app.student.id === user!.id)
        );
        setProjects(projectsWithMyApplications);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getMyApplication = (project: Project) => {
    return project.applications?.find(app => app.student.id === user!.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    const myApp = getMyApplication(project);
    return myApp?.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status of your project applications</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === status
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500 mb-6">
              {filter === 'all'
                ? "You haven't applied to any projects yet. Browse available projects to get started."
                : `You don't have any ${filter} applications.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/projects')}
                className="btn-primary"
              >
                Browse Projects
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProjects.map((project, index) => {
              const myApplication = getMyApplication(project);
              if (!myApplication) return null;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`card border-2 ${getStatusColor(myApplication.status)}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(project.difficulty)}`}>
                            {project.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Application Status */}
                      <div className="mb-4 flex items-center gap-2">
                        {getStatusIcon(myApplication.status)}
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(myApplication.status)}`}>
                          {myApplication.status.charAt(0).toUpperCase() + myApplication.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Applied on {new Date(myApplication.appliedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Application Message */}
                      {myApplication.message && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Application Message:</p>
                          <p className="text-sm text-gray-600">{myApplication.message}</p>
                        </div>
                      )}

                      {/* Skills */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {project.skills.slice(0, 5).map(skill => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {project.duration}
                        </div>
                        <div className="flex items-center">
                          <img
                            src={project.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner.name)}&background=3b82f6&color=fff`}
                            alt={project.owner.name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span>Owner: {project.owner.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className="lg:min-w-[200px]">
                      {myApplication.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            Your application is under review. The project owner will notify you soon.
                          </p>
                        </div>
                      )}
                      {myApplication.status === 'accepted' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800 font-medium mb-2">
                            🎉 Congratulations! Your application was accepted.
                          </p>
                          <p className="text-sm text-green-700">
                            The project owner will contact you to start the collaboration.
                          </p>
                        </div>
                      )}
                      {myApplication.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-800">
                            Your application was not selected for this project. Keep applying to other projects!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;

