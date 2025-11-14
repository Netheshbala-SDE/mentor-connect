import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  StarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useMentors } from '../hooks/useApi';
import { User } from '../services/api';

const Mentors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [filteredMentors, setFilteredMentors] = useState<User[]>([]);
  
  const { data: mentorsData, loading, error, execute: fetchMentors } = useMentors();

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    if (mentorsData?.data) {
      const mentors = mentorsData.data;
      const filtered = mentors.filter(mentor => {
        const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             mentor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesSkill = selectedSkill === 'all' || mentor.skills.includes(selectedSkill);

        return matchesSearch && matchesSkill;
      });
      setFilteredMentors(filtered);
    }
  }, [mentorsData, searchTerm, selectedSkill]);

  const allSkills = mentorsData?.data 
    ? Array.from(new Set(mentorsData.data.flatMap(mentor => mentor.skills)))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Mentor</h1>
          <p className="text-gray-600">Connect with experienced engineers who can guide your learning journey</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mentors by name, role, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Skill Filter */}
            <div>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading mentors...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <AcademicCapIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading mentors</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchMentors()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Mentors Grid */}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              className="card hover:shadow-md transition-shadow duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Mentor Header */}
              <div className="flex items-start mb-4">
                <img
                  src={mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=3b82f6&color=fff`}
                  alt={mentor.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                  <p className="text-sm text-gray-600">Software Engineer</p>
                  <p className="text-sm text-gray-500">{mentor.location || 'Remote'}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(mentor.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {mentor.rating || 0} ({mentor.totalReviews || 0} reviews)
                </span>
              </div>

              {/* Bio */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {mentor.bio || 'Experienced software engineer passionate about mentoring and helping students grow their technical skills.'}
              </p>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {mentor.skills.slice(0, 4).map(skill => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {mentor.skills.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{mentor.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>



              {/* Details */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <BriefcaseIcon className="h-4 w-4 mr-2" />
                  {mentor.experience} experience
                </div>
                <div className="flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  Available: {mentor.isAvailable ? 'Yes' : 'No'}
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full btn-primary">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 inline" />
                Connect for Mentoring
              </button>
            </motion.div>
          ))}
          </div>
        )}

        {!loading && !error && filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No mentors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
