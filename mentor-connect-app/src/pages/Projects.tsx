import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  CodeBracketIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useProjects } from '../hooks/useApi';
import { Project, Application } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  
  const { data: projectsData, loading, error, execute: fetchProjects } = useProjects();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projectsData?.data) {
      const projects = projectsData.data;
      const filtered = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;
        const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;

        return matchesSearch && matchesDifficulty && matchesStatus;
      });
      setFilteredProjects(filtered);
    }
  }, [projectsData, searchTerm, selectedDifficulty, selectedStatus]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const hasApplied = (project: Project): boolean => {
    if (!user || !project.applications) return false;
    return project.applications.some(
      (app: Application) => app.student.id === user.id
    );
  };

  const getApplicationStatus = (project: Project): string | null => {
    if (!user || !project.applications) return null;
    const application = project.applications.find(
      (app: Application) => app.student.id === user.id
    );
    return application ? application.status : null;
  };

  const handleApplyClick = (project: Project) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    if (user.role !== 'student') {
      setApplyError('Only students can apply to projects');
      return;
    }
    setSelectedProject(project);
    setShowApplyModal(true);
    setApplicationMessage('');
    setApplyError('');
    setApplySuccess(false);
  };

  const handleSubmitApplication = async () => {
    if (!selectedProject) return;

    setIsApplying(true);
    setApplyError('');
    setApplySuccess(false);

    try {
      await apiService.applyToProject(selectedProject.id, applicationMessage);
      setApplySuccess(true);
      // Refresh projects
      setTimeout(() => {
        fetchProjects();
        setShowApplyModal(false);
        setApplySuccess(false);
      }, 1500);
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'engineer' ? 'Browse Projects' : 'Available Projects'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'engineer' 
              ? 'Explore projects from other engineers' 
              : 'Find projects that match your skills and interests'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, skills, or technologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <CodeBracketIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading projects</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchProjects()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <div className="grid gap-6">
            {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="card hover:shadow-md transition-shadow duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map(skill => (
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
                      <UserIcon className="h-4 w-4 mr-1" />
                      {project.student ? 'Student assigned' : 'No student yet'}
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                      {project.budget ? `$${project.budget}` : 'No budget'}
                    </div>
                  </div>
                </div>

                {/* Project Owner */}
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <div className="flex items-center mb-2">
                    <img
                      src={project.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner.name)}&background=3b82f6&color=fff`}
                      alt={project.owner.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{project.owner.name}</div>
                      <div className="text-sm text-gray-500">{project.owner.role}</div>
                    </div>
                  </div>
                  {user?.role === 'student' && project.status === 'open' ? (
                    hasApplied(project) ? (
                      <div className="w-full">
                        {getApplicationStatus(project) === 'pending' && (
                          <button className="w-full btn-outline" disabled>
                            Application Pending
                          </button>
                        )}
                        {getApplicationStatus(project) === 'accepted' && (
                          <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg" disabled>
                            Application Accepted
                          </button>
                        )}
                        {getApplicationStatus(project) === 'rejected' && (
                          <button className="w-full btn-outline text-red-600" disabled>
                            Application Rejected
                          </button>
                        )}
                      </div>
                    ) : (
                      <button 
                        className="w-full btn-primary"
                        onClick={() => handleApplyClick(project)}
                      >
                        Apply Now
                      </button>
                    )
                  ) : project.status === 'open' && !user ? (
                    <button 
                      className="w-full btn-primary"
                      onClick={() => window.location.href = '/login'}
                    >
                      Login to Apply
                    </button>
                  ) : project.status !== 'open' ? (
                    <button className="w-full btn-outline" disabled>
                      {project.status === 'in-progress' ? 'In Progress' : project.status}
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        )}

        {!loading && !error && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Apply to Project</h2>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedProject.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedProject.description.substring(0, 150)}...
              </p>
            </div>

            {applySuccess ? (
              <div className="text-center py-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Application submitted successfully!</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Message (Optional)
                  </label>
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    placeholder="Tell the project owner why you're interested and what you can bring to the project..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {applicationMessage.length}/500 characters
                  </p>
                </div>

                {applyError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{applyError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 btn-outline"
                    disabled={isApplying}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    className="flex-1 btn-primary"
                    disabled={isApplying}
                  >
                    {isApplying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;
