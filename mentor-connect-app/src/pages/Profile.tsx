import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  GlobeAltIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useApi';
import apiService, { RecentActivityItem, ProfileResponse, Project as ProjectType } from '../services/api';

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, loading: authLoading } = useAuth();
  const { data: profileResponse, loading: profileLoading, error: profileError, execute: fetchProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    experience: '',
    bio: '',
    location: '',
    github: '',
    linkedin: '',
    website: '',
    skills: [] as string[],
    isAvailable: true
  });

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const profileData: ProfileResponse | undefined = profileResponse?.data;
  const profileUser = profileData?.user ?? user ?? null;

  useEffect(() => {
    if (profileUser) {
      setEditData({
        name: profileUser.name || '',
        experience: profileUser.experience || '',
        bio: profileUser.bio || '',
        location: profileUser.location || '',
        github: profileUser.github || '',
        linkedin: profileUser.linkedin || '',
        website: profileUser.website || '',
        skills: profileUser.skills || [],
        isAvailable: profileUser.isAvailable ?? true
      });
    }
  }, [profileUser]);

  const statistics = useMemo(() => {
    if (!profileData) {
      return [];
    }
    return [
      {
        label: 'Projects Completed',
        value: profileData.statistics.completedProjects.toString(),
        icon: CodeBracketIcon
      },
      {
        label: 'Projects In Progress',
        value: profileData.statistics.inProgressProjects.toString(),
        icon: ClockIcon
      },
      {
        label: profileUser?.role === 'engineer' ? 'Students Mentored' : 'Projects Owned',
        value: profileUser?.role === 'engineer'
          ? profileData.statistics.mentoredProjects.toString()
          : profileData.statistics.ownedProjects.toString(),
        icon: AcademicCapIcon
      },
      {
        label: 'Rating',
        value: `${(profileUser?.rating ?? 0).toFixed(1)} / 5`,
        icon: StarIcon
      }
    ];
  }, [profileData, profileUser]);

  type QuickAction = {
    label: string;
    icon: typeof CodeBracketIcon;
    variant: 'primary' | 'outline';
    description?: string;
    onClick: () => void;
  };

  const quickActions: QuickAction[] = useMemo(() => {
    if (!profileUser) {
      return [];
    }

    if (profileUser.role === 'engineer') {
      return [
        {
          label: 'Post New Project',
          icon: CodeBracketIcon,
          variant: 'primary',
          description: 'Share a new collaboration opportunity',
          onClick: () => navigate('/projects/new')
        },
        {
          label: 'Browse Projects',
          icon: UserGroupIcon,
          variant: 'outline',
          description: 'Review active collaborations',
          onClick: () => navigate('/projects')
        },
        {
          label: 'Find Mentors',
          icon: AcademicCapIcon,
          variant: 'outline',
          description: 'Connect with other mentors',
          onClick: () => navigate('/mentors')
        }
      ];
    }

    return [
      {
        label: 'Browse Projects',
        icon: CodeBracketIcon,
        variant: 'primary',
        description: 'Join a project that matches your skills',
        onClick: () => navigate('/projects')
      },
      {
        label: 'Find Mentors',
        icon: AcademicCapIcon,
        variant: 'outline',
        description: 'Connect with experienced engineers',
        onClick: () => navigate('/mentors')
      },
      {
        label: 'Update Profile Info',
        icon: PencilIcon,
        variant: 'outline',
        description: 'Refresh your skills and bio',
        onClick: () => setIsEditing(true)
      }
    ];
  }, [profileUser, navigate, setIsEditing]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  const resetEditState = () => {
    if (!profileUser) {
      return;
    }
    setEditData({
      name: profileUser.name || '',
      experience: profileUser.experience || '',
      bio: profileUser.bio || '',
      location: profileUser.location || '',
      github: profileUser.github || '',
      linkedin: profileUser.linkedin || '',
      website: profileUser.website || '',
      skills: profileUser.skills || [],
      isAvailable: profileUser.isAvailable ?? true
    });
    setFormError('');
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setFormError('');

    try {
      const payload = {
        name: editData.name.trim(),
        experience: editData.experience.trim(),
        bio: editData.bio.trim(),
        location: editData.location.trim(),
        github: editData.github.trim() || undefined,
        linkedin: editData.linkedin.trim() || undefined,
        website: editData.website.trim() || undefined,
        skills: Array.from(new Set(editData.skills.map(skill => skill.trim()).filter(Boolean))),
        isAvailable: editData.isAvailable
      };

      const response = await apiService.updateProfile(user.id, payload);

      if (response.success && response.data?.data) {
        const updatedUser = response.data.data;
        updateUser(updatedUser);
        await fetchProfile(user.id);
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Unable to update profile');
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetEditState();
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <img
                src={profileUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser?.name ?? '')}&background=3b82f6&color=fff`}
                alt={profileUser?.name}
                className="w-20 h-20 rounded-full mr-6"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profileUser?.name}</h1>
                <p className="text-gray-600 capitalize">{profileUser?.role}</p>
                <p className="text-sm text-gray-500">{profileUser?.email}</p>
                {profileUser?.location && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {profileUser.location}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Availability: {profileUser?.isAvailable ? 'Open to mentor' : 'Currently unavailable'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!isEditing) {
                  resetEditState();
                }
                setIsEditing(!isEditing);
              }}
              className="btn-outline"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {profileLoading && !profileData ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile data...</p>
          </div>
        ) : profileError ? (
          <div className="bg-white rounded-lg border border-red-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Could not load profile</h2>
            <p className="text-sm text-red-500">{profileError}</p>
            <button
              className="btn-primary mt-4"
              onClick={() => fetchProfile(user.id)}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Information */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

                {isEditing ? (
                  <div className="space-y-6">
                    {formError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {formError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={editData.location}
                          onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                          className="input-field"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {profileUser?.role === 'engineer' ? 'Years of Experience' : 'Academic Level'}
                      </label>
                      <textarea
                        value={editData.experience}
                        onChange={(e) => setEditData(prev => ({ ...prev, experience: e.target.value }))}
                        rows={3}
                        className="input-field"
                        placeholder="Tell us about your experience"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="input-field"
                        placeholder="Share a short introduction"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GitHub
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={editData.github}
                            onChange={(e) => setEditData(prev => ({ ...prev, github: e.target.value }))}
                            className="input-field pl-10"
                            placeholder="https://github.com/username"
                          />
                          <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={editData.linkedin}
                            onChange={(e) => setEditData(prev => ({ ...prev, linkedin: e.target.value }))}
                            className="input-field pl-10"
                            placeholder="https://www.linkedin.com/in/username"
                          />
                          <UserGroupIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={editData.website}
                            onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                            className="input-field pl-10"
                            placeholder="https://yourportfolio.com"
                          />
                          <GlobeAltIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills & Technologies
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="input-field flex-1"
                          placeholder="Add a skill (press enter)"
                        />
                        <button onClick={addSkill} className="btn-secondary">
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editData.skills.map(skill => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 text-primary-500 hover:text-primary-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="availability"
                        type="checkbox"
                        checked={editData.isAvailable}
                        onChange={(e) => setEditData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="availability" className="ml-2 text-sm text-gray-700">
                        I am available for new mentorship or project collaborations
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving}
                      >
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button onClick={handleCancel} className="btn-outline">
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {profileUser?.bio && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">About</h3>
                        <p className="text-gray-900">{profileUser.bio}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Experience</h3>
                        <p className="text-gray-900">{profileUser?.experience}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Contact</h3>
                        <p className="text-gray-900 break-all">{profileUser?.email}</p>
                        {profileUser?.github && (
                          <a href={profileUser.github} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm block">
                            GitHub
                          </a>
                        )}
                        {profileUser?.linkedin && (
                          <a href={profileUser.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm block">
                            LinkedIn
                          </a>
                        )}
                        {profileUser?.website && (
                          <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm block">
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Skills & Technologies</h3>
                      <div className="flex flex-wrap gap-2">
                        {(profileUser?.skills || []).map(skill => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                {profileData?.recentActivity?.length ? (
                  <div className="space-y-4">
                    {profileData.recentActivity.map((activity: RecentActivityItem, index) => (
                      <motion.div
                        key={activity.id}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'owned' ? 'bg-blue-100' : activity.type === 'mentored' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {activity.type === 'mentored' ? (
                            <AcademicCapIcon className="w-4 h-4 text-green-600" />
                          ) : (
                            <CodeBracketIcon className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{activity.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                            <span>{activity.status}</span>
                            <span>{formatDate(activity.updatedAt)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent activity recorded yet.</p>
                )}
              </div>

              {/* Projects Overview */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Projects Overview</h2>
                {profileData?.projects?.length ? (
                  <div className="space-y-4">
                    {profileData.projects.map((project: ProjectType) => (
                      <div key={project.id} className="border border-gray-100 rounded-lg p-4 hover:border-primary-100 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {project.skills.slice(0, 5).map(skill => (
                                <span key={skill} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 md:text-right">
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {project.status}
                            </span>
                            <div className="text-sm text-gray-500">
                              Duration: {project.duration}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.owner.id === profileUser?.id ? (
                                // User is the project owner (engineer)
                                project.student ? `Student: ${project.student.name}` : 'Student needed'
                              ) : (
                                // User is the student working on the project
                                project.owner ? `Mentored by ${project.owner.name}` : 'Looking for mentor'
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No projects linked to your profile yet.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Stats */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Stats</h2>
                <div className="space-y-4">
                  {statistics.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <stat.icon className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="text-sm text-gray-600">{stat.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{stat.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  {quickActions.map(action => {
                    const Icon = action.icon;
                    const variantClass = action.variant === 'primary' ? 'btn-primary' : 'btn-outline';
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={action.onClick}
                        className={`w-full ${variantClass} flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-1`}
                      >
                        <span className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {action.label}
                        </span>
                        {action.description && (
                          <span className="text-xs sm:text-sm text-gray-200 sm:text-gray-500">
                            {action.description}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
