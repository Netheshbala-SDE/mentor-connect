import express,{Request,Response} from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { protect } from '../middleware/auth';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/profiles/:id
// @access  Public
router.get('/:id', async (req:Request, res:Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's projects
    const projects = await Project.find({
      $or: [
        { owner: req.params.id },
        { student: req.params.id }
      ]
    })
      .populate('owner', 'name avatar role')
      .populate('student', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get statistics
    const ownedProjects = await Project.countDocuments({ owner: req.params.id });
    const mentoredProjects = await Project.countDocuments({ student: req.params.id });
    const completedProjects = await Project.countDocuments({
      $or: [
        { owner: req.params.id, status: 'completed' },
        { student: req.params.id, status: 'completed' }
      ]
    });
    const inProgressProjects = await Project.countDocuments({
      $or: [
        { owner: req.params.id, status: 'in-progress' },
        { student: req.params.id, status: 'in-progress' }
      ]
    });

    const recentActivity = projects.slice(0, 5).map(project => {
      const ownerAny = project.owner as any;
      const studentAny = project.student as any;

      const ownerId = ownerAny?._id ? ownerAny._id.toString() : ownerAny?.toString();
      const studentId = studentAny?._id ? studentAny._id.toString() : studentAny?.toString();

      const isOwner = ownerId === req.params.id;
      const isStudent = studentId === req.params.id;

      return {
        id: project._id,
        type: isOwner ? 'owned' : isStudent ? 'mentored' : 'project',
        title: project.title,
        description: project.description ? project.description.substring(0, 140) : '',
        status: project.status,
        updatedAt: project.updatedAt,
        project: {
          id: project._id,
          title: project.title
        }
      };
    });

    // Transform user _id to id
    const userObj = user.toObject();
    const { _id: userId, __v: userV, ...userRest } = userObj;
    const transformedUser = {
      id: userId.toString(),
      ...userRest
    };

    // Transform projects _id to id and populated fields
    const transformedProjects = projects.map(project => {
      const projObj = project.toObject();
      const { _id: projId, __v: projV, owner, student, ...projRest } = projObj;
      
      const ownerAny = owner as any;
      const studentAny = student as any;

      const transformedOwner = owner ? {
        id: ownerAny._id?.toString() || ownerAny.toString(),
        name: ownerAny.name || null,
        avatar: ownerAny.avatar || null,
        role: ownerAny.role || null
      } : null;
      
      const transformedStudent = student ? {
        id: studentAny._id?.toString() || studentAny.toString(),
        name: studentAny.name || null,
        avatar: studentAny.avatar || null,
        role: studentAny.role || null
      } : null;
      
      return {
        id: projId.toString(),
        ...projRest,
        owner: transformedOwner,
        student: transformedStudent
      };
    });

    return res.json({
      success: true,
      data: {
        user: transformedUser,
        projects: transformedProjects,
        statistics: {
          ownedProjects,
          mentoredProjects,
          completedProjects,
          inProgressProjects
        },
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/profiles/:id
// @access  Private
router.put('/:id', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('location')
    .optional()
    .trim(),
  body('github')
    .optional()
    .matches(/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+$/)
    .withMessage('Please add a valid GitHub URL'),
  body('linkedin')
    .optional()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+$/)
    .withMessage('Please add a valid LinkedIn URL'),
  body('website')
    .optional()
    .matches(/^https?:\/\/.+/)
    .withMessage('Please add a valid website URL'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('experience')
    .optional()
    .notEmpty()
    .withMessage('Experience cannot be empty'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
], async (req: any, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if user is updating their own profile
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Transform _id to id
    const userObj = user.toObject();
    const { _id, __v, ...rest } = userObj;
    const transformedUser = {
      id: _id.toString(),
      ...rest
    };

    return res.json({
      success: true,
      data: {
        data: transformedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's projects
// @route   GET /api/profiles/:id/projects
// @access  Public
router.get('/:id/projects', async (req:Request, res:Response) => {
  try {
    const { type = 'all', page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    
    if (type === 'owned') {
      query.owner = req.params.id;
    } else if (type === 'mentored') {
      query.student = req.params.id;
    } else {
      query.$or = [
        { owner: req.params.id },
        { student: req.params.id }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(query)
      .populate('owner', 'name avatar role')
      .populate('student', 'name avatar role')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    // Transform projects with populated fields
    const transformedProjects = projects.map(project => {
      const projObj = project.toObject();
      const { _id, __v, owner, student, ...rest } = projObj;
      
      const transformedOwner = owner ? {
        id: (owner as any)._id?.toString() || owner.toString(),
        name: (owner as any).name,
        avatar: (owner as any).avatar,
        role: (owner as any).role
      } : null;
      
      const transformedStudent = student ? {
        id: (student as any)._id?.toString() || student.toString(),
        name: (student as any).name,
        avatar: (student as any).avatar,
        role: (student as any).role
      } : null;
      
      return {
        id: _id.toString(),
        ...rest,
        owner: transformedOwner,
        student: transformedStudent
      };
    });

    return res.json({
      success: true,
      data: {
        data: transformedProjects,
        count: transformedProjects.length,
        total,
        pagination: {
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/profiles/:id/stats
// @access  Public
router.get('/:id/stats', async (req:Request, res:Response) => {
  try {
    const userId = req.params.id;

    // Get project statistics
    const ownedProjects = await Project.countDocuments({ owner: userId });
    const mentoredProjects = await Project.countDocuments({ student: userId });
    const completedProjects = await Project.countDocuments({
      $or: [
        { owner: userId, status: 'completed' },
        { student: userId, status: 'completed' }
      ]
    });
    const inProgressProjects = await Project.countDocuments({
      $or: [
        { owner: userId, status: 'in-progress' },
        { student: userId, status: 'in-progress' }
      ]
    });

    // Get user details
    const user = await User.findById(userId).select('rating totalReviews role');

    return res.json({
      success: true,
      data: {
        projects: {
          owned: ownedProjects,
          mentored: mentoredProjects,
          completed: completedProjects,
          inProgress: inProgressProjects
        },
        rating: user?.rating || 0,
        totalReviews: user?.totalReviews || 0,
        role: user?.role
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update avatar
// @route   PUT /api/profiles/:id/avatar
// @access  Private
router.put('/:id/avatar', protect, [
  body('avatar')
    .notEmpty()
    .withMessage('Avatar URL is required')
    .isURL()
    .withMessage('Please provide a valid URL')
], async (req: any, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if user is updating their own avatar
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this avatar'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: req.body.avatar },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Transform _id to id
    const userObj = user.toObject();
    const { _id, __v, ...rest } = userObj;
    const transformedUser = {
      id: _id.toString(),
      ...rest
    };

    return res.json({
      success: true,
      data: {
        data: transformedUser
      }
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
