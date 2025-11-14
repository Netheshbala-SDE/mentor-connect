import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService, { CreateProjectData } from '../services/api';

const defaultFormState: CreateProjectData = {
  title: '',
  description: '',
  skills: [],
  difficulty: 'beginner',
  duration: '',
  budget: undefined,
  githubUrl: '',
  liveUrl: ''
};

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateProjectData>(defaultFormState);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAuthenticated = Boolean(user);
  const isEngineer = user?.role === 'engineer';

  const isSubmitDisabled = useMemo(() => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.duration.trim()) {
      return true;
    }

    return formData.skills.length === 0;
  }, [formData]);

  const handleSkillAdd = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleChange = (field: keyof CreateProjectData, value: string | number | string[] | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !isEngineer) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Clean up payload - remove empty strings for optional fields
      const payload: CreateProjectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        skills: formData.skills,
        difficulty: formData.difficulty,
        duration: formData.duration.trim(),
        ...(formData.budget !== undefined && formData.budget !== null && formData.budget > 0 ? { budget: Number(formData.budget) } : {}),
        ...(formData.githubUrl?.trim() ? { githubUrl: formData.githubUrl.trim() } : {}),
        ...(formData.liveUrl?.trim() ? { liveUrl: formData.liveUrl.trim() } : {})
      };

      const response = await apiService.createProject(payload);

      if (response.success && response.data) {
        setSuccessMessage('Project created successfully!');
        setFormData(defaultFormState);
        setSkillInput('');

        setTimeout(() => {
          navigate('/projects');
        }, 1200);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create project. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Please sign in</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in as an engineer to create a new project.
          </p>
          <div className="flex justify-center gap-3">
            <button
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate('/register')}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isEngineer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access restricted</h1>
          <p className="text-gray-600 mb-6">
            Project creation is currently limited to engineers. Browse available projects instead.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate('/projects')}
          >
            Browse Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Project</h1>
            <p className="text-gray-600">
              Share your idea, outline the scope, and we’ll connect you with passionate students eager to collaborate.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="input-field"
                placeholder="Give your project a clear and descriptive title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={6}
                className="input-field"
                placeholder="Describe the project goals, required deliverables, and expectations."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="input-field"
                  placeholder="e.g. 6 weeks, 2 months"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="input-field"
                >
                  {difficultyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSkillAdd();
                    }
                  }}
                  className="input-field flex-1"
                  placeholder="Add a skill (press Enter to confirm)"
                />
                <button type="button" className="btn-secondary" onClick={handleSkillAdd}>
                  Add
                </button>
              </div>
              {formData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                    >
                      {skill}
                      <button
                        type="button"
                        className="ml-2 text-primary-500 hover:text-primary-700"
                        onClick={() => handleSkillRemove(skill)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Add at least one skill so students know if they’re a good fit.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleChange('budget', value === '' ? undefined : Number(value));
                  }}
                  className="input-field"
                  placeholder="Provide compensation details (if any)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository (optional)
                </label>
                <input
                  type="url"
                  value={formData.githubUrl ?? ''}
                  onChange={(e) => handleChange('githubUrl', e.target.value)}
                  className="input-field"
                  placeholder="https://github.com/your-org/your-repo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live URL (optional)
              </label>
              <input
                type="url"
                value={formData.liveUrl ?? ''}
                onChange={(e) => handleChange('liveUrl', e.target.value)}
                className="input-field"
                placeholder="https://your-live-demo.com"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn-outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || isSubmitDisabled}
              >
                {submitting ? 'Creating project...' : 'Create Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateProject;


