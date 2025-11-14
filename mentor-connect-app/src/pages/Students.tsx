import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  AcademicCapIcon,
  MapPinIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import apiService, { User } from '../services/api';

const Students: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [allStudents, setAllStudents] = useState<User[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'engineer') {
      navigate('/');
      return;
    }
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudents({ page: 1, limit: 100 });
      if (response.success && response.data) {
        const students = response.data.data || [];
        setAllStudents(students);
        setFilteredStudents(students);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = allStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSkill = selectedSkill === 'all' || student.skills.includes(selectedSkill);

      return matchesSearch && matchesSkill;
    });
    setFilteredStudents(filtered);
  }, [searchTerm, selectedSkill, allStudents]);

  const allSkills = allStudents.length > 0
    ? Array.from(new Set(allStudents.flatMap(student => student.skills)))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Students</h1>
          <p className="text-gray-600">Find talented students to work on your projects</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or skills..."
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

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/profile/${student.id}`)}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff`}
                    alt={student.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {student.name}
                    </h3>
                    {student.location && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {student.location}
                      </div>
                    )}
                    {student.experience && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {student.experience}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {student.skills.slice(0, 4).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{student.skills.length - 4} more
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <CodeBracketIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">Student</span>
                      </div>
                      {student.rating > 0 && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{student.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500 ml-1">⭐</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;

