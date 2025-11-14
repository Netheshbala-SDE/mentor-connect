import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CodeBracketIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import apiService, { Project, Application } from '../services/api';

const MyProjects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'engineer') {
      navigate('/');
      return;
    }
    fetchMyProjects();
  }, [user, navigate]);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserProjects(user!.id, 'owned', 1, 100);
      if (response.success && response.data) {
        setProjects(response.data.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (projectId: string) => {
    try {
      setLoadingApplications(true);
      const response = await apiService.getProjectApplications(projectId);
      if (response.success && response.data) {
        setApplications(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleViewApplications = async (project: Project) => {
    setSelectedProject(project);
    await fetchApplications(project.id);
  };

  const handleApplicationAction = async (action: 'accept' | 'reject', applicationId: string) => {
    if (!selectedProject) return;

    try {
      await apiService.updateApplication(selectedProject.id, applicationId, action);
      // Refresh applications and projects
      await fetchApplications(selectedProject.id);
      await fetchMyProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingApplicationsCount = (project: Project) => {
    return project.applications?.filter(app => app.status === 'pending').length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
            <p className="text-gray-600">Manage your projects and review student applications</p>
          </div>
          <button
            onClick={() => navigate('/projects/new')}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create Project
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500 mb-6">
              Create your first project to start receiving applications from students.
            </p>
            <button
              onClick={() => navigate('/projects/new')}
              className="btn-primary"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-md transition-shadow"
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

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
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {project.student ? `Student: ${project.student.name}` : 'No student assigned'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    {project.status === 'open' && (
                      <div className="mb-2">
                        {pendingApplicationsCount(project) > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-yellow-800">
                                {pendingApplicationsCount(project)} pending application{pendingApplicationsCount(project) !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => handleViewApplications(project)}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Applications ({project.applications?.length || 0})
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Applications Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Applications for "{selectedProject.title}"</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {applications.length} total application{applications.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setApplications([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Applications List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loadingApplications ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Students will appear here when they apply to your project.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={application.student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(application.student.name)}&background=3b82f6&color=fff`}
                                alt={application.student.name}
                                className="w-12 h-12 rounded-full"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900">{application.student.name}</h4>
                                <p className="text-sm text-gray-500">{application.student.email}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getApplicationStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                            </div>

                            {application.message && (
                              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{application.message}</p>
                              </div>
                            )}

                            {/* Student Skills */}
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-2">
                                {application.student.skills?.slice(0, 5).map(skill => (
                                  <span
                                    key={skill}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {application.student.experience && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Experience:</span> {application.student.experience}
                              </p>
                            )}

                            <p className="text-xs text-gray-500">
                              Applied on {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          {application.status === 'pending' && selectedProject.status === 'open' && !selectedProject.student && (
                            <div className="flex flex-col gap-2 ml-4">
                              <button
                                onClick={() => handleApplicationAction('accept', application.id)}
                                className="btn-primary text-sm flex items-center gap-2 whitespace-nowrap"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleApplicationAction('reject', application.id)}
                                className="btn-outline text-sm flex items-center gap-2 whitespace-nowrap text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <XCircleIcon className="h-4 w-4" />
                                Reject
                              </button>
                            </div>
                          )}
                          {application.status === 'accepted' && (
                            <div className="ml-4 flex items-center text-green-600">
                              <CheckCircleIcon className="h-5 w-5 mr-1" />
                              <span className="text-sm font-medium">Accepted</span>
                            </div>
                          )}
                          {application.status === 'rejected' && (
                            <div className="ml-4 flex items-center text-red-600">
                              <XCircleIcon className="h-5 w-5 mr-1" />
                              <span className="text-sm font-medium">Rejected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects;

