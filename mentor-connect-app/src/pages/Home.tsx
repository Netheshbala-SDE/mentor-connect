import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CodeBracketIcon,
  AcademicCapIcon,
  UsersIcon,
  RocketLaunchIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useHomeContent } from '../hooks/useApi';
import { Feature, HomeStat, Testimonial, Project as ProjectType, User as UserType } from '../services/api';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CodeBracketIcon,
  AcademicCapIcon,
  UsersIcon,
  RocketLaunchIcon
};

const LoadingBlock: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4" />
    <p className="text-gray-600">{message || 'Loading data...'}</p>
  </div>
);

const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="text-center py-12">
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const renderStars = (rating: number) => (
  <div className="flex text-yellow-400">
    {Array.from({ length: 5 }).map((_, index) => (
      <StarIcon
        key={index}
        className={`w-5 h-5 ${index < Math.round(rating ?? 0) ? 'fill-current' : ''}`}
      />
    ))}
  </div>
);

const Home: React.FC = () => {
  const { data: homeData, loading, error, execute: fetchHomeContent } = useHomeContent();

  useEffect(() => {
    fetchHomeContent();
  }, [fetchHomeContent]);

  const stats: HomeStat[] = homeData?.stats ?? [];
  const features: Feature[] = homeData?.features ?? [];
  const testimonials: Testimonial[] = homeData?.testimonials ?? [];
  const topMentors: UserType[] = homeData?.highlights?.topMentors?.slice(0, 3) ?? [];
  const recentProjects: ProjectType[] = homeData?.highlights?.recentProjects?.slice(0, 3) ?? [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Connect. Build.
              <span className="text-primary-600"> Grow.</span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Software engineers get free project assistance from engineering students
              in exchange for valuable mentoring. A win-win collaboration platform powered by real community data.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started Free
              </Link>
              <Link to="/projects" className="btn-outline text-lg px-8 py-3">
                Browse Projects
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && !stats.length ? (
            <LoadingBlock message="Crunching the latest stats..." />
          ) : error ? (
            <EmptyState
              title="We couldn't load the latest stats"
              description="Please refresh the page or try again later."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our community-driven playbook evolves as mentors and students achieve milestones together.
            </p>
          </div>

          {loading && !features.length ? (
            <LoadingBlock message="Loading community highlights..." />
          ) : !features.length ? (
            <EmptyState
              title="No highlights yet"
              description="Once the first mentorship is completed, you will see it reflected here."
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature: Feature, index) => {
                const Icon = iconMap[feature.icon] ?? CodeBracketIcon;
                return (
                  <motion.div
                    key={feature.id}
                    className="card text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Top Mentors */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Top Mentors</h2>
                <Link to="/mentors" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all mentors
                </Link>
              </div>

              {loading && !topMentors.length ? (
                <LoadingBlock message="Spotlighting community mentors..." />
              ) : !topMentors.length ? (
                <EmptyState
                  title="No mentors available yet"
                  description="Mentors will appear here as soon as they join the platform."
                />
              ) : (
                <div className="space-y-4">
                  {topMentors.map((mentor: UserType, index) => (
                    <motion.div
                      key={mentor.id}
                      className="card flex items-center justify-between"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <img
                          src={mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=3b82f6&color=fff`}
                          alt={mentor.name}
                          className="w-14 h-14 rounded-full mr-4"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{mentor.role}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-sm font-medium text-primary-600">
                              {(mentor.rating ?? 0).toFixed(1)}
                            </span>
                            <StarIcon className="w-4 h-4 text-yellow-400 ml-1 fill-current" />
                            <span className="text-xs text-gray-400 ml-2">
                              {mentor.totalReviews} reviews
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mentor.skills.slice(0, 3).map(skill => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button className="btn-outline text-sm whitespace-nowrap">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1 inline" />
                        Connect
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Projects */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Latest Projects</h2>
                <Link to="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Browse projects
                </Link>
              </div>

              {loading && !recentProjects.length ? (
                <LoadingBlock message="Fetching the newest project briefs..." />
              ) : !recentProjects.length ? (
                <EmptyState
                  title="No projects posted yet"
                  description="Your project will be the first one here."
                />
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project: ProjectType, index) => (
                    <motion.div
                      key={project.id}
                      className="card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {project.status}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {project.difficulty}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {project.duration}
                          </span>
                          <span className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-1" />
                            {project.student ? 'Student assigned' : 'Student needed'}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <img
                            src={project.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner.name)}&background=3b82f6&color=fff`}
                            alt={project.owner.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{project.owner.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{project.owner.role}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of engineers and students who are already collaborating and growing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200">
              Join as Engineer
            </Link>
            <Link to="/register" className="bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200">
              Join as Student
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
          </div>

          {loading && !testimonials.length ? (
            <LoadingBlock message="Gathering fresh testimonials..." />
          ) : !testimonials.length ? (
            <EmptyState
              title="No testimonials posted yet"
              description="Be the first to share your mentorship story."
            />
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial: Testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-gray-600 mb-4">
                    “{testimonial.quote}”
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
