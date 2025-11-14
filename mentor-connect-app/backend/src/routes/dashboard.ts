import express, { Request, Response } from 'express';
import { Feature } from '../models/Feature';
import { Testimonial } from '../models/Testimonial';
import { Project } from '../models/Project';
import { User } from '../models/User';

const DEFAULT_FEATURES = [
  {
    title: 'Project Collaboration',
    description: 'Connect with students who can help build your projects while you mentor them in return.',
    icon: 'CodeBracketIcon',
    order: 1
  },
  {
    title: 'Skill Development',
    description: 'Students gain real-world experience while engineers get free project assistance.',
    icon: 'AcademicCapIcon',
    order: 2
  },
  {
    title: 'Community Building',
    description: 'Join a community of passionate engineers and students helping each other grow.',
    icon: 'UsersIcon',
    order: 3
  },
  {
    title: 'Innovation Hub',
    description: 'Turn your ideas into reality with collaborative development and mentorship.',
    icon: 'RocketLaunchIcon',
    order: 4
  }
];

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Senior Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    quote: 'As a senior engineer, I\'ve found amazing students to help with my side projects. The mentoring aspect is incredibly rewarding.',
    rating: 5
  },
  {
    name: 'Alex Rodriguez',
    role: 'Computer Science Student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    quote: 'This platform helped me gain real-world experience while working on interesting projects. My mentor has been incredibly helpful!',
    rating: 5
  },
  {
    name: 'Emily Watson',
    role: 'Full Stack Developer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    quote: 'The quality of collaboration here is outstanding. I\'ve built several successful projects with talented students.',
    rating: 5
  }
];

const router = express.Router();

// @desc    Get homepage content and statistics
// @route   GET /api/dashboard/home
// @access  Public
router.get('/home', async (_req: Request, res: Response) => {
  try {
    let [
      features,
      testimonials,
      totalProjects,
      openProjects,
      completedProjects,
      mentorCount,
      studentCount,
      topMentors,
      recentProjects
    ] = await Promise.all([
      Feature.find({ isActive: true }).sort({ order: 1 }),
      Testimonial.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(6),
      Project.countDocuments({}),
      Project.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
      Project.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'engineer' }),
      User.countDocuments({ role: 'student' }),
      User.find({
        role: 'engineer',
        isAvailable: true
      })
        .select('-password')
        .sort({ rating: -1, totalReviews: -1 })
        .limit(6)
        .lean(),
      Project.find({})
        .populate('owner', 'name avatar role')
        .populate('mentor', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean()
    ]);

    if (!features.length) {
      await Feature.insertMany(DEFAULT_FEATURES);
      features = await Feature.find({ isActive: true }).sort({ order: 1 });
    }

    if (!testimonials.length) {
      await Testimonial.insertMany(DEFAULT_TESTIMONIALS);
      testimonials = await Testimonial.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(6);
    }

    const successRate = totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

    // Transform topMentors _id to id
    const transformedTopMentors = topMentors.map((mentor: any) => {
      const { _id, __v, ...rest } = mentor;
      return {
        id: _id.toString(),
        ...rest
      };
    });

    // Transform recentProjects _id to id and populated fields
    const transformedRecentProjects = recentProjects.map((project: any) => {
      const { _id, __v, owner, mentor, ...rest } = project;
      
      const transformedOwner = owner ? {
        id: owner._id?.toString() || owner.toString(),
        name: owner.name || '',
        avatar: owner.avatar || '',
        role: owner.role || ''
      } : null;
      
      const transformedMentor = mentor ? {
        id: mentor._id?.toString() || mentor.toString(),
        name: mentor.name || '',
        avatar: mentor.avatar || '',
        role: mentor.role || ''
      } : null;
      
      return {
        id: _id.toString(),
        ...rest,
        owner: transformedOwner,
        mentor: transformedMentor
      };
    });

    return res.json({
      success: true,
      data: {
        stats: [
          {
            id: 'activeProjects',
            label: 'Active Projects',
            value: openProjects
          },
          {
            id: 'mentors',
            label: 'Mentors',
            value: mentorCount
          },
          {
            id: 'students',
            label: 'Students',
            value: studentCount
          },
          {
            id: 'successRate',
            label: 'Success Rate',
            value: `${successRate}%`
          }
        ],
        features,
        testimonials,
        highlights: {
          topMentors: transformedTopMentors,
          recentProjects: transformedRecentProjects
        }
      }
    });
  } catch (error) {
    console.error('Dashboard home error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load homepage data'
    });
  }
});

export default router;


