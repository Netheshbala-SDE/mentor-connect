import express, { Request, Response } from 'express';
import { User } from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
router.get('/', async (req:Request, res:Response) => {
  try {
    const { skills, location, page = 1, limit = 10 } = req.query;
    
    const query: any = {
      role: 'engineer',
      isAvailable: true
    };
    
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const mentors = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort({ rating: -1, totalReviews: -1 });

    const total = await User.countDocuments(query);

    // Transform _id to id for all mentors
    const transformedMentors = mentors.map(mentor => {
      const mentorObj = mentor.toObject();
      const { _id, __v, ...rest } = mentorObj;
      return {
        id: _id.toString(),
        ...rest
      };
    });

    return res.json({
      success: true,
      data: {
        data: transformedMentors,
        count: transformedMentors.length,
        total,
        pagination: {
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
router.get('/:id', async (req:Request, res:Response) => {
  try {
    const mentor = await User.findOne({
      _id: req.params.id,
      role: 'engineer'
    }).select('-password');
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Transform _id to id
    const mentorObj = mentor.toObject();
    const { _id, __v, ...rest } = mentorObj;
    const transformedMentor = {
      id: _id.toString(),
      ...rest
    };

    return res.json({
      success: true,
      data: {
        data: transformedMentor
      }
    });
  } catch (error) {
    console.error('Get mentor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get top rated mentors
// @route   GET /api/mentors/top/rated
// @access  Public
router.get('/top/rated', async (req:Request, res:Response) => {
  try {
    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit as string);

    const topMentors = await User.find({
      role: 'engineer',
      isAvailable: true,
      totalReviews: { $gt: 0 }
    })
      .select('-password')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limitNum);

    // Transform _id to id
    const transformedMentors = topMentors.map(mentor => {
      const mentorObj = mentor.toObject();
      const { _id, __v, ...rest } = mentorObj;
      return {
        id: _id.toString(),
        ...rest
      };
    });

    return res.json({
      success: true,
      data: {
        data: transformedMentors,
        count: transformedMentors.length
      }
    });
  } catch (error) {
    console.error('Get top mentors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Search mentors by skills
// @route   GET /api/mentors/search/skills
// @access  Public
router.get('/search/skills', async (req:Request, res:Response) => {
  try {
    const { skills, page = 1, limit = 10 } = req.query;
    
    if (!skills) {
      return res.status(400).json({
        success: false,
        message: 'Please provide skills to search for'
      });
    }

    const skillsArray = Array.isArray(skills) ? skills : [skills];
    
    const query = {
      role: 'engineer',
      isAvailable: true,
      skills: { $in: skillsArray }
    };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const mentors = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort({ rating: -1 });

    const total = await User.countDocuments(query);

    // Transform _id to id
    const transformedMentors = mentors.map(mentor => {
      const mentorObj = mentor.toObject();
      const { _id, __v, ...rest } = mentorObj;
      return {
        id: _id.toString(),
        ...rest
      };
    });

    return res.json({
      success: true,
      data: {
        data: transformedMentors,
        count: transformedMentors.length,
        total,
        pagination: {
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Search mentors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update mentor availability
// @route   PUT /api/mentors/:id/availability
// @access  Private
router.put('/:id/availability', protect, async (req:Request, res:Response) => {
  try {
    const { isAvailable } = req.body;

    // Check if user is updating their own availability
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this mentor'
      });
    }

    // Check if user is an engineer
    if (req.user.role !== 'engineer') {
      return res.status(403).json({
        success: false,
        message: 'Only engineers can update availability'
      });
    }

    const mentor = await User.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Transform _id to id
    const mentorObj = mentor.toObject();
    const { _id, __v, ...rest } = mentorObj;
    const transformedMentor = {
      id: _id.toString(),
      ...rest
    };

    return res.json({
      success: true,
      data: {
        data: transformedMentor
      }
    });
  } catch (error) {
    console.error('Update mentor availability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
