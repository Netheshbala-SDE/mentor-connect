import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private
router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const { role, skills, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    
    if (role) {
      query.role = role;
    }
    
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Transform _id to id
    const transformedUsers = users.map(user => {
      const userObj = user.toObject();
      const { _id, __v, ...rest } = userObj;
      return {
        id: _id.toString(),
        ...rest
      };
    });

    return res.json({
      success: true,
      data: {
        data: transformedUsers,
        count: transformedUsers.length,
        total,
        pagination: {
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
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
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
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

    // Check if user is updating their own profile or is admin
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
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
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
router.delete('/:id', protect, async (req: any, res: Response) => {
  try {
    // Check if user is deleting their own account or is admin
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: {
        message: 'User deleted successfully'
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
